import { RuntimeTransaction } from './runtime-transaction';

export type ProcessedTransactionStatus = 'Processing' | 'Processed' | { Failed: string };

export interface ProcessedTransaction {
  runtime_transaction: RuntimeTransaction;
  status: ProcessedTransactionStatus;
  bitcoin_txid: string | null;
}
