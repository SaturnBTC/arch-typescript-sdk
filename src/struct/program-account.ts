import { Pubkey } from './pubkey';
import { AccountInfoResult } from './account';

export interface AccountFilter {
  memcmp?: {
    offset: number;
    bytes: string; // hex-encoded bytes
  };
  dataSize?: number;
}
export interface ProgramAccount {
  pubkey: Pubkey;
  account: AccountInfoResult;
}
