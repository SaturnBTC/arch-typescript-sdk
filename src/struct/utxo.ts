import { Schema } from 'borsh';

// pub struct UtxoMeta([u8; 36]);
export type UtxoMeta = Uint8Array;

export interface UtxoMetaData {
  txid: string;
  vout: number;
}

export const UtxoMetaSchema: Schema = {
  array: { type: 'u8', len: 36 },
};
