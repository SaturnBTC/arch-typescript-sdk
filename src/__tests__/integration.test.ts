import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ArchConnection } from '../arch';
import { RpcConnection } from '../provider/rpc';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';

describe('Arch Token Integration Tests', () => {
  let arch: any;
  let testPayer: Uint8Array;
  let testMintAuthority: Uint8Array;
  let testFreezeAuthority: Uint8Array;
  let testOwner: Uint8Array;

  beforeAll(async () => {
    // Connect to real Arch RPC server
    const provider = new RpcConnection('http://localhost:9002');
    arch = ArchConnection(provider);

    // Generate test keypairs
    testPayer = secp256k1.utils.randomPrivateKey();
    testMintAuthority = secp256k1.utils.randomPrivateKey();
    testFreezeAuthority = secp256k1.utils.randomPrivateKey();
    testOwner = secp256k1.utils.randomPrivateKey();

    console.log('Connected to Arch RPC server on localhost:9002');
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log('Integration tests completed');
  });

  describe('Network Connectivity', () => {
    it('should connect to Arch RPC server', async () => {
      const blockhash = await arch.getBestBlockHash();
      expect(blockhash).toBeDefined();
      expect(typeof blockhash).toBe('string');
      expect(blockhash.length).toBeGreaterThan(0);
    });

    it('should get recent blockhash', async () => {
      const blockhash = await arch.getBestBlockHash();
      console.log('Recent blockhash:', blockhash);
      expect(blockhash).toBeDefined();
    });
  });

  describe('Token Mint Operations', () => {
    it('should create a token mint', async () => {
      const params = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      console.log('Creating token mint with params:', {
        decimals: params.decimals,
        mintAuthority: hex.encode(params.mintAuthority),
        freezeAuthority: hex.encode(params.freezeAuthority),
        payer: hex.encode(params.payer),
      });

      try {
        const tokenMint = await arch.createTokenMint(params);

        expect(tokenMint).toBeDefined();
        expect(tokenMint.address).toBeDefined();
        expect(tokenMint.decimals).toBe(6);
        expect(tokenMint.mintAuthority).toBe(hex.encode(testMintAuthority));
        expect(tokenMint.freezeAuthority).toBe(hex.encode(testFreezeAuthority));
        expect(tokenMint.initialized).toBe(true);

        console.log('Created token mint:', tokenMint);
      } catch (error) {
        console.error('Error creating token mint:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
    }, 30000); // 30 second timeout for real network calls

    it('should get token mint info', async () => {
      // First create a mint
      const createParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const createdMint = await arch.createTokenMint(createParams);
      
      // Then get its info
      const mintInfo = await arch.getTokenMint(createdMint.address);

      expect(mintInfo).toBeDefined();
      expect(mintInfo?.address).toBe(createdMint.address);
      expect(mintInfo?.decimals).toBe(6);
      expect(mintInfo?.initialized).toBe(true);

      console.log('Retrieved mint info:', mintInfo);
    }, 30000);
  });

  describe('Token Account Operations', () => {
    it('should create a token account', async () => {
      // First create a mint
      const mintParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const tokenMint = await arch.createTokenMint(mintParams);

      // Then create an account for that mint
      const accountParams = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      console.log('Creating token account for mint:', tokenMint.address);

      const tokenAccount = await arch.createTokenAccount(accountParams);

      expect(tokenAccount).toBeDefined();
      expect(tokenAccount.address).toBeDefined();
      expect(tokenAccount.mint).toBe(tokenMint.address);
      expect(tokenAccount.owner).toBe(hex.encode(testOwner));
      expect(tokenAccount.balance).toBe('0');
      expect(tokenAccount.state).toBe('initialized');

      console.log('Created token account:', tokenAccount);
    }, 30000);

    it('should get token account info', async () => {
      // Create mint and account first
      const mintParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const tokenMint = await arch.createTokenMint(mintParams);

      const accountParams = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const createdAccount = await arch.createTokenAccount(accountParams);

      // Get account info
      const accountInfo = await arch.getTokenAccount(createdAccount.address);

      expect(accountInfo).toBeDefined();
      expect(accountInfo?.address).toBe(createdAccount.address);
      expect(accountInfo?.mint).toBe(tokenMint.address);
      expect(accountInfo?.owner).toBe(hex.encode(testOwner));

      console.log('Retrieved account info:', accountInfo);
    }, 30000);
  });

  describe('Token Transfer Operations', () => {
    it('should mint tokens to an account', async () => {
      // Create mint and account
      const mintParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const tokenMint = await arch.createTokenMint(mintParams);

      const accountParams = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const tokenAccount = await arch.createTokenAccount(accountParams);

      // Mint tokens
      const mintParams2 = {
        mintAddress: tokenMint.address,
        destinationAccount: tokenAccount.address,
        mintAuthority: testMintAuthority,
        amount: '1000000', // 1 token with 6 decimals
      };

      console.log('Minting tokens to account:', tokenAccount.address);

      const transactionId = await arch.mintTokens(mintParams2);

      expect(transactionId).toBeDefined();
      expect(typeof transactionId).toBe('string');
      expect(transactionId.length).toBeGreaterThan(0);

      console.log('Mint transaction ID:', transactionId);

      // Check balance
      const balance = await arch.getTokenBalance(tokenAccount.address);
      expect(balance).toBe('1000000');

      console.log('Account balance after mint:', balance);
    }, 30000);

    it('should transfer tokens between accounts', async () => {
      // Create mint and two accounts
      const mintParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const tokenMint = await arch.createTokenMint(mintParams);

      const account1Params = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const account2Params = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const account1 = await arch.createTokenAccount(account1Params);
      const account2 = await arch.createTokenAccount(account2Params);

      // Mint tokens to account1
      const mintParams2 = {
        mintAddress: tokenMint.address,
        destinationAccount: account1.address,
        mintAuthority: testMintAuthority,
        amount: '2000000', // 2 tokens
      };

      await arch.mintTokens(mintParams2);

      // Transfer from account1 to account2
      const transferParams = {
        sourceAccount: account1.address,
        destinationAccount: account2.address,
        owner: testOwner,
        amount: '500000', // 0.5 tokens
      };

      console.log('Transferring tokens from', account1.address, 'to', account2.address);

      const transactionId = await arch.transferTokens(transferParams);

      expect(transactionId).toBeDefined();
      expect(typeof transactionId).toBe('string');

      console.log('Transfer transaction ID:', transactionId);

      // Check balances
      const balance1 = await arch.getTokenBalance(account1.address);
      const balance2 = await arch.getTokenBalance(account2.address);

      expect(balance1).toBe('1500000'); // 2 - 0.5 = 1.5
      expect(balance2).toBe('500000'); // 0.5

      console.log('Account1 balance after transfer:', balance1);
      console.log('Account2 balance after transfer:', balance2);
    }, 30000);
  });

  describe('Advanced Token Operations', () => {
    it('should perform checked operations', async () => {
      // Create mint and account
      const mintParams = {
        decimals: 6,
        mintAuthority: testMintAuthority,
        freezeAuthority: testFreezeAuthority,
        payer: testPayer,
      };

      const tokenMint = await arch.createTokenMint(mintParams);

      const accountParams = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const tokenAccount = await arch.createTokenAccount(accountParams);

      // Test mint to checked
      const mintCheckedParams = {
        mintAddress: tokenMint.address,
        destinationAccount: tokenAccount.address,
        mintAuthority: testMintAuthority,
        amount: '1000000',
        decimals: 6,
      };

      console.log('Testing mint to checked operation');

      const mintTxId = await arch.mintTokensChecked(mintCheckedParams);
      expect(mintTxId).toBeDefined();

      console.log('Mint checked transaction ID:', mintTxId);

      // Test transfer checked
      const account2Params = {
        mint: tokenMint.address,
        owner: testOwner,
        payer: testPayer,
      };

      const account2 = await arch.createTokenAccount(account2Params);

      const transferCheckedParams = {
        sourceAccount: tokenAccount.address,
        destinationAccount: account2.address,
        mintAddress: tokenMint.address,
        owner: testOwner,
        amount: '300000',
        decimals: 6,
      };

      console.log('Testing transfer checked operation');

      const transferTxId = await arch.transferTokensChecked(transferCheckedParams);
      expect(transferTxId).toBeDefined();

      console.log('Transfer checked transaction ID:', transferTxId);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid mint address gracefully', async () => {
      const invalidAddress = 'invalid_address_that_is_not_64_chars';
      
      const result = await arch.getTokenMint(invalidAddress);
      expect(result).toBeNull();
    });

    it('should handle non-existent account gracefully', async () => {
      const nonExistentAddress = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const result = await arch.getTokenAccount(nonExistentAddress);
      expect(result).toBeNull();
    });
  });
}); 