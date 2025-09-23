export type WebSocketFactory = (url: string) => any;

export const defaultWebSocketFactory: WebSocketFactory = (url: string) => {
  const WS = (typeof globalThis !== 'undefined'
    ? (globalThis as any).WebSocket
    : undefined) as any;
  if (!WS) {
    throw new Error(
      'No WebSocket implementation available. Provide webSocketFactory in options when not running in a browser.',
    );
  }
  return new WS(url);
};


