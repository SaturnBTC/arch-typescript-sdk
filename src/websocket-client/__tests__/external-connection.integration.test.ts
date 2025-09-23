import { describe, it, expect, vi } from 'vitest';
import WebSocket from 'ws';
import { ArchWebSocketClient } from '../arch-web-socket-client';
import { EventTopic } from '../types/events';

// NOTE: This test hits an external WS endpoint. It may fail if the endpoint is unreachable.
describe('External WebSocket connectivity', () => {
  it('connects and disconnects from ws://44.195.37.144:9003', async () => {
    const client = new ArchWebSocketClient({
      url: 'ws://44.195.37.144:9003',
      timeout: 15000,
      autoReconnect: false,
      webSocketFactory: (url: string) => new WebSocket(url),
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 30000);

  it('subscribes to a topic and receives at least one event', async () => {
    const client = new ArchWebSocketClient({
      url: 'ws://44.195.37.144:9003',
      timeout: 20000,
      autoReconnect: false,
      webSocketFactory: (url: string) => new WebSocket(url),
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    const callback = vi.fn(async () => {});
    await client.subscribe(EventTopic.Block, callback);

    // Wait for some time to receive at least one broadcast
    await new Promise((resolve) => setTimeout(resolve, 6000));

    expect(callback.mock.calls.length).toBeGreaterThan(0);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 40000);

  it('unsubscribes by subscription id and stops receiving events', async () => {
    const client = new ArchWebSocketClient({
      url: 'ws://44.195.37.144:9003',
      timeout: 20000,
      autoReconnect: false,
      webSocketFactory: (url: string) => new WebSocket(url),
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    const callback = vi.fn(async () => {});
    const subscriptionId = await client.subscribe(EventTopic.Block, callback);

    // Wait to receive at least one event
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const initialCalls = callback.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);

    // Unsubscribe and ensure we stop receiving
    await client.unsubscribeById(subscriptionId);
    const callsAfterUnsub = callback.mock.calls.length;
    // Wait another window and ensure count does not increase
    await new Promise((resolve) => setTimeout(resolve, 6000));
    expect(callback.mock.calls.length).toBe(callsAfterUnsub);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 60000);

  it('unsubscribes by topic and stops receiving events', async () => {
    const client = new ArchWebSocketClient({
      url: 'ws://44.195.37.144:9003',
      timeout: 20000,
      autoReconnect: false,
      webSocketFactory: (url: string) => new WebSocket(url),
    });

    await client.connect();
    expect(client.isConnected()).toBe(true);

    const callback = vi.fn(async () => {});
    await client.subscribe(EventTopic.Block, callback);

    // Wait to receive at least one event
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const initialCalls = callback.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);

    // Unsubscribe by topic and ensure we stop receiving
    await client.unsubscribe(EventTopic.Block);
    const callsAfterUnsub = callback.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 6000));
    expect(callback.mock.calls.length).toBe(callsAfterUnsub);

    await client.disconnect();
    expect(client.isConnected()).toBe(false);
  }, 60000);
});
