import { Provider } from './provider/provider';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import { CreatedAccount } from './struct/account';

export class Arch {
  provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  /**
   * Creates a new account.
   * @returns A promise that resolves with the created account.
   */
  async createNewAccount(): Promise<CreatedAccount> {
    const newShardPrivKey = secp256k1.utils.randomPrivateKey();
    const newShardPubkey = secp256k1
      .getPublicKey(newShardPrivKey, true)
      .slice(1); // xonly pubkey

    const address = await this.provider.getAccountAddress(newShardPubkey);
    return {
      privkey: hex.encode(newShardPrivKey),
      pubkey: hex.encode(newShardPubkey),
      address,
    };
  }
}
