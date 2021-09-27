import { CryptoAddress, Payment, Wallet } from '../types';

export class Dummy implements Wallet {
  constructor() {
    return this;
  }

  initialize(): Promise<this> {
    return Promise.resolve(this);
  }
 
  getAnyCryptoAddress(): Promise<CryptoAddress> {
    return Promise.resolve({
      value: '_<_Dummy_>_',
      pay(to: string, amount: string): Promise<Payment> {
        return Promise.resolve({});
      },
      sign(message: string | Uint8Array): Promise<string | Uint8Array> {
        return Promise.resolve(new Uint8Array());
      }
    });
  }
}
