import { Schema } from 'borsh';
import { Pubkey } from './pubkey';
import { UtxoMeta } from './utxo';

export class AccountInfoResult {
  pubkey: Pubkey;
  utxo: UtxoMeta | null;
  data: Uint8Array;
  owner: Pubkey | null;

  constructor(
    pubkey: Pubkey,
    utxo: UtxoMeta | null,
    data: Uint8Array,
    owner: Pubkey | null,
  ) {
    this.pubkey = pubkey;
    this.utxo = utxo;
    this.data = data;
    this.owner = owner;
  }

  static Schema: Schema = {
    struct: {
      pubkey: Pubkey.Schema,
      utxo: { option: UtxoMeta.Schema },
      data: { array: { type: 'u8', len: 32 } },
      owner: { option: Pubkey.Schema },
    },
  };
}
