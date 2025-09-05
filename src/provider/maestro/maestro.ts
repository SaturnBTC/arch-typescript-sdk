import {
  deserializeWithUint8Array,
  SerializeUint8Array,
  serializeWithUint8Array,
} from '../../serde/uint8array';
import { AccountInfoResult } from '../../struct/account';
import { Block } from '../../struct/block';
import { BlockTransactionFilter } from '../../struct/block-transaction-filter';
import { BlockTransactionsParams } from '../../struct/block-transactions-params';
import { ProcessedTransaction } from '../../struct/processed-transaction';
import { AccountFilter, ProgramAccount } from '../../struct/program-account';
import { Pubkey } from '../../struct/pubkey';
import { RuntimeTransaction } from '../../struct/runtime-transaction';
import { TransactionListParams } from '../../struct/transaction-list-params';
import { TransactionsByIdsParams } from '../../struct/transactions-by-ids-params';
import { Provider } from '../provider';
import {
  AccountAddressResponse,
  AccountInfoResponse,
  BlockCountResponse,
  BlockInfoResponse,
  LatestBlockHashResponse,
  LatestBlockInfoResponse,
  ProcessedTransactionResponse,
  ProgramAccountResponse,
  RecentTransactionsResponse,
  SendTransactionResponse,
  SendTransactionsResponse,
} from './maestro.dto';

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
      'api-key': this.apiKey,
    };
  }

  /**
   * Sends a transaction.
   * @param params The transaction to send.
   * @returns A promise that resolves with the transaction result.
   */
  async sendTransaction(params: RuntimeTransaction): Promise<string> {
    const response = await fetch(`${this.url}/rpc/transaction/send`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to send transaction: ${body}`);
    }

    const result = (await response.json()) as SendTransactionResponse;
    return result.data;
  }

  /**
   * Sends multiple transactions.
   * @param params The transactions to send.
   * @returns A promise that resolves with the transaction results.
   */
  async sendTransactions(params: Array<RuntimeTransaction>): Promise<string[]> {
    const response = await fetch(`${this.url}/rpc/transaction/send/batch`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to send transactions: ${body}`);
    }

    const result = (await response.json()) as SendTransactionsResponse;
    return result.data;
  }

  /**
   * Reads account information.
   * @param pubkey The public key of the account.
   * @returns A promise that resolves with the account information.
   */
  async readAccountInfo(pubkey: Pubkey): Promise<AccountInfoResult> {
    const response = await fetch(`${this.url}/rpc/account/info`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(pubkey),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to read account info: ${body}`);
    }

    const result = (await response.json()) as AccountInfoResponse;
    return deserializeWithUint8Array<AccountInfoResult>(result.data);
  }

  /**
   * Reads account information in hex format.
   * @param pubkey The public key of the account.
   * @returns A promise that resolves with the account information.
   */
  async readAccountInfoHex(pubkey: string): Promise<AccountInfoResult> {
    const response = await fetch(`${this.url}/rpc/account/info/${pubkey}`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to read account info: ${body}`);
    }

    const result = (await response.json()) as AccountInfoResponse;
    return deserializeWithUint8Array<AccountInfoResult>(result.data);
  }

  /**
   * Gets the address for an account.
   * @param accountPubkey The public key of the account.
   * @returns A promise that resolves with the account address.
   */
  async getAccountAddress(pubkey: Pubkey): Promise<string> {
    const response = await fetch(`${this.url}/rpc/account/address`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(pubkey),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get account address: ${body}`);
    }

    const result = (await response.json()) as AccountAddressResponse;
    return result.data;
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

    const result = (await response.json()) as LatestBlockHashResponse;
    return result.data;
  }

  /**
   * Gets block information for a given hash.
   * @param blockHash The block hash.
   * @returns A promise that resolves with the block information.
   */
  async getBlock(blockHash: string): Promise<Block | undefined> {
    const response = await fetch(`${this.url}/rpc/block/${blockHash}`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get block: ${body}`);
    }

    const result = (await response.json()) as BlockInfoResponse;
    return deserializeWithUint8Array<Block>(result.data);
  }

  /**
   * Gets the latest block.
   * @returns A promise that resolves with the latest block.
   */
  async getLatestBlock(): Promise<Block> {
    const response = await fetch(`${this.url}/rpc/block/latest`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get latest block: ${body}`);
    }

    const result = (await response.json()) as LatestBlockInfoResponse;
    return deserializeWithUint8Array<Block>(result.data);
  }

  /**
   * Gets the block count.
   * @returns A promise that resolves with the block count.
   */
  async getBlockCount(): Promise<number> {
    const response = await fetch(`${this.url}/rpc/block/count`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get block count: ${body}`);
    }

    const result = (await response.json()) as BlockCountResponse;
    return result.data;
  }

  /**
   * Gets the block hash for a given height.
   * @param blockHeight The block height.
   * @returns A promise that resolves with the block hash.
   */
  // TODO: NOT IMPLEMENTED
  async getBlockHash(blockHeight: number): Promise<string> {
    throw new Error('Not implemented');
  }

  /**
   * Gets information about a processed transaction.
   * @param txId The transaction ID.
   * @returns A promise that resolves with the processed transaction information.
   */
  async getProcessedTransaction(
    txid: string,
  ): Promise<ProcessedTransaction | undefined> {
    const response = await fetch(`${this.url}/rpc/transaction/${txid}`, {
      method: 'GET',
      headers: this.commonHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get processed transaction: ${body}`);
    }

    const result = (await response.json()) as ProcessedTransactionResponse;
    return deserializeWithUint8Array<ProcessedTransaction>(result.data);
  }

  /**
   * Gets the recent transactions.
   * @param count The number of transactions to get.
   * @param order The order of the transactions.
   * @returns A promise that resolves with the recent transactions.
   */
  async getRecentTransactions(
    count: number,
    order: 'asc' | 'desc',
  ): Promise<ProcessedTransaction[]> {
    const response = await fetch(
      `${this.url}/rpc/transaction/recent?count=${count}&order=${order}`,
      {
        method: 'GET',
        headers: this.commonHeaders(),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get recent transactions: ${body}`);
    }

    const result = (await response.json()) as RecentTransactionsResponse;
    return deserializeWithUint8Array<ProcessedTransaction[]>(result.data);
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

    const response = await fetch(`${this.url}/rpc/program/accounts`, {
      method: 'POST',
      headers: this.commonHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const body = await response.text();
      throw Error(`Failed to get program accounts: ${body}`);
    }

    const result = (await response.json()) as ProgramAccountResponse;
    return deserializeWithUint8Array<ProgramAccount[]>(result.data);
  }

  async getBlockByHeight(
    blockHeight: number,
    filter?: BlockTransactionFilter,
  ): Promise<Block | undefined> {
    throw new Error('Not implemented');
  }

  async getTransactionsByBlock(
    params: BlockTransactionsParams,
  ): Promise<ProcessedTransaction[]> {
    throw new Error('Not implemented');
  }

  async getTransactionsByIds(
    params: TransactionsByIdsParams,
  ): Promise<(ProcessedTransaction | null)[]> {
    throw new Error('Not implemented');
  }

  async recentTransactions(
    params: TransactionListParams,
  ): Promise<ProcessedTransaction[]> {
    throw new Error('Not implemented');
  }

  async getMultipleAccounts(
    pubkeys: Pubkey[],
  ): Promise<(AccountInfoResult | null)[]> {
    throw new Error('Not implemented');
  }

  async requestAirdrop(pubkey: Pubkey) {
    // const response = await fetch(`${this.url}/rpc/airdrop/request`, {
    //   method: 'POST',
    //   headers: this.commonHeaders(),
    //   body: JSON.stringify(pubkey),
    // });

    // if (!response.ok) {
    //   const body = await response.text();
    //   throw Error(`Failed to request airdrop: ${body}`);
    // }

    throw new Error('Not implemented');
  }

  async createAccountWithFaucet(pubkey: Pubkey): Promise<RuntimeTransaction> {
    // const response = await fetch(`${this.url}/rpc/account/faucet`, {
    //   method: 'POST',
    //   headers: this.commonHeaders(),
    //   body: JSON.stringify(pubkey),
    // });

    // if (!response.ok) {
    //   const body = await response.text();
    //   throw Error(`Failed to create account with faucet: ${body}`);
    // }

    throw new Error('Not implemented');
  }
}
