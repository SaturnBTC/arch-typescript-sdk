import { Pubkey } from './pubkey';

export interface BlockTransactionsParams {
  block_hash: string;
  limit?: number;
  offset?: number;
  account?: Pubkey;
}
