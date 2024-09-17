import { Schema } from 'borsh';
import { Instruction, InstructionSchema } from './instruction';
import { Pubkey, PubkeySchema } from './pubkey';

export interface Message {
  signers: Array<Pubkey>;
  instructions: Array<Instruction>;
}

export const MessageSchema: Schema = {
  struct: {
    signers: {
      array: {
        type: PubkeySchema,
      },
    },
    instructions: {
      array: {
        type: InstructionSchema,
      },
    },
  },
};
