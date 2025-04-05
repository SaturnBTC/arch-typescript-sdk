export enum Action {
  // START_KEY_EXCHANGE = 'start_key_exchange',
  // START_DKG = 'start_dkg',
  // ASSIGN_AUTHORITY = 'assign_authority',
  READ_ACCOUNT_INFO = 'read_account_info',
  // DEPLOY_PROGRAM = 'deploy_program',
  SEND_TRANSACTION = 'send_transaction',
  SEND_TRANSACTIONS = 'send_transactions',
  GET_BLOCK = 'get_block',
  GET_BLOCK_COUNT = 'get_block_count',
  GET_BLOCK_HASH = 'get_block_hash',
  GET_BEST_BLOCK_HASH = 'get_best_block_hash',
  GET_PROCESSED_TRANSACTION = 'get_processed_transaction',
  GET_ACCOUNT_ADDRESS = 'get_account_address',
  GET_PROGRAM_ACCOUNTS = 'get_program_accounts',
}

export const RUNTIME_TX_SIZE_LIMIT = 1024; /** usize */

// Buffer.from("apl-token00000000000000000000000", "utf8");
export const TOKEN_PROGRAM_ID = new Uint8Array([
  97, 112, 108, 45, 116, 111, 107, 101, 110, 48, 48, 48, 48, 48, 48, 48, 48, 48,
  48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48,
]);
// Buffer.from("associated-token-account00000000", "utf8");
export const ASSOCIATED_TOKEN_PROGRAM_ID = new Uint8Array([
  97, 115, 115, 111, 99, 105, 97, 116, 101, 100, 45, 116, 111, 107, 101, 110,
  45, 97, 99, 99, 111, 117, 110, 116, 48, 48, 48, 48, 48, 48, 48, 48,
]);
export const SYSTEM_PROGRAM_ID = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1,
]);
