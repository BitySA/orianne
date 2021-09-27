export interface Payment {
}

export interface CryptoAddress {
  value: string;
  pay(toAddress: string, amountInStandardDenomination: string): Promise<Payment>;
  sign(message: string | Uint8Array): Promise<string | Uint8Array>;
}

export interface Wallet {
  getAnyCryptoAddress(network?: string): Promise<CryptoAddress>;
  initialize(): Promise<this>;
}

export enum Error {
  NoWallets,
  NoWalletInUse,
  WalletAlreadyExists,
  WalletDoesntExist,
}

export type Result<T> = T | Error;

export enum Networks {
  DUMMY  = 'Dummy',
  ETH = 'ETH',
  BTC = 'BTC',
  USDC = 'USDC',
}

export enum Wallets {
  BitBox02 = 'BitBox02',
  Dummy = 'Dummy',
  Ledger = 'Ledger',
  Metamask = 'Metamask',
  Trezor = 'Trezor',
}
