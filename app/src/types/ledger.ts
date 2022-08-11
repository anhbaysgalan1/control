import { Cursor, ObjectOf } from './generic';

export enum LedgerResources {
  ACCOUNTS = 'accounts',
  TRANSACTIONS = 'transactions',
}

export enum LedgerSubResources {
  METADATA = 'metadata',
}

export type LedgerResource =
  | 'overview'
  | LedgerResources.ACCOUNTS
  | 'account'
  | LedgerResources.TRANSACTIONS
  | 'transaction'
  | 'insights'
  | 'reports'
  | 'integrations';

export type Metadata = {
  key: string;
  value: any;
};

export type LedgerGetResourceData = {
  cursor: Cursor<any>;
  err: any;
  ok: boolean;
};

export type Account = {
  address: string;
  contract: string;
  metadata: ObjectOf<any>;
  balances?: ObjectOf<any>;
  volumes?: ObjectOf<any>;
};

export type Asset = {
  account: string;
  input: number;
  name: string;
  output: number;
};

export type Balance = {
  asset: string;
  value: number;
};

export type Volume = {
  asset: string;
  sent: number;
  received: number;
};

export type Posting = {
  amount: number;
  asset: string;
  destination: string;
  source: string;
};

export type Transaction = {
  hash: string;
  postings: Posting[];
  reference: string;
  timestamp: Date;
  txid: number;
  metadata: Metadata;
};

export type PostingHybrid = {
  hash: string;
  reference: string;
  timestamp: Date;
  txid: number;
  amount: number;
  asset: string;
  destination: string;
  source: string;
  metadata: Metadata;
};

export type TransactionHybrid = Omit<Transaction, 'postings'> &
  Posting & {
    postingId: number;
  };

export type AccountHybrid = {
  balances: Balance[];
  volumes: Volume[];
  metadata: ObjectOf<any>;
};

export type LedgerInfo = {
  server: string;
  version: string;
  config: {
    storage: {
      driver: string;
      ledgers: string[];
    };
  };
};