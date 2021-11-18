import { BigNumber } from 'bignumber.js';
// @ts-ignore
import { constants, BitBox02API, getDevicePath, getKeypathFromString } from 'bitbox02-api';
import { CryptoAddress, Payment, Wallet } from '../types';
import { uint8ArrayToBase64, uint8ArrayToHex } from '../utils';

const BTC_BECH32_1ST_ADDRESS_PATH = getKeypathFromString("m/84'/0'/0'/0/0");
const ETH_1ST_ADDRESS_PATH = "m/44'/60'/0'/0/0";

export class BitBox02 implements Wallet {
  public isInitialized: boolean;
  private client: BitBox02API;
  private attestation = false;

  constructor() {
    this.isInitialized = false;
    return this;
  }

  initialize(): Promise<this> {
    return Promise.resolve(this);
  }

  unlock(
    showPairingCode = () => {},
    userVerify = () => {},
    onClose = () => {},
    statusChange = () => {}
  ): Promise<this> {
    if (this.isInitialized) { return Promise.resolve(this); }
    this.isInitialized = true;

    return getDevicePath().then((devicePath: any) => {
      this.client = new BitBox02API(devicePath);
      return this.client.connect(
        showPairingCode,
        userVerify,
        (attestationResult: boolean) => {
          this.attestation = attestationResult;
        },
        onClose,
        statusChange
      ).then(() => {
        if (!this.attestation) {
          return Promise.reject('Attestation failure');
        }

        return this;
      })
    });
  }
 
  getAnyCryptoAddress(network = ''): Promise<CryptoAddress> {
    const that = this;
    switch (network.toLowerCase()) {
      case 'btc':
        return this.client.btcDisplayAddressSimple(
          constants.messages.BTCCoin.BTC,
          BTC_BECH32_1ST_ADDRESS_PATH,
          constants.messages.BTCScriptConfig_SimpleType.P2WPKH,
        ).then((address: string) => ({
          value: address,
          pay(toAddress: string, amountInStandardDenomination: string): Promise<Payment> {
            return Promise.resolve({});
          },
          sign(message: string | Uint8Array): Promise<string | Uint8Array> {
            const m = message instanceof Uint8Array
              ? message
              : new TextEncoder().encode(message);
            return that.client.btcSignMessage(
              constants.messages.BTCCoin.BTC,
              constants.messages.BTCScriptConfig_SimpleType.P2WPKH,
              BTC_BECH32_1ST_ADDRESS_PATH,
              m
            ).then(({ electrumSignature }: any) => {
              return uint8ArrayToBase64(electrumSignature);
            });
          }
        }));
        break;

      case 'eth':
      case 'usdc':
        return this.client.ethDisplayAddress(
          ETH_1ST_ADDRESS_PATH,
        ).then((address: string) => ({
          value: address,
          pay(toAddress: string, amountInStandardDenomination: string): Promise<Payment> {
            return Promise.resolve({});
          },
          sign(message: string | Uint8Array): Promise<string | Uint8Array> {
            const m = message instanceof Uint8Array
              ? message
              : new TextEncoder().encode(message);
            return that.client.ethSignMessage({
              keypath: ETH_1ST_ADDRESS_PATH,
              message: m,
            })
            .then(({ r, s, v }: any) => {
              const sigBytes = new Uint8Array([
                ...r,
                ...s,
                v[0] - 27
              ]);
              
              return uint8ArrayToHex(sigBytes);
            });
          }
        }));
        break;

      default:
        return Promise.reject('Unsupported network');
        break;
    }
  }
}
