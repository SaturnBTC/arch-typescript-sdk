import { sha256 } from '@noble/hashes/sha256';
import { Message } from '../struct/message';
import { serialize as serializeInstruction } from './instruction';
import { hex } from '@scure/base';

export const serialize = (message: Message) => {
  const signersCount = new Uint8Array([message.signers.length]);
  const serializedSigners = message.signers.flatMap((message) =>
    Array.from(message),
  );

  const instructionsCount = new Uint8Array([message.instructions.length]);
  const serializedInstructions = message.instructions.flatMap((instruction) =>
    Array.from(serializeInstruction(instruction)),
  );

  return new Uint8Array([
    ...signersCount,
    ...serializedSigners,
    ...instructionsCount,
    ...serializedInstructions,
  ]);
};

export const hash = (message: Message) => {
  const serializedData = serialize(message);
  return sha256(hex.encode(sha256(serializedData)));
};
