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
const recentBlockhash = /* string (hex) */;

// 3. Create a SanitizedMessage
const message = SanitizedMessageUtil.createSanitizedMessage(
  instructions,
  payerPubkey,
  recentBlockhash
);

// 4. Hash the message and sign it (using your signing method)
const messageHash = SanitizedMessageUtil.hash(message); // Uint8Array
const signature = /* sign messageHash with your private key */;

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
const recentBlockhash = '...'; // Replace with recent blockhash (hex string)

const message = SanitizedMessageUtil.createSanitizedMessage(
  [instruction],
  payerPubkey,
  recentBlockhash
);

const messageHash = SanitizedMessageUtil.hash(message);
const signature = /* sign messageHash with your private key */;
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
- **Batch Transactions**: Use `arch.sendTransactions([tx1, tx2, ...])` to send multiple transactions at once.
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

## Wallet Types and BigInt Serialization

### Wallet Types

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

### BigInt Serialization Utilities

When working with JSON APIs or storage, use these helpers to safely serialize/deserialize objects containing `bigint` fields:

```typescript
import {
  serializeWithBigInt,
  deserializeWithBigInt,
} from '@saturnbtcio/pool-serde-sdk';

const obj = { value: 123n };
const jsonReady = serializeWithBigInt(obj); // { value: '123' }
const restored = deserializeWithBigInt(jsonReady); // { value: 123n }
```

Use these utilities whenever you need to send or receive data with `bigint` values over the network or store them as JSON.

---

## License

MIT
