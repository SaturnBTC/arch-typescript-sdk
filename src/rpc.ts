import { Action } from './constants';
import { AccountInfoResult } from './struct/account';
import { Block } from './struct/block';
import { ProcessedTransaction } from './struct/processed-transaction';
import { Pubkey } from './struct/pubkey';
import { RuntimeTransaction } from './struct/runtime-transaction';
import { postData, processResult } from './utils';

const NOT_FOUND = 404;

export class RpcConnection {
  nodeUrl: string;

  constructor(nodeUrl: string) {
    this.nodeUrl = nodeUrl;
  }

  async sendTransaction(params: RuntimeTransaction) {
    return postData(this.nodeUrl, Action.SEND_TRANSACTION, params);
  }

  async readAccountInfo(pubkey: Pubkey) {
    const result = processResult<AccountInfoResult>(
      await postData(this.nodeUrl, Action.READ_ACCOUNT_INFO, pubkey),
    );

    return result;
  }

  async getAccountAddress(pubkey: Pubkey): Promise<string> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_ACCOUNT_ADDRESS,
      pubkey,
    );

    return processResult<string>(result);
  }

  async getProgram(programId: string) {
    const result = await postData(this.nodeUrl, Action.GET_PROGRAM, programId);

    return processResult<string>(result);
  }

  async getBestBlockHash(): Promise<string> {
    const bestBlockHash = await postData(
      this.nodeUrl,
      Action.GET_BEST_BLOCK_HASH,
    );

    return processResult<string>(bestBlockHash);
  }

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

  async getBlockCount(): Promise<number> {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK_COUNT);

    return processResult<number>(result);
  }

  async getBlockHash(blockHeight: number): Promise<string> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_BLOCK_HASH,
      blockHeight,
    );

    return processResult<string>(result);
  }

  async getProcessedTransaction(
    txid: string,
  ): Promise<ProcessedTransaction | undefined> {
    const result = await postData(
      this.nodeUrl,
      Action.GET_PROCESSED_TRANSACTION,
      txid,
    );

    try {
      return processResult<ProcessedTransaction>(result);
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
