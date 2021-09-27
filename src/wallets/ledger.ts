// @ts-ignore
import LedgerBtc from '@ledgerhq/hw-app-btc';
// @ts-ignore
import LedgerEth from '@ledgerhq/hw-app-eth';
// @ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { BigNumber } from 'bignumber.js';
import { CryptoAddress, Payment, Wallet } from '../types';

// The Ledger hw-app-btc documentation incorrect states to use 173' purpose.
// The correct purpose is 84' for Bech32 addresses.
const BTC_BECH32_1ST_ADDRESS_PATH = "m/84'/0'/0'/0/0";
const ETH_1ST_ADDRESS_PATH = "m/44'/60'/0'/0/0";

export class Ledger implements Wallet {
  public isInitialized: boolean;
  public transport: any;

  constructor() {
    this.isInitialized = false;
    return this;
  }

  initialize(): Promise<this> {
    if (this.isInitialized) { return Promise.resolve(this); }
    this.isInitialized = true;

    
    return TransportWebUSB.create()
      .then((transport: TransportWebUSB) => this.transport = transport)
      .then(() => this);
  }
 
  getAnyCryptoAddress(network = ''): Promise<CryptoAddress> {
    let client: any;

    switch (network.toLowerCase()) {
      case 'btc':
        client = new LedgerBtc(this.transport);
        return client
          .getWalletPublicKey(BTC_BECH32_1ST_ADDRESS_PATH, { format: 'bech32' })
          .then(({ bitcoinAddress }: any) => ({
              value: bitcoinAddress,
              pay(to: string, amount: string): Promise<Payment> {
                return Promise.resolve({});
              },
              sign(message: string | Uint8Array): Promise<string | Uint8Array> {
                let messageBuffer = Buffer.from(message).toString("hex");
                
                return client
                  .signMessageNew(BTC_BECH32_1ST_ADDRESS_PATH, messageBuffer)
                  .then((result: any) => {

                    // Taken from ledgerjs documentation. 
                    const v = result['v'] + 27 + 4;
                    const signature = Buffer.from(
                      v.toString(16) + result['r'] + result['s'],
                      'hex'
                    ).toString('base64');
                    return signature;
                  });
              }
            })
          );
        break;

      case 'eth':
      case 'usdc':
        client = new LedgerEth(this.transport);
        return client
          .getAddress(ETH_1ST_ADDRESS_PATH)
          .then(({ address }: any) => ({
              value: address,
              pay(to: string, amount: string): Promise<Payment> {
                return Promise.resolve({});
              },
              sign(message: string | Uint8Array): Promise<string | Uint8Array> {
                let messageBuffer = Buffer.from(message).toString("hex");

                return client
                  .signPersonalMessage(ETH_1ST_ADDRESS_PATH, messageBuffer)
                  .then((result: any) => {

                    // Taken from ledgerjs documentation. 
                    let v = (result['v'] - 27).toString(16);
                    if (v.length < 2) {
                      v = '0' + v;
                    }
                    
                    const signature = '0x' + result['r'] + result['s'] + v;
                    return signature;
                  });
              }
            })
          );
        break;

      default:
        return Promise.reject('Unsupported network');
        break;
    }
  }
}
