import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { Schema } from '../../interfaces/schemas';
import { constructStore } from './construct-store';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';

interface Counter {
  count: number;
}

const SQL_SCRIPT_CHECK_USER_EXIST = `SELECT COUNT(*) AS count FROM users WHERE id = ?`;

const SQL_SCRIPT_COLLECTION_STORES = `
  SELECT
    s.id AS id,
    s.name AS name,
    s.isDeleted AS isDeleted,
    s.address AS address,
    s.latitude AS latitude,
    s.longtitude AS longtitude,
    s.rate AS rate,
    s.\`featuredImage\` AS \`featuredImage\`
  FROM stores AS s
  LEFT JOIN collections AS col
  ON s.id = col.storeId
  LEFT JOIN users AS u
  ON col.userId = u.id
  WHERE u.id = ?
`;

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const [result] = (await connection.query(SQL_SCRIPT_CHECK_USER_EXIST, [id])) as [Counter];
    if (result.count <= 0) {
      return ResponseBuilder.createNotFound('The user does not exist.');
    }

    const rawStores = (await connection.query(SQL_SCRIPT_COLLECTION_STORES, [
      id,
    ])) as Schema.Store[];

    const promises = rawStores.map((rawStore) => constructStore(rawStore, userId, connection));

    const stores = await Promise.all(promises);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody({ stores })
      .build();
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    connection.disconnect();
  }
};
