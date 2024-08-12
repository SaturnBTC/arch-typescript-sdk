import { Schema, serialize } from 'borsh';
import { Pubkey } from './pubkey';

export class InputToSign {
  constructor(
    public index: number /* u32 */,
    public signer: Pubkey,
  ) {}

  static Schema: Schema = {
    struct: {
      index: 'u32',
      signer: Pubkey.Schema,
    },
  };

  serialize() {
    return serialize(InputToSign.Schema, this);
  }
}
