export abstract class ValidationError extends Error {
  protected readonly errCode: string;
  protected readonly errReason: string;
  public get code() {
    return this.errCode;
  }
  public get reason() {
    return this.errReason;
  }
}

export class NotIntegerError extends ValidationError {
  protected readonly errCode = 'NOT_INTEGER';
  protected readonly errReason: string;

  public constructor(reason?: string) {
    super();
    this.errReason = reason || 'A parameter is not an integer.';
  }
}
