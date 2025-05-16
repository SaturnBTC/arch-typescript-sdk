import { RuntimeTransaction } from '../struct/runtime-transaction';
import { SanitizedMessageUtil } from '..';
import { hex } from '@scure/base';

export const toHex = (transaction: RuntimeTransaction) => {
  return {
    version: transaction.version,
    signatures: transaction.signatures.map((signature) =>
      hex.encode(signature),
    ),
    message: SanitizedMessageUtil.toHex(transaction.message),
  };
};

export const toNumberArray = (transaction: RuntimeTransaction) => {
  return {
    version: transaction.version,
    signatures: transaction.signatures.map((signature) =>
      Array.from(signature),
    ),
    message: SanitizedMessageUtil.toNumberArray(transaction.message),
  };
};
