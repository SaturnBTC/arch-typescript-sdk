import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { ArchWebSocketClient } from '../arch-web-socket-client';
import { EventTopic } from '../types/events';
import {
  startServer,
  stopServer,
} from '../../../test/mock-websocket-server/server';

describe('ArchWebSocketClient Integration', () => {
  beforeAll(async () => {
    await startServer(3001);
  });

  afterAll(async () => {
    await stopServer();
  });

  it('Should subscribe and receive block events', async () => {
    const client = new ArchWebSocketClient({ url: 'ws://localhost:3001' });
    await client.connect();
    expect(client.isConnected()).toBe(true);
    const callback = vi.fn(async () => {});
    await client.subscribe(EventTopic.Block, callback);
    // Wait for the server to emit a block event (server emits every 5s)
    await new Promise((resolve) => setTimeout(resolve, 6000));
    expect(callback).toHaveBeenCalled();
    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 20000);
});
