import { 
  TokenInstruction, 
  TokenAccountMeta, 
  TokenInstructionType, 
  APL_TOKEN_PROGRAM_ID,
  AuthorityType,
  TransferCheckedParams,
  MintToCheckedParams,
  BurnCheckedParams,
  ApproveCheckedParams,
  SetAuthorityParams,
  ApproveParams,
  RevokeParams,
  CreateMultisigParams,
  BatchTransferParams,
  BatchMintParams,
  CloseAccountParams
} from '../struct/token';
import { hex } from '@scure/base';

export class TokenUtil {
  /**
   * Create a token instruction
   */
  static createTokenInstruction(
    instructionType: TokenInstructionType,
    accounts: TokenAccountMeta[],
    data: Uint8Array
  ): TokenInstruction {
    return {
      programId: APL_TOKEN_PROGRAM_ID,
      accounts,
      data: new Uint8Array([instructionType, ...data])
    };
  }

  /**
   * Create initialize mint instruction
   */
  static createInitializeMintInstruction(
    mint: Uint8Array,
    mintAuthority: Uint8Array,
    freezeAuthority: Uint8Array | null,
    decimals: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: mintAuthority, isSigner: false, isWritable: false }
    ];

    if (freezeAuthority) {
      accounts.push({ pubkey: freezeAuthority, isSigner: false, isWritable: false });
    }

    const data = new Uint8Array([decimals]);
    return this.createTokenInstruction(TokenInstructionType.InitializeMint, accounts, data);
  }

  /**
   * Create mint to instruction
   */
  static createMintToInstruction(
    mint: Uint8Array,
    destination: Uint8Array,
    mintAuthority: Uint8Array,
    amount: bigint
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: mintAuthority, isSigner: true, isWritable: false }
    ];

    const data = this.serializeAmount(amount);
    return this.createTokenInstruction(TokenInstructionType.MintTo, accounts, data);
  }

  /**
   * Create mint to checked instruction
   */
  static createMintToCheckedInstruction(
    mint: Uint8Array,
    destination: Uint8Array,
    mintAuthority: Uint8Array,
    amount: bigint,
    decimals: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: mintAuthority, isSigner: true, isWritable: false }
    ];

    const data = new Uint8Array([...this.serializeAmount(amount), decimals]);
    return this.createTokenInstruction(TokenInstructionType.MintToChecked, accounts, data);
  }

  /**
   * Create transfer instruction
   */
  static createTransferInstruction(
    source: Uint8Array,
    destination: Uint8Array,
    owner: Uint8Array,
    amount: bigint
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false }
    ];

    const data = this.serializeAmount(amount);
    return this.createTokenInstruction(TokenInstructionType.Transfer, accounts, data);
  }

  /**
   * Create transfer checked instruction
   */
  static createTransferCheckedInstruction(
    source: Uint8Array,
    mint: Uint8Array,
    destination: Uint8Array,
    owner: Uint8Array,
    amount: bigint,
    decimals: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false }
    ];

    const data = new Uint8Array([...this.serializeAmount(amount), decimals]);
    return this.createTokenInstruction(TokenInstructionType.TransferChecked, accounts, data);
  }

  /**
   * Create burn instruction
   */
  static createBurnInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    authority: Uint8Array,
    amount: bigint
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false }
    ];

    const data = this.serializeAmount(amount);
    return this.createTokenInstruction(TokenInstructionType.Burn, accounts, data);
  }

  /**
   * Create burn checked instruction
   */
  static createBurnCheckedInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    authority: Uint8Array,
    amount: bigint,
    decimals: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false }
    ];

    const data = new Uint8Array([...this.serializeAmount(amount), decimals]);
    return this.createTokenInstruction(TokenInstructionType.BurnChecked, accounts, data);
  }

  /**
   * Create approve instruction
   */
  static createApproveInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    delegate: Uint8Array,
    owner: Uint8Array,
    amount: bigint
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: delegate, isSigner: false, isWritable: false },
      { pubkey: owner, isSigner: true, isWritable: false }
    ];

    const data = this.serializeAmount(amount);
    return this.createTokenInstruction(TokenInstructionType.Approve, accounts, data);
  }

  /**
   * Create approve checked instruction
   */
  static createApproveCheckedInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    delegate: Uint8Array,
    owner: Uint8Array,
    amount: bigint,
    decimals: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: delegate, isSigner: false, isWritable: false },
      { pubkey: owner, isSigner: true, isWritable: false }
    ];

    const data = new Uint8Array([...this.serializeAmount(amount), decimals]);
    return this.createTokenInstruction(TokenInstructionType.ApproveChecked, accounts, data);
  }

  /**
   * Create revoke instruction
   */
  static createRevokeInstruction(
    account: Uint8Array,
    owner: Uint8Array
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false }
    ];

    return this.createTokenInstruction(TokenInstructionType.Revoke, accounts, new Uint8Array());
  }

  /**
   * Create set authority instruction
   */
  static createSetAuthorityInstruction(
    account: Uint8Array,
    newAuthority: Uint8Array | null,
    authorityType: AuthorityType,
    currentAuthority: Uint8Array
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: currentAuthority, isSigner: true, isWritable: false }
    ];

    const data = new Uint8Array([authorityType, newAuthority ? 1 : 0, ...(newAuthority || [])]);
    return this.createTokenInstruction(TokenInstructionType.SetAuthority, accounts, data);
  }

  /**
   * Create freeze account instruction
   */
  static createFreezeAccountInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    freezeAuthority: Uint8Array
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: freezeAuthority, isSigner: true, isWritable: false }
    ];

    return this.createTokenInstruction(TokenInstructionType.FreezeAccount, accounts, new Uint8Array());
  }

  /**
   * Create thaw account instruction
   */
  static createThawAccountInstruction(
    account: Uint8Array,
    mint: Uint8Array,
    freezeAuthority: Uint8Array
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: freezeAuthority, isSigner: true, isWritable: false }
    ];

    return this.createTokenInstruction(TokenInstructionType.ThawAccount, accounts, new Uint8Array());
  }

  /**
   * Create close account instruction
   */
  static createCloseAccountInstruction(
    account: Uint8Array,
    destination: Uint8Array,
    authority: Uint8Array
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false }
    ];

    return this.createTokenInstruction(TokenInstructionType.CloseAccount, accounts, new Uint8Array());
  }

  /**
   * Create initialize multisig instruction
   */
  static createInitializeMultisigInstruction(
    multisig: Uint8Array,
    signers: Uint8Array[],
    minimumSigners: number
  ): TokenInstruction {
    const accounts: TokenAccountMeta[] = [
      { pubkey: multisig, isSigner: false, isWritable: true },
      ...signers.map(signer => ({ pubkey: signer, isSigner: true, isWritable: false }))
    ];

    const data = new Uint8Array([minimumSigners]);
    return this.createTokenInstruction(TokenInstructionType.InitializeMultisig, accounts, data);
  }

  /**
   * Serialize amount to bytes
   */
  static serializeAmount(amount: bigint): Uint8Array {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, amount, true); // little-endian
    return new Uint8Array(buffer);
  }

  /**
   * Deserialize amount from bytes
   */
  static deserializeAmount(data: Uint8Array): bigint {
    if (!data.buffer) {
      throw new Error('Invalid data buffer');
    }
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    return view.getBigUint64(0, true); // little-endian
  }

  /**
   * Convert string amount to bigint based on decimals
   */
  static stringToAmount(amount: string, decimals: number): bigint {
    const parts = amount.split('.');
    const whole = parts[0] || '0';
    const fraction = parts[1] ?? '';
    
    // Pad or truncate fraction to match decimals
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    
    return BigInt(whole + paddedFraction);
  }

  /**
   * Convert bigint amount to string based on decimals
   */
  static amountToString(amount: bigint, decimals: number): string {
    const amountStr = amount.toString();
    
    if (decimals === 0) {
      return amountStr;
    }
    
    if (amountStr.length <= decimals) {
      return '0.' + amountStr.padStart(decimals, '0');
    }
    
    const whole = amountStr.slice(0, -decimals);
    const fraction = amountStr.slice(-decimals);
    
    return whole + '.' + fraction;
  }

  /**
   * Generate deterministic mint address from payer
   */
  static generateMintAddress(payer: Uint8Array): { address: Uint8Array; keypair: Uint8Array } {
    // Simple deterministic generation for demo purposes
    // In production, this should use proper cryptographic derivation
    const hash = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hash[i] = (payer[i] ?? 0) ^ (i + 1);
    }
    
    return {
      address: hash,
      keypair: hash // For demo, using same bytes as keypair
    };
  }

  /**
   * Validate token address format
   */
  static validateTokenAddress(address: string): boolean {
    return /^[0-9a-fA-F]{64}$/.test(address);
  }

  /**
   * Validate decimals (0-9)
   */
  static validateDecimals(decimals: number): boolean {
    return decimals >= 0 && decimals <= 9;
  }

  /**
   * Validate amount string
   */
  static validateAmount(amount: string): boolean {
    return /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
  }

  /**
   * Calculate rent-exempt amount for token accounts
   */
  static calculateRentExemptAmount(accountSize: number): bigint {
    // Simplified calculation - in production, this should use the actual rent calculation
    return BigInt(accountSize * 3480); // Approximate rent per byte
  }

  /**
   * Get token account size
   */
  static getTokenAccountSize(): number {
    return 165; // Standard token account size
  }

  /**
   * Get mint account size
   */
  static getMintAccountSize(): number {
    return 82; // Standard mint account size
  }
} 