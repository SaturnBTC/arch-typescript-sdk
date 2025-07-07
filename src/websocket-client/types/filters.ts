import { TransactionStatus } from './events';

export interface EventFilter {
  [key: string]: any;
}

export interface TransactionFilter extends EventFilter {
  status?: TransactionStatus;
  program_ids?: string[];
}

export interface BlockFilter extends EventFilter {
  hash?: string;
  timestamp?: number;
}
