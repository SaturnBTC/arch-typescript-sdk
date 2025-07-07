import { BackoffStrategy } from './backoff-strategy';

export interface WebSocketClientOptions {
  url: string;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  pingInterval?: number;
  pongTimeout?: number;
  backoffStrategy?: BackoffStrategy;
  autoReconnect?: boolean;
  timeout?: number;
  transports?: string[];
  forceNew?: boolean;
  multiplex?: boolean;
}

export const DEFAULT_OPTIONS: WebSocketClientOptions = {
  maxReconnectAttempts: 5,
  reconnectInterval: 2000,
  pingInterval: 10000,
  pongTimeout: 10000,
  autoReconnect: false,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  forceNew: true,
  multiplex: false,
  url: '', // must be provided by user
};
