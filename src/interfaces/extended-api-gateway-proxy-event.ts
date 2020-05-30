import { APIGatewayProxyEvent, APIGatewayEventRequestContext } from 'aws-lambda';

export interface ApiAuthResponseContext {
  principalId: string;
  integrationLatency: number;
  userId: string;
}

export interface ExtendedAPIGatewayEventRequestContext extends APIGatewayEventRequestContext {
  authorizer: ApiAuthResponseContext;
}

export interface ExtendedAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  requestContext: ExtendedAPIGatewayEventRequestContext;
}
