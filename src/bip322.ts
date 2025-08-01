import { schnorr } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { base58check } from '@noble/hashes/base58';

// BIP322 implementation for Arch Network
// Based on the Rust implementation in arch-network/sdk/src/helper/bip322.rs

export interface BIP322Message {
  to_spend: string;
  to_sign: string;
}

export function createBIP322Signature(
  privateKey: Uint8Array,
  messageHash: Uint8Array,
  network: 'mainnet' | 'testnet' | 'regtest' = 'regtest'
): Uint8Array {
  // For Arch, we simplify BIP322 to just sign the message hash directly with Schnorr
  // This matches the pattern used in the Rust implementation where the message hash
  // is the digest of the transaction message
  
  // Ensure private key is 32 bytes
  if (privateKey.length !== 32) {
    throw new Error('Private key must be 32 bytes');
  }
  
  // Ensure message hash is 32 bytes
  if (messageHash.length !== 32) {
    throw new Error('Message hash must be 32 bytes');
  }
  
  // Sign the message hash with Schnorr (Taproot signature)
  const signature = schnorr.sign(messageHash, privateKey);
  
  // Ensure we return a proper Uint8Array
  // The schnorr.sign function might return a different type, so we need to convert it properly
  if (signature instanceof Uint8Array) {
    return signature;
  } else if (ArrayBuffer.isView(signature)) {
    return new Uint8Array(signature.buffer, signature.byteOffset, signature.byteLength);
  } else if (Array.isArray(signature)) {
    return new Uint8Array(signature);
  } else {
    // If it's some other type, try to convert it
    return new Uint8Array(Object.values(signature));
  }
}

export function verifyBIP322Signature(
  publicKey: Uint8Array,
  messageHash: Uint8Array,
  signature: Uint8Array,
  network: 'mainnet' | 'testnet' | 'regtest' = 'regtest'
): boolean {
  try {
    // Verify the Schnorr signature
    return schnorr.verify(signature, messageHash, publicKey);
  } catch (error) {
    return false;
  }
}

// Helper function to derive public key from private key
export function derivePublicKey(privateKey: Uint8Array): Uint8Array {
  return schnorr.getPublicKey(privateKey);
}

// Helper function to create a deterministic message hash from transaction message
export function createMessageHash(message: any): Uint8Array {
  // This should match the Rust ArchMessage::hash() implementation
  // For now, we'll use a simple SHA256 of the serialized message
  const messageStr = JSON.stringify(message);
  return sha256(messageStr);
} 