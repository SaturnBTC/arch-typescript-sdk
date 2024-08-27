import { Pubkey } from "./pubkey";

export const systemProgram = () => {
  const tmp = new Uint8Array(32);
  tmp[31] = 1;
  return tmp as Pubkey;
};

export const fromHex = (hex: string) => {
  const data = Buffer.from(hex, 'hex');
  const tmp = new Uint8Array(32);
  tmp.set(data.subarray(0, 32));
  return tmp as Pubkey;
};

export const isSystemProgram = (pubkey: Pubkey) => {
  return pubkey === systemProgram();
};
