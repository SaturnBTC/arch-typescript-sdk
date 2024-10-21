import { RuntimeTransaction } from './runtime-transaction';

export enum Status {
  Processing,
  Processed,
}

export interface ProcessedTransaction {
  runtime_transaction: RuntimeTransaction;
  status: Status;
  bitcoin_txid: string | undefined;
}
