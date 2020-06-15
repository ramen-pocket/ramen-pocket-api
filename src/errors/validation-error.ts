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

export class ValueExceedMaximumError extends ValidationError {
  protected readonly errCode = 'VALUE_EXCEED_MAXIMUM';
  protected readonly errReason: string;

  public constructor(reason?: string) {
    super();
    this.errReason = reason || 'A value exceeds the maximum value.';
  }
}

export class ValueFallBehindMinimumError extends ValidationError {
  protected readonly errCode = 'VALUE_FALL_BEHIND_MINIMUM';
  protected readonly errReason: string;

  public constructor(reason?: string) {
    super();
    this.errReason = reason || 'A value falls behind the minimum value.';
  }
}
