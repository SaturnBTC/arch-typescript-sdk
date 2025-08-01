import { describe, it, expect, beforeEach } from 'vitest';
import { TokenUtil } from '../serde/token';
import { 
  TokenInstructionType, 
  APL_TOKEN_PROGRAM_ID,
  AuthorityType 
} from '../struct/token';

describe('TokenUtil', () => {
  let mockMint: Uint8Array;
  let mockDestination: Uint8Array;
  let mockAuthority: Uint8Array;
  let mockOwner: Uint8Array;
  let mockDelegate: Uint8Array;
  let mockFreezeAuthority: Uint8Array;

  beforeEach(() => {
    // Create mock Uint8Arrays for testing
    mockMint = new Uint8Array(32).fill(1);
    mockDestination = new Uint8Array(32).fill(2);
    mockAuthority = new Uint8Array(32).fill(3);
    mockOwner = new Uint8Array(32).fill(4);
    mockDelegate = new Uint8Array(32).fill(5);
    mockFreezeAuthority = new Uint8Array(32).fill(6);
  });

  describe('Basic Token Instructions', () => {
    it('should create initialize mint instruction', () => {
      const instruction = TokenUtil.createInitializeMintInstruction(
        mockMint,
        mockAuthority,
        mockFreezeAuthority,
        6
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[0].isWritable).toBe(true);
      expect(instruction.accounts[1].pubkey).toEqual(mockAuthority);
      expect(instruction.accounts[2].pubkey).toEqual(mockFreezeAuthority);
      expect(instruction.data[0]).toBe(TokenInstructionType.InitializeMint);
      expect(instruction.data[1]).toBe(6); // decimals
    });

    it('should create initialize mint instruction without freeze authority', () => {
      const instruction = TokenUtil.createInitializeMintInstruction(
        mockMint,
        mockAuthority,
        null,
        6
      );

      expect(instruction.accounts).toHaveLength(2);
      expect(instruction.accounts[1].pubkey).toEqual(mockAuthority);
    });

    it('should create mint to instruction', () => {
      const instruction = TokenUtil.createMintToInstruction(
        mockMint,
        mockDestination,
        mockAuthority,
        BigInt(1000000)
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockDestination);
      expect(instruction.accounts[2].pubkey).toEqual(mockAuthority);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.MintTo);
    });

    it('should create transfer instruction', () => {
      const instruction = TokenUtil.createTransferInstruction(
        mockMint,
        mockDestination,
        mockOwner,
        BigInt(500000)
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockDestination);
      expect(instruction.accounts[2].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.Transfer);
    });

    it('should create burn instruction', () => {
      const instruction = TokenUtil.createBurnInstruction(
        mockMint,
        mockDestination,
        mockAuthority,
        BigInt(100000)
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockDestination);
      expect(instruction.accounts[2].pubkey).toEqual(mockAuthority);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.Burn);
    });
  });

  describe('Advanced Token Instructions', () => {
    it('should create mint to checked instruction', () => {
      const instruction = TokenUtil.createMintToCheckedInstruction(
        mockMint,
        mockDestination,
        mockAuthority,
        BigInt(1000000),
        6
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.data[0]).toBe(TokenInstructionType.MintToChecked);
      expect(instruction.data[9]).toBe(6); // decimals at the end
    });

    it('should create transfer checked instruction', () => {
      const instruction = TokenUtil.createTransferCheckedInstruction(
        mockMint,
        mockDestination,
        mockDestination, // destination
        mockOwner,
        BigInt(500000),
        6
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(4);
      expect(instruction.data[0]).toBe(TokenInstructionType.TransferChecked);
      expect(instruction.data[9]).toBe(6); // decimals at the end
    });

    it('should create burn checked instruction', () => {
      const instruction = TokenUtil.createBurnCheckedInstruction(
        mockMint,
        mockDestination,
        mockAuthority,
        BigInt(100000),
        6
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.data[0]).toBe(TokenInstructionType.BurnChecked);
      expect(instruction.data[9]).toBe(6); // decimals at the end
    });

    it('should create approve checked instruction', () => {
      const instruction = TokenUtil.createApproveCheckedInstruction(
        mockMint,
        mockDestination,
        mockDelegate,
        mockOwner,
        BigInt(100000),
        6
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(4);
      expect(instruction.data[0]).toBe(TokenInstructionType.ApproveChecked);
      expect(instruction.data[9]).toBe(6); // decimals at the end
    });
  });

  describe('Delegation Instructions', () => {
    it('should create approve instruction', () => {
      const instruction = TokenUtil.createApproveInstruction(
        mockMint,
        mockDestination,
        mockDelegate,
        mockOwner,
        BigInt(100000)
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(4);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[2].pubkey).toEqual(mockDelegate);
      expect(instruction.accounts[3].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[3].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.Approve);
    });

    it('should create revoke instruction', () => {
      const instruction = TokenUtil.createRevokeInstruction(
        mockMint,
        mockOwner
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(2);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[1].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.Revoke);
    });
  });

  describe('Authority Management', () => {
    it('should create set authority instruction', () => {
      const instruction = TokenUtil.createSetAuthorityInstruction(
        mockMint,
        mockDelegate,
        AuthorityType.MintTokens,
        mockOwner
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(2);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[1].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.SetAuthority);
      expect(instruction.data[1]).toBe(AuthorityType.MintTokens);
      expect(instruction.data[2]).toBe(1); // has new authority
    });

    it('should create set authority instruction with null authority', () => {
      const instruction = TokenUtil.createSetAuthorityInstruction(
        mockMint,
        null,
        AuthorityType.FreezeAccount,
        mockOwner
      );

      expect(instruction.data[1]).toBe(AuthorityType.FreezeAccount);
      expect(instruction.data[2]).toBe(0); // no new authority
    });
  });

  describe('Account Management', () => {
    it('should create freeze account instruction', () => {
      const instruction = TokenUtil.createFreezeAccountInstruction(
        mockMint,
        mockDestination,
        mockFreezeAuthority
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockDestination);
      expect(instruction.accounts[2].pubkey).toEqual(mockFreezeAuthority);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.FreezeAccount);
    });

    it('should create thaw account instruction', () => {
      const instruction = TokenUtil.createThawAccountInstruction(
        mockMint,
        mockDestination,
        mockFreezeAuthority
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.data[0]).toBe(TokenInstructionType.ThawAccount);
    });

    it('should create close account instruction', () => {
      const instruction = TokenUtil.createCloseAccountInstruction(
        mockMint,
        mockDestination,
        mockOwner
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(3);
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[1].pubkey).toEqual(mockDestination);
      expect(instruction.accounts[2].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.CloseAccount);
    });
  });

  describe('Multisig Instructions', () => {
    it('should create initialize multisig instruction', () => {
      const signers = [mockAuthority, mockOwner, mockDelegate];
      const instruction = TokenUtil.createInitializeMultisigInstruction(
        mockMint,
        signers,
        2
      );

      expect(instruction.programId).toEqual(APL_TOKEN_PROGRAM_ID);
      expect(instruction.accounts).toHaveLength(4); // multisig + 3 signers
      expect(instruction.accounts[0].pubkey).toEqual(mockMint);
      expect(instruction.accounts[0].isWritable).toBe(true);
      expect(instruction.accounts[1].pubkey).toEqual(mockAuthority);
      expect(instruction.accounts[1].isSigner).toBe(true);
      expect(instruction.accounts[2].pubkey).toEqual(mockOwner);
      expect(instruction.accounts[2].isSigner).toBe(true);
      expect(instruction.accounts[3].pubkey).toEqual(mockDelegate);
      expect(instruction.accounts[3].isSigner).toBe(true);
      expect(instruction.data[0]).toBe(TokenInstructionType.InitializeMultisig);
      expect(instruction.data[1]).toBe(2); // minimum signers
    });
  });

  describe('Amount Serialization', () => {
    it('should serialize and deserialize amounts correctly', () => {
      const testAmounts = [
        BigInt(0),
        BigInt(1),
        BigInt(1000000),
        BigInt(999999999999999999)
      ];

      testAmounts.forEach(amount => {
        const serialized = TokenUtil.serializeAmount(amount);
        const deserialized = TokenUtil.deserializeAmount(serialized);
        expect(deserialized).toBe(amount);
      });
    });

    it('should handle string to amount conversion', () => {
      expect(TokenUtil.stringToAmount('1000', 6)).toBe(BigInt(1000000000));
      expect(TokenUtil.stringToAmount('1.5', 6)).toBe(BigInt(1500000));
      expect(TokenUtil.stringToAmount('0.001', 6)).toBe(BigInt(1000));
      expect(TokenUtil.stringToAmount('1000', 0)).toBe(BigInt(1000));
    });

    it('should handle amount to string conversion', () => {
      expect(TokenUtil.amountToString(BigInt(1000000000), 6)).toBe('1000.000000');
      expect(TokenUtil.amountToString(BigInt(1500000), 6)).toBe('1.500000');
      expect(TokenUtil.amountToString(BigInt(1000), 6)).toBe('0.001000');
      expect(TokenUtil.amountToString(BigInt(1000), 0)).toBe('1000');
    });

    it('should handle edge cases in amount conversion', () => {
      expect(TokenUtil.stringToAmount('0', 6)).toBe(BigInt(0));
      expect(TokenUtil.amountToString(BigInt(0), 6)).toBe('0.000000');
      expect(TokenUtil.stringToAmount('', 6)).toBe(BigInt(0));
    });
  });

  describe('Validation Functions', () => {
    it('should validate token addresses correctly', () => {
      expect(TokenUtil.validateTokenAddress('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(true);
      expect(TokenUtil.validateTokenAddress('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdeg')).toBe(false);
      expect(TokenUtil.validateTokenAddress('1234567890abcdef')).toBe(false);
      expect(TokenUtil.validateTokenAddress('')).toBe(false);
    });

    it('should validate decimals correctly', () => {
      expect(TokenUtil.validateDecimals(0)).toBe(true);
      expect(TokenUtil.validateDecimals(6)).toBe(true);
      expect(TokenUtil.validateDecimals(9)).toBe(true);
      expect(TokenUtil.validateDecimals(-1)).toBe(false);
      expect(TokenUtil.validateDecimals(10)).toBe(false);
    });

    it('should validate amounts correctly', () => {
      expect(TokenUtil.validateAmount('1000')).toBe(true);
      expect(TokenUtil.validateAmount('1.5')).toBe(true);
      expect(TokenUtil.validateAmount('0.001')).toBe(true);
      expect(TokenUtil.validateAmount('0')).toBe(false);
      expect(TokenUtil.validateAmount('-1')).toBe(false);
      expect(TokenUtil.validateAmount('abc')).toBe(false);
      expect(TokenUtil.validateAmount('')).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should generate deterministic mint addresses', () => {
      const payer = new Uint8Array(32).fill(42);
      const result1 = TokenUtil.generateMintAddress(payer);
      const result2 = TokenUtil.generateMintAddress(payer);

      expect(result1.address).toEqual(result2.address);
      expect(result1.keypair).toEqual(result2.keypair);
      expect(result1.address).toHaveLength(32);
      expect(result1.keypair).toHaveLength(32);
    });

    it('should calculate rent exempt amounts', () => {
      expect(TokenUtil.calculateRentExemptAmount(82)).toBe(BigInt(285360)); // 82 * 3480
      expect(TokenUtil.calculateRentExemptAmount(165)).toBe(BigInt(574200)); // 165 * 3480
    });

    it('should return correct account sizes', () => {
      expect(TokenUtil.getTokenAccountSize()).toBe(165);
      expect(TokenUtil.getMintAccountSize()).toBe(82);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data buffer in deserializeAmount', () => {
      const invalidData = new Uint8Array(8);
      // Remove the buffer property to simulate invalid data
      Object.defineProperty(invalidData, 'buffer', {
        value: undefined,
        writable: true
      });

      expect(() => TokenUtil.deserializeAmount(invalidData)).toThrow('Invalid data buffer');
    });
  });
}); 