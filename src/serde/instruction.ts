import { Instruction } from '../struct/instruction';
import { serialize as serializeAccountMeta } from './account';

export const serialize = (instruction: Instruction): Uint8Array => {
  const serializedProgramId = instruction.program_id;
  const accountsCount = new Uint8Array([instruction.accounts.length]);
  const serializedAccounts = instruction.accounts.flatMap((account) =>
    Array.from(serializeAccountMeta(account)),
  );
  // Extend with data length (u64 in little-endian)
  const dataLengthBuffer = new ArrayBuffer(8);
  const dataLengthView = new DataView(dataLengthBuffer);

  dataLengthView.setBigUint64(0, BigInt(instruction.data.length), true);
  const littleEndianDataLength = new Uint8Array(dataLengthBuffer);

  return new Uint8Array([
    ...serializedProgramId,
    ...accountsCount,
    ...serializedAccounts,
    ...littleEndianDataLength,
    ...instruction.data,
  ]);
};
