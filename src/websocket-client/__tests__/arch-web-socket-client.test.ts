import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchWebSocketClient } from '../arch-web-socket-client';
import { EventTopic } from '../types/events';
import type { ArchEventCallback } from '../managers/event-manager';
import { SocketLike } from '../managers/socket-like';
import WebSocket from 'ws';

// Mock the ConnectionManager to inject a fake SocketLike
vi.mock('../managers/connection-manager', () => {
  class MockSocket implements SocketLike {
    public handlers: Record<string, Set<Function>> = {};
    public connected = false;
    connect(): void {
      setTimeout(() => {
        this.connected = true;
        (this.handlers['connect'] || new Set()).forEach((cb) => cb());
      }, 0);
    }
    disconnect(): void {
      this.connected = false;
      (this.handlers['disconnect'] || new Set()).forEach((cb) => cb());
    }
    on(event: string, callback: Function): void {
      if (!this.handlers[event]) this.handlers[event] = new Set();
      this.handlers[event].add(callback);
    }
    off(event: string, callback: Function): void {
      this.handlers[event]?.delete(callback);
    }
    once(event: string, callback: Function): void {
      const wrapper = (...args: any[]) => {
        callback(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    }
    emit(event: string, ...args: any[]): void {
      // echo locally and simulate server behavior for subscribe
      (this.handlers[event] || new Set()).forEach((cb) => cb(...args));
      if (event === 'subscribe') {
        const request = args[0];
        setTimeout(() => {
          const response = {
            request_id: request.request_id,
            status: 'Subscribed',
            subscriptionId: `sub-${request.topic}-${request.request_id}`,
          };
          (
            this.handlers[`subscription_response_${request.request_id}`] ||
            new Set()
          ).forEach((cb) => cb(response));
        }, 0);
      }
    }
  }
  class MockConnectionManager {
    private socket = new MockSocket();
    async connect() {
      this.socket.connect();
      await new Promise((r) => setTimeout(r, 0));
    }
    async disconnect() {
      this.socket.disconnect();
    }
    isConnected() {
      return this.socket.connected;
    }
    getSocket() {
      return this.socket;
    }
    onConnect() {
      return () => {};
    }
    onDisconnect() {
      return () => {};
    }
    enableKeepAlive() {}
  }
  return { ConnectionManager: MockConnectionManager };
});

describe('ArchWebSocketClient', () => {
  let client: ArchWebSocketClient;

  beforeEach(() => {
    client = new ArchWebSocketClient({
      url: 'ws://localhost:123',
      webSocketFactory: (url: string) => new WebSocket(url),
    });
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
