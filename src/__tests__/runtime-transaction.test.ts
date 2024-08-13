import { it, describe, expect } from 'vitest';
import { Message } from '../struct/message';
import { Pubkey } from '../struct/pubkey';
import { SystemInstruction } from '../struct/instruction';
import { localPubkey } from './fixtures';
import { RuntimeTransaction } from '../struct/runtime-transaction';
import { Signature } from '../struct/signature';

const borshSerializedOutput = Uint8Array.from([
  0, 0, 0, 0, 1, 0, 0, 0, 32, 0, 0, 0, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23,
  22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 1, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 1, 1, 10, 0, 0, 0, 1,
  5, 0, 0, 0, 1, 2, 3, 4, 5,
]);

const serdeJsonOutput = {
  message: {
    instructions: [
      {
        accounts: [
          {
            is_signer: true,
            is_writable: true,
            pubkey: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
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
  },
  signatures: [
    [
      32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15,
      14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ],
  ],
  version: 0,
};

describe('assert that runtime-transaction struct serialization matches the one from Rust', () => {
  it.skip('checks if borsh serialization matches', () => {
    const signer = localPubkey;
    const instruction = SystemInstruction.newExtendBytesInstruction(
      Uint8Array.from([1, 2, 3, 4, 5]),
      localPubkey,
    );
    const message = new Message([signer], [instruction]);
    const signature = new Signature(
      Uint8Array.from([
        32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15,
        14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ]),
    );
    const runtimeTransaction = new RuntimeTransaction(0, [signature], message);
    // const serialized = runtimeTransaction.serialize();

    // expect(serialized).toEqual(borshSerializedOutput);
  });

  it('checks if the toJSON output matches the serde json output', () => {
    const signer = localPubkey;
    const instruction = SystemInstruction.newExtendBytesInstruction(
      Uint8Array.from([1, 2, 3, 4, 5]),
      localPubkey,
    );
    const message = new Message([signer], [instruction]);
    const signature = new Signature(
      Uint8Array.from([
        32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15,
        14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ]),
    );
    console.log(signature.toJSON());
    const runtimeTransaction = new RuntimeTransaction(0, [signature], message);

    expect(runtimeTransaction.toJSON()).equals(serdeJsonOutput);
  });
});
