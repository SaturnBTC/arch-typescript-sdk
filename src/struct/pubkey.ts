import { Schema } from 'borsh';

// pub struct Pubkey(pub [u8; 32]);
export type Pubkey = Uint8Array;

export const PubkeySchema: Schema = { array: { type: 'u8', len: 32 } };
