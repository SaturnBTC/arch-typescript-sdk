export enum BackoffStrategyType {
  Constant = 'constant',
  Linear = 'linear',
  Exponential = 'exponential',
}

export interface BackoffStrategy {
  type: BackoffStrategyType;
  initial?: number;
  factor?: number;
  maxDelay?: number;
  step?: number;
  jitter?: number;
}

export const DEFAULT_BACKOFF_STRATEGY: BackoffStrategy = {
  type: BackoffStrategyType.Exponential,
  initial: 1000,
  factor: 2,
  maxDelay: 30000,
  jitter: 0.2,
};
