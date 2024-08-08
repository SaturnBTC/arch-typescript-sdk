type Value = { [key: string]: any };

export interface JsonRpcPayload<T> {
  jsonrpc: string;
  id: string;
  method: string;
  params?: T;
}

export async function post(url: string, method: string): Promise<string> {
  const payload = {
    jsonrpc: '2.0',
    id: 'curlycurl',
    method,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw Error(await response.text());
    }

    return response.text();
  } catch (err) {
    throw Error('rpc post should not fail');
  }
}

export async function postData<T>(
  url: string,
  method: string,
  params: T,
): Promise<string> {
  const payload: JsonRpcPayload<T> = {
    jsonrpc: '2.0',
    id: 'curlycurl',
    method: method,
    params: params,
  };

  let serializedPayload;
  try {
    serializedPayload = JSON.stringify(payload);
  } catch (err) {
    throw Error('Params must be serializable', { cause: err });
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
    throw Error('post data should not fail');
  }
}

export function processResult(response: string): Value {
  try {
    const result: Value = JSON.parse(response);

    if (typeof result !== 'object' || result === null) {
      throw new Error('unexpected output');
    }

    if ('error' in result) {
      throw new Error(JSON.stringify(result.error));
    }

    return result.result;
  } catch (error: any) {
    throw new Error(
      `Processing result failed: ${'message' in error ? error.message : 'unknown'}`,
    );
  }
}
