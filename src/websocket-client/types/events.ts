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
  programIds: string[];
}

export interface AccountUpdateEvent {
  account: string;
  transactionHash: string;
}

export interface RolledbackTransactionsEvent {
  transactionHashes: string[];
}

export interface ReappliedTransactionsEvent {
  transactionHashes: string[];
}

export interface DKGEvent {
  status: string;
}

export type ArchSocketEvent = EventTopic | 'connect' | 'disconnect';
