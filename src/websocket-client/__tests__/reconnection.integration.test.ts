import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import WebSocket, { WebSocketServer } from 'ws';
import { ArchWebSocketClient } from '../arch-web-socket-client';
import { EventTopic } from '../types/events';

describe('Reconnection flow', () => {
  let wss: WebSocketServer;
  const port = 3011;

  function broadcast(topic: string, data: any) {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ topic, data }));
      }
    }
  }

  function closeAllClients() {
    for (const client of wss.clients) {
      try {
        client.close(1000, 'server-closing');
      } catch {}
    }
  }

  beforeAll(async () => {
    wss = new WebSocketServer({ port });
    wss.on('connection', (socket) => {
      socket.on('message', (raw) => {
        try {
          const text = typeof raw === 'string' ? raw : raw.toString();
          const msg = JSON.parse(text);
          if (msg && msg.method === 'subscribe') {
            const { topic, request_id } = msg.params || {};
            const response = {
              status: 'Subscribed',
              subscription_id: `sub-${topic}-${Math.random().toString(36).slice(2)}`,
              topic,
              request_id,
            };
            socket.send(JSON.stringify(response));
          }
          if (msg && msg.method === 'unsubscribe') {
            const { subscription_id } = msg.params || {};
            const response = {
              status: 'Unsubscribed',
              subscription_id,
              message: 'Unsubscribed successfully',
            };
            socket.send(JSON.stringify(response));
          }
        } catch {}
      });
    });
    await new Promise((resolve) => wss.once('listening', resolve));
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      try {
        wss.close(() => resolve());
      } catch {
        resolve();
      }
    });
  });

  it('reconnects and resubscribes after server closes the connection', async () => {
    const client = new ArchWebSocketClient({
      url: `ws://127.0.0.1:${port}`,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      webSocketFactory: (url: string) => new WebSocket(url),
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    const callback = vi.fn(async () => {});
    await client.subscribe(EventTopic.Block, callback);

    // First event before disconnection
    broadcast('block', { hash: 'first', timestamp: Date.now() });

    // Wait up to 3s for first event
    await waitFor(() => callback.mock.calls.length >= 1, 3000);
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(1);

    // Force server-side close to trigger client reconnect
    closeAllClients();

    // Backoff initial attempt ~2s with jitter; wait a bit more to ensure reconnect
    await sleep(3500);

    // After reconnect, client should resubscribe and receive events again
    broadcast('block', { hash: 'second', timestamp: Date.now() });

    await waitFor(() => callback.mock.calls.length >= 2, 6000);
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(2);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 30000);
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitFor(predicate: () => boolean, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await sleep(50);
  }
  throw new Error('waitFor timeout');
}
