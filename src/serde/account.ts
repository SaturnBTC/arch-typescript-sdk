import { AccountMeta } from '../struct/account';

export const serialize = (account: AccountMeta): Uint8Array => {
  return new Uint8Array([
    ...account.pubkey,
    account.is_signer ? 1 : 0,
    account.is_writable ? 1 : 0,
  ]);
};
