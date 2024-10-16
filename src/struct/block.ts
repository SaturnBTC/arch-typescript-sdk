export interface Block {
  transactions: Array<string>;
  previous_block_hash: string;
  bitcoin_block_hash: string;
  hash: string;
  merkle_root: string;
  timestamp: number;
  transactions_count: number;
}
