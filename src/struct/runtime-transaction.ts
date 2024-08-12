import { deserialize, Schema, serialize } from 'borsh';
import { Message } from './message';
import { Signature } from './signature';
import { createHash } from 'crypto';
import { RUNTIME_TX_SIZE_LIMIT } from '../constants';

export class RuntimeTransaction {
  constructor(
    /** u32 */
    public version: number,
    public signatures: Array<Signature>,
    public message: Message,
  ) {}

  static Schema: Schema = {
    struct: {
      version: 'u32',
      signatures: { array: { type: Signature.Schema } },
      message: { struct: { type: Message.Schema } },
    },
  };

  serialize() {
    return serialize(RuntimeTransaction.Schema, this);
  }

  toJSON() {
    return {
      version: this.version,
      signatures: this.signatures.map(Signature.prototype.toJSON),
      message: this.message.toJSON(),
    };
  }

  fromBuffer(buffer: Uint8Array) {
    const deserialized = deserialize(RuntimeTransaction.Schema, buffer);
    if (!deserialized) throw Error("runtime tx couldn't be deserialized");
    const jsonParsed = JSON.parse(deserialized.toString());

    return new RuntimeTransaction(
      jsonParsed.version,
      jsonParsed.signatures,
      jsonParsed.message,
    );
  }

  txid() {
    const hash1 = createHash('sha256').update(this.serialize()).digest();
    const hash2 = createHash('sha256').update(hash1).digest();

    return hash2;
  }

  checkTxSizeLimit() {
    const serialized = this.serialize();
    if (serialized.length > RUNTIME_TX_SIZE_LIMIT) {
      throw Error('runtime tx size exceeds RUNTIME_TX_SIZE_LIMIT');
    }
  }
}
