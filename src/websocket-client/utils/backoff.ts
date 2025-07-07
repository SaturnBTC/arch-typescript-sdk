import {
  BackoffStrategy,
  BackoffStrategyType,
} from '../config/backoff-strategy';

export class BackoffCalculator {
  static calculateDelay(strategy: BackoffStrategy, attempt: number): number {
    switch (strategy.type) {
      case BackoffStrategyType.Constant:
        return strategy.initial || 1000;

      case BackoffStrategyType.Linear:
        const initial = strategy.initial || 1000;
        const step = strategy.step || 1000;
        return initial + step * attempt;

      case BackoffStrategyType.Exponential:
        const expInitial = strategy.initial || 1000;
        const factor = strategy.factor || 2.0;
        const maxDelay = strategy.maxDelay || 60000;
        const jitter = strategy.jitter || 0.1;

        // Calculate base exponential delay
        const baseDelay = expInitial * Math.pow(factor, attempt);

        // Apply jitter
        const jitterFactor = 1.0 - jitter + Math.random() * jitter * 2.0;
        const jitteredDelay = baseDelay * jitterFactor;

        // Ensure we don't exceed max delay
        return Math.min(jitteredDelay, maxDelay);

      default:
        return 1000;
    }
  }
}
