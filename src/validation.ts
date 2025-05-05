import { toHex } from './serde/pubkey';
import { Pubkey } from './struct/pubkey';
import { Signature } from './struct/runtime-transaction';

enum ValidationErrorType {
  InvalidPubkey = 'InvalidPubkey',
  InvalidSignature = 'InvalidSignature',
}

export class ValidationError extends Error {
  public readonly code: ValidationErrorType;
  constructor(code: ValidationErrorType, message: string) {
    super(message);
    this.code = code;
  }
}

const base64StringRegex =
  /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{4}|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}={2})$/;
const hexStringRegex = /^[0-9a-fA-F]+$/;

export function validatePubkey(bytes: Pubkey) {
  const hexPubkey = toHex(bytes);

  if (!hexStringRegex.test(hexPubkey)) {
    throw new ValidationError(
      ValidationErrorType.InvalidPubkey,
      `Invalid pubkey: contains non-hex characters (“${hexPubkey}”).`,
    );
  }

  if (hexPubkey.length !== 64) {
    throw new ValidationError(
      ValidationErrorType.InvalidPubkey,
      `Invalid pubkey size: does not contain 64 characters (“${hexPubkey}”).`,
    );
  }
}

export function validateSignature(sig: Uint8Array) {
  const base64Sig = Buffer.from(sig).toString('base64');
  if (!base64StringRegex.test(base64Sig)) {
    throw new ValidationError(
      ValidationErrorType.InvalidSignature,
      `Invalid signature: not valid Base64 (“${base64Sig}”).`,
    );
  }
}

export function validatePubkeys(pubkeys: Array<Pubkey>) {
  for (var pubkey of pubkeys) {
    validatePubkey(pubkey);
  }
}

export function validateSignatures(signatures: Array<Signature>) {
  for (var signature of signatures) {
    validateSignature(signature);
  }
}
