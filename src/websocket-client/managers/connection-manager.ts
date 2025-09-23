import { SocketLike } from './socket-like';
import { WebSocketAdapter } from './ws-adapter';
import {
  DEFAULT_OPTIONS,
  WebSocketClientOptions,
} from '../config/web-socket-config';
import { WebSocketError, WebSocketErrorType } from '../errors/web-socket-error';

export class ConnectionManager {
  private socket: SocketLike | null = null;
  private connectCallbacks: Set<() => void> = new Set();
  private disconnectCallbacks: Set<() => void> = new Set();
  private options: WebSocketClientOptions;
  private isConnecting: boolean = false;
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else if (!this.isConnecting) {
            reject(
              new WebSocketError(
                WebSocketErrorType.ConnectionFailed,
                'Connection failed',
              ),
            );
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocketAdapter(this.options.url, this.options.webSocketFactory);

      // Set up event listeners
      this.setupEventListeners();

      // Connect to the server
      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(
            new WebSocketError(
              WebSocketErrorType.ConnectionFailed,
              'Socket not initialized',
            ),
          );
          return;
        }

        const timeout = setTimeout(() => {
          reject(
            new WebSocketError(
              WebSocketErrorType.ConnectionFailed,
              'Connection timeout',
            ),
          );
        }, this.options.timeout || DEFAULT_OPTIONS.timeout);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          resolve();
        });

        // For plain WS we don't have a separate 'connect_error' upfront.
        // We'll treat timeout as connection failure.

        this.socket.connect();
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): SocketLike | null {
    return this.socket;
  }

  onConnect(callback: () => void): () => void {
    this.connectCallbacks.add(callback);
    return () => this.connectCallbacks.delete(callback);
  }

  onDisconnect(callback: () => void): () => void {
    this.disconnectCallbacks.add(callback);
    return () => this.disconnectCallbacks.delete(callback);
  }

  enableKeepAlive(interval: number): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    this.keepAliveInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, interval);
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectCallbacks.forEach((connectCallback) => {
        try {
          connectCallback();
        } catch (e) {
          throw new WebSocketError(
            WebSocketErrorType.Other,
            'Error in onConnect callback',
            e instanceof Error ? e : undefined,
          );
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.disconnectCallbacks.forEach((disconnectCallback) => {
        try {
          disconnectCallback();
        } catch (e) {
          throw new WebSocketError(
            WebSocketErrorType.Other,
            'Error in onDisconnect callback',
            e instanceof Error ? e : undefined,
          );
        }
      });
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
}
