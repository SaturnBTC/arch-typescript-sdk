import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchWebSocketClient } from '../arch-web-socket-client';
import { EventTopic } from '../types/events';
import type { ArchEventCallback } from '../managers/event-manager';

vi.mock('socket.io-client', () => {
  // MockSocket simulates the Socket.IO client used by ArchWebSocketClient.
  // It allows us to control connection state and simulate server events/responses.
  class MockSocket {
    public handlers: Record<string, Set<Function>> = {};
    public connected = false;

    // Simulate connecting to the server.
    connect() {
      // After a short delay, set connected=true and emit 'connect' event.
      setTimeout(() => {
        this.connected = true;
        (this.handlers['connect'] || []).forEach((callback) => callback());
      }, 0);
    }

    // Simulate disconnecting from the server.
    disconnect() {
      this.connected = false;
      (this.handlers['disconnect'] || []).forEach((callback) => callback());
    }

    // Register an event handler (e.g., for 'block', 'connect', etc.)
    on(event: string, callback: Function) {
      if (!this.handlers[event]) this.handlers[event] = new Set();
      this.handlers[event].add(callback);
    }

    // Remove a specific event handler.
    off(event: string, callback: Function) {
      if (this.handlers[event]) this.handlers[event].delete(callback);
    }

    // Emit an event to all registered handlers.
    // Also simulates server-side responses for 'subscribe'.
    emit(event: string, ...args: any[]) {
      (this.handlers[event] || []).forEach((callback) => callback(...args));
      /*
        Simulate the server's response to a 'subscribe' event:
        When the client emits 'subscribe', the server would normally reply
        with a 'subscription_response_{requestId}' event. We simulate that here.
      */
      if (event === 'subscribe') {
        const request = args[0];
        setTimeout(() => {
          const response = {
            request_id: request.request_id,
            status: 'Subscribed',
            subscriptionId: `sub-${request.topic}-${request.request_id}`,
          };
          (
            this.handlers[`subscription_response_${request.request_id}`] || []
          ).forEach((callback) => callback(response));
        }, 0);
      }
    }

    once(event: string, callback: Function) {
      const wrapper = (...args: any[]) => {
        callback(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    }
  }
  // Return the mock for socket.io-client
  return {
    io: vi.fn(() => new MockSocket()),
    Socket: MockSocket,
  };
});

describe('ArchWebSocketClient', () => {
  let client: ArchWebSocketClient;

  beforeEach(() => {
    client = new ArchWebSocketClient({ url: 'ws://localhost:123' });
  });

  it('Connects to the server', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
  });

  it('Subscribes to block topic and receives event', async () => {
    await client.connect();

    const callback = vi.fn(async () => {});
    await client.subscribe(EventTopic.Block, callback);

    // Simulate the server emitting a block event to the client.
    (client as any).socket.emit(EventTopic.Block, {
      hash: 'abc',
      timestamp: 123,
    });

    expect(callback).toHaveBeenCalledWith({ hash: 'abc', timestamp: 123 });
  });

  it('Adds additional listeners for block event', async () => {
    await client.connect();
    const callback1 = vi.fn(async () => {});

    const callback2 = vi.fn(async () => {});
    // Subscribe and add an additional listener for the same event.
    await client.subscribe(EventTopic.Block, callback1);

    client.on(EventTopic.Block, callback2);

    // Simulate the server emitting a block event.
    (client as any).socket.emit(EventTopic.Block, {
      hash: 'def',
      timestamp: 456,
    });

    expect(callback1).toHaveBeenCalledWith({ hash: 'def', timestamp: 456 });
    expect(callback2).toHaveBeenCalledWith({ hash: 'def', timestamp: 456 });
  });

  it('Disconnects from the server', async () => {
    await client.connect();
    await client.disconnect();

    expect(client.isConnected()).toBe(false);
  });
});
