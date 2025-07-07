import { BackoffStrategy } from '../config/backoff-strategy';
import { BackoffCalculator } from '../utils/backoff';

export class ReconnectionManager {
  private enabled: boolean = false;
  private strategy: BackoffStrategy;
  private maxAttempts: number = 5;
  private currentAttempt: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(defaultStrategy: BackoffStrategy) {
    this.strategy = defaultStrategy;
  }

  setOptions(
    enabled: boolean,
    strategy: BackoffStrategy,
    maxAttempts: number,
  ): void {
    this.enabled = enabled;
    this.strategy = strategy;
    this.maxAttempts = maxAttempts;
  }

  shouldReconnect(): boolean {
    return (
      this.enabled &&
      (this.maxAttempts === 0 || this.currentAttempt < this.maxAttempts)
    );
  }

  scheduleReconnect(callback: () => void): void {
    if (!this.shouldReconnect()) {
      return;
    }

    this.currentAttempt++;
    const delay = BackoffCalculator.calculateDelay(
      this.strategy,
      this.currentAttempt,
    );

    console.log(
      `Scheduling reconnection attempt ${this.currentAttempt} in ${delay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      callback();
    }, delay);
  }

  resetAttempts(): void {
    this.currentAttempt = 0;
  }

  cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  getCurrentAttempt(): number {
    return this.currentAttempt;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}
