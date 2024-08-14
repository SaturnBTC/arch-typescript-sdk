import { describe, expect, it } from 'vitest';
import { SystemInstruction } from '../struct/instruction';
import { localPubkey } from './fixtures';

const expectedJsonOutput = {
  accounts: [
    {
      is_signer: true,
      is_writable: true,
      pubkey: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ],
    },
  ],
  data: [1, 5, 0, 0, 0, 1, 2, 3, 4, 5],
  program_id: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
};

describe('assert that instruction struct serialization matches the one from Rust', () => {
  it('checks if the toJSON output matches the serde json output', () => {
    const instruction = SystemInstruction.newExtendBytesInstruction(
      Uint8Array.from([1, 2, 3, 4, 5]),
      localPubkey,
    );

    expect(instruction.toJSON()).equals(expectedJsonOutput);
  });
});
