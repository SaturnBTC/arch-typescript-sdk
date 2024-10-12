import { assert, describe, expect, it } from 'vitest';
import {
  buildAccountAddress,
  getAccountKeyInOutput,
} from '../transaction/utils';

describe('assert that we serialize/deserialize the account pubkey in the output right', () => {
  it('matches the account pubkey to the one in the output', () => {
    const borshOutputWithKey = Uint8Array.from([
      21, 83, 216, 109, 197, 115, 18, 22, 155, 163, 235, 12, 188, 205, 94, 58,
      120, 219, 188, 64, 44, 148, 144, 204, 101, 126, 151, 58, 248, 58, 39, 141,
      0, 0, 0, 0,
    ]);

    const accountPubKey = '';

    const accountGot = getAccountKeyInOutput(borshOutputWithKey);

    expect(accountGot).toEqual(accountPubKey);
  });

  it(`shouldn't find any account`, () => {
    const borshOutputWithoutKey = Uint8Array.from([
      21, 83, 216, 109, 197, 115, 18, 22, 155, 163, 235, 12, 188, 205, 94, 58,
      120, 219, 188, 64, 44, 148, 144, 204, 101, 126, 151, 58, 248, 58, 39, 141,
      0, 0, 0, 0,
    ]);

    let found = false;
    try {
      getAccountKeyInOutput(borshOutputWithoutKey);
      found = true;
    } catch (err) {
      found = false;
    }

    expect(found).toBe(false);
  });

  it(`should create the correct frost utxo script`, () => {
    const xonlygrouppubkey = Uint8Array.from([
      21, 83, 216, 109, 197, 115, 18, 22, 155, 163, 235, 12, 188, 205, 94, 58,
      120, 219, 188, 64, 44, 148, 144, 204, 101, 126, 151, 58, 248, 58, 39, 141,
      0, 0, 0, 0,
    ]);

    const accountpubkey = Uint8Array.from([
      21, 83, 216, 109, 197, 115, 18, 22, 155, 163, 235, 12, 188, 205, 94, 58,
      120, 219, 188, 64, 44, 148, 144, 204, 101, 126, 151, 58, 248, 58, 39, 141,
      0, 0, 0, 0,
    ]);

    const address = '';

    expect(
      buildAccountAddress(xonlygrouppubkey, accountpubkey, 'regtest'),
    ).toBe(address);
  });
});
