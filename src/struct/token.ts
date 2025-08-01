import { Pubkey } from './pubkey';

export interface TokenMint {
  address: string;
  decimals: number;
  supply: string;
  mintAuthority: string;
  freezeAuthority?: string;
  initialized: boolean;
}

export interface TokenAccount {
  address: string;
  mint: string;
  owner: string;
  balance: string;
  delegate?: string;
  state: 'initialized' | 'frozen' | 'closed';
}

export interface CreateTokenMintParams {
  decimals: number;
  mintAuthority: Uint8Array;
  freezeAuthority?: Uint8Array;
  payer: Uint8Array;
}

export interface CreateTokenAccountParams {
  mint: string;
  owner: Uint8Array;
  payer: Uint8Array;
}

export interface MintTokensParams {
  mintAddress: string;
  destinationAccount: string;
  mintAuthority: Uint8Array;
  amount: string;
}

export interface TransferTokensParams {
  sourceAccount: string;
  destinationAccount: string;
  owner: Uint8Array;
  amount: string;
}

// Advanced Operations
export interface TransferCheckedParams {
  sourceAccount: string;
  destinationAccount: string;
  owner: Uint8Array;
  amount: string;
  decimals: number;
}

export interface MintToCheckedParams {
  mintAddress: string;
  destinationAccount: string;
  mintAuthority: Uint8Array;
  amount: string;
  decimals: number;
}

export interface BurnCheckedParams {
  account: string;
  mint: string;
  authority: Uint8Array;
  amount: string;
  decimals: number;
}

export interface ApproveCheckedParams {
  account: string;
  mint: string;
  delegate: Uint8Array;
  owner: Uint8Array;
  amount: string;
  decimals: number;
}

// Authority Management
export interface SetAuthorityParams {
  account: string;
  newAuthority: Uint8Array;
  authorityType: AuthorityType;
  currentAuthority: Uint8Array;
}

export enum AuthorityType {
  MintTokens = 0,
  FreezeAccount = 1,
  AccountOwner = 2,
  CloseAccount = 3,
}

// Delegation
export interface ApproveParams {
  account: string;
  mintAddress?: string; // Optional mint address
  delegate: Uint8Array;
  owner: Uint8Array;
  amount: string;
}

export interface RevokeParams {
  account: string;
  owner: Uint8Array;
}

// Multisig
export interface CreateMultisigParams {
  signers: Uint8Array[];
  minimumSigners: number;
  payer: Uint8Array;
}

export interface MultisigAccount {
  address: string;
  signers: string[];
  minimumSigners: number;
  numValidSigners: number;
}

// Batch Operations
export interface BatchTransferParams {
  transfers: Array<{
    sourceAccount: string;
    destinationAccount: string;
    amount: string;
  }>;
  owner: Uint8Array;
}

export interface BatchMintParams {
  mints: Array<{
    mintAddress: string;
    destinationAccount: string;
    amount: string;
  }>;
  mintAuthority: Uint8Array;
}

// Account Management
export interface CloseAccountParams {
  account: string;
  destination: Uint8Array;
  authority: Uint8Array;
}

export interface TokenInstruction {
  programId: Uint8Array;
  accounts: TokenAccountMeta[];
  data: Uint8Array;
}

export interface TokenAccountMeta {
  pubkey: Uint8Array;
  isSigner: boolean;
  isWritable: boolean;
}

// APL Token Program ID (this should match the actual program ID)
export const APL_TOKEN_PROGRAM_ID = new Uint8Array([
  0x06, 0x1d, 0x7b, 0x1c, 0x8d, 0x6e, 0x6b, 0x8a,
  0x9e, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90,
  0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
  0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f, 0xa0
]);

// Token instruction types
export enum TokenInstructionType {
  InitializeMint = 0,
  InitializeAccount = 1,
  InitializeMultisig = 2,
  Transfer = 3,
  Approve = 4,
  MintTo = 5,
  Burn = 6,
  Revoke = 7,
  SetAuthority = 8,
  MintToChecked = 9,
  BurnChecked = 10,
  InitializeAccount2 = 11,
  SyncNative = 12,
  InitializeAccount3 = 13,
  ApproveChecked = 14,
  TransferChecked = 15,
  FreezeAccount = 16,
  ThawAccount = 17,
  CloseAccount = 18,
} 