import { hex } from '@scure/base';
import { SanitizedInstruction } from '../struct/sanitized-instruction';

export const serialize = (instruction: SanitizedInstruction): Uint8Array => {
  const serializedProgramId = instruction.program_id_index;

  const accountsCountBuffer = new ArrayBuffer(4);
  const accountsCountView = new DataView(accountsCountBuffer);
  accountsCountView.setUint32(0, instruction.accounts.length, true);
  const accountsCount = new Uint8Array(accountsCountBuffer);

  const serializedAccounts = instruction.accounts;

  // Extend with data length (u64 in little-endian)
  const dataLengthBuffer = new ArrayBuffer(4);
  const dataLengthView = new DataView(dataLengthBuffer);

  dataLengthView.setUint32(0, instruction.data.length, true);
  const littleEndianDataLength = new Uint8Array(dataLengthBuffer);

  return new Uint8Array([
    serializedProgramId,
    ...accountsCount,
    ...serializedAccounts,
    ...littleEndianDataLength,
    ...instruction.data,
  ]);
};

export const toHex = (instruction: SanitizedInstruction) => {
  return {
    program_id_index: instruction.program_id_index,
    accounts: instruction.accounts,
    data: hex.encode(instruction.data),
  };
};

export const toNumberArray = (instruction: SanitizedInstruction) => {
  return {
    program_id_index: instruction.program_id_index,
    accounts: instruction.accounts,
    data: Array.from(instruction.data),
  };
};
