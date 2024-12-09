export type SerializeUint8Array<T> = T extends Uint8Array
  ? number[]
  : T extends Array<infer U>
    ? Array<SerializeUint8Array<U>>
    : T extends object
      ? { [K in keyof T]: SerializeUint8Array<T[K]> }
      : T;

// Transform Uint8Array to number[]
export function serializeWithUint8Array<T>(obj: T): SerializeUint8Array<T> {
  if (obj instanceof Uint8Array) {
    return Array.from(obj) as SerializeUint8Array<T>;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as SerializeUint8Array<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeWithUint8Array) as SerializeUint8Array<T>;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      serializeWithUint8Array(value),
    ]),
  ) as SerializeUint8Array<T>;
}

// Transform number[] to Uint8Array
export function deserializeWithUint8Array<T>(obj: SerializeUint8Array<T>): T {
  if (Array.isArray(obj) && obj.every((item) => typeof item === 'number')) {
    return new Uint8Array(obj) as unknown as T;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeWithUint8Array) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      deserializeWithUint8Array(value),
    ]),
  ) as T;
}

export type SerializeHexString<T> = T extends Uint8Array
  ? string
  : T extends Array<infer U>
    ? Array<SerializeHexString<U>>
    : T extends object
      ? { [K in keyof T]: SerializeHexString<T[K]> }
      : T;

// Transform Uint8Array to hex string
export function serializeToHexString<T>(obj: T): SerializeHexString<T> {
  if (obj instanceof Uint8Array) {
    return Array.from(obj)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('') as unknown as SerializeHexString<T>;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as SerializeHexString<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeToHexString) as SerializeHexString<T>;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      serializeToHexString(value),
    ]),
  ) as SerializeHexString<T>;
}

// Transform hex string to Uint8Array
export function deserializeFromHexString<T>(obj: SerializeHexString<T>): T {
  if (typeof obj === 'string' && /^[0-9a-fA-F]+$/.test(obj)) {
    const bytes = new Uint8Array(
      obj.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );
    return bytes as unknown as T;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeFromHexString) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      deserializeFromHexString(value),
    ]),
  ) as T;
}
