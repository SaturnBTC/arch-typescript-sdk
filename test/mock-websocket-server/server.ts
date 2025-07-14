import { Server } from 'socket.io';
import http from 'http';

let io: Server | undefined;
let httpServer: http.Server | undefined;
let interval: NodeJS.Timeout | undefined;

export async function startServer(port = 3001) {
  httpServer = http.createServer();
  io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`[SERVER] Client connected: ${socket.id}`);

    socket.on('subscribe', (data) => {
      console.log(
        `[SERVER] Subscribe from client ${socket.id} to topic: ${data.topic}`,
      );
      const subscriptionId = Math.random().toString(36).substring(2, 15);
      socket.emit(`subscription_response_${data.request_id}`, {
        status: 'Subscribed',
        subscriptionId,
        topic: data.topic,
        request_id: data.request_id,
      });
    });

    socket.on('unsubscribe', (data) => {
      console.log(
        `[SERVER] Unsubscribe from client ${socket.id} for subscriptionId: ${data.subscriptionId}`,
      );
      socket.emit(`unsubscribe_response_${data.subscriptionId}`, {
        status: 'Unsubscribed',
        subscriptionId: data.subscriptionId,
        message: 'Unsubscribed successfully',
      });
    });
  });

  // Emit events every 5 seconds
  interval = setInterval(() => {
    if (!io) return;
    io.emit('block', { hash: randomHash(), timestamp: Date.now() });
    io.emit('transaction', {
      hash: randomHash(),
      status: 'Processed',
      programIds: ['program1'],
    });
    io.emit('account_update', {
      account: 'account1',
      transactionHash: randomHash(),
    });
    io.emit('rolledback_transactions', { transactionHashes: [randomHash()] });
    io.emit('reapplied_transactions', { transactionHashes: [randomHash()] });
    io.emit('dkg', { status: 'active' });
  }, 5000);

  await new Promise<void>((resolve) => httpServer!.listen(port, resolve));
  console.log(`[SERVER] Socket.IO mock server started on port ${port}`);
}

export async function stopServer() {
  if (interval) clearInterval(interval);
  if (io) io.close();
  if (httpServer)
    await new Promise<void>((resolve) => httpServer!.close(() => resolve()));
  console.log('[SERVER] Socket.IO mock server stopped');
}

function randomHash(): string {
  return Math.random().toString(36).substring(2, 15);
}
