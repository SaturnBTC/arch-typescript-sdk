import { Pubkey } from './pubkey';

export interface TransactionListParams {
  limit?: number;
  offset?: number;
  account?: Pubkey;
}
