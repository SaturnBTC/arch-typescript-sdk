import { describe, it, expect } from 'vitest';
import { fromHex } from '../serde/utxo';

describe('assert that utxo meta serializes as expected', () => {
  it('matches the output of the borsh serializer in Rust', () => {
    const borshOutput = Uint8Array.from([
      21, 83, 216, 109, 197, 115, 18, 22, 155, 163, 235, 12, 188, 205, 94, 58,
      120, 219, 188, 64, 44, 148, 144, 204, 101, 126, 151, 58, 248, 58, 39, 141,
      0, 0, 0, 0,
    ]);

    const txid =
      '1553d86dc57312169ba3eb0cbccd5e3a78dbbc402c9490cc657e973af83a278d';
    const vout = 0;
    const utxoMeta = fromHex(txid, vout);

    expect(utxoMeta).toEqual(borshOutput);
  });
});
