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
}

export interface AccountUpdateEvent {
  account: string;
  transaction_hash: string;
}

export interface RolledbackTransactionsEvent {
  transaction_hashes: string[];
}

export interface ReappliedTransactionsEvent {
  transaction_hashes: string[];
}

export interface DKGEvent {
  status: string;
}

export type ArchWebSocketEvent =
  | { topic: 'block'; data: BlockEvent }
  | { topic: 'transaction'; data: TransactionEvent }
  | { topic: 'account_update'; data: AccountUpdateEvent }
  | { topic: 'rolledback_transactions'; data: RolledbackTransactionsEvent }
  | { topic: 'reapplied_transactions'; data: ReappliedTransactionsEvent }
  | { topic: 'dkg'; data: DKGEvent };

export type EventCallback<T extends EventTopic> = (
  event: Extract<ArchWebSocketEvent, { topic: T }>,
) => void;

export type AsyncEventCallback<T extends EventTopic> = (
  event: Extract<ArchWebSocketEvent, { topic: T }>,
) => Promise<void>;

export type ConnectionCallback = (connected: boolean) => void;
