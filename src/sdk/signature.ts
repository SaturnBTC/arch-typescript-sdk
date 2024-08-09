import { Schema } from 'borsh';
import { serialize } from 'borsh';

export class Signature {
  constructor(public data: Uint8Array) {}

  static Schema: Schema = {
    array: {
      type: 'u8',
    },
  };

  serialize() {
    return serialize(Signature.Schema, this.data);
  }
}
