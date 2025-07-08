import {
  BackoffStrategy,
  DEFAULT_BACKOFF_STRATEGY,
} from './config/backoff-strategy';
import {
  DEFAULT_OPTIONS,
  WebSocketClientOptions,
} from './config/web-socket-config';
import { ConnectionManager } from './managers/connection-manager';
import { EventManager } from './managers/event-manager';
import { ReconnectionManager } from './managers/reconnection-manager';
import { SubscriptionManager } from './managers/subscription-manager';
import { AsyncEventCallback, EventCallback, EventTopic } from './types/events';
import { EventFilter } from './types/filters';

export class ArchWebSocketClient {
  private connectionManager: ConnectionManager;
  private subscriptionManager: SubscriptionManager;
  private eventManager: EventManager;
  private reconnectionManager: ReconnectionManager;
  private options: WebSocketClientOptions;
  private autoReconnectHandler: (() => void) | undefined;

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
  }

  async connect(): Promise<void> {
    await this.connectionManager.connect();
    const socket = this.connectionManager.getSocket();
    if (socket) {
      this.subscriptionManager.setSocket(socket);
      this.eventManager.setSocket(socket);

      // Setup auto-reconnect if enabled
      if (this.options.autoReconnect) {
        if (this.autoReconnectHandler) {
          socket.off('disconnect', this.autoReconnectHandler);
        }
        this.autoReconnectHandler = this.autoReconnectHandlerImpl.bind(this);
        socket.on('disconnect', this.autoReconnectHandler);
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
      const socket = this.connectionManager.getSocket();
      if (socket) {
        socket.off('disconnect', this.autoReconnectHandler);
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
   * Subscribe to a topic with a synchronous event handler.
   * Returns an unsubscribe function that removes both the event handler and the subscription.
   */
  async subscribe<T extends EventTopic>(
    topic: T,
    handler: EventCallback<T>,
    filter?: EventFilter,
  ): Promise<() => void> {
    const subscriptionId = await this.subscriptionManager.subscribe(
      topic,
      filter,
    );
    const unsubscribeEvent = this.eventManager.onEvent(topic, handler);
    return async () => {
      unsubscribeEvent();
      await this.subscriptionManager.unsubscribe(subscriptionId);
    };
  }

  onConnect(callback: () => void): () => void {
    return this.connectionManager.onConnect(callback);
  }

  onDisconnect(callback: () => void): () => void {
    return this.connectionManager.onDisconnect(callback);
  }

  /**
   * Subscribe to a topic with an asynchronous event handler.
   * Returns an unsubscribe function that removes both the event handler and the subscription.
   */
  async subscribeAsync<T extends EventTopic>(
    topic: T,
    handler: AsyncEventCallback<T>,
    filter?: EventFilter,
  ): Promise<() => void> {
    const subscriptionId = await this.subscriptionManager.subscribe(
      topic,
      filter,
    );
    const unsubscribeEvent = this.eventManager.onEventAsync(topic, handler);
    return async () => {
      unsubscribeEvent();
      await this.subscriptionManager.unsubscribe(subscriptionId);
    };
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    return this.subscriptionManager.unsubscribe(subscriptionId);
  }

  async unsubscribeTopic(topic: EventTopic): Promise<void> {
    return this.subscriptionManager.unsubscribeTopic(topic);
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
}
