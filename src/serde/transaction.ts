import { RuntimeTransaction } from '../struct/runtime-transaction';
import { MessageUtil } from '..';
import { hex } from '@scure/base';

export const toHex = (transaction: RuntimeTransaction) => {
  return {
    version: transaction.version,
    signatures: transaction.signatures.map((signature) =>
      hex.encode(signature),
    ),
    message: MessageUtil.toHex(transaction.message),
  };
};

export const toNumberArray = (transaction: RuntimeTransaction) => {
  return {
    version: transaction.version,
    signatures: transaction.signatures.map((signature) =>
      Array.from(signature),
    ),
    message: MessageUtil.toNumberArray(transaction.message),
  };
};
