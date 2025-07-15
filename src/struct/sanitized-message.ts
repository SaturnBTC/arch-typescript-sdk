import { Schema } from 'borsh';
import { Pubkey, PubkeySchema } from './pubkey';
import { MessageHeader, MessageHeaderSchema } from './header';
import {
  SanitizedInstruction,
  SanitizedInstructionSchema,
} from './sanitized-instruction';

export interface SanitizedMessage {
  header: MessageHeader;
  account_keys: Array<Pubkey>;
  recent_blockhash: Uint8Array;
  instructions: Array<SanitizedInstruction>;
}

export const SanitizedMessageSchema: Schema = {
  struct: {
    header: MessageHeaderSchema,
    account_keys: {
      array: {
        type: PubkeySchema,
      },
    },
    recent_blockhash: {
      array: {
        type: 'u8',
        len: 32,
      },
    },
    instructions: {
      array: {
        type: SanitizedInstructionSchema,
      },
    },
  },
};
