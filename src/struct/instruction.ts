import { AccountMeta } from './account';
import { Pubkey } from './pubkey';

export interface Instruction {
  program_id: Pubkey;
  accounts: Array<AccountMeta>;
  data: Uint8Array;
}
