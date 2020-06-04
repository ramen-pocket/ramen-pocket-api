import { APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { DatabaseConnection } from '../../utils/database-connection';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';

type TransformationResult<T> = [boolean, T];

interface Counter {
  count: number;
}

const SQL_SCRIPT_CHECK_COLLECTION_EXIST =
  'SELECT COUNT(*) AS count FROM collections WHERE userId = ? AND storeId = ?';

const SQL_SCRIPT_DELETE_COLLECTION = 'DELETE FROM collections WHERE userId = ? AND storeId = ?';

function transfromToPositiveInteger(value: string): TransformationResult<number> {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;
  const { storeId: rawStoreId } = event.pathParameters;
  let success: boolean, storeId: number;

  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The parameter storeId must be a positive integer or zero.',
    );
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const [counter] = (await connection.query(SQL_SCRIPT_CHECK_COLLECTION_EXIST, [
      userId,
      storeId,
    ])) as [Counter];
    if (counter.count < 1) {
      return ResponseBuilder.createNotFound('The collection does not exist.');
    }

    await connection.query(SQL_SCRIPT_DELETE_COLLECTION, [userId, storeId]);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.NoContent)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
