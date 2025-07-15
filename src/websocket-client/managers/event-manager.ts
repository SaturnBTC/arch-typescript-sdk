import { ArchSocketEvent } from '../types/events';

export type ArchEventCallback = (...args: any[]) => Promise<void>;

export class EventManager {
  private listeners: Map<ArchSocketEvent, Set<ArchEventCallback>> = new Map();

  addListener(event: ArchSocketEvent, callback: ArchEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeListener(event: ArchSocketEvent, callback: ArchEventCallback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
      if (this.listeners.get(event)!.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  removeAllListeners(event: ArchSocketEvent) {
    this.listeners.delete(event);
  }

  getListeners(event: ArchSocketEvent): Set<ArchEventCallback> | undefined {
    return this.listeners.get(event);
  }

  getAllListeners() {
    return this.listeners;
  }
}
