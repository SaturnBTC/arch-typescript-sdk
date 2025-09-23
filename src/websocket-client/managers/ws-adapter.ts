import { SocketLike } from './socket-like';
import { WebSocketFactory } from './websocket-factory';

type EventHandler = (...args: any[]) => void;

export class WebSocketAdapter implements SocketLike {
  private url: string;
  private ws: any | null = null;
  private factory?: WebSocketFactory;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  public connected: boolean = false;

  constructor(url: string, factory?: WebSocketFactory) {
    this.url = url;
    this.factory = factory;
  }

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    // Prefer injected factory (for Node/testing); otherwise try browser global
    const globalWS = (typeof globalThis !== 'undefined'
      ? (globalThis as any).WebSocket
      : undefined) as any;
    const created = this.factory
      ? this.factory(this.url)
      : globalWS
      ? new globalWS(this.url)
      : null;

    if (!created) {
      this.emitLocal(
        'error',
        new Error(
          'No WebSocket implementation available. Provide webSocketFactory in options when not running in a browser.',
        ),
      );
      return;
    }

    this.ws = created;

    // Attach event listeners for both browser and Node ws implementations
    const socket: any = this.ws;

    const onOpen = () => {
      this.connected = true;
      this.emitLocal('connect');
    };
    const onClose = () => {
      const wasConnected = this.connected;
      this.connected = false;
      if (wasConnected) {
        this.emitLocal('disconnect');
      }
    };
    const onError = (err: any) => {
      this.emitLocal('error', err instanceof Error ? err : new Error(String(err)));
    };
    const onMessage = (evtOrRaw: any) => {
      try {
        const raw = evtOrRaw && evtOrRaw.data !== undefined ? evtOrRaw.data : evtOrRaw;
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
            this.emitLocal('subscription_response', msg);
            if (msg.request_id) {
              this.emitLocal(`subscription_response_${msg.request_id}`, msg);
            }
            return;
          } else {
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
    };

    if (typeof socket.addEventListener === 'function') {
      socket.addEventListener('open', onOpen);
      socket.addEventListener('close', onClose);
      socket.addEventListener('error', onError);
      socket.addEventListener('message', onMessage);
    } else if (typeof socket.on === 'function') {
      socket.on('open', onOpen);
      socket.on('close', onClose);
      socket.on('error', onError);
      socket.on('message', onMessage);
    }
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
    // 1 === OPEN for both browser WebSocket and ws
    if (!this.ws || (this.ws as any).readyState !== 1) return;

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
