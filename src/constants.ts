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
  REQUEST_AIRDROP = 'request_airdrop',
  CREATE_ACCOUNT_WITH_FAUCET = 'create_account_with_faucet',
  GET_BLOCK_BY_HEIGHT = 'get_block_by_height',
  GET_TRANSACTIONS_BY_BLOCK = 'get_transactions_by_block',
  GET_TRANSACTIONS_BY_IDS = 'get_transactions_by_ids',
  RECENT_TRANSACTIONS = 'recent_transactions',
  GET_MULTIPLE_ACCOUNTS = 'get_multiple_accounts',
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
// Buffer.from("BpfLoader11111111111111111111111", "utf8");
export const BPF_LOADER_PROGRAM_ID = new Uint8Array([
  66, 112, 102, 76, 111, 97, 100, 101, 114, 49, 49, 49, 49, 49, 49, 49, 49, 49,
  49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49,
]);
// Buffer.from("VoteProgram111111111111111111111", "utf8")
export const VOTE_PROGRAM_ID = new Uint8Array([
  86, 111, 116, 101, 80, 114, 111, 103, 114, 97, 109, 49, 49, 49, 49, 49, 49,
  49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49,
]);
// Buffer.from("StakeProgram11111111111111111111", "utf8")
export const STAKE_PROGRAM_ID = new Uint8Array([
  83, 116, 97, 107, 101, 80, 114, 111, 103, 114, 97, 109, 49, 49, 49, 49, 49,
  49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49,
]);
