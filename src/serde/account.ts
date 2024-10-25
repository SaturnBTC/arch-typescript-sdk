import { hex } from '@scure/base';
import { AccountMeta } from '../struct/account';

export const serialize = (account: AccountMeta): Uint8Array => {
  return new Uint8Array([
    ...account.pubkey,
    account.is_signer ? 1 : 0,
    account.is_writable ? 1 : 0,
  ]);
};

export const toHex = (account: AccountMeta) => {
  return {
    pubkey: hex.encode(account.pubkey),
    is_signer: account.is_signer,
    is_writable: account.is_writable,
  };
};

export const toNumberArray = (account: AccountMeta) => {
  return {
    pubkey: Array.from(account.pubkey),
    is_signer: account.is_signer,
    is_writable: account.is_writable,
  };
};
