import { Pubkey } from './pubkey';
import { Instruction } from './instruction';
import { MessageHeader } from './header';
import { hex } from '@scure/base';

export interface CompiledKeyMeta {
  isSigner: boolean;
  isWritable: boolean;
  isInvoked: boolean;
}

export enum CompileError {
  AccountIndexOverflow = 'account index overflowed during compilation',
  AddressTableLookupIndexOverflow = 'address lookup table index overflowed during compilation',
  UnknownInstructionKey = 'encountered unknown account key during instruction compilation',
}

// Helper function for parameterized error, though direct throwing with a message is also common in TS
export const unknownInstructionKeyError = (key: Pubkey): string => {
  return `encountered unknown account key ${hex.encode(key)} during instruction compilation`;
};

export class CompiledKeys {
  public payer: Pubkey | null;
  public keyMetaMap: Map<string, CompiledKeyMeta>; // Using hex string of Pubkey as key

  private constructor(
    payer: Pubkey | null,
    keyMetaMap: Map<string, CompiledKeyMeta>,
  ) {
    this.payer = payer;
    this.keyMetaMap = keyMetaMap;
  }

  public static compile(
    instructions: Instruction[],
    payer: Pubkey | null,
  ): CompiledKeys {
    const keyMetaMap = new Map<string, CompiledKeyMeta>();

    for (const ix of instructions) {
      const programIdStr = hex.encode(ix.program_id);
      let meta = keyMetaMap.get(programIdStr);
      if (!meta) {
        meta = { isSigner: false, isWritable: false, isInvoked: false };
        keyMetaMap.set(programIdStr, meta);
      }
      meta.isInvoked = true;

      for (const accountMeta of ix.accounts) {
        const accountMetaPubkeyStr = hex.encode(accountMeta.pubkey);
        let accountKeyMeta = keyMetaMap.get(accountMetaPubkeyStr);
        if (!accountKeyMeta) {
          accountKeyMeta = {
            isSigner: false,
            isWritable: false,
            isInvoked: false,
          };
          keyMetaMap.set(accountMetaPubkeyStr, accountKeyMeta);
        }
        accountKeyMeta.isSigner ||= accountMeta.is_signer;
        accountKeyMeta.isWritable ||= accountMeta.is_writable;
      }
    }

    if (payer) {
      const payerStr = hex.encode(payer);
      let payerMeta = keyMetaMap.get(payerStr);
      if (!payerMeta) {
        payerMeta = { isSigner: false, isWritable: false, isInvoked: false };
        keyMetaMap.set(payerStr, payerMeta);
      }
      payerMeta.isSigner = true;
      payerMeta.isWritable = true;
    }

    return new CompiledKeys(payer, keyMetaMap);
  }

  public tryIntoMessageComponents(): [MessageHeader, Pubkey[]] | CompileError {
    const tryIntoU8 = (num: number): number | CompileError => {
      if (num < 0 || num > 255 || !Number.isInteger(num)) {
        return CompileError.AccountIndexOverflow;
      }
      return num;
    };

    const payerStr = this.payer ? hex.encode(this.payer) : null;
    const keyMetaMapEntries = Array.from(this.keyMetaMap.entries());

    // Filter out payer from the entries we iterate over for categorization,
    // as payer is handled separately and prepended.
    const anetriesWithoutPayer = payerStr
      ? keyMetaMapEntries.filter(([keyStr, _]) => keyStr !== payerStr)
      : keyMetaMapEntries;

    const writableSignerKeys: Pubkey[] = [];
    if (this.payer) {
      writableSignerKeys.push(this.payer);
    }
    anetriesWithoutPayer.forEach(([keyStr, meta]) => {
      if (meta.isSigner && meta.isWritable) {
        // Avoid adding payer again if it was already in keyMetaMap explicitly with these flags
        if (keyStr !== payerStr) {
          writableSignerKeys.push(hex.decode(keyStr));
        }
      }
    });

    const readonlySignerKeys: Pubkey[] = anetriesWithoutPayer
      .filter(([_, meta]) => meta.isSigner && !meta.isWritable)
      .map(([keyStr, _]) => hex.decode(keyStr));

    const writableNonSignerKeys: Pubkey[] = anetriesWithoutPayer
      .filter(([_, meta]) => !meta.isSigner && meta.isWritable)
      .map(([keyStr, _]) => hex.decode(keyStr));

    const readonlyNonSignerKeys: Pubkey[] = anetriesWithoutPayer
      .filter(([_, meta]) => !meta.isSigner && !meta.isWritable)
      .map(([keyStr, _]) => hex.decode(keyStr));

    const signersLen = writableSignerKeys.length + readonlySignerKeys.length;

    const numRequiredSignatures = tryIntoU8(signersLen);
    if (typeof numRequiredSignatures !== 'number') return numRequiredSignatures;

    const numReadonlySignedAccounts = tryIntoU8(readonlySignerKeys.length);
    if (typeof numReadonlySignedAccounts !== 'number')
      return numReadonlySignedAccounts;

    const numReadonlyUnsignedAccounts = tryIntoU8(readonlyNonSignerKeys.length);
    if (typeof numReadonlyUnsignedAccounts !== 'number')
      return numReadonlyUnsignedAccounts;

    const header: MessageHeader = {
      num_required_signatures: numRequiredSignatures,
      num_readonly_signed_accounts: numReadonlySignedAccounts,
      num_readonly_unsigned_accounts: numReadonlyUnsignedAccounts,
    };

    const staticAccountKeys: Pubkey[] = [
      ...writableSignerKeys,
      ...readonlySignerKeys,
      ...writableNonSignerKeys,
      ...readonlyNonSignerKeys,
    ];

    return [header, staticAccountKeys];
  }

  // More methods will be added here (compile, tryIntoMessageComponents)
}
