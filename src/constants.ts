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
