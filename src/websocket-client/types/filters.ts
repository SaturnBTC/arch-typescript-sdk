import { TransactionStatus } from './events';

export interface EventFilter {
  [key: string]: any;
}

export interface TransactionFilter extends EventFilter {
  status?: TransactionStatus;
  programIds?: string[];
}

export interface BlockFilter extends EventFilter {
  hash?: string;
  timestamp?: number;
}
