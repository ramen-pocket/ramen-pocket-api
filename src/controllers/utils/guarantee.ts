import { CustomAuthorizerEvent, CustomAuthorizerResult, APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { RequestHandler } from '../interfaces/request-handler';
import { AuthorizationHandler } from '../interfaces/authorization-handler';

export type Action = () => Promise<void>;
export type Remedy<T> = (error: Error) => Promise<T>;

export class Guarantee implements RequestHandler {
  private assurance?: Action;
  private remedy?: Remedy<APIGatewayProxyResult>;

  public constructor(private readonly entryHandler: RequestHandler) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      return await this.entryHandler.handle(event);
    } catch (err) {
      if (this.remedy) {
        return await this.remedy(err);
      } else {
        throw err;
      }
    } finally {
      if (this.assurance) {
        await this.assurance();
      }
    }
  }

  public ensure(action: Action) {
    this.assurance = action;
  }

  public rescue(remedy: Remedy<APIGatewayProxyResult>) {
    this.remedy = remedy;
  }
}

export class AuthorizationGuarantee implements AuthorizationHandler {
  private assurance?: Action;
  private remedy?: Remedy<CustomAuthorizerResult>;

  public constructor(private readonly entryHandler: AuthorizationHandler) {}

  public async handle(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> {
    try {
      return await this.entryHandler.handle(event);
    } catch (err) {
      if (this.remedy) {
        return await this.remedy(err);
      } else {
        throw err;
      }
    } finally {
      if (this.assurance) {
        await this.assurance();
      }
    }
  }

  public ensure(action: Action) {
    this.assurance = action;
  }

  public rescue(remedy: Remedy<CustomAuthorizerResult>) {
    this.remedy = remedy;
  }
}
