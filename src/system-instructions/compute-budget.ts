import { COMPUTE_BUDGET_PROGRAM_ID } from '../constants';
import { Instruction } from '../struct/instruction';
import { u32ToLeBytes } from './system-instructions';

export const request_heap_frame = (bytes: number): Instruction => {
  if (bytes % 1024 !== 0) {
    throw new Error('Bytes must be a multiple of 1024');
  }

  const discriminant = u32ToLeBytes(0);
  const bytes_array = u32ToLeBytes(bytes);

  const data = new Uint8Array([...discriminant, ...bytes_array]);

  return {
    program_id: COMPUTE_BUDGET_PROGRAM_ID,
    accounts: [],
    data,
  };
};

export const set_compute_unit_limit = (units: number): Instruction => {
  const discriminant = u32ToLeBytes(1);
  const units_array = u32ToLeBytes(units);

  const data = new Uint8Array([...discriminant, ...units_array]);

  return {
    program_id: COMPUTE_BUDGET_PROGRAM_ID,
    accounts: [],
    data,
  };
};
