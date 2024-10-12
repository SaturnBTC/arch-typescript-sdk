import { UtxoMeta, UtxoMetaData } from '../struct/utxo';
import { hex } from '@scure/base';

export const fromBytes = (txid: Uint8Array, vout: number): UtxoMeta => {
  if (txid.length !== 32) {
    throw new Error('Txid must be 32 bytes');
  }

  const data = new Uint8Array(36);
  data.set(txid, 0);
  data.set(new Uint8Array(new Uint32Array([vout]).buffer), 32);
  return data as UtxoMeta;
};

export const fromHex = (txid: string, vout: number): UtxoMeta => {
  const txidBytes = hex.decode(txid);
  return fromBytes(txidBytes, vout);
};

export const toString = (utxo: UtxoMeta): UtxoMetaData => {
  const txid = hex.encode(utxo.slice(0, 32));
  const vout = new DataView(utxo.buffer).getUint32(32, true);
  return {
    txid,
    vout,
  }
};
