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
