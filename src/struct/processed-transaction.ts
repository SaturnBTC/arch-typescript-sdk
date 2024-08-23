import { RuntimeTransaction } from './runtime-transaction';

export enum Status {
  Processing,
  Processed,
}

export interface ProcessedTransaction {
  runtimeTransaction: RuntimeTransaction;
  status: Status;
  bitcoinTxids: string[];
}

