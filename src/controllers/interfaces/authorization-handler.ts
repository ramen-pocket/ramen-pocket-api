import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';

export interface AuthorizationHandler {
  handle(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult>;
}
