import { deserializeWithUint8Array, SerializeUint8Array, serializeWithUint8Array } from '../serde/uint8array';
import { AccountInfoResult } from '../struct/account';
import { Block } from '../struct/block';
import { ProcessedTransaction } from '../struct/processed-transaction';
import { AccountFilter, ProgramAccount } from '../struct/program-account';
import { Pubkey } from '../struct/pubkey';
import { RuntimeTransaction } from '../struct/runtime-transaction';
import { Provider } from './provider';

export class Maestro implements Provider {
  url: string;
  apiKey: string;

  constructor(url: string, apiKey: string) {
    this.url = url;
    this.apiKey = apiKey;
  }

  private commonHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  /**
   * Sends a transaction.
   * @param params The transaction to send.
   * @returns A promise that resolves with the transaction result.
   */
  async sendTransaction(params: RuntimeTransaction): Promise<string> {
    const response = await fetch(`${this.url}/rpc/arch/transaction/send`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to send transaction: ${body}`);
    }

    return (await response.json()) as string;
  }

  /**
   * Sends multiple transactions.
   * @param params The transactions to send.
   * @returns A promise that resolves with the transaction results.
   */
  async sendTransactions(params: Array<RuntimeTransaction>): Promise<string[]> {
    const response = await fetch(
      `${this.url}/rpc/arch/transaction/send/batch`,
      {
        method: 'POST',
        headers: this.commonHeaders(),
        body: JSON.stringify(params),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to send transactions: ${body}`);
    }

    return (await response.json()) as string[];
  }

  /**
   * Reads account information.
   * @param pubkey The public key of the account.
   * @returns A promise that resolves with the account information.
   */
  async readAccountInfo(pubkey: Pubkey): Promise<AccountInfoResult> {
    const response = await fetch(`${this.url}/rpc/arch/account/info`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(pubkey),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to read account info: ${body}`);
    }

    const result = await response.json() as SerializeUint8Array<AccountInfoResult>;
    return deserializeWithUint8Array<AccountInfoResult>(result);
  }

  /**
   * Gets the address for an account.
   * @param accountPubkey The public key of the account.
   * @returns A promise that resolves with the account address.
   */
  async getAccountAddress(pubkey: Pubkey): Promise<string> {
    const response = await fetch(`${this.url}/rpc/arch/account/address`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(pubkey),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get account address: ${body}`);
    }

    return (await response.json()) as string;
  }

  /**
   * Gets the best block hash.
   * @returns A promise that resolves with the best block hash.
   */
  async getBestBlockHash(): Promise<string> {
    const response = await fetch(`${this.url}/rpc/arch/block/latest/hash`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get latest block hash: ${body}`);
    }

    return (await response.json()) as string;
  }

  /**
   * Gets block information for a given hash.
   * @param blockHash The block hash.
   * @returns A promise that resolves with the block information.
   */
  async getBlock(blockHash: string): Promise<Block | undefined> {
    const response = await fetch(`${this.url}/rpc/arch/block/${blockHash}`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get block: ${body}`);
    }

    return (await response.json()) as Block;
  }

  /**
   * Gets the block count.
   * @returns A promise that resolves with the block count.
   */
  async getBlockCount(): Promise<number> {
    const response = await fetch(`${this.url}/rpc/arch/block/count`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get block count: ${body}`);
    }

    return (await response.json()) as number;
  }

  /**
   * Gets the block hash for a given height.
   * @param blockHeight The block height.
   * @returns A promise that resolves with the block hash.
   */
  // TODO: NOT IMPLEMENTED
  async getBlockHash(blockHeight: number): Promise<string> {
    const response = await fetch(`${this.url}/rpc/arch/block/${blockHeight}/hash`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get block hash: ${body}`);
    }

    return (await response.json()) as string;
  }

  /**
   * Gets information about a processed transaction.
   * @param txId The transaction ID.
   * @returns A promise that resolves with the processed transaction information.
   */
  async getProcessedTransaction(
    txid: string,
  ): Promise<ProcessedTransaction | undefined> {
    const response = await fetch(`${this.url}/rpc/arch/transaction/${txid}`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get processed transaction: ${body}`);
    }

    const result = await response.json() as SerializeUint8Array<ProcessedTransaction>;
    return deserializeWithUint8Array<ProcessedTransaction>(result);
  }

  /**
   * Gets the program accounts for a given program ID.
   * @param programId The program ID to fetch accounts for.
   * @param filters Optional filters to apply when fetching accounts.
   * @returns A promise that resolves with an array of program accounts.
   */
  async getProgramAccounts(
    programId: Pubkey,
    filters?: AccountFilter[],
  ): Promise<ProgramAccount[]> {
    const params = {
      program_id: serializeWithUint8Array(programId),
      filters: filters,
    };

    const response = await fetch(`${this.url}/rpc/arch/program/accounts`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get program accounts: ${body}`);
    }

    const result = await response.json() as SerializeUint8Array<ProgramAccount[]>;
    return deserializeWithUint8Array<ProgramAccount[]>(result);
  }
}
