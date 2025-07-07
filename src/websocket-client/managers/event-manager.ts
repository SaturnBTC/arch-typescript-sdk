import { Socket } from 'socket.io-client';
import {
  EventTopic,
  EventCallback,
  AsyncEventCallback,
  ArchWebSocketEvent,
} from '../types/events';

export class EventManager {
  private eventHandlers: Map<EventTopic, Set<EventCallback<any>>> = new Map();
  private asyncEventHandlers: Map<EventTopic, Set<AsyncEventCallback<any>>> =
    new Map();
  private socket: Socket | null = null;

  setSocket(socket: Socket): void {
    this.socket = socket;
    this.setupEventListeners();
  }

  onEvent<T extends EventTopic>(
    topic: T,
    callback: (event: Extract<ArchWebSocketEvent, { topic: T }>) => void,
  ): () => void {
    if (!this.eventHandlers.has(topic)) {
      this.eventHandlers.set(topic, new Set());
    }

    this.eventHandlers.get(topic)!.add(callback as EventCallback<any>);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(topic);
      if (handlers) {
        handlers.delete(callback as EventCallback<any>);
        if (handlers.size === 0) {
          this.eventHandlers.delete(topic);
        }
      }
    };
  }

  onEventAsync<T extends EventTopic>(
    topic: T,
    callback: (
      event: Extract<ArchWebSocketEvent, { topic: T }>,
    ) => Promise<void>,
  ): () => void {
    if (!this.asyncEventHandlers.has(topic)) {
      this.asyncEventHandlers.set(topic, new Set());
    }

    this.asyncEventHandlers
      .get(topic)!
      .add(callback as AsyncEventCallback<any>);

    // Return unsubscribe function
    return () => {
      const handlers = this.asyncEventHandlers.get(topic);
      if (handlers) {
        handlers.delete(callback as AsyncEventCallback<any>);
        if (handlers.size === 0) {
          this.asyncEventHandlers.delete(topic);
        }
      }
    };
  }

  removeEventListeners(topic: EventTopic): void {
    this.eventHandlers.delete(topic);
    this.asyncEventHandlers.delete(topic);
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // CHECK:Listen for all event types
    Object.values(EventTopic).forEach((topic) => {
      this.socket!.on(topic, (data: any) => {
        this.handleEvent({ topic, data } as ArchWebSocketEvent);
      });
    });
  }

  private handleEvent(event: ArchWebSocketEvent): void {
    const topic = event.topic;

    // Handle synchronous callbacks
    const syncHandlers = this.eventHandlers.get(topic as EventTopic);
    if (syncHandlers) {
      syncHandlers.forEach((handler) => {
        try {
          (handler as (event: ArchWebSocketEvent) => void)(event);
        } catch (error) {
          console.error(`Error in sync event handler for ${topic}:`, error);
        }
      });
    }

    // Handle asynchronous callbacks
    const asyncHandlers = this.asyncEventHandlers.get(topic as EventTopic);
    if (asyncHandlers) {
      asyncHandlers.forEach((handler) => {
        try {
          (handler as any)(event).catch((error: any) => {
            console.error(`Error in async event handler for ${topic}:`, error);
          });
        } catch (error) {
          console.error(
            `Error calling async event handler for ${topic}:`,
            error,
          );
        }
      });
    }
  }
}
