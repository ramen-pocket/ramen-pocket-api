import { APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { DatabaseConnection } from '../../utils/database-connection';

const SQL_SCRIPT_READ_TAGS = `SELECT * FROM tags`;

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const connection = new DatabaseConnection();
  try {
    await connection.connect();
    const tags = await connection.query(SQL_SCRIPT_READ_TAGS);
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(tags)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
