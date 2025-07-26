export class Notification {
  constructor(
    public type: string,
    public symbol: string,
    public userId: string,
    public id?: number,
    public price?: number,
    public percentage?: number,
    public time?: number,
  ) {}

  static fromJson(json: any): Notification {
    return new Notification(
      json.type,
      json.symbol,
      json.userId,
      json.id,
      json.price,
      json.percentage,
      json.time,
    );
  }
}