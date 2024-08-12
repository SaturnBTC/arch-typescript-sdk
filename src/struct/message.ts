import { Schema, serialize } from 'borsh';
import { Instruction } from './instruction';
import { Pubkey } from './pubkey';
import { createHash } from 'crypto';

export class Message {
  constructor(
    public signers: Array<Pubkey>,
    public instructions: Array<Instruction>,
  ) {}

  static Schema: Schema = {
    struct: {
      signers: {
        array: {
          type: Pubkey.Schema,
        },
      },
      instructions: {
        array: {
          type: Instruction.Schema,
        },
      },
    },
  };

  serialize() {
    return serialize(Message.Schema, this);
  }

  hash() {
    const serializedData = this.serialize();
    const hash1 = createHash('sha256').update(serializedData).digest();
    const hash2 = createHash('sha256').update(hash1).digest();

    return hash2;
  }
}
