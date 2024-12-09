import { Provider } from './provider/provider';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import { CreatedAccount } from './struct/account';

export interface Arch extends Provider {
  createNewAccount: () => Promise<CreatedAccount>;
}

export const ArchConnection = <T extends Provider>(provider: T): Arch & T => {
  const archExtensions = {
    async createNewAccount(): Promise<CreatedAccount> {
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

  // Add any Arch methods onto the provider instance itself.
  Object.assign(provider, archExtensions);

  return provider as Arch & T;
};
