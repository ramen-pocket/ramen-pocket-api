export abstract class ServiceError extends Error {
  protected readonly errCode: string;
  protected readonly errReason: string;
  public get code() {
    return this.errCode;
  }
  public get reason() {
    return this.errReason;
  }
}

export class UserTokenExpired extends ServiceError {
  protected readonly errCode = 'USER_TOKEN_EXPIRED';
  protected readonly errReason = 'The token has exipred.';
}

export class InvalidSignInToken extends ServiceError {
  protected readonly errCode = 'INVALID_SIGN_IN_TOKEN';
  protected readonly errReason = 'The sign in token is invalid.';
}

export class ResourceNotFound extends ServiceError {
  protected readonly errCode = 'RESOURCE_NOT_FOUND';
  protected readonly errReason: string;

  constructor(reason: string) {
    super();
    this.errReason = reason;
  }
}

export class ResourceCreationConflict extends ServiceError {
  protected readonly errCode = 'RESOURCE_CREATION_CONFLICT';
  protected readonly errReason: string;

  constructor(reason?: string) {
    super();
    this.errReason = reason || 'A conflict from the creation of the resource occurred.';
  }
}
