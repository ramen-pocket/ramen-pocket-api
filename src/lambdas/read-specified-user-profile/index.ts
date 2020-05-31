import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { Profile } from '../../interfaces/profile';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';

const SQL_SCRIPT = 'SELECT name, avatar, points FROM users WHERE id = ?';

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const results = await connection.query(SQL_SCRIPT, [id]);
    if (results.length <= 0) {
      return ResponseBuilder.createNotFound('The user does not exist.');
    }

    const user = results[0];
    const profile: Profile = {
      userId: id,
      name: user.name,
      avatar: user.avatar,
      points: user.points,
    };

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(profile)
      .build();
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    connection.disconnect();
  }
};
