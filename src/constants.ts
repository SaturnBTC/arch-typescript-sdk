export enum Actions {
  START_KEY_EXCHANGE = 'start_key_exchange',
  ASSIGN_AUTHORITY = 'assign_authority',
  READ_ACCOUNT_INFO = 'read_account_info',
  DEPLOY_PROGRAM = 'deploy_program',
  SEND_TRANSACTION = 'send_transaction',
  GET_PROGRAM = 'get_program',
  GET_BLOCK = 'get_block',
  GET_BEST_BLOCK_HASH = 'get_best_block_hash',
  GET_PROCESSED_TRANSACTION = 'get_processed_transaction',
  GET_ACCOUNT_ADDRESS = 'get_account_address',
}

export const RUNTIME_TX_SIZE_LIMIT = 1024; /** usize */
