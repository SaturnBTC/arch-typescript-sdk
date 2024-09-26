import { it, describe, expect } from 'vitest';
import { systemProgram } from '../serde/pubkey';
import { Instruction } from '../struct/instruction';
import { serialize as serializeInstruction } from '../serde/instruction';

describe('assert that instruction struct serializes as expected', () => {
  it('checks borsh serialization matches', () => {
    // instruction: new extend bytes instruction:
    const borshSerializedOutput = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 10, 0, 0, 0, 0, 0, 0,
      0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ]);

    const testInstruction: Instruction = {
      program_id: systemProgram(),
      accounts: [
        {
          pubkey: systemProgram(),
          is_signer: true,
          is_writable: true,
        },
      ],
      data: new Uint8Array(10).fill(2),
    };

    // number array for easier comparison
    const serialized = Array.from(serializeInstruction(testInstruction));
    const expected = Array.from(borshSerializedOutput);

    expect(serialized).toEqual(expected);
  });
});
