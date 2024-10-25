export const adjustSignature = (signature: Uint8Array) => {
  if (signature.length === 66) {
    // Take the last 64 bytes
    // We're removing the first two bytes which are the size.
    return signature.subarray(2);
  }

  if (signature.length === 67) {
    // Remove the first 2 bytes and the last byte
    // The last one is the sighash type.
    return signature.subarray(2, -1);
  }

  if (signature.length === 64) {
    return signature;
  }

  throw new Error('Invalid signature length');
};
