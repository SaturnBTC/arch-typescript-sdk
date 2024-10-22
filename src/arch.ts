import { Provider } from './provider/provider';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import { CreatedAccount } from './struct/account';

export interface Arch extends Provider {
  createNewAccount: () => Promise<CreatedAccount>;
}

export const ArchConnection = (provider: Provider): Arch => {
  return {
    sendTransaction: provider.sendTransaction.bind(provider),
    sendTransactions: provider.sendTransactions.bind(provider),
    readAccountInfo: provider.readAccountInfo.bind(provider),
    getAccountAddress: provider.getAccountAddress.bind(provider),
    getBestBlockHash: provider.getBestBlockHash.bind(provider),
    getBlock: provider.getBlock.bind(provider),
    getBlockCount: provider.getBlockCount.bind(provider),
    getBlockHash: provider.getBlockHash.bind(provider),
    getProgramAccounts: provider.getProgramAccounts.bind(provider),
    getProcessedTransaction: provider.getProcessedTransaction.bind(provider),

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
