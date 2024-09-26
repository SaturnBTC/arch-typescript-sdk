import { describe, it, expect } from 'vitest';
import { localPubkey } from './fixtures';
import { serialize } from 'borsh';
import { PubkeySchema } from '../struct/pubkey';
import { systemProgram } from '../serde/pubkey';

describe('assert that pubkey serializes as expected', () => {
  it('matches the output of the borsh serializer in Rust', () => {
    const borshOutput = Uint8Array.from([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    ]);
    const serialized = serialize(PubkeySchema, localPubkey);

    expect(serialized).toEqual(borshOutput);
  });
  it('matches the system program pubkey', () => {
    const borshOutput = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1,
    ]);
    const serialized = serialize(PubkeySchema, systemProgram());

    expect(serialized).toEqual(borshOutput);
  });
});
