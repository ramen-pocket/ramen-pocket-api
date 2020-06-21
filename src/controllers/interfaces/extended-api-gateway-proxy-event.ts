import { APIGatewayProxyEvent, APIGatewayEventRequestContext } from 'aws-lambda';

export interface APIAuthResponseContext {
  principalId: string;
  integrationLatency: number;
  userId: string;
}

export interface ExtendedAPIGatewayEventRequestContext extends APIGatewayEventRequestContext {
  authorizer: APIAuthResponseContext;
}

export interface ExtendedAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  requestContext: ExtendedAPIGatewayEventRequestContext;
}
