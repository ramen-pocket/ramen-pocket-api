import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { StoreLoader } from './store-loader';

type TransformationResult = [boolean, number];

function transfromToPositiveInteger(value: string): TransformationResult {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;
  const queryParameters = event.queryStringParameters || {};
  const rawLimit = queryParameters.limit || '10';
  const rawSkip = queryParameters.skip || '0';

  // Validation & Transformation
  let success: boolean;
  let limit, skip: number;

  [success, limit] = transfromToPositiveInteger(rawLimit);
  if (!success) {
    return ResponseBuilder.createUnauthorized(
      'The query parameter limit must be an positive integer or zero.',
    );
  } else if (limit > 100) {
    return ResponseBuilder.createUnauthorized(
      'The value of the query parameter limit must be less than or equal to 100.',
    );
  }

  [success, skip] = transfromToPositiveInteger(rawSkip);
  if (!success) {
    return ResponseBuilder.createUnauthorized(
      'The query parameter skip must be an positive integer or zero',
    );
  }

  // Query
  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const storeLoader = new StoreLoader(connection);
    const stores = await storeLoader.readStores(userId, limit, skip);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody({ stores })
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
