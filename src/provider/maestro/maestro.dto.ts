import { SerializeHexString, SerializeUint8Array } from '../../serde/uint8array';
import { AccountInfoResult } from '../../struct/account';
import { Block } from '../../struct/block';
import { ProcessedTransaction } from '../../struct/processed-transaction';
import { ProgramAccount } from '../../struct/program-account';

export interface MaestroResponse<T> {
  data: T;
  last_updated: {
    block_hash: string;
    block_height: number;
  };
}

export type AccountAddressResponse = MaestroResponse<string>;
export type AccountInfoResponse = MaestroResponse<
  SerializeUint8Array<AccountInfoResult>
>;
export type AccountInfoHexResponse = MaestroResponse<
  SerializeHexString<AccountInfoResult>
>;

export type BlockCountResponse = MaestroResponse<number>;
export type LatestBlockInfoResponse = MaestroResponse<
  SerializeUint8Array<Block>
>;
export type LatestBlockHashResponse = MaestroResponse<string>;
export type BlockRangeInfoResponse = MaestroResponse<
  Array<SerializeUint8Array<Block>>
>;
export type RecentBlockInfoResponse = MaestroResponse<
  Array<SerializeUint8Array<Block>>
>;
export type BlockInfoResponse = MaestroResponse<SerializeUint8Array<Block>>;

export type ProgramAccountResponse = MaestroResponse<
  Array<SerializeUint8Array<ProgramAccount>>
>;

export type RecentTransactionsResponse = MaestroResponse<
  Array<SerializeUint8Array<ProcessedTransaction>>
>;
export type RecentTransactionsHexResponse = MaestroResponse<
  Array<SerializeHexString<ProcessedTransaction>>
>;

export type SendTransactionResponse = MaestroResponse<string>;
export type SendTransactionsResponse = MaestroResponse<Array<string>>;

export type ProcessedTransactionResponse = MaestroResponse<
  SerializeUint8Array<ProcessedTransaction>
>;
export type ProcessedTransactionHexResponse = MaestroResponse<
  SerializeHexString<ProcessedTransaction>
>;
