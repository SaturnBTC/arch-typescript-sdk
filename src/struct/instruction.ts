import { Schema, serialize } from 'borsh';
import { AccountMeta } from './account';
import { Pubkey } from './pubkey';
import { createHash } from 'crypto';

export class Instruction {
  constructor(
    public program_id: Pubkey,
    public accounts: Array<AccountMeta>,
    public data: Uint8Array,
  ) {}

  static Schema: Schema = {
    struct: {
      program_id: Pubkey.Schema,
      accounts: {
        array: {
          type: AccountMeta.Schema,
        },
      },
      data: {
        array: {
          type: 'u8',
        },
      },
    },
  };

  serialize() {
    return serialize(Instruction.Schema, this);
  }

  hash() {
    const serializedData = this.serialize();
    const hash1 = createHash('sha256').update(serializedData).digest();
    const hash2 = createHash('sha256').update(hash1).digest();

    return hash2;
  }

  toJSON() {
    return {
      program_id: this.program_id.toJSON(),
      accounts: this.accounts.map((accountMeta) => accountMeta.toJSON()),
      data: Array.from(this.data),
    };
  }
}

export class CreateAccount {
  constructor(
    public txid: String,
    /** u32 */
    public vout: number,
    public pubkey: Pubkey,
  ) {}

  static Schema: Schema = {
    struct: {
      txid: 'string',
      vout: 'u32',
      pubkey: Pubkey.Schema,
    },
  };

  serialize() {
    return serialize(CreateAccount.Schema, this);
  }
}

// export class ExtendBytes {}

export class SystemInstruction {
  /**
   * Create Account instruction
   *
   * @param {string} txid
   * @param {number} vout u32
   * @param {Pubkey} pubkey
   */
  static newCreateAccountInstruction(
    txid: string,
    vout: number,
    pubkey: Pubkey,
  ) {
    return new Instruction(
      Pubkey.systemProgram(),
      [AccountMeta.from({ pubkey, is_signer: true, is_writable: true })],
      new CreateAccount(txid, vout, pubkey).serialize(),
    );
  }

  /**
   * Extend Bytes instruction
   *
   * @param {Uint8Array} data
   * @param {Pubkey} pubkey
   */
  static newExtendBytesInstruction(data: Uint8Array, pubkey: Pubkey) {
    return new Instruction(
      Pubkey.systemProgram(),
      [AccountMeta.from({ pubkey, is_signer: true, is_writable: true })],
      data, // should borsh be used here?
    );
  }
}
