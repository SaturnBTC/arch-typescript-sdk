export interface Block {
  transactions: Array<string>;
  previous_block_hash: string;
  timestamp: number;
  block_height: number;
  bitcoin_block_height: string;
  transactions_count: number;
  merkle_root: string;
}
