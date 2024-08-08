import { Schema } from 'borsh';
import { Pubkey } from './pubkey';

export class UtxoMeta {
  txid: string;
  vout: number;

  constructor(txid: string, vout: number) {
    this.txid = txid;
    this.vout = vout;
  }

  static Schema: Schema = {
    struct: {
      txid: 'string',
      vout: 'u32',
    },
  };

  id(): string {
    return `${this.txid}:${this.vout}`;
  }
}

export class UtxoInfo {
  txid: string;
  vout: number;
  value: number;
  owner: Pubkey;

  constructor(txid: string, vout: number, value: number, owner: Pubkey) {
    this.txid = txid;
    this.vout = vout;
    this.value = value;
    this.owner = owner;
  }

  id(): string {
    return `${this.txid}:${this.vout}`;
  }
}
