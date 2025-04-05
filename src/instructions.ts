import { SYSTEM_PROGRAM_ID } from './constants';
import { fromHex } from './serde/utxo';
import { Instruction } from './struct/instruction';
import { Pubkey } from './struct/pubkey';
import { UtxoMetaData } from './struct/utxo';

export function createAccountInstruction(
  utxo: UtxoMetaData,
  owner: Pubkey,
  is_signer: boolean = true,
): Instruction {
  // Create instruction data by concatenating:
  // 1. Instruction tag [0] (1 byte)
  // 2. UTXO metadata (36 bytes)
  const instructionTag = new Uint8Array([0]);
  const utxoBytes = fromHex(utxo.txid, utxo.vout);
  const data = new Uint8Array(1 + 36); // Total 37 bytes
  data.set(instructionTag, 0);
  data.set(utxoBytes, 1);

  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: owner, is_signer, is_writable: true }],
    data,
  };
  return instruction;
}

export function createAssignOwnershipInstruction(
  from: Pubkey,
  to: Pubkey,
): Instruction {
  const instruction: Instruction = {
    program_id: SYSTEM_PROGRAM_ID,
    accounts: [{ pubkey: from, is_signer: true, is_writable: true }],
    data: new Uint8Array([3, ...to]), // Instruction tag 3 followed by owner pubkey
  };
  return instruction;
}
