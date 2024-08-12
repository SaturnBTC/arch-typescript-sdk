import { Schema } from 'borsh';
import { Pubkey } from './pubkey';
import { UtxoMeta } from './utxo';

export class AccountInfo {
  key: Pubkey;
  utxo: UtxoMeta;
  data: Uint8Array;
  owner: Pubkey;
  is_signer: boolean;
  is_writable: boolean;

  constructor(
    key: Pubkey,
    utxo: UtxoMeta,
    is_signer: boolean,
    is_writable: boolean,
  ) {
    this.key = key;
    this.utxo = utxo;
    this.is_signer = is_signer;
    this.is_writable = is_writable;
    this.data = new Uint8Array();
    this.owner = Pubkey.fromSlice(new Uint8Array(32));
  }
}

export class AccountMeta {
  constructor(
    public pubkey: Pubkey,
    public is_signer: boolean,
    public is_writable: boolean,
  ) {}

  static Schema: Schema = {
    struct: {
      pubkey: Pubkey.Schema,
      is_signer: 'bool',
      is_writable: 'bool',
    },
  };
}
