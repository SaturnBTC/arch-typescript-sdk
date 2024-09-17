import { it, describe, expect } from 'vitest';
import { Message } from '../struct/message';
import { systemProgram } from '../serde/pubkey';
import { serialize as serializeMessage } from '../serde/message';
import { Instruction } from '../struct/instruction';

describe('assert that message struct serializes as expected', () => {
  it('checks borsh serialization matches', () => {
    // Message
    const borshSerializedOutput = Uint8Array.from([
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      1, 10, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ]);

    const signer = systemProgram();
    const instruction: Instruction = {
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

    const testMessage: Message = {
      signers: [signer],
      instructions: [instruction],
    };

    // number array for easier comparison
    const serialized = Array.from(serializeMessage(testMessage));
    const expected = Array.from(borshSerializedOutput);

    expect(serialized).toEqual(expected);
  });
});
