import { Instruction } from './instruction';
import { Pubkey } from './pubkey';

export interface Message {
  signers: Array<Pubkey>;
  instructions: Array<Instruction>;
}
