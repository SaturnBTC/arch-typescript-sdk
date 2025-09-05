import { Instruction } from '../struct/instruction';
import { AccountMeta } from '../struct/account';
import { Pubkey } from '../struct/pubkey';
import { SYSTEM_PROGRAM_ID } from '../constants';

export enum SystemInstruction {
  CreateAccount = 0,
  CreateAccountWithAnchor = 1,
  Assign = 2,
  Anchor = 3,
  Transfer = 4,
  Allocate = 5,
  AdvanceNonceAccount = 6,
  WithdrawNonceAccount = 7,
  InitializeNonceAccount = 8,
  AuthorizeNonceAccount = 9,
}

// Converts a number (u32) to a 4-byte Uint8Array in little-endian order.
export const u32ToLeBytes = (num: number): Uint8Array => {
  const arr = new Uint8Array(4);
  new DataView(arr.buffer).setUint32(0, num, true);
  return arr;
};

// Converts a bigint (u64) to an 8-byte Uint8Array in little-endian order.
export const u64ToLeBytes = (num: bigint): Uint8Array => {
  const arr = new Uint8Array(8);
  const view = new DataView(arr.buffer);
  view.setUint32(0, Number(num & 0xffffffffn), true); // lower 32 bits
  view.setUint32(4, Number((num >> 32n) & 0xffffffffn), true); // Upper 32 bits
  return arr;
};

// Converts a 64-character hex string (representing 32 bytes) to a Uint8Array.
export const hexStringToUint8Array = (hex: string): Uint8Array => {
  if (hex.length !== 64)
    throw new Error('txid hex string must be 64 characters');
  return new Uint8Array(Buffer.from(hex, 'hex'));
};

export const createAccount = (
  fromPubkey: Pubkey,
  toPubkey: Pubkey,
  lamports: bigint,
  space: bigint,
  owner: Pubkey,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.CreateAccount);
  const lamportsArray = u64ToLeBytes(lamports);
  const spaceArray = u64ToLeBytes(space);
  const ownerBytes = owner;
  const data = new Uint8Array([
    ...discriminant,
    ...lamportsArray,
    ...spaceArray,
    ...ownerBytes,
  ]);

  const accounts: AccountMeta[] = [
    { pubkey: fromPubkey, is_signer: true, is_writable: true },
    { pubkey: toPubkey, is_signer: true, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const createAccountWithAnchor = (
  fromPubkey: Pubkey,
  toPubkey: Pubkey,
  lamports: bigint,
  space: bigint,
  owner: Pubkey,
  txid: string,
  vout: number,
): Instruction => {
  const txidBytes = hexStringToUint8Array(txid);
  if (txidBytes.length !== 32) {
    throw new Error('txid must be 32 bytes');
  }

  const discriminant = u32ToLeBytes(SystemInstruction.CreateAccountWithAnchor);
  const lamportsArray = u64ToLeBytes(lamports);
  const spaceArray = u64ToLeBytes(space);
  const ownerBytes = owner;
  const voutArray = u32ToLeBytes(vout);

  const data = new Uint8Array([
    ...discriminant,
    ...lamportsArray,
    ...spaceArray,
    ...ownerBytes,
    ...txidBytes,
    ...voutArray,
  ]);

  const accounts: AccountMeta[] = [
    { pubkey: fromPubkey, is_signer: true, is_writable: true },
    { pubkey: toPubkey, is_signer: true, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const assign = (pubkey: Pubkey, owner: Pubkey): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.Assign);
  const ownerBytes = owner;
  const data = new Uint8Array([...discriminant, ...ownerBytes]);

  const accounts: AccountMeta[] = [
    { pubkey, is_signer: true, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const anchor = (
  pubkey: Pubkey,
  txid: string,
  vout: number,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.Anchor);
  const txidBytes = hexStringToUint8Array(txid);
  const voutArray = u32ToLeBytes(vout);
  const data = new Uint8Array([...discriminant, ...txidBytes, ...voutArray]);

  const accounts: AccountMeta[] = [
    { pubkey, is_signer: true, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const transfer = (
  fromPubkey: Pubkey,
  toPubkey: Pubkey,
  lamports: bigint,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.Transfer);
  const lamportsBytes = u64ToLeBytes(lamports);
  const data = new Uint8Array([...discriminant, ...lamportsBytes]);

  const accounts: AccountMeta[] = [
    { pubkey: fromPubkey, is_signer: true, is_writable: true },
    { pubkey: toPubkey, is_signer: false, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const allocate = (pubkey: Pubkey, space: bigint): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.Allocate);
  const spaceArray = u64ToLeBytes(space);
  const data = new Uint8Array([...discriminant, ...spaceArray]);

  const accounts: AccountMeta[] = [
    { pubkey, is_signer: true, is_writable: true },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const advanceNonceAccount = (
  noncePubkey: Pubkey,
  recentBlockhashesSysvar: Pubkey,
  authorizedPubkey: Pubkey,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.AdvanceNonceAccount);
  const data = new Uint8Array([...discriminant]);

  const accounts: AccountMeta[] = [
    { pubkey: noncePubkey, is_signer: false, is_writable: true },
    { pubkey: recentBlockhashesSysvar, is_signer: false, is_writable: false },
    { pubkey: authorizedPubkey, is_signer: true, is_writable: false },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const withdrawNonceAccount = (
  noncePubkey: Pubkey,
  toPubkey: Pubkey,
  recentBlockhashesSysvar: Pubkey,
  rentSysvar: Pubkey,
  authorizedPubkey: Pubkey,
  lamports: bigint,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.WithdrawNonceAccount);
  const lamportsBytes = u64ToLeBytes(lamports);
  const data = new Uint8Array([...discriminant, ...lamportsBytes]);

  const accounts: AccountMeta[] = [
    { pubkey: noncePubkey, is_signer: false, is_writable: true },
    { pubkey: toPubkey, is_signer: false, is_writable: true },
    { pubkey: recentBlockhashesSysvar, is_signer: false, is_writable: false },
    { pubkey: rentSysvar, is_signer: false, is_writable: false },
    { pubkey: authorizedPubkey, is_signer: true, is_writable: false },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const initializeNonceAccount = (
  noncePubkey: Pubkey,
  recentBlockhashesSysvar: Pubkey,
  rentSysvar: Pubkey,
  authority: Pubkey,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.InitializeNonceAccount);
  const data = new Uint8Array([...discriminant, ...authority]);

  const accounts: AccountMeta[] = [
    { pubkey: noncePubkey, is_signer: false, is_writable: true },
    { pubkey: recentBlockhashesSysvar, is_signer: false, is_writable: false },
    { pubkey: rentSysvar, is_signer: false, is_writable: false },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};

export const authorizeNonceAccount = (
  noncePubkey: Pubkey,
  authorizedPubkey: Pubkey,
  newAuthority: Pubkey,
): Instruction => {
  const discriminant = u32ToLeBytes(SystemInstruction.AuthorizeNonceAccount);
  const data = new Uint8Array([...discriminant, ...newAuthority]);

  const accounts: AccountMeta[] = [
    { pubkey: noncePubkey, is_signer: false, is_writable: true },
    { pubkey: authorizedPubkey, is_signer: true, is_writable: false },
  ];

  return {
    program_id: SYSTEM_PROGRAM_ID,
    accounts,
    data,
  };
};
