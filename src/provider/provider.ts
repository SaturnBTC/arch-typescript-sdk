import { AccountInfoResult } from '../struct/account';
import { Block } from '../struct/block';
import { ProcessedTransaction } from '../struct/processed-transaction';
import { ProgramAccount } from '../struct/program-account';
import { Pubkey } from '../struct/pubkey';
import { RuntimeTransaction } from '../struct/runtime-transaction';

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
  getProcessedTransaction: (txid: string) => Promise<ProcessedTransaction | undefined>;
  requestAirdrop: (pubkey: Pubkey) => Promise<void>;
  createAccountWithFaucet: (pubkey: Pubkey) => Promise<void>;
}
