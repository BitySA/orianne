import * as fc from 'fast-check';
import { Orianne } from '../src/orianne';
import { Error, Networks, Wallet, Wallets } from '../src/types';
import { Dummy } from '../src/wallets/dummy';

test('cant use a non-existing wallet', (done) => {
  fc.assert(fc.property(fc.string(), fc.string(), (network: any, wallet: any) => {
    const orianne = new Orianne();
    orianne.useWallet(network, wallet)
    .then(() => {
      expect(false).toBe(true);
    })
    .catch((error: Error) => {
      expect(error).toBe(Error.WalletDoesntExist);
    })
    .finally(() => done());
  }));
});

test('a wallet of any network, name and type can be added', (done) => {
  fc.assert(fc.property(fc.string(), fc.string(), (network: any, wallet: any) => {
    const orianne = new Orianne();
    expect(orianne.addWallet([network], wallet, new Dummy())).toBe(undefined);
    orianne.useWallet(network, wallet)
      .then(() => done())
      .catch((error: Error) => {
        expect(false).toBe(true);
        done();
      });
  }));
});

test('a wallet cant be overwritten', () => {
  fc.assert(fc.property(fc.string(), fc.string(), (network: any, wallet: any) => {
    const orianne = new Orianne();
    expect(orianne.addWallet([network], wallet, new Dummy())).toBe(undefined);
    expect(orianne.addWallet([network], wallet, new Dummy())).toBe(Error.WalletAlreadyExists);
  }));
});

test('use wallets included with Orianne', () => {
  const orianne = new Orianne();
  orianne.addDefaultWallets('', '');
  const wallets = orianne.networks.get(Networks.DUMMY);
  expect(wallets instanceof Map).toBe(true);
  expect(wallets!.get(Wallets.Dummy)
    instanceof Dummy).toBe(true);
});

test('make a payment with any wallet', (done) => {
  fc.assert(fc.property(fc.string(), fc.string(), (network: any, wallet: any) => {
    const orianne = new Orianne();
    orianne.addWallet([network], wallet, new Dummy());
    orianne.useWallet(network, wallet);
    orianne.getAnyCryptoAddress()
      .then(({ pay }) => pay('some other address', '100'))
      .then(() => done())
      .catch((error: Error) => {
        expect(false).toBe(true);
        done();
      });
  }));
});
