import { BigNumber } from 'bignumber.js';
import TrezorConnect from 'trezor-connect';
import { CryptoAddress, Payment, Wallet } from '../types';

const BTC_PATH = "m/49'/0'/0'";
const ETH_PATH = "m/44'/60'/0'/0/0";

export class Trezor implements Wallet {
  public isInitialized: boolean;
  public appUrl: string;
  public email: string;

  constructor(appUrl: string, email: string) {
    this.appUrl = appUrl;
    this.email = email;
    this.isInitialized = false;
    return this;
  }

  initialize(): Promise<this> {
    if (this.isInitialized) { return Promise.resolve(this); }
    this.isInitialized = true;

    return TrezorConnect.init({
      manifest: {
        appUrl: this.appUrl,
        email: this.email,
      }
    }).then(() => this);
  }
 
  getAnyCryptoAddress(network = ''): Promise<CryptoAddress> {
    switch (network.toLowerCase()) {
      case 'btc': return TrezorConnect
        .getAccountInfo({
          path: BTC_PATH,
          coin: network.toLowerCase(),
          details: 'tokens',
        })
        .then((account: any) => {
          const unusedAddress = account.payload.addresses.unused[0];

          return {
            value: unusedAddress.address,
            pay(to: string, amountInStandardDenomination: string): Promise<Payment> {
              const amount = new BigNumber(amountInStandardDenomination)
                .times(new BigNumber(10).pow(8)).toFixed();
      
              return TrezorConnect.composeTransaction({
                outputs: [{
                  amount,
                  address: to
                }],
                coin: network.toLowerCase(),
                push: true,
              });
            },
            sign(message: string | Uint8Array): Promise<string | Uint8Array> {
              return TrezorConnect.signMessage({
                path: unusedAddress.path,
                message: message as string,
                coin: network.toLowerCase(),
              }).then((response: any) => {
                return response.payload.signature;
              });
            }
          };
        });
        break;

      case 'eth':
      case 'usdc':
      return TrezorConnect
        .getAccountInfo({
          path: ETH_PATH,
          coin: 'eth',
          details: 'tokens',
        })
        .then((account: any) => {
          const address = account.payload.descriptor;

          return {
            value: address,
            pay(to: string, amount: string): Promise<Payment> {
              return TrezorConnect.composeTransaction({
                outputs: [{
                  amount,
                  address: to
                }],
                coin: 'eth',
                push: true,
              });
            },
            sign(message: string | Uint8Array): Promise<string | Uint8Array> {
              return TrezorConnect.ethereumSignMessage({
                path: ETH_PATH,
                message: message as string,
              }).then((response: any) => {
                return response.payload.signature;
              });
            }
          };
        });
        break;

      default:
        return Promise.reject('Unsupported network');
        break;
    }
  }
}
