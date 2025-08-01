import { Provider } from './provider/provider';
import { secp256k1 } from '@noble/curves/secp256k1';
import { schnorr } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import { CreatedAccount } from './struct/account';
import { 
  TokenMint, 
  TokenAccount, 
  CreateTokenMintParams, 
  CreateTokenAccountParams, 
  MintTokensParams, 
  TransferTokensParams,
  TransferCheckedParams,
  MintToCheckedParams,
  BurnCheckedParams,
  ApproveCheckedParams,
  SetAuthorityParams,
  ApproveParams,
  RevokeParams,
  CreateMultisigParams,
  MultisigAccount,
  BatchTransferParams,
  BatchMintParams,
  CloseAccountParams,
  AuthorityType
} from './struct/token';
import { TokenUtil } from './serde/token';
import { Instruction } from './struct/instruction';
import * as SanitizedMessageUtil from './serde/sanitized-message';
import * as SignatureUtil from './signatures';
import { hex as hexUtil } from '@scure/base';
import { createBIP322Signature, createMessageHash } from './bip322';

// Helper function to transform SDK message format to Arch network format
// Note: The real Arch RPC server expects the original field names
const transformMessageForArch = (message: any) => {
  return {
    header: message.header,
    account_keys: message.account_keys,
    recent_blockhash: message.recent_blockhash,
    instructions: message.instructions
  };
};

// Helper function to convert TokenInstruction to Instruction
const convertTokenInstructionToInstruction = (tokenInstruction: any): Instruction => {
  return {
    program_id: tokenInstruction.programId,
    accounts: tokenInstruction.accounts.map((meta: any) => ({
      pubkey: meta.pubkey,
      is_signer: meta.isSigner,
      is_writable: meta.isWritable
    })),
    data: tokenInstruction.data
  };
};

// Helper function to sign a transaction using BIP322
const signTransaction = (message: any, signers: Uint8Array[]): Uint8Array[] => {
  // Create proper BIP322 signatures for Arch
  return signers.map((privateKey) => {
    // Create the message hash that matches the Rust ArchMessage::hash() implementation
    const messageHash = createMessageHash(message);
    
    // Sign the message hash with BIP322 (Schnorr/Taproot)
    const signature = createBIP322Signature(privateKey, messageHash, 'regtest');
    
    // Return the signature in the expected format (64 bytes)
    return signature;
  });
};

export interface Arch extends Provider {
  createNewAccount: () => Promise<CreatedAccount>;
  
  // Basic Token functionality
  createTokenMint: (params: CreateTokenMintParams) => Promise<TokenMint>;
  getTokenMint: (mintAddress: string) => Promise<TokenMint | null>;
  createTokenAccount: (params: CreateTokenAccountParams) => Promise<TokenAccount>;
  getTokenAccount: (accountAddress: string) => Promise<TokenAccount | null>;
  mintTokens: (params: MintTokensParams) => Promise<string>;
  transferTokens: (params: TransferTokensParams) => Promise<string>;
  burnTokens: (account: string, mint: string, authority: Uint8Array, amount: string) => Promise<string>;
  freezeAccount: (account: string, mint: string, freezeAuthority: Uint8Array) => Promise<string>;
  thawAccount: (account: string, mint: string, freezeAuthority: Uint8Array) => Promise<string>;
  getTokenBalance: (accountAddress: string) => Promise<string>;

  // Advanced Operations (Checked)
  transferTokensChecked: (params: TransferCheckedParams) => Promise<string>;
  mintTokensChecked: (params: MintToCheckedParams) => Promise<string>;
  burnTokensChecked: (params: BurnCheckedParams) => Promise<string>;
  approveChecked: (params: ApproveCheckedParams) => Promise<string>;

  // Authority Management
  setAuthority: (params: SetAuthorityParams) => Promise<string>;

  // Delegation
  approve: (params: ApproveParams) => Promise<string>;
  revoke: (params: RevokeParams) => Promise<string>;

  // Multisig
  createMultisig: (params: CreateMultisigParams) => Promise<MultisigAccount>;
  getMultisig: (multisigAddress: string) => Promise<MultisigAccount | null>;

  // Batch Operations
  batchTransfer: (params: BatchTransferParams) => Promise<string>;
  batchMint: (params: BatchMintParams) => Promise<string>;

  // Account Management
  closeAccount: (params: CloseAccountParams) => Promise<string>;
}

export const ArchConnection = <T extends Provider>(provider: T): Arch & T => {
  const archExtensions = {
    async createNewAccount(): Promise<CreatedAccount> {
      const newShardPrivKey = secp256k1.utils.randomPrivateKey();
      const newShardPubkey = secp256k1
        .getPublicKey(newShardPrivKey, true)
        .slice(1); // xonly pubkey

      const address = await provider.getAccountAddress(newShardPubkey);
      return {
        privkey: hex.encode(newShardPrivKey),
        pubkey: hex.encode(newShardPubkey),
        address,
      };
    },

    async createTokenMint(params: CreateTokenMintParams): Promise<TokenMint> {
      // Generate deterministic mint address
      const { address: mintAddress, keypair: mintKeypair } = TokenUtil.generateMintAddress(params.payer);
      
              // Create system instruction to create account
        const createAccountInstruction: Instruction = {
          program_id: new Uint8Array(32), // System program ID
          accounts: [
            { pubkey: secp256k1.getPublicKey(params.payer).slice(0, 32), is_signer: true, is_writable: true },
            { pubkey: mintAddress, is_signer: false, is_writable: true } // New account being created, not a signer
          ],
          data: new Uint8Array([0, 0, 0, 0, 82, 0, 0, 0, 0, 0, 0, 0]) // Create account with 82 bytes
        };

      // Get recent blockhash
      const recentBlockhash = await provider.getBestBlockHash();
      
      // Create message
      const messageResult = SanitizedMessageUtil.createSanitizedMessage(
        [createAccountInstruction],
        params.payer,
        hexUtil.decode(recentBlockhash)
      );

      if (typeof messageResult === 'string') {
        throw new Error(`Failed to create message: ${messageResult}`);
      }

      // Transform message for Arch network format
      const transformedMessage = transformMessageForArch(messageResult);

      // Sign the transaction - only the payer needs to sign
      const signatures = signTransaction(transformedMessage, [params.payer]);
      
      // Ensure we have the correct number of signatures
      // If the message requires 2 signatures but we only have 1 signer, add a placeholder
      const requiredSignatures = transformedMessage.header.num_required_signatures;
      const actualSignatures = signatures.length;
      
      let finalSignatures = signatures;
      if (requiredSignatures > actualSignatures) {
        // Add placeholder signatures to match the required count
        const placeholderSignature = new Uint8Array(64).fill(0);
        for (let i = actualSignatures; i < requiredSignatures; i++) {
          finalSignatures.push(placeholderSignature);
        }
      }
      
      // Send transaction
      const txid = await provider.sendTransaction({
        version: 0,
        signatures: finalSignatures,
        message: transformedMessage
      });

      // Initialize the mint
      const initTokenInstruction = TokenUtil.createInitializeMintInstruction(
        mintAddress,
        params.mintAuthority,
        params.freezeAuthority || null,
        params.decimals
      );

      const initInstruction = convertTokenInstructionToInstruction(initTokenInstruction);

      const initMessageResult = SanitizedMessageUtil.createSanitizedMessage(
        [initInstruction],
        params.payer,
        hexUtil.decode(recentBlockhash)
      );

      if (typeof initMessageResult === 'string') {
        throw new Error(`Failed to create init message: ${initMessageResult}`);
      }

      const transformedInitMessage = transformMessageForArch(initMessageResult);

      // Sign the init transaction
      const initSignatures = signTransaction(transformedInitMessage, [params.payer]);
      
      // Ensure we have the correct number of signatures for the init transaction too
      const requiredInitSignatures = transformedInitMessage.header.num_required_signatures;
      const actualInitSignatures = initSignatures.length;
      
      let finalInitSignatures = initSignatures;
      if (requiredInitSignatures > actualInitSignatures) {
        // Add placeholder signatures to match the required count
        const placeholderSignature = new Uint8Array(64).fill(0);
        for (let i = actualInitSignatures; i < requiredInitSignatures; i++) {
          finalInitSignatures.push(placeholderSignature);
        }
      }
      
      const initTxid = await provider.sendTransaction({
        version: 0,
        signatures: finalInitSignatures,
        message: transformedInitMessage
      });

      return {
        address: hexUtil.encode(mintAddress),
        decimals: params.decimals,
        supply: '0',
        mintAuthority: hexUtil.encode(params.mintAuthority),
        initialized: true
      };
    },

    async getTokenMint(mintAddress: string): Promise<TokenMint | null> {
      try {
        const mintPubkey = hexUtil.decode(mintAddress);
        const accountInfo = await provider.readAccountInfo(mintPubkey);
        
        if (!accountInfo) {
          return null;
        }

        // Parse mint data (simplified for demo)
        return {
          address: mintAddress,
          decimals: 6, // Default for demo
          supply: '0',
          mintAuthority: hexUtil.encode(new Uint8Array(32)),
          initialized: true
        };
      } catch (error) {
        console.error('Error fetching token mint:', error);
        return null;
      }
    },

    async createTokenAccount(params: CreateTokenAccountParams): Promise<TokenAccount> {
      // Generate account address
      const accountAddress = await provider.getAccountAddress(params.owner);
      
      // Create account instruction
      const createAccountInstruction: Instruction = {
        program_id: new Uint8Array(32), // System program ID
        accounts: [
          { pubkey: params.payer, is_signer: true, is_writable: true },
          { pubkey: hexUtil.decode(accountAddress), is_signer: false, is_writable: true }
        ],
        data: new Uint8Array([0, 0, 0, 0, 165, 0, 0, 0, 0, 0, 0, 0]) // Create account with 165 bytes
      };

      // Get recent blockhash
      const recentBlockhash = await provider.getBestBlockHash();
      
      // Create message
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [createAccountInstruction],
        params.payer,
        recentBlockhash
      );

      // Send transaction
      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return {
        address: accountAddress,
        mint: params.mint,
        owner: hexUtil.encode(params.owner),
        balance: '0',
        state: 'initialized'
      };
    },

    async getTokenAccount(accountAddress: string): Promise<TokenAccount | null> {
      try {
        const accountPubkey = hexUtil.decode(accountAddress);
        const accountInfo = await provider.readAccountInfo(accountPubkey);
        
        if (!accountInfo) {
          return null;
        }

        // Parse account data (simplified for demo)
        return {
          address: accountAddress,
          mint: 'mock_mint_address',
          owner: hexUtil.encode(new Uint8Array(32)),
          balance: '0',
          state: 'initialized'
        };
      } catch (error) {
        console.error('Error fetching token account:', error);
        return null;
      }
    },

    async mintTokens(params: MintTokensParams): Promise<string> {
      const mintInstruction = TokenUtil.createMintToInstruction(
        hexUtil.decode(params.mintAddress),
        hexUtil.decode(params.destinationAccount),
        params.mintAuthority,
        TokenUtil.stringToAmount(params.amount, 6) // Default 6 decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [mintInstruction],
        params.mintAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async transferTokens(params: TransferTokensParams): Promise<string> {
      const transferInstruction = TokenUtil.createTransferInstruction(
        hexUtil.decode(params.sourceAccount),
        hexUtil.decode(params.destinationAccount),
        params.owner,
        TokenUtil.stringToAmount(params.amount, 6) // Default 6 decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [transferInstruction],
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async burnTokens(account: string, mint: string, authority: Uint8Array, amount: string): Promise<string> {
      const burnInstruction = TokenUtil.createBurnInstruction(
        hexUtil.decode(account),
        hexUtil.decode(mint),
        authority,
        TokenUtil.stringToAmount(amount, 6) // Default 6 decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [burnInstruction],
        authority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async freezeAccount(account: string, mint: string, freezeAuthority: Uint8Array): Promise<string> {
      const freezeInstruction = TokenUtil.createFreezeAccountInstruction(
        hexUtil.decode(account),
        hexUtil.decode(mint),
        freezeAuthority
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [freezeInstruction],
        freezeAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async thawAccount(account: string, mint: string, freezeAuthority: Uint8Array): Promise<string> {
      const thawInstruction = TokenUtil.createThawAccountInstruction(
        hexUtil.decode(account),
        hexUtil.decode(mint),
        freezeAuthority
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [thawInstruction],
        freezeAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async getTokenBalance(accountAddress: string): Promise<string> {
      const account = await this.getTokenAccount(accountAddress);
      return account?.balance || '0';
    },

    // Advanced Operations (Checked)
    async transferTokensChecked(params: TransferCheckedParams): Promise<string> {
      const transferInstruction = TokenUtil.createTransferCheckedInstruction(
        hexUtil.decode(params.sourceAccount),
        hexUtil.decode(params.mintAddress),
        hexUtil.decode(params.destinationAccount),
        params.owner,
        TokenUtil.stringToAmount(params.amount, params.decimals),
        params.decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [transferInstruction],
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async mintTokensChecked(params: MintToCheckedParams): Promise<string> {
      const mintInstruction = TokenUtil.createMintToCheckedInstruction(
        hexUtil.decode(params.mintAddress),
        hexUtil.decode(params.destinationAccount),
        params.mintAuthority,
        TokenUtil.stringToAmount(params.amount, params.decimals),
        params.decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [mintInstruction],
        params.mintAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async burnTokensChecked(params: BurnCheckedParams): Promise<string> {
      const burnInstruction = TokenUtil.createBurnCheckedInstruction(
        hexUtil.decode(params.account),
        hexUtil.decode(params.mint),
        params.authority,
        TokenUtil.stringToAmount(params.amount, params.decimals),
        params.decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [burnInstruction],
        params.authority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async approveChecked(params: ApproveCheckedParams): Promise<string> {
      const approveInstruction = TokenUtil.createApproveCheckedInstruction(
        hexUtil.decode(params.account),
        hexUtil.decode(params.mint),
        params.delegate,
        params.owner,
        TokenUtil.stringToAmount(params.amount, params.decimals),
        params.decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [approveInstruction],
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    // Authority Management
    async setAuthority(params: SetAuthorityParams): Promise<string> {
      const setAuthorityInstruction = TokenUtil.createSetAuthorityInstruction(
        hexUtil.decode(params.account),
        params.newAuthority,
        params.authorityType,
        params.currentAuthority
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [setAuthorityInstruction],
        params.currentAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    // Delegation
    async approve(params: ApproveParams): Promise<string> {
      const approveInstruction = TokenUtil.createApproveInstruction(
        hexUtil.decode(params.account),
        hexUtil.decode(params.mintAddress || '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'), // Default mint address
        params.delegate,
        params.owner,
        TokenUtil.stringToAmount(params.amount, 6) // Default 6 decimals
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [approveInstruction],
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async revoke(params: RevokeParams): Promise<string> {
      const revokeInstruction = TokenUtil.createRevokeInstruction(
        hexUtil.decode(params.account),
        params.owner
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [revokeInstruction],
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    // Multisig
    async createMultisig(params: CreateMultisigParams): Promise<MultisigAccount> {
      const multisigAddress = await provider.getAccountAddress(params.payer);
      
      const createMultisigInstruction = TokenUtil.createInitializeMultisigInstruction(
        hexUtil.decode(multisigAddress),
        params.signers,
        params.minimumSigners
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [createMultisigInstruction],
        params.payer,
        recentBlockhash
      );

      await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return {
        address: multisigAddress,
        signers: params.signers.map(signer => hexUtil.encode(signer)),
        minimumSigners: params.minimumSigners,
        numValidSigners: params.signers.length
      };
    },

    async getMultisig(multisigAddress: string): Promise<MultisigAccount | null> {
      try {
        const multisigPubkey = hexUtil.decode(multisigAddress);
        const accountInfo = await provider.readAccountInfo(multisigPubkey);
        
        if (!accountInfo) {
          return null;
        }

        // Parse multisig data (simplified for demo)
        return {
          address: multisigAddress,
          signers: ['mock_signer_1', 'mock_signer_2'],
          minimumSigners: 2,
          numValidSigners: 2
        };
      } catch (error) {
        console.error('Error fetching multisig account:', error);
        return null;
      }
    },

    // Batch Operations
    async batchTransfer(params: BatchTransferParams): Promise<string> {
      const instructions = params.transfers.map(transfer => 
        TokenUtil.createTransferInstruction(
          hexUtil.decode(transfer.sourceAccount),
          hexUtil.decode(transfer.destinationAccount),
          params.owner,
          TokenUtil.stringToAmount(transfer.amount, 6) // Default 6 decimals
        )
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        instructions,
        params.owner,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    async batchMint(params: BatchMintParams): Promise<string> {
      const instructions = params.mints.map(mint => 
        TokenUtil.createMintToInstruction(
          hexUtil.decode(mint.mintAddress),
          hexUtil.decode(mint.destinationAccount),
          params.mintAuthority,
          TokenUtil.stringToAmount(mint.amount, 6) // Default 6 decimals
        )
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        instructions,
        params.mintAuthority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    },

    // Account Management
    async closeAccount(params: CloseAccountParams): Promise<string> {
      const closeInstruction = TokenUtil.createCloseAccountInstruction(
        hexUtil.decode(params.account),
        params.destination,
        params.authority
      );

      const recentBlockhash = await provider.getBestBlockHash();
      const message = SanitizedMessageUtil.createSanitizedMessage(
        [closeInstruction],
        params.authority,
        recentBlockhash
      );

      const txid = await provider.sendTransaction({
        version: 1,
        signatures: [new Uint8Array(64)], // Placeholder signature
        message
      });

      return txid;
    }
  };

  // Add any Arch methods onto the provider instance itself.
  Object.assign(provider, archExtensions);

  return provider as Arch & T;
};
