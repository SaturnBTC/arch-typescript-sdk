import { SocketLike } from './managers/socket-like';
import {
  BackoffStrategy,
  DEFAULT_BACKOFF_STRATEGY,
} from './config/backoff-strategy';
import {
  DEFAULT_OPTIONS,
  WebSocketClientOptions,
} from './config/web-socket-config';
import { ConnectionManager } from './managers/connection-manager';
import { ArchEventCallback, EventManager } from './managers/event-manager';
import { ReconnectionManager } from './managers/reconnection-manager';
import { SubscriptionManager } from './managers/subscription-manager';
import { ArchSocketEvent, EventTopic } from './types/events';
import { EventFilter } from './types/filters';

export class ArchWebSocketClient {
  private connectionManager: ConnectionManager;
  private subscriptionManager: SubscriptionManager;
  private eventManager: EventManager;
  private reconnectionManager: ReconnectionManager;
  private options: WebSocketClientOptions;
  private autoReconnectHandler: (() => void) | undefined;
  private socket: SocketLike | null = null;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      url: options.url,
      maxReconnectAttempts:
        options.maxReconnectAttempts ?? DEFAULT_OPTIONS.maxReconnectAttempts,
      backoffStrategy: options.backoffStrategy,
      autoReconnect: options.autoReconnect ?? DEFAULT_OPTIONS.autoReconnect,
      timeout: options.timeout ?? DEFAULT_OPTIONS.timeout,
      transports: options.transports ?? DEFAULT_OPTIONS.transports,
      forceNew: options.forceNew ?? DEFAULT_OPTIONS.forceNew,
      multiplex: options.multiplex ?? DEFAULT_OPTIONS.multiplex,
    };

    this.connectionManager = new ConnectionManager(this.options);
    this.subscriptionManager = new SubscriptionManager();
    this.eventManager = new EventManager();
    this.reconnectionManager = new ReconnectionManager(
      DEFAULT_BACKOFF_STRATEGY,
    );
    this.reconnectionManager.setOptions(
      !!this.options.autoReconnect,
      this.options.backoffStrategy ?? DEFAULT_BACKOFF_STRATEGY,
      Number(
        this.options.maxReconnectAttempts ??
          DEFAULT_OPTIONS.maxReconnectAttempts,
      ),
    );
  }

  async connect(): Promise<void> {
    await this.connectionManager.connect();
    this.socket = this.connectionManager.getSocket();
    if (this.socket) {
      this.subscriptionManager.setSocket(this.socket);
      this.attachAllListeners();
      // Setup auto-reconnect if enabled
      if (this.options.autoReconnect) {
        if (this.autoReconnectHandler) {
          this.socket.off('disconnect', this.autoReconnectHandler);
        }
        this.autoReconnectHandler = this.autoReconnectHandlerImpl.bind(this);
        this.socket.on('disconnect', this.autoReconnectHandler);
      }
    }
  }

  private async autoReconnectHandlerImpl() {
    if (this.reconnectionManager.shouldReconnect()) {
      this.reconnectionManager.scheduleReconnect(async () => {
        try {
          await this.connect();
          this.reconnectionManager.resetAttempts();
          await this.subscriptionManager.resubscribeAll();
        } catch {
          this.autoReconnectHandlerImpl();
        }
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.autoReconnectHandler) {
      if (this.socket) {
        this.socket.off('disconnect', this.autoReconnectHandler);
      }
      this.autoReconnectHandler = undefined;
    }
    this.reconnectionManager.cancelReconnect();
    return this.connectionManager.disconnect();
  }

  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Subscribe to a topic with an async callback. Returns the subscription ID.
   */
  async subscribe(
    topic: EventTopic,
    callback: ArchEventCallback,
    filter?: EventFilter,
  ): Promise<string> {
    const subscriptionId = await this.subscriptionManager.subscribe(
      topic,
      filter,
    );
    this.eventManager.addListener(topic, callback);
    if (this.socket) {
      this.socket.on(topic, callback);
    }
    return subscriptionId;
  }

  // Add additional listeners
  on(event: ArchSocketEvent, callback: ArchEventCallback) {
    this.eventManager.addListener(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove a specific listener
  off(event: ArchSocketEvent, callback: ArchEventCallback) {
    this.eventManager.removeListener(event, callback);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Unsubscribe and remove all listeners for the topic
  async unsubscribe(topic: EventTopic): Promise<void> {
    await this.subscriptionManager.unsubscribeTopic(topic);
    const listeners = this.eventManager.getListeners(topic);
    if (listeners && this.socket) {
      for (const cb of listeners) {
        this.socket.off(topic, cb);
      }
    }
    this.eventManager.removeAllListeners(topic);
  }

  // Unsubscribe by subscription ID and remove all listeners for the associated topic
  async unsubscribeById(subscriptionId: string): Promise<void> {
    // Find the topic for this subscriptionId
    const activeSubs = this.subscriptionManager.getActiveSubscriptions();
    const sub = activeSubs.find((s) => s.id === subscriptionId);
    if (sub) {
      await this.subscriptionManager.unsubscribe(subscriptionId);
      const listeners = this.eventManager.getListeners(sub.topic);
      if (listeners && this.socket) {
        for (const cb of listeners) {
          this.socket.off(sub.topic, cb);
        }
      }
      this.eventManager.removeAllListeners(sub.topic);
    }
  }

  setReconnectOptions(
    enabled: boolean,
    strategy: BackoffStrategy,
    maxAttempts: number,
  ): void {
    this.reconnectionManager.setOptions(enabled, strategy, maxAttempts);
  }

  enableKeepAlive(interval: number): void {
    this.connectionManager.enableKeepAlive(interval);
  }

  private attachAllListeners() {
    if (!this.socket) return;
    const allListeners = this.eventManager.getAllListeners();
    if (allListeners.size === 0) return; // No listeners to attach

    for (const [event, callbacks] of allListeners) {
      for (const callback of callbacks) {
        this.socket.on(event, callback);
      }
    }
  }
}
