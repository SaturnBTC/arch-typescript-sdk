import { describe, it, expect } from 'vitest';
import { localPubkey } from './fixtures';

describe('assert that pubkey serializes as expected', () => {
  it('matches the output of the borsh serializer in Rust', () => {
    const borshOutput = Uint8Array.from([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    ]);
    const serialized = localPubkey.serialize();

    expect(serialized).toEqual(borshOutput);
  });
  it('matches the output of the json serialization in Rust', () => {
    const serdeJsonOutput = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    ];
    const jsonSerialized = localPubkey.toJSON();

    expect(jsonSerialized).toEqual(serdeJsonOutput);
  });
});
