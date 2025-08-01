import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchConnection } from '../arch';
import { hex } from '@scure/base';

// Mock the RpcConnection provider
vi.mock('../provider/rpc', () => ({
  RpcConnection: vi.fn().mockImplementation(() => ({
    getBestBlockHash: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
    sendTransaction: vi.fn().mockResolvedValue('mock_transaction_id'),
    readAccountInfo: vi.fn().mockResolvedValue({ data: new Uint8Array(82) }),
    getAccountAddress: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
  }))
}));

// Mock the dependencies
vi.mock('../serde/sanitized-message', () => ({
  createSanitizedMessage: vi.fn().mockReturnValue({
    header: { numRequiredSignatures: 1, numReadonlySignedAccounts: 0, numReadonlyUnsignedAccounts: 1 },
    staticAccountKeys: [],
    recentBlockhash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    compiledInstructions: [],
    addressTableLookups: []
  })
}));

vi.mock('../serde/token', () => ({
  TokenUtil: {
    generateMintAddress: vi.fn().mockReturnValue({
      address: new Uint8Array(32).fill(1),
      keypair: new Uint8Array(32).fill(1)
    }),
    createInitializeMintInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([0, 6])
    }),
    createMintToInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([5])
    }),
    createTransferInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([3])
    }),
    createBurnInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([6])
    }),
    createFreezeAccountInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([16])
    }),
    createThawAccountInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([17])
    }),
    createTransferCheckedInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([15])
    }),
    createMintToCheckedInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([9])
    }),
    createBurnCheckedInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([10])
    }),
    createApproveCheckedInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([14])
    }),
    createSetAuthorityInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([8])
    }),
    createApproveInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([4])
    }),
    createRevokeInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([7])
    }),
    createInitializeMultisigInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([2])
    }),
    createCloseAccountInstruction: vi.fn().mockReturnValue({
      programId: new Uint8Array(32),
      accounts: [],
      data: new Uint8Array([18])
    }),
    stringToAmount: vi.fn().mockReturnValue(BigInt(1000000))
  }
}));

describe('Arch Token Functionality', () => {
  let arch: any;
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = {
      getBestBlockHash: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
      sendTransaction: vi.fn().mockResolvedValue('mock_transaction_id'),
      sendTransactions: vi.fn().mockResolvedValue(['mock_transaction_id']),
      readAccountInfo: vi.fn().mockResolvedValue({ data: new Uint8Array(82) }),
      getAccountAddress: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
      getBlock: vi.fn().mockResolvedValue(undefined),
      getBlockCount: vi.fn().mockResolvedValue(100),
      getBlockHash: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
      getProgramAccounts: vi.fn().mockResolvedValue([]),
      getProcessedTransaction: vi.fn().mockResolvedValue(undefined),
      requestAirdrop: vi.fn().mockResolvedValue(undefined),
      createAccountWithFaucet: vi.fn().mockResolvedValue(undefined),
    };
    
    arch = ArchConnection(mockProvider);
  });

  describe('Basic Token Operations', () => {
    it('should create a token mint', async () => {
      const params = {
        decimals: 6,
        mintAuthority: new Uint8Array(32).fill(1),
        freezeAuthority: new Uint8Array(32).fill(2),
        payer: new Uint8Array(32).fill(3),
      };

      const result = await arch.createTokenMint(params);

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('decimals', 6);
      expect(result).toHaveProperty('supply', '0');
      expect(result).toHaveProperty('mintAuthority');
      expect(result).toHaveProperty('initialized', true);
      expect(mockProvider.sendTransaction).toHaveBeenCalledTimes(2); // Create account + initialize
    });

    it('should get a token mint', async () => {
      const mintAddress = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const result = await arch.getTokenMint(mintAddress);

      expect(result).toHaveProperty('address', mintAddress);
      expect(result).toHaveProperty('decimals', 6);
      expect(result).toHaveProperty('initialized', true);
      expect(mockProvider.readAccountInfo).toHaveBeenCalled();
    });

    it('should create a token account', async () => {
      const params = {
        mint: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        owner: new Uint8Array(32).fill(1),
        payer: new Uint8Array(32).fill(2),
      };

      const result = await arch.createTokenAccount(params);

      expect(result).toHaveProperty('address', '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toHaveProperty('mint', '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toHaveProperty('owner');
      expect(result).toHaveProperty('balance', '0');
      expect(result).toHaveProperty('state', 'initialized');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should get a token account', async () => {
      const accountAddress = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const result = await arch.getTokenAccount(accountAddress);

      expect(result).toHaveProperty('address', accountAddress);
      expect(result).toHaveProperty('mint', 'mock_mint_address');
      expect(result).toHaveProperty('owner');
      expect(result).toHaveProperty('balance', '0');
      expect(result).toHaveProperty('state', 'initialized');
      expect(mockProvider.readAccountInfo).toHaveBeenCalled();
    });

    it('should mint tokens', async () => {
      const params = {
        mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mintAuthority: new Uint8Array(32).fill(1),
        amount: '1000000',
      };

      const result = await arch.mintTokens(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should transfer tokens', async () => {
      const params = {
        sourceAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        owner: new Uint8Array(32).fill(1),
        amount: '500000',
      };

      const result = await arch.transferTokens(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should burn tokens', async () => {
      const result = await arch.burnTokens(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        new Uint8Array(32).fill(1),
        '100000'
      );

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should freeze an account', async () => {
      const result = await arch.freezeAccount(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        new Uint8Array(32).fill(1)
      );

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should thaw an account', async () => {
      const result = await arch.thawAccount(
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        new Uint8Array(32).fill(1)
      );

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should get token balance', async () => {
      const result = await arch.getTokenBalance('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

      expect(result).toBe('0');
      expect(mockProvider.readAccountInfo).toHaveBeenCalled();
    });
  });

  describe('Advanced Token Operations', () => {
    it('should transfer tokens with checked operation', async () => {
      const params = {
        sourceAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        owner: new Uint8Array(32).fill(1),
        amount: '500000',
        decimals: 6,
      };

      const result = await arch.transferTokensChecked(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should mint tokens with checked operation', async () => {
      const params = {
        mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mintAuthority: new Uint8Array(32).fill(1),
        amount: '1000000',
        decimals: 6,
      };

      const result = await arch.mintTokensChecked(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should burn tokens with checked operation', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mint: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        authority: new Uint8Array(32).fill(1),
        amount: '100000',
        decimals: 6,
      };

      const result = await arch.burnTokensChecked(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should approve with checked operation', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mint: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        delegate: new Uint8Array(32).fill(1),
        owner: new Uint8Array(32).fill(2),
        amount: '100000',
        decimals: 6,
      };

      const result = await arch.approveChecked(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });
  });

  describe('Authority Management', () => {
    it('should set authority', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        newAuthority: new Uint8Array(32).fill(1),
        authorityType: 0, // MintTokens
        currentAuthority: new Uint8Array(32).fill(2),
      };

      const result = await arch.setAuthority(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });
  });

  describe('Delegation', () => {
    it('should approve delegate', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        delegate: new Uint8Array(32).fill(1),
        owner: new Uint8Array(32).fill(2),
        amount: '100000',
      };

      const result = await arch.approve(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should revoke delegate', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        owner: new Uint8Array(32).fill(1),
      };

      const result = await arch.revoke(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });
  });

  describe('Multisig Operations', () => {
    it('should create multisig account', async () => {
      const params = {
        signers: [new Uint8Array(32).fill(1), new Uint8Array(32).fill(2)],
        minimumSigners: 2,
        payer: new Uint8Array(32).fill(3),
      };

      const result = await arch.createMultisig(params);

      expect(result).toHaveProperty('address', '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toHaveProperty('signers');
      expect(result).toHaveProperty('minimumSigners', 2);
      expect(result).toHaveProperty('numValidSigners', 2);
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should get multisig account', async () => {
      const multisigAddress = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const result = await arch.getMultisig(multisigAddress);

      expect(result).toHaveProperty('address', multisigAddress);
      expect(result).toHaveProperty('signers');
      expect(result).toHaveProperty('minimumSigners', 2);
      expect(result).toHaveProperty('numValidSigners', 2);
      expect(mockProvider.readAccountInfo).toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch transfer', async () => {
      const params = {
        transfers: [
          {
            sourceAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            amount: '100000',
          },
          {
            sourceAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            amount: '200000',
          },
        ],
        owner: new Uint8Array(32).fill(1),
      };

      const result = await arch.batchTransfer(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });

    it('should perform batch mint', async () => {
      const params = {
        mints: [
          {
            mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            amount: '100000',
          },
          {
            mintAddress: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            destinationAccount: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            amount: '200000',
          },
        ],
        mintAuthority: new Uint8Array(32).fill(1),
      };

      const result = await arch.batchMint(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });
  });

  describe('Account Management', () => {
    it('should close account', async () => {
      const params = {
        account: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        destination: new Uint8Array(32).fill(1),
        authority: new Uint8Array(32).fill(2),
      };

      const result = await arch.closeAccount(params);

      expect(result).toBe('mock_transaction_id');
      expect(mockProvider.sendTransaction).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle getTokenMint when account not found', async () => {
      mockProvider.readAccountInfo.mockResolvedValue(null);
      
      const result = await arch.getTokenMint('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      
      expect(result).toBeNull();
    });

    it('should handle getTokenAccount when account not found', async () => {
      mockProvider.readAccountInfo.mockResolvedValue(null);
      
      const result = await arch.getTokenAccount('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      
      expect(result).toBeNull();
    });

    it('should handle getMultisig when account not found', async () => {
      mockProvider.readAccountInfo.mockResolvedValue(null);
      
      const result = await arch.getMultisig('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      
      expect(result).toBeNull();
    });

    it('should handle provider errors gracefully', async () => {
      // Mock the provider to throw an error during sendTransaction
      const mockProviderWithError = {
        getBestBlockHash: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
        sendTransaction: vi.fn().mockRejectedValue(new Error('Network error')),
        sendTransactions: vi.fn().mockResolvedValue(['mock_transaction_id']),
        readAccountInfo: vi.fn().mockResolvedValue({ data: new Uint8Array(82) }),
        getAccountAddress: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
        getBlock: vi.fn().mockResolvedValue(undefined),
        getBlockCount: vi.fn().mockResolvedValue(100),
        getBlockHash: vi.fn().mockResolvedValue('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
        getProgramAccounts: vi.fn().mockResolvedValue([]),
        getProcessedTransaction: vi.fn().mockResolvedValue(undefined),
        requestAirdrop: vi.fn().mockResolvedValue(undefined),
        createAccountWithFaucet: vi.fn().mockResolvedValue(undefined),
      };
      
      // Create a new arch instance with the error-throwing provider
      const archWithError = ArchConnection(mockProviderWithError);
      
      const params = {
        decimals: 6,
        mintAuthority: new Uint8Array(32).fill(1),
        payer: new Uint8Array(32).fill(2),
      };

      await expect(archWithError.createTokenMint(params)).rejects.toThrow('Network error');
    });
  });
}); 