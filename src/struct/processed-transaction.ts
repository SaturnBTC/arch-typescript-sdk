import { RuntimeTransaction } from './runtime-transaction';

export type ProcessedTransactionStatus =
  | {
      type: 'processing';
    }
  | {
      type: 'processed';
    }
  | {
      type: 'failed';
      message: string;
    };

export type RollbackStatus =
  | {
      type: 'notRolledback';
    }
  | {
      type: 'rolledback';
      message: string;
    };

export interface ProcessedTransaction {
  runtime_transaction: RuntimeTransaction;
  status: ProcessedTransactionStatus;
  rollback_status: RollbackStatus;
  bitcoin_txid: string | null;
  logs: Array<string>;
}
