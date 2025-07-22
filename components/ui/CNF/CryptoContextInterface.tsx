import { CryptoPrice } from '@/models/CryptoPrice';

export interface CryptoDataContextInterface {
  cryptos: CryptoPrice[];
  userId: string;
}