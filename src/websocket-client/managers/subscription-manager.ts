import { Socket } from 'socket.io-client';
import { WebSocketError, WebSocketErrorType } from '../errors/web-socket-error';
import { EventTopic } from '../types/events';
import { EventFilter } from '../types/filters';
import {
  SubscribeRequest,
  SubscriptionResponse,
  UnsubscribeRequest,
} from '../types/messages';

interface SubscriptionHandler {
  id: string;
  topic: EventTopic;
  filter: EventFilter;
  pending: boolean;
}

export class SubscriptionManager {
  private subscriptions: Map<string, SubscriptionHandler> = new Map();
  private socket: Socket | null = null;
  private requestIdCounter: number = 0;

  setSocket(socket: Socket): void {
    this.socket = socket;
    this.setupMessageHandlers();
  }

  async subscribe(
    topic: EventTopic,
    filter: EventFilter = {},
  ): Promise<string> {
    if (!this.socket?.connected) {
      throw new WebSocketError(
        WebSocketErrorType.ConnectionFailed,
        'Not connected to server',
      );
    }

    // Check if we already have a matching subscription
    for (const [id, handler] of this.subscriptions) {
      if (
        !handler.pending &&
        handler.topic === topic &&
        this.filtersMatch(handler.filter, filter)
      ) {
        return id;
      }
    }

    const requestId = this.generateRequestId();
    const pendingId = `pending-${topic}-${requestId}`;

    // Add as pending subscription
    this.subscriptions.set(pendingId, {
      id: pendingId,
      topic,
      filter,
      pending: true,
    });

    // Send subscription request
    const request: SubscribeRequest = {
      topic,
      filter,
      request_id: requestId,
    };

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.subscriptions.delete(pendingId);
        reject(
          new WebSocketError(
            WebSocketErrorType.SubscriptionFailed,
            'Subscription timeout',
          ),
        );
      }, 10000); // 10 second timeout

      // Listen for subscription response
      const responseHandler = (response: SubscriptionResponse) => {
        if (response.request_id === requestId) {
          clearTimeout(timeout);

          if (response.status === 'Subscribed') {
            // Update subscription with confirmed ID
            this.subscriptions.delete(pendingId);
            this.subscriptions.set(response.subscription_id, {
              id: response.subscription_id,
              topic,
              filter,
              pending: false,
            });
            resolve(response.subscription_id);
          } else {
            this.subscriptions.delete(pendingId);
            reject(
              new WebSocketError(
                WebSocketErrorType.SubscriptionFailed,
                'Subscription rejected by server',
              ),
            );
          }
        }
      };

      // Store response handler temporarily
      (this.socket as any).once(
        `subscription_response_${requestId}`,
        responseHandler,
      );

      // Send the request
      this.socket!.emit('subscribe', request);
    });
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new WebSocketError(
        WebSocketErrorType.ConnectionFailed,
        'Not connected to server',
      );
    }

    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new WebSocketError(
        WebSocketErrorType.UnsubscriptionFailed,
        'Subscription not found',
      );
    }

    const request: UnsubscribeRequest = {
      topic: subscription.topic,
      subscription_id: subscriptionId,
    };

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new WebSocketError(
            WebSocketErrorType.UnsubscriptionFailed,
            'Unsubscribe timeout',
          ),
        );
      }, 10000);

      const responseHandler = (response: any) => {
        if (response.subscription_id === subscriptionId) {
          clearTimeout(timeout);
          this.subscriptions.delete(subscriptionId);
          resolve();
        }
      };

      (this.socket as any).once(
        `unsubscribe_response_${subscriptionId}`,
        responseHandler,
      );
      this.socket!.emit('unsubscribe', request);
    });
  }

  async unsubscribeTopic(topic: EventTopic): Promise<void> {
    const subscriptionIds = Array.from(this.subscriptions.entries())
      .filter(([_, handler]) => handler.topic === topic)
      .map(([id, _]) => id);

    const results = await Promise.allSettled(
      subscriptionIds.map((id) => this.unsubscribe(id)),
    );

    // Check if any failed
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      throw new WebSocketError(
        WebSocketErrorType.UnsubscriptionFailed,
        `Failed to unsubscribe from ${failures.length} subscriptions`,
      );
    }
  }

  async resubscribeAll(): Promise<void> {
    const subscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => !sub.pending,
    );

    // Clear all subscriptions
    this.subscriptions.clear();

    // Resubscribe to all
    for (const sub of subscriptions) {
      try {
        await this.subscribe(sub.topic, sub.filter);
      } catch (error) {
        console.error(`Failed to resubscribe to ${sub.topic}:`, error);
      }
    }
  }

  getActiveSubscriptions(): SubscriptionHandler[] {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => !sub.pending,
    );
  }

  private setupMessageHandlers(): void {
    if (!this.socket) return;

    // CHECK: event name to listen?
    this.socket.on(
      'subscription_response',
      (response: SubscriptionResponse) => {
        if (response.request_id) {
          this.socket!.emit(
            `subscription_response_${response.request_id}`,
            response,
          );
        }
      },
    );

    this.socket.on('unsubscribe_response', (response: any) => {
      this.socket!.emit(
        `unsubscribe_response_${response.subscription_id}`,
        response,
      );
    });
  }

  private generateRequestId(): string {
    return `req_${++this.requestIdCounter}_${Date.now()}`;
  }

  private filtersMatch(filter1: EventFilter, filter2: EventFilter): boolean {
    const keys1 = Object.keys(filter1);
    const keys2 = Object.keys(filter2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(
      (key) => JSON.stringify(filter1[key]) === JSON.stringify(filter2[key]),
    );
  }
}
