import { Schema } from 'borsh';
import { Buffer } from 'buffer';

export class Pubkey {
  private data: Uint8Array;

  constructor(data: Uint8Array) {
    if (data.length !== 32) {
      throw new Error('Invalid data length for Pubkey, expected 32 bytes.');
    }
    this.data = data;
  }

  // Borsh schema - TODO: this doesn't seem correct
  static Schema: Schema = {
    struct: {
      data: {
        array: { type: 'u8', len: 32 },
      },
    },
  };

  static fromSlice(data: Uint8Array): Pubkey {
    const tmp = new Uint8Array(32);
    tmp.set(data.slice(0, 32));
    return new Pubkey(tmp);
  }

  static fromHex(hexString: string): Pubkey {
    const data = Buffer.from(hexString, 'hex');
    return Pubkey.fromSlice(data);
  }

  static fromString(s: string): Pubkey {
    return Pubkey.fromHex(s);
  }

  static systemProgram(): Pubkey {
    const tmp = new Uint8Array(32);
    tmp[31] = 1;
    return new Pubkey(tmp);
  }

  serialize(): Uint8Array {
    return this.data;
  }

  toHex(): string {
    return Buffer.from(this.data).toString('hex');
  }

  toString(): string {
    return this.toHex();
  }

  toJSON() {
    return Array.from(this.data);
  }

  equals(key: Pubkey) {
    for (let i = 0; i < 32; i++) {
      if (this.data[i] !== key.data[i]) {
        return false;
      }
    }

    return true;
  }
}
