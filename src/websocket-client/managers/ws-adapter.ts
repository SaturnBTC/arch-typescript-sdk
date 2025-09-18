import WebSocket from 'ws';
import { SocketLike } from './socket-like';

type EventHandler = (...args: any[]) => void;

export class WebSocketAdapter implements SocketLike {
  private url: string;
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  public connected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      this.connected = true;
      this.emitLocal('connect');
    });

    this.ws.on('close', () => {
      const wasConnected = this.connected;
      this.connected = false;
      if (wasConnected) {
        this.emitLocal('disconnect');
      }
    });

    this.ws.on('error', (err: Error) => {
      this.emitLocal('error', err);
    });

    this.ws.on('message', (raw: WebSocket.RawData) => {
      try {
        const text = typeof raw === 'string' ? raw : (raw as any)?.toString?.();
        if (!text) return;
        const msg = JSON.parse(text as string);

        // Handle SubscriptionResponse / UnsubscribeResponse (snake_case pass-through)
        if (
          msg &&
          typeof msg === 'object' &&
          'status' in msg &&
          'subscription_id' in msg
        ) {
          if (msg.topic !== undefined) {
            // It's a SubscriptionResponse
            this.emitLocal('subscription_response', msg);
            if (msg.request_id) {
              this.emitLocal(`subscription_response_${msg.request_id}`, msg);
            }
            return;
          } else {
            // It's an UnsubscribeResponse
            this.emitLocal('unsubscribe_response', msg);
            this.emitLocal(`unsubscribe_response_${msg.subscription_id}`, msg);
            return;
          }
        }

        // Handle Event broadcasts: { topic: string, data: any }
        if (msg && typeof msg === 'object' && 'topic' in msg && 'data' in msg) {
          const topic = msg.topic as string;
          this.emitLocal(topic, msg.data);
          return;
        }

        // Fallback: envelope format { event, data }
        if (msg && typeof msg === 'object' && 'event' in msg) {
          const eventName = msg.event as string;
          this.emitLocal(eventName, msg.data);
        }
      } catch (e) {
        // Ignore malformed messages
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  on(event: string, callback: EventHandler): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(callback);
  }

  off(event: string, callback: EventHandler): void {
    this.handlers.get(event)?.delete(callback);
  }

  once(event: string, callback: EventHandler): void {
    const wrapper: EventHandler = (...args: any[]) => {
      try {
        callback(...args);
      } finally {
        this.off(event, wrapper);
      }
    };
    this.on(event, wrapper);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Internal re-dispatch events should not be sent over the wire
    if (
      event === 'subscription_response' ||
      event === 'unsubscribe_response' ||
      event.startsWith('subscription_response_') ||
      event.startsWith('unsubscribe_response_')
    ) {
      this.emitLocal(event, ...(args || []));
      return;
    }

    // Map SDK high-level events to server protocol
    if (event === 'subscribe') {
      const params = args[0] || {};
      const payload = {
        method: 'subscribe',
        params: {
          topic: params.topic,
          filter: params.filter ?? {},
          request_id: params.request_id,
        },
      };
      this.ws.send(JSON.stringify(payload));
      return;
    }

    if (event === 'unsubscribe') {
      const params = args[0] || {};
      const payload = {
        method: 'unsubscribe',
        params: {
          topic: params.topic,
          subscription_id: params.subscriptionId ?? params.subscription_id,
        },
      };
      this.ws.send(JSON.stringify(payload));
      return;
    }
  }

  private emitLocal(event: string, ...args: any[]) {
    const callbacks = this.handlers.get(event);
    if (!callbacks) return;
    for (const cb of Array.from(callbacks)) {
      try {
        cb(...args);
      } catch (e) {
        // Swallow listener errors to avoid breaking the adapter
        // Callers can add their own try/catch in callbacks if needed
      }
    }
  }
}
