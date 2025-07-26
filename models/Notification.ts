export class Notification {
  constructor(
    public id: number,
    public type: string,
    public symbol: string,
    public userId: string,
    public price?: number,
    public percentage?: number,
    public time?: number,
  ) {}

  static fromJson(json: any): Notification {
    return new Notification(
      json.id,
      json.type,
      json.symbol,
      json.userId,
      json.price,
      json.percentage,
      json.time,
    );
  }
}