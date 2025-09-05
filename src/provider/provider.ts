import { AccountInfoResult } from '../struct/account';
import { Block } from '../struct/block';
import { BlockTransactionFilter } from '../struct/block-transaction-filter';
import { BlockTransactionsParams } from '../struct/block-transactions-params';
import { ProcessedTransaction } from '../struct/processed-transaction';
import { ProgramAccount } from '../struct/program-account';
import { Pubkey } from '../struct/pubkey';
import { RuntimeTransaction } from '../struct/runtime-transaction';
import { TransactionListParams } from '../struct/transaction-list-params';
import { TransactionsByIdsParams } from '../struct/transactions-by-ids-params';

export interface Provider {
  sendTransaction: (transaction: RuntimeTransaction) => Promise<string>;
  sendTransactions: (transactions: RuntimeTransaction[]) => Promise<string[]>;
  readAccountInfo: (pubkey: Pubkey) => Promise<AccountInfoResult>;
  getAccountAddress: (pubkey: Pubkey) => Promise<string>;
  getBestBlockHash: () => Promise<string>;
  getBlock: (blockHash: string) => Promise<Block | undefined>;
  getBlockCount: () => Promise<number>;
  getBlockHash: (blockHeight: number) => Promise<string>;
  getProgramAccounts: (programId: Pubkey) => Promise<ProgramAccount[]>;
  getProcessedTransaction: (
    txid: string,
  ) => Promise<ProcessedTransaction | undefined>;
  requestAirdrop: (pubkey: Pubkey) => Promise<void>;
  createAccountWithFaucet: (pubkey: Pubkey) => Promise<RuntimeTransaction>;
  getBlockByHeight: (
    blockHeight: number,
    filter?: BlockTransactionFilter,
  ) => Promise<Block | undefined>;
  getTransactionsByBlock: (
    params: BlockTransactionsParams,
  ) => Promise<ProcessedTransaction[]>;
  getTransactionsByIds: (
    params: TransactionsByIdsParams,
  ) => Promise<(ProcessedTransaction | null)[]>;
  recentTransactions: (
    params: TransactionListParams,
  ) => Promise<ProcessedTransaction[]>;
  getMultipleAccounts: (
    pubkeys: Pubkey[],
  ) => Promise<(AccountInfoResult | null)[]>;
}
