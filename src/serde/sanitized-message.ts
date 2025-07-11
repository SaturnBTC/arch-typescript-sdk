import { sha256 } from '@noble/hashes/sha256';
import { serialize as serializeInstruction } from './sanitized-instruction';
import { hex } from '@scure/base';
import { SanitizedMessage } from '../struct/sanitized-message';
import { MessageHeader } from '../struct/header';
import { Pubkey, SanitizedInstruction, SanitizedInstructionUtil } from '..';
import { Instruction } from '../struct/instruction';
import { AccountMeta } from '../struct/account';
import { CompiledKeys, CompileError } from '../struct/compiled-keys';

const serializeMessageHeader = (header: MessageHeader) => {
  return new Uint8Array([
    header.num_required_signatures,
    header.num_readonly_signed_accounts,
    header.num_readonly_unsigned_accounts,
  ]);
};

export const serialize = (message: SanitizedMessage) => {
  const serializedHeader = serializeMessageHeader(message.header);

  const accountKeyBuffer = new ArrayBuffer(4);
  const view = new DataView(accountKeyBuffer);
  view.setUint32(0, message.account_keys.length, true);
  const accountKeysCount = new Uint8Array(accountKeyBuffer);

  const serializedAccountKeys = message.account_keys.flatMap((accountKey) =>
    Array.from(accountKey),
  );

  const recentBlockhashCount = message.recent_blockhash;

  const instructionBuffer = new ArrayBuffer(4);
  const instructionView = new DataView(instructionBuffer);
  instructionView.setUint32(0, message.instructions.length, true);
  const instructionsCount = new Uint8Array(instructionBuffer);

  const serializedInstructions = message.instructions.flatMap((instruction) =>
    Array.from(serializeInstruction(instruction)),
  );

  return new Uint8Array([
    ...serializedHeader,
    ...accountKeysCount,
    ...serializedAccountKeys,
    ...recentBlockhashCount,
    ...instructionsCount,
    ...serializedInstructions,
  ]);
};

export const hash = (message: SanitizedMessage) => {
  const serializedData = serialize(message);
  const firstHash = sha256(serializedData);
  const hexString = hex.encode(firstHash);
  const hexBytes = new TextEncoder().encode(hexString);
  const finalHash = sha256(hexBytes);
  return new TextEncoder().encode(hex.encode(finalHash));
};

export const toHex = (message: SanitizedMessage) => {
  return {
    header: message.header,
    account_keys: message.account_keys.map((accountKey) =>
      hex.encode(accountKey),
    ),
    recent_blockhash: message.recent_blockhash,
    instructions: message.instructions.map(SanitizedInstructionUtil.toHex),
  };
};

export const toNumberArray = (message: SanitizedMessage) => {
  return {
    header: message.header,
    account_keys: message.account_keys.map((accountKey) =>
      Array.from(accountKey),
    ),
    recent_blockhash: Array.from(message.recent_blockhash),
    instructions: message.instructions.map(
      SanitizedInstructionUtil.toNumberArray,
    ),
  };
};

// Helper function to find pubkey index (similar to Rust's `position`)
const findPubkeyIndex = (accountKeys: Pubkey[], keyToFind: Pubkey): number => {
  const keyToFindStr = hex.encode(keyToFind);
  for (let i = 0; i < accountKeys.length; i++) {
    if (hex.encode(accountKeys[i]!) === keyToFindStr) {
      return i;
    }
  }

  // This case should ideally not be reached if accountKeys is correctly constructed
  // based on all instructions and payer, as in the Rust version's logic flow.
  // The Rust code unwraps, implying it's guaranteed to be found.
  // Throwing an error here aligns with an unexpected state.
  throw new Error(
    `Pubkey ${keyToFindStr} not found in accountKeys. This indicates an issue with compiled keys.`,
  );
};

// Helper function to compile a single raw Instruction to a SanitizedInstruction
const compileTsInstruction = (
  rawInstruction: Instruction,
  accountKeys: Pubkey[],
): SanitizedInstruction => {
  const programIdIndex = findPubkeyIndex(
    accountKeys,
    rawInstruction.program_id,
  );
  const accountIndices = rawInstruction.accounts.map((meta: AccountMeta) =>
    findPubkeyIndex(accountKeys, meta.pubkey),
  );

  if (programIdIndex > 255) {
    throw new Error(CompileError.AccountIndexOverflow);
  }
  for (const accIdx of accountIndices) {
    if (accIdx > 255) {
      throw new Error(CompileError.AccountIndexOverflow);
    }
  }

  return {
    program_id_index: programIdIndex,
    accounts: accountIndices,
    data: rawInstruction.data,
  };
};

// Helper function to compile all raw Instructions
const compileTsInstructions = (
  rawInstructions: Instruction[],
  accountKeys: Pubkey[],
): SanitizedInstruction[] => {
  return rawInstructions.map((ix) => compileTsInstruction(ix, accountKeys));
};

/**
 * Creates a SanitizedMessage from raw instructions, an optional payer, and a recent blockhash.
 * This function mirrors the logic of ArchMessage::new in the Rust codebase.
 *
 * @param rawInstructions - An array of raw Instruction objects.
 * @param payer - An optional Pubkey for the transaction fee payer. If null, the first signer encountered will be payer.
 * @param recentBlockhash - The recent blockhash as a hex string.
 * @returns A SanitizedMessage object if successful, or a CompileError if there was an issue.
 */
export const createSanitizedMessage = (
  rawInstructions: Instruction[],
  payer: Pubkey | null,
  recentBlockhash: Uint8Array,
): SanitizedMessage | CompileError => {
  const compiledKeys = CompiledKeys.compile(rawInstructions, payer);
  const messageComponentsResult = compiledKeys.tryIntoMessageComponents();

  if (!Array.isArray(messageComponentsResult)) {
    // It's a CompileError enum value (which are strings in the TS port)
    return messageComponentsResult;
  }

  const [header, accountKeys] = messageComponentsResult;

  let sanitizedInstructions: SanitizedInstruction[];
  try {
    sanitizedInstructions = compileTsInstructions(rawInstructions, accountKeys);
  } catch (e: any) {
    // Check if the error message matches a known CompileError string value
    if (Object.values(CompileError).includes(e.message as CompileError)) {
      return e.message as CompileError;
    }
    // Re-throw other unexpected errors
    throw e;
  }

  return {
    header,
    account_keys: accountKeys,
    recent_blockhash: recentBlockhash,
    instructions: sanitizedInstructions,
  };
};
