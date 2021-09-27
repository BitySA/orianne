import { BigNumber } from 'bignumber.js';
import { CryptoAddress, Payment, Wallet } from '../types';

export class Metamask implements Wallet {
  constructor() {
    return this;
  }

  initialize(): Promise<this> {
    return Promise.resolve(this);
  }
 
  getAnyCryptoAddress(): Promise<CryptoAddress> {
    // @ts-ignore
    const ethereum = window.ethereum;

    return ethereum.request({ method: 'eth_requestAccounts' }).then(() => ({
      value: ethereum.selectedAddress,
      pay(to: string, amountInStandardDenomination: string): Promise<Payment> {
        const amount = '0x' + new BigNumber(amountInStandardDenomination)
          .times(new BigNumber(10).pow(18)).toString(16);

        const requestObject = {
          method: 'eth_sendTransaction',
          params: [{
            from: ethereum.selectedAddress,
            to,
            value: amount,
          }],
        };

        return ethereum.request(requestObject);
      },
      sign(message: string | Uint8Array): Promise<string | Uint8Array> {
        return ethereum
          .request({
            method: 'personal_sign',
            params: [
              ethereum.selectedAddress,
              message,
            ]
          });
      }
    }));
  }
}
