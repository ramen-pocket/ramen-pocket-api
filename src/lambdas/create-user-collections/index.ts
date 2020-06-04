import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';

type TransformationResult<T> = [boolean, T];
interface Counter {
  count: number;
}

const SQL_SCRIPT_CHECK_STORE_EXIST = 'SELECT COUNT(*) AS count FROM stores WHERE id = ?';

const SQL_SCRIPT_CHECK_COLLECTION_EXIST =
  'SELECT COUNT(*) AS count FROM collections WHERE userId = ? AND storeId = ?';

const SQL_SCRIPT_ADD_COLLECTION = 'INSERT INTO collections VALUES (?, ?)';

function transfromToPositiveInteger(value: string): TransformationResult<number> {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { requestContext, pathParameters } = event;
  const { userId } = requestContext.authorizer;
  const { storeId: rawStoreId } = pathParameters;
  let success: boolean, storeId: number;

  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The paramter storeId must be a positive integer or zero.',
    );
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    let [result] = (await connection.query(SQL_SCRIPT_CHECK_STORE_EXIST, [storeId])) as [Counter];
    if (result.count <= 0) {
      return ResponseBuilder.createBadRequest('The store does not exist.');
    }

    [result] = await connection.query(SQL_SCRIPT_CHECK_COLLECTION_EXIST, [userId, storeId]);
    if (result.count >= 1) {
      return ResponseBuilder.createBadRequest('The collection has already existed.');
    }

    await connection.query(SQL_SCRIPT_ADD_COLLECTION, [userId, storeId]);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.Created)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
