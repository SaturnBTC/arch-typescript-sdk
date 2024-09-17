import { it, describe, expect } from 'vitest';
import { systemProgram } from '../serde/pubkey';
import { Instruction } from '../struct/instruction';
import { AccountMeta } from '../struct/account';
import { serialize } from '../serde/account';

describe('assert that account struct serializes as expected', () => {
  it('checks borsh serialization matches', () => {
    // instruction: new extend bytes instruction:
    const borshSerializedOutput = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1, 1, 1,
    ]);

    const testAccount: AccountMeta = {
      pubkey: systemProgram(),
      is_signer: true,
      is_writable: true,
    };

    // number array for easier comparison
    const serialized = Array.from(serialize(testAccount));
    const expected = Array.from(borshSerializedOutput);

    expect(serialized).toEqual(expected);
  });
});
