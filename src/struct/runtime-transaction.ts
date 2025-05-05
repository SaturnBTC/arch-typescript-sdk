import { validatePubkeys, validateSignatures } from '../validation';
import { Message } from './message';

// 64 bytes
export type Signature = Uint8Array;

export interface RuntimeTransaction {
  version: number;
  signatures: Array<Signature>;
  message: Message;
}

export function validateRunTimeTransactions(params: Array<RuntimeTransaction>) {
  for (var runtimeTransaction of params) {
    validatePubkeys(runtimeTransaction.message.signers);
    validateSignatures(runtimeTransaction.signatures);
    validatePubkeys(
      runtimeTransaction.message.instructions.map(
        (instruction) => instruction.program_id,
      ),
    );
  }
}
