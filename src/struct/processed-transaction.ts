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
  bitcoin_txid: Uint8Array | null;
  logs: Array<string>;
  rollback_status: RollbackStatus;
}
