import { Action } from './constants';
import { Pubkey } from './struct/pubkey';
import { RuntimeTransaction } from './struct/runtime-transaction';
import { postData, processResult } from './utils';

export class RpcConnection {
  nodeUrl: string;

  constructor(nodeUrl: string) {
    this.nodeUrl = nodeUrl;
  }

  async startKeyExchange() {
    const result = await postData(this.nodeUrl, Action.START_KEY_EXCHANGE);

    return processResult(result);
  }

  async sendTransaction(params: RuntimeTransaction) {
    // RuntimeTransaction must be JSON serializable, according to the Rust code
    return postData(this.nodeUrl, Action.SEND_TRANSACTION, params.toJSON());
  }

  async readAccountInfo(pubkey: Pubkey) {
    const result = processResult(
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

    return processResult(result).toString();
  }

  async getProgram(programId: string) {
    const result = await postData(this.nodeUrl, Action.GET_PROGRAM, programId);

    return processResult(result);
  }

  async getBestBlock(): Promise<string> {
    const bestBlockHash = await postData(
      this.nodeUrl,
      Action.GET_BEST_BLOCK_HASH,
    );

    return postData(this.nodeUrl, Action.GET_BLOCK, bestBlockHash);
  }

  async getProcessedTx(txid: string) {
    return postData(this.nodeUrl, Action.GET_PROCESSED_TRANSACTION, txid);
  }

  async getBlockCount() {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK_COUNT);

    return processResult(result);
  }

  async getBlockHash() {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK_HASH);

    return processResult(result);
  }

  async getBlock(hash: string) {
    const result = await postData(this.nodeUrl, Action.GET_BLOCK, hash);

    return processResult(result);
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
