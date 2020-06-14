import { APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from './extended-api-gateway-proxy-event';

export interface RequestHandler {
  handle(event: ExtendedAPIGatewayProxyEvent): APIGatewayProxyResult;
}
