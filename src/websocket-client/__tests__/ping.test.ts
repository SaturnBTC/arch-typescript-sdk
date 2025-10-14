import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketAdapter } from '../managers/ws-adapter';
import { ArchWebSocketClient } from '../arch-web-socket-client';

class FakeNodeWS {
  public readyState = 1; // OPEN
  private handlers: Map<string, Set<Function>> = new Map();
  public ping = vi.fn();
  public send = vi.fn();
  public close = vi.fn();

  on(event: string, cb: Function) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(cb);
  }

  trigger(event: string, ...args: any[]) {
    const cbs = this.handlers.get(event);
    if (!cbs) return;
    for (const cb of Array.from(cbs)) cb(...args);
  }
}

describe('Ping behavior', () => {
  let wsInstance: FakeNodeWS;

  beforeEach(() => {
    wsInstance = new FakeNodeWS();
  });

  it('WebSocketAdapter emits protocol ping via ws.ping()', async () => {
    const factory = (_url: string) => wsInstance;
    const adapter = new WebSocketAdapter('ws://test', factory);
    adapter.connect();
    // simulate underlying socket open
    wsInstance.trigger('open');

    // act: request a ping
    adapter.emit('ping');

    expect(wsInstance.ping).toHaveBeenCalledTimes(1);
  });

  it('ArchWebSocketClient keepalive triggers periodic pings', async () => {
    // factory that triggers open on next tick to resolve client.connect()
    const factory = (url: string) => {
      wsInstance = new FakeNodeWS();
      setTimeout(() => wsInstance.trigger('open'), 0);
      return wsInstance as any;
    };

    const client = new ArchWebSocketClient({
      url: 'ws://keepalive',
      autoReconnect: false,
      webSocketFactory: factory as any,
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    // small interval to observe at least one ping
    client.enableKeepAlive(20);

    await sleep(60);

    expect(wsInstance.ping.mock.calls.length).toBeGreaterThanOrEqual(1);

    await client.disconnect();
  });
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}


