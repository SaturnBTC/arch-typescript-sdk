import { io, Socket } from 'socket.io-client';
import {
  DEFAULT_OPTIONS,
  WebSocketClientOptions,
} from '../config/web-socket-config';
import { WebSocketError, WebSocketErrorType } from '../errors/web-socket-error';

export class ConnectionManager {
  private socket: Socket | null = null;
  private connectCallbacks: Set<() => void> = new Set();
  private disconnectCallbacks: Set<() => void> = new Set();
  private options: WebSocketClientOptions;
  private isConnecting: boolean = false;
  private keepAliveInterval: NodeJS.Timeout | null = null;

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
      // Create Socket.IO connection
      this.socket = io(this.options.url, {
        transports: this.options.transports ?? DEFAULT_OPTIONS.transports,
        timeout: this.options.timeout ?? DEFAULT_OPTIONS.timeout,
        forceNew: this.options.forceNew ?? DEFAULT_OPTIONS.forceNew,
        multiplex: this.options.multiplex ?? DEFAULT_OPTIONS.multiplex,
        autoConnect: false, // We'll connect manually
        reconnection: false, // We'll handle reconnection ourselves
      });

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

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          reject(
            new WebSocketError(
              WebSocketErrorType.ConnectionFailed,
              error.message,
            ),
          );
        });

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

  getSocket(): Socket | null {
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

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
}
