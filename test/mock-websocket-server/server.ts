import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import type { AddressInfo } from 'net';

let wss: WebSocketServer | undefined;
let httpServer: http.Server | undefined;
let interval: NodeJS.Timeout | undefined;

export async function startServer(port = 0): Promise<number> {
  httpServer = http.createServer();
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket: WebSocket) => {
    console.log(`[SERVER] Client connected`);

    socket.on('message', (raw: WebSocket.RawData) => {
      try {
        const text = typeof raw === 'string' ? raw : raw.toString();
        const msg = JSON.parse(text);
        // Support both old { event, data } and new { method, params } envelopes
        const isSubscribe =
          msg?.event === 'subscribe' || msg?.method === 'subscribe';
        const isUnsubscribe =
          msg?.event === 'unsubscribe' || msg?.method === 'unsubscribe';

        if (isSubscribe) {
          const data = msg?.data || msg?.params || {};
          const subscription_id = Math.random().toString(36).substring(2, 15);
          const request_id = data.request_id;
          const topic = data.topic;

          // Respond using the SDK-expected event channel and snake_case fields
          socket.send(
            JSON.stringify({
              event: `subscription_response_${request_id}`,
              data: {
                status: 'Subscribed',
                subscription_id,
                topic,
                request_id,
              },
            }),
          );
        }

        if (isUnsubscribe) {
          const data = msg?.data || msg?.params || {};
          const subscription_id = data.subscription_id || data.subscriptionId;

          socket.send(
            JSON.stringify({
              event: `unsubscribe_response_${subscription_id}`,
              data: {
                status: 'Unsubscribed',
                subscription_id,
                message: 'Unsubscribed successfully',
              },
            }),
          );
        }
      } catch (e) {
        // ignore
      }
    });
  });

  // Emit events every 5 seconds
  interval = setInterval(() => {
    if (!wss) return;
    const broadcast = (event: string, data: any) => {
      for (const client of wss!.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event, data }));
        }
      }
    };
    broadcast('block', { hash: randomHash(), timestamp: Date.now() });
    broadcast('transaction', {
      hash: randomHash(),
      status: 'Processed',
      programIds: ['program1'],
    });
    broadcast('account_update', {
      account: 'account1',
      transactionHash: randomHash(),
    });
    broadcast('rolledback_transactions', { transactionHashes: [randomHash()] });
    broadcast('reapplied_transactions', { transactionHashes: [randomHash()] });
    broadcast('dkg', { status: 'active' });
  }, 5000);

  await new Promise<void>((resolve) => httpServer!.listen(port, resolve));
  const address = httpServer!.address();
  const actualPort = typeof address === 'object' && address
    ? (address as AddressInfo).port
    : port;
  console.log(`[SERVER] WS mock server started on port ${actualPort}`);
  return actualPort;
}

export async function stopServer() {
  if (interval) clearInterval(interval);
  if (wss) {
    try {
      // Terminate all client sockets to ensure a clean shutdown
      for (const client of wss.clients) {
        try {
          client.terminate();
        } catch {}
      }
    } catch {}
    await new Promise<void>((resolve) => wss!.close(() => resolve()));
    wss = undefined;
  }
  if (httpServer)
    await new Promise<void>((resolve) => httpServer!.close(() => resolve()));
  console.log('[SERVER] WS mock server stopped');
}

function randomHash(): string {
  return Math.random().toString(36).substring(2, 15);
}
