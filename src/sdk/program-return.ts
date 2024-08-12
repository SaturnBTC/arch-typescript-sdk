import { Schema, serialize } from 'borsh';
import { InputToSign } from './input-to-sign';

export class ProgramReturn {
  constructor(
    public txBytes: Uint8Array,
    public inputsToSign: Array<InputToSign>,
  ) {}

  static Schema: Schema = {
    struct: {
      txBytes: {
        array: {
          type: 'u8',
        },
      },
      inputsToSign: {
        array: {
          type: InputToSign.Schema,
        },
      },
    },
  };

  serialize() {
    return serialize(ProgramReturn.Schema, this);
  }
}
