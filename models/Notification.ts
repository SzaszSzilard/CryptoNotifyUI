export class Notification {
  constructor(
    public id: number,
    public symbol: string,
    public price: number,
    public type: string,
  ) {}

  static fromJson(json: any): Notification {
    return new Notification(
      json.id,
      json.symbol,
      json.price,
      json.type,
    );
  }
}