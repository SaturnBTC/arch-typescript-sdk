import { SanitizedMessage } from './sanitizied-message';

// 64 bytes
export type Signature = Uint8Array;

export interface RuntimeTransaction {
  version: number;
  signatures: Array<Signature>;
  message: SanitizedMessage;
}
