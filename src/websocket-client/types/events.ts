export enum EventTopic {
  Block = 'block',
  Transaction = 'transaction',
  AccountUpdate = 'account_update',
  RolledbackTransactions = 'rolledback_transactions',
  ReappliedTransactions = 'reapplied_transactions',
  DKG = 'dkg',
}

export enum TransactionStatus {
  Queued = 'Queued',
  Processed = 'Processed',
  Failed = 'Failed',
}

export interface BlockEvent {
  hash: string;
  timestamp: number;
}

export interface TransactionEvent {
  hash: string;
  status: TransactionStatus | { Failed: string };
  program_ids: string[];
  block_height: number;
}

export interface AccountUpdateEvent {
  account: string;
  transaction_hash: string;
  block_height: number;
}

export interface RolledbackTransactionsEvent {
  transaction_hashes: string[];
  block_height: number;
}

export interface ReappliedTransactionsEvent {
  transaction_hashes: string[];
  block_height: number;
}

export interface DKGEvent {
  status: string;
}

export type ArchSocketEvent = EventTopic | 'connect' | 'disconnect';
