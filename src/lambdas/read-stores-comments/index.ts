import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { ResponseConstructor } from './response-constructor';

type TransformationResult = [boolean, number];

function transfromToPositiveInteger(value: string): TransformationResult {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { storeId: rawStoreId } = event.pathParameters;
  const queryParameters = event.queryStringParameters || {};
  const rawLimit = queryParameters.limit || '10';
  const rawSkip = queryParameters.skip || '0';
  let storeId, limit, skip: number;
  let success: boolean;

  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest('The parameter id must be a positive integer or zero.');
  }

  [success, limit] = transfromToPositiveInteger(rawLimit);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The query parameter limit must be a positive integer or zero.',
    );
  } else if (limit > 100) {
    return ResponseBuilder.createBadRequest(
      'The query parameter limit must be less than or equal to 100.',
    );
  }

  [success, skip] = transfromToPositiveInteger(rawSkip);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The query parameter skip must be a positive interger or zero.',
    );
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const responseConstructor = new ResponseConstructor(connection);
    const body = await responseConstructor.load(storeId);
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
