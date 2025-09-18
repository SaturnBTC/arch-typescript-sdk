import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

let wss: WebSocketServer | undefined;
let httpServer: http.Server | undefined;
let interval: NodeJS.Timeout | undefined;

export async function startServer(port = 3001) {
  httpServer = http.createServer();
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket: WebSocket) => {
    console.log(`[SERVER] Client connected`);

    socket.on('message', (raw: WebSocket.RawData) => {
      try {
        const text = typeof raw === 'string' ? raw : raw.toString();
        const msg = JSON.parse(text);
        if (msg.event === 'subscribe') {
          const data = msg.data || {};
          const subscriptionId = Math.random().toString(36).substring(2, 15);
          socket.send(
            JSON.stringify({
              event: `subscription_response_${data.request_id}`,
              data: {
                status: 'Subscribed',
                subscriptionId,
                topic: data.topic,
                request_id: data.request_id,
              },
            }),
          );
        }
        if (msg.event === 'unsubscribe') {
          const data = msg.data || {};
          socket.send(
            JSON.stringify({
              event: `unsubscribe_response_${data.subscriptionId}`,
              data: {
                status: 'Unsubscribed',
                subscriptionId: data.subscriptionId,
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
  console.log(`[SERVER] WS mock server started on port ${port}`);
}

export async function stopServer() {
  if (interval) clearInterval(interval);
  if (wss) wss.close();
  if (httpServer)
    await new Promise<void>((resolve) => httpServer!.close(() => resolve()));
  console.log('[SERVER] WS mock server stopped');
}

function randomHash(): string {
  return Math.random().toString(36).substring(2, 15);
}
