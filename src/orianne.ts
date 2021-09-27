import {
  CryptoAddress,
  Error,
  Networks,
  Result,
  Payment,
  Wallet,
  Wallets
} from './types';
import { BitBox02 } from './wallets/bitbox02';
import { Dummy } from './wallets/dummy';
import { Ledger } from './wallets/ledger';
import { Metamask } from './wallets/metamask';
import { Trezor } from './wallets/trezor';

export class Orianne {
  public networks: Map<string, Map<string, Wallet>>;
  public currentWallet: undefined | Promise<Wallet>;
  
  constructor() {
    this.networks = new Map();
  }

  addDefaultWallets(appUrl: string, email: string) {
    this.addWallet([Networks.DUMMY], Wallets.Dummy, new Dummy());
    this.addWallet([Networks.BTC, Networks.ETH, Networks.USDC], Wallets.Ledger, new Ledger());
    this.addWallet([Networks.ETH, Networks.USDC], Wallets.Metamask, new Metamask());
    this.addWallet([Networks.BTC, Networks.ETH, Networks.USDC], Wallets.Trezor, new Trezor(appUrl, email));
    this.addWallet([Networks.BTC, Networks.ETH, Networks.USDC], Wallets.BitBox02, new BitBox02());
  }

  useWallet(networkToken: string, walletToken: string): Promise<void> {
    const wallets = this.networks.get(networkToken);
    if (wallets === undefined) {
      return Promise.reject(Error.WalletDoesntExist);
    }
    const wallet = wallets.get(walletToken);
    if (wallet === undefined) {
      return Promise.reject(Error.WalletDoesntExist);
    }
    this.currentWallet = wallet.initialize();
    return Promise.resolve();
  }

  addWallet(networkTokens: string[], walletToken: string, wallet: Wallet): Result<void> {
    for (let networkToken of networkTokens) {
      if (this.networks.has(networkToken) === false) {
        this.networks.set(networkToken, new Map());
      }
      const wallets = this.networks.get(networkToken);
      if (wallets === undefined) {
        return Error.NoWallets;
      }
      if (wallets.has(walletToken)) {
        return Error.WalletAlreadyExists;
      }
      wallets.set(walletToken, wallet);
    }
  }

  async getAnyCryptoAddress(network = ''): Promise<CryptoAddress> {
    const wallet = await this.currentWallet;
    if (wallet === undefined) {
      return Promise.reject(Error.NoWalletInUse);
    }
    return wallet.getAnyCryptoAddress(network);
  }
}
