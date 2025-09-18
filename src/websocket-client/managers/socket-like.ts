export interface SocketLike {
  connected: boolean;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  once(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  connect(): void;
  disconnect(): void;
}


