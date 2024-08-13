import { it, describe, expect } from 'vitest';
import { Message } from '../struct/message';
import { Pubkey } from '../struct/pubkey';
import { SystemInstruction } from '../struct/instruction';
import { localPubkey } from './fixtures';

describe('assert that message struct serializes as expected', () => {
  it('checks borsh serialization matches', () => {
    // Message
    // signer: localPubkey equal to the one from the fixtures file
    // instruction: new extend bytes instruction:
    // pubkey: localPubkey, from the fixtures file
    // data: u8 array, [1, 2, 3, 4, 5]
    const borshSerializedOutput = Uint8Array.from([
      1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 1,
      1, 10, 0, 0, 0, 1, 5, 0, 0, 0, 1, 2, 3, 4, 5,
    ]);

    const signer = localPubkey;
    const instruction = SystemInstruction.newExtendBytesInstruction(
      Uint8Array.from([1, 2, 3, 4, 5]),
      localPubkey,
    );

    const testMessage = new Message([signer], [instruction]);

    // number array for easier comparison
    const serialized = Array.from(testMessage.serialize());
    const expected = Array.from(borshSerializedOutput);

    expect(serialized).toEqual(expected);
  });

  it('checks if the toJSON output matches the serde json output', () => {
    const expected = {
      instructions: [
        {
          accounts: [
            {
              is_signer: true,
              is_writable: true,
              pubkey: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
              ],
            },
          ],
          data: [1, 5, 0, 0, 0, 1, 2, 3, 4, 5],
          program_id: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1,
          ],
        },
      ],
      signers: [
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
        ],
      ],
    };

    const signer = localPubkey;
    const instruction = SystemInstruction.newExtendBytesInstruction(
      Uint8Array.from([1, 2, 3, 4, 5]),
      localPubkey,
    );
    const message = new Message([signer], [instruction]);

    expect(message.toJSON()).toEqual(expected);
  });
});
