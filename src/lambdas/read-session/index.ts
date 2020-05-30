import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createConnection } from 'mariadb';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

const SQL_SCRIPT = 'SELECT COUNT(*) AS count FROM users WHERE token = ?';

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const conn = await createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  });

  const { headers } = event;
  const token = headers['Authorization'];
  if (!token) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'unauthorized',
    };
  }

  const [result] = await conn.query(SQL_SCRIPT, [token]);

  if (result.count > 0) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'authorized',
    };
  } else {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'unauthorized',
    };
  }
};
