import { Action } from './constants';
import { Pubkey } from './struct/pubkey';
import { post, postData, processResult } from './utils';

export class RpcConnection {
  nodeUrl: string;

  constructor(nodeUrl: string) {
    this.nodeUrl = nodeUrl;
  }

  async startKeyExchange() {
    const result = await post(this.nodeUrl, Action.START_KEY_EXCHANGE);

    return processResult(result);
  }

  async sendTransaction(transactionParams: any) {
    return postData(this.nodeUrl, Action.SEND_TRANSACTION, transactionParams);
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
    const bestBlockHash = await post(this.nodeUrl, Action.GET_BEST_BLOCK_HASH);

    return postData(this.nodeUrl, Action.GET_BLOCK, bestBlockHash);
  }

  async getProcessedTx(txid: string) {
    return postData(this.nodeUrl, Action.GET_PROCESSED_TRANSACTION, txid);
  }
}
