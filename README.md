# Arch TypeScript SDK

A TypeScript SDK for building, signing, and sending transactions on the Arch Network. This SDK provides low-level primitives for message creation, signature handling, and transaction submission, enabling developers to build custom workflows and applications on top of the Arch protocol.

## Installation

```bash
npm install @saturnbtcio/arch-sdk
```

## Quickstart Example

Below is a minimal example showing how to create a message, sign it, adjust the signature, and send an Arch transaction using this SDK.

```typescript
import {
  ArchConnection,
  SanitizedMessageUtil,
  SignatureUtil,
  RpcConnection,
} from '@saturnbtcio/arch-sdk';

// 1. Set up a provider (e.g., RPC connection to an Arch node)
const provider = new RpcConnection({ nodeUrl: 'http://localhost:8899' });
const arch = ArchConnection(provider);

// 2. Prepare your instruction(s) (see Instruction type for structure)
const instructions = [/* ...your instructions here... */];
const payerPubkey = /* Uint8Array (32 bytes) */;
const recentBlockhash = /* Call the archRpc.getBestBlockhash */;

// 3. Create a SanitizedMessage
const message = SanitizedMessageUtil.createSanitizedMessage(
  instructions,
  payerPubkey,
  recentBlockhash
);

// 4. Hash the message and sign it (using your signing method)
const messageHash = SanitizedMessageUtil.hash(message); // Uint8Array

// Decode it using utf-8
const messageHashString = new TextDecoder().decode(messageHash);

// Sign the message hash using your Bitcoin private key, producing a BIP322-compliant signature.
// You can use a wallet or library that supports BIP322 signing.
const signature = bip322Sign(privateKey, messageHashString, addressType); // pseudocode

// 5. Adjust the signature to the required format
const adjustedSignature = SignatureUtil.adjustSignature(signature);

// 6. Build the transaction object
const transaction = {
  version: 1,
  signatures: [adjustedSignature],
  message,
};

// 7. Send the transaction
const txid = await arch.sendTransaction(transaction);
console.log('Arch transaction ID:', txid);

```

## API Overview

### Providers

- **RpcConnection**: Connects to an Arch node via HTTP.
- **ArchConnection**: Extends a provider with Arch-specific helpers (e.g., createNewAccount).

### Message Creation

- **SanitizedMessageUtil.createSanitizedMessage(instructions, payer, recentBlockhash)**
  - Compiles instructions into a canonical message for signing and sending.
- **SanitizedMessageUtil.hash(message)**
  - Returns the hash (Uint8Array) of a sanitized message for signing.

### Signature Utilities

- **SignatureUtil.adjustSignature(signature: Uint8Array)**
  - Normalizes a signature to the required 64-byte format for Arch transactions.

### Transaction Structure

- **RuntimeTransaction**
  - `{ version: number, signatures: Uint8Array[], message: SanitizedMessage }`

### Sending Transactions

- **arch.sendTransaction(transaction: RuntimeTransaction): Promise<string>**
  - Sends a transaction to the Arch network and returns the transaction ID.

### Creating a New Account

- **arch.createNewAccount(): Promise<{ privkey, pubkey, address }>**
  - Generates a new keypair and returns the address, pubkey, and privkey.

## Types

- **Instruction**: `{ program_id, accounts, data }`
- **SanitizedMessage**: `{ header, account_keys, recent_blockhash, instructions }`
- **Signature**: `Uint8Array (64 bytes)`
- **RuntimeTransaction**: `{ version, signatures, message }`

## System Instruction Helpers

The SDK provides low-level helper functions for constructing system instructions compatible with the Arch blockchain. These helpers serialize instruction data in a format expected by the on-chain Rust programs, making it easy to create, transfer, and manage accounts from TypeScript.

### `createAccount`

Creates a new account on the blockchain.

**Parameters:**

- `fromPubkey: Pubkey` — Funding account public key (signer, writable)
- `toPubkey: Pubkey` — New account public key (signer, writable)
- `lamports: bigint` — Number of lamports to transfer to the new account
- `space: bigint` — Number of bytes of memory to allocate
- `owner: Pubkey` — Program that will own the new account

**Example:**

```typescript
const ix = createAccount(funder, newAccount, 1000n, 128n, ownerProgramId);
```

---

### `createAccountWithAnchor`

Creates a new account and anchors it to a specific UTXO (e.g., for Bitcoin integration).

**Parameters:**

- `fromPubkey: Pubkey` — Funding account public key (signer, writable)
- `toPubkey: Pubkey` — New account public key (signer, writable)
- `lamports: bigint` — Number of lamports to transfer
- `space: bigint` — Number of bytes of memory to allocate
- `owner: Pubkey` — Program that will own the new account
- `txid: string` — 64-character hex string of the UTXO transaction ID
- `vout: number` — Output index of the UTXO

**Example:**

```typescript
const ix = createAccountWithAnchor(
  funder,
  newAccount,
  1000n,
  128n,
  ownerProgramId,
  'aabbcc...ff', // 64-char hex string
  0,
);
```

---

### `transfer`

Transfers lamports from one account to another.

**Parameters:**

- `fromPubkey: Pubkey` — Sender account public key (signer, writable)
- `toPubkey: Pubkey` — Recipient account public key (writable)
- `lamports: bigint` — Amount to transfer

**Example:**

```typescript
const ix = transfer(sender, recipient, 500n);
```

---

### `assign`

Assigns a new owner (program) to an account.

**Parameters:**

- `pubkey: Pubkey` — Account to reassign (signer, writable)
- `owner: Pubkey` — New owner program public key

**Example:**

```typescript
const ix = assign(account, newOwnerProgramId);
```

---

### `allocate`

Allocates space in an account without funding it.

**Parameters:**

- `pubkey: Pubkey` — Account to allocate space for (signer, writable)
- `space: bigint` — Number of bytes to allocate

**Example:**

```typescript
const ix = allocate(account, 256n);
```

---

**Usage Note:**
After constructing an instruction with these helpers, use the SDK's serialization utilities (see above) to serialize and send the instruction as part of a transaction.

## Example: Creating and Sending a Transaction

```typescript
import {
  ArchConnection,
  SanitizedMessageUtil,
  SignatureUtil,
  RpcConnection,
  // ...other imports
} from '@saturnbtcio/arch-sdk';

// Set up provider and arch connection
const provider = new RpcConnection({ nodeUrl: 'http://localhost:8899' });
const arch = ArchConnection(provider);

// Example instruction (replace with your actual data)
const instruction = {
  program_id: new Uint8Array(32), // 32-byte program ID
  accounts: [
    {
      pubkey: new Uint8Array(32), // 32-byte pubkey
      is_signer: true,
      is_writable: true,
    },
  ],
  data: new Uint8Array([1, 2, 3]), // Your instruction data
};

const payerPubkey = new Uint8Array(32); // Replace with your payer pubkey
const recentBlockhash = '...'; // Call the archRpc.getBestBlockhash

const message = SanitizedMessageUtil.createSanitizedMessage(
  [instruction],
  payerPubkey,
  recentBlockhash,
);

const messageHash = SanitizedMessageUtil.hash(message);
// Sign the message hash with your Bitcoin private key using the BIP322 standard.
// (You must use a wallet or library that supports BIP322 message signing.)
const signature = bip322Sign(privateKey, messageHash, addressType); // pseudocode
const adjustedSignature = SignatureUtil.adjustSignature(signature);

const transaction = {
  version: 1,
  signatures: [adjustedSignature],
  message,
};

const txid = await arch.sendTransaction(transaction);
console.log('Arch transaction ID:', txid);
```

## Advanced Topics

- **Multiple Signers**: Add multiple signatures to the `signatures` array in the transaction.
- **Custom Providers**: Implement the `Provider` interface for custom transport or signing logic.

## Troubleshooting

- Ensure all public keys and signatures are 32 and 64 bytes respectively.
- Use `SignatureUtil.adjustSignature` to normalize signatures from different signing libraries.
- Check node connectivity and blockhash freshness if transactions fail to send.

## WebSocket Client: Real-Time Event Subscriptions

The SDK provides a WebSocket client for subscribing to real-time events from the Arch network, such as new blocks, transactions, account updates, and more.

### Features

- Connect/disconnect to a WebSocket server
- Subscribe to event topics (block, transaction, account update, etc.)
- Filter events by custom criteria
- Add/remove listeners for events
- Automatic reconnection with backoff strategies

### Event Topics

- `block`: New block events
- `transaction`: Transaction status updates
- `account_update`: Account state changes
- `rolledback_transactions`, `reapplied_transactions`, `dkg`: Advanced protocol events

### Configuration Options

You can customize the WebSocket client by passing a configuration object to the constructor:

```typescript
interface WebSocketClientOptions {
  url: string; // (Required) WebSocket server URL
  maxReconnectAttempts?: number; // Max reconnection attempts (default: 5)
  backoffStrategy?: BackoffStrategy; // Reconnection backoff strategy (see below)
  autoReconnect?: boolean; // Enable auto-reconnect (default: false)
  timeout?: number; // Connection timeout in ms (default: 20000)
  transports?: string[]; // Socket.IO transports (default: ['websocket', 'polling'])
  forceNew?: boolean; // Force new connection (default: true)
  multiplex?: boolean; // Enable multiplexing (default: false)
}

interface BackoffStrategy {
  type: 'constant' | 'linear' | 'exponential'; // Strategy type
  initial?: number; // Initial delay in ms (default: 1000)
  factor?: number; // Growth factor for exponential (default: 2)
  maxDelay?: number; // Max delay in ms (default: 30000)
  step?: number; // Step size for linear (optional)
  jitter?: number; // Jitter as a fraction (default: 0.2)
}
```

**Defaults:**

- `maxReconnectAttempts`: 5
- `autoReconnect`: false
- `timeout`: 20000
- `transports`: ['websocket', 'polling']
- `forceNew`: true
- `multiplex`: false
- `backoffStrategy`: Exponential (initial: 1000ms, factor: 2, maxDelay: 30000ms, jitter: 0.2)

#### Example

```typescript
const client = new ArchWebSocketClient({
  url: 'ws://localhost:3001',
  autoReconnect: true,
  maxReconnectAttempts: 10,
  timeout: 15000,
  transports: ['websocket'],
  backoffStrategy: {
    type: 'exponential',
    initial: 500,
    factor: 2,
    maxDelay: 20000,
    jitter: 0.1,
  },
});
```

### Example Usage

```typescript
import { ArchWebSocketClient } from '@saturnbtcio/arch-sdk';
import { EventTopic } from '@saturnbtcio/arch-sdk/websocket-client/types/events';

const client = new ArchWebSocketClient({ url: 'ws://localhost:3001' });

// Connect to the server
await client.connect();

// Subscribe to new block events
const blockCallback = async (event) => {
  console.log('New block:', event.hash, event.timestamp);
};
await client.subscribe(EventTopic.Block, blockCallback);

// Subscribe to transaction events with a filter
const txCallback = async (event) => {
  console.log('Transaction update:', event.hash, event.status);
};
await client.subscribe(EventTopic.Transaction, txCallback, {
  status: 'Processed',
});

// Add an additional listener for account updates
client.on(EventTopic.AccountUpdate, (event) => {
  console.log('Account updated:', event.account);
});

// Disconnect when done
await client.disconnect();
```

### Filters

You can filter events by fields such as status, programIds, block hash, etc. (see `EventFilter`, `TransactionFilter`, `BlockFilter`).

### Reconnection

The client supports automatic reconnection with customizable backoff strategies:

```typescript
client.setReconnectOptions(
  true,
  /* strategy */ 'exponential',
  /* maxAttempts */ 5,
);
```

### Event Types

See the SDK source for all event interfaces (e.g., `BlockEvent`, `TransactionEvent`, `AccountUpdateEvent`).

---

## Wallet Types

The SDK and related packages define types for representing user wallets, UTXOs, and collections:

```typescript
interface Wallet {
  address: string;
  balance: bigint;
  utxos: Array<CollectionUtxo>;
}

interface CollectionUtxo {
  // UTXO details
  collectionStatuses: Array<CollectionAmount>;
  hasInscription: boolean;
}

interface CollectionAmount {
  id: string;
  type: 'rune' | 'btc';
  amount: bigint;
}
```

These types are useful for wallet management, UTXO selection, and integration with pool or transaction logic.

---
