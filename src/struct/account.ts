import { Schema } from 'borsh';
import { Pubkey, PubkeySchema } from './pubkey';
import { UtxoMeta } from './utxo';

export interface AccountInfo {
  key: Pubkey;
  utxo: UtxoMeta;
  data: Uint8Array;
  owner: Pubkey;
  is_signer: boolean;
  is_writable: boolean;
}
export interface AccountMeta {
  pubkey: Pubkey;
  is_signer: boolean;
  is_writable: boolean;
}

export interface AccountInfoResult {
  owner: Pubkey;
  data: Uint8Array;
  utxo: string;
  is_executable: boolean;
}

export const AccountMetaSchema: Schema = {
  struct: {
    pubkey: PubkeySchema,
    is_signer: 'bool',
    is_writable: 'bool',
  },
};
