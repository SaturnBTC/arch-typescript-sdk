import { Provider } from './provider/provider';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import { CreatedAccount } from './struct/account';

export interface Arch extends Provider {
  createNewAccount: () => Promise<CreatedAccount>;
}

export const ArchConnection = (provider: Provider): Arch => {
  return {
    sendTransaction: provider.sendTransaction,
    sendTransactions: provider.sendTransactions,
    readAccountInfo: provider.readAccountInfo,
    getAccountAddress: provider.getAccountAddress,
    getBestBlockHash: provider.getBestBlockHash,
    getBlock: provider.getBlock,
    getBlockCount: provider.getBlockCount,
    getBlockHash: provider.getBlockHash,
    getProgramAccounts: provider.getProgramAccounts,
    getProcessedTransaction: provider.getProcessedTransaction,

    /**
     * Creates a new account.
     * @returns A promise that resolves with the created account.
     */
    createNewAccount: async (): Promise<CreatedAccount> => {
      const newShardPrivKey = secp256k1.utils.randomPrivateKey();
      const newShardPubkey = secp256k1
        .getPublicKey(newShardPrivKey, true)
        .slice(1); // xonly pubkey

      const address = await provider.getAccountAddress(newShardPubkey);
      return {
        privkey: hex.encode(newShardPrivKey),
        pubkey: hex.encode(newShardPubkey),
        address,
      };
    },
  };
};
