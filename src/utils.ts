import { serializeWithUint8Array } from './serde/uint8array';

type Value = { [key: string]: any };

export interface JsonRpcPayload<T> {
  jsonrpc: string;
  id: string;
  method: string;
  params?: T;
}

export async function postData<T>(
  url: string,
  method: string,
  params?: T,
): Promise<string> {
  const payload: JsonRpcPayload<T> = {
    jsonrpc: '2.0',
    id: 'curlycurl',
    method: method,
  };

  if (params) {
    payload.params = params;
  }

  let serializedPayload;
  try {
    // Serialize Uint8Array fields to number arrays before JSON stringification
    const serializedPayloadObj = serializeWithUint8Array(payload);
    serializedPayload = JSON.stringify(serializedPayloadObj);
    console.log('🔍 DEBUG: Serialized payload length:', serializedPayload.length);
    console.log('🔍 DEBUG: Serialized payload preview:', serializedPayload.substring(0, 200) + '...');
  } catch (err) {
    throw Error('payload must be serializable', { cause: err });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedPayload,
    });

    if (!response.ok) {
      throw Error(await response.text());
    }

    return response.text();
  } catch (err) {
    console.error(err);
    throw Error('Error requesting data from rpc', { cause: err });
  }
}

export function processResult<T>(response: string): T {
  const result: Value = JSON.parse(response);

  if (typeof result !== 'object' || result === null) {
    throw new ArchRpcError(
      {
        code: 0,
        message: 'unexpected output',
      },
      { cause: response },
    );
  }

  if ('error' in result) {
    throw new ArchRpcError(result.error, { cause: response });
  }

  return result.result as T;
}

export interface ArchRpcErrorType {
  code: number;
  message: string;
}

export class ArchRpcError extends Error {
  error: ArchRpcErrorType;

  constructor(error: ArchRpcErrorType, options?: ErrorOptions) {
    super(error.message, options);
    this.error = error;
  }
}
