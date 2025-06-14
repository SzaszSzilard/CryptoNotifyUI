export class CryptoPrice {
  constructor(
    public symbol: string,
    public price: number,
  ) {}

  static fromJson(json: any): CryptoPrice {
    return new CryptoPrice(
      json.symbol,
      json.price,
    );
  }
}