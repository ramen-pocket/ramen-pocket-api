import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { ResponseConstructor } from './response-constructor';

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;

  const connection = new DatabaseConnection();
  try {
    await connection.connect();
    const responseConstructor = new ResponseConstructor(connection);

    const body = await responseConstructor.load(id, userId);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(body)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
