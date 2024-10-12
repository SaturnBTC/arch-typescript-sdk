import { hex } from '@scure/base';
import { Action } from './constants';
import { AccountInfoResult, CreatedAccount } from './struct/account';
import { Block } from './struct/block';
import { ProcessedTransaction } from './struct/processed-transaction';
import { Pubkey } from './struct/pubkey';
import { RuntimeTransaction } from './struct/runtime-transaction';
import { postData, processResult } from './utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import {
  deserializeWithUint8Array,
  SerializeUint8Array,
  serializeWithUint8Array,
} from './serde/uint8array';

const NOT_FOUND = 404;

export class RpcConnection {
  nodeUrl: string;

  constructor(nodeUrl: string) {
    this.nodeUrl = nodeUrl;
  }

  /**
   * Sends a transaction.
   * @param params The transaction to send.
   * @returns A promise that resolves with the transaction result.
   */
  async sendTransaction(params: RuntimeTransaction) {
    return postData(
      this.nodeUrl,
      Action.SEND_TRANSACTION,
      serializeWithUint8Array(params),
    );
  }

  /**
   * Sends multiple transactions.
   * @param params The transactions to send.
   * @returns A promise that resolves with the transaction results.
   */
  async sendTransactions(params: Array<RuntimeTransaction>) {
    return postData(
      this.nodeUrl,
      Action.SEND_TRANSACTIONS,
      params.map((tx) => serializeWithUint8Array(tx)),
    );
  }

  /**
   * Reads account information.
   * @param pubkey The public key of the account.
   * @returns A promise that resolves with the account information.
   */
  async readAccountInfo(pubkey: Pubkey) {
    const result = processResult<SerializeUint8Array<AccountInfoResult>>(
      await postData(
        this.nodeUrl,
        Action.READ_ACCOUNT_INFO,
        serializeWithUint8Array(pubkey),
      ),
    );

    return deserializeWithUint8Array<AccountInfoResult>(result);
  }

  /**
   * Gets the address for an account.
   * @param accountPubkey The public key of the account.
   * @returns A promise that resolves with the account address.
   */
  async getAccountAddress(pubkey: Pubkey): Promise<string> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_ACCOUNT_ADDRESS,
      serializeWithUint8Array(pubkey),
    );

    return processResult<string>(result);
  }

  /**
   * Creates a new account.
   * @returns A promise that resolves with the created account.
   */
  async createNewAccount(): Promise<CreatedAccount> {
    const newShardPrivKey = secp256k1.utils.randomPrivateKey();
    const newShardPubkey = secp256k1.getPublicKey(newShardPrivKey);
    const address = await this.getAccountAddress(newShardPubkey);
    return {
      privkey: hex.encode(newShardPrivKey),
      pubkey: hex.encode(newShardPubkey),
      address,
    };
  }

  /**
   * Gets the best block hash.
   * @returns A promise that resolves with the best block hash.
   */
  async getBestBlockHash(): Promise<string> {
    const bestBlockHash = await postData(
      this.nodeUrl,
      Action.GET_BEST_BLOCK_HASH,
    );

    return processResult<string>(bestBlockHash);
  }

  /**
   * Gets block information for a given hash.
   * @param blockHash The block hash.
   * @returns A promise that resolves with the block information.
   */
  async getBlock(blockHash: string): Promise<Block | undefined> {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK, blockHash);

    try {
      return processResult<Block>(result);
    } catch (error: any) {
      if (error.code === NOT_FOUND) {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * Gets the current block count.
   * @returns A promise that resolves with the current block count.
   */
  async getBlockCount(): Promise<number> {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK_COUNT);

    return processResult<number>(result);
  }

  /**
   * Gets the block hash for a given height.
   * @param blockHeight The block height.
   * @returns A promise that resolves with the block hash.
   */
  async getBlockHash(blockHeight: number): Promise<string> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_BLOCK_HASH,
      blockHeight,
    );

    return processResult<string>(result);
  }

  /**
   * Gets information about a processed transaction.
   * @param txId The transaction ID.
   * @returns A promise that resolves with the processed transaction information.
   */
  async getProcessedTransaction(
    txid: string,
  ): Promise<ProcessedTransaction | undefined> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_PROCESSED_TRANSACTION,
      txid,
    );

    try {
      const response =
        processResult<SerializeUint8Array<ProcessedTransaction>>(result);
      return deserializeWithUint8Array<ProcessedTransaction>(response);
    } catch (error: any) {
      if (error.code === NOT_FOUND) {
        return undefined;
      }

      throw error;
    }
  }

  async getAccountInfo(address: string) {
    const result = await postData(
      this.nodeUrl,
      Action.GET_ACCOUNT_INFO,
      address,
    );

    return processResult(result);
  }
}
