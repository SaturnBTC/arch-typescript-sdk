import { RuntimeTransaction } from './runtime-transaction';

export type ProcessedTransactionStatus =
  | 'Processing'
  | 'Processed'
  | { Failed: string };

export type RollbackStatus = { Rolledback: string } | 'NotRolledback';

export interface ProcessedTransaction {
  runtime_transaction: RuntimeTransaction;
  status: ProcessedTransactionStatus;
  rollback_status: RollbackStatus;
  bitcoin_txid: string | null;
  logs: Array<string>;
}
