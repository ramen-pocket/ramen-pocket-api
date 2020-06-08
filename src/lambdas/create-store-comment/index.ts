import { APIGatewayProxyResult } from 'aws-lambda';
import moment from 'moment';
import { UpsertResult } from 'mariadb';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { DATETIME_FORMATE } from '../../constants/database';

type TransformationResult<T> = [boolean, T];

interface Counter {
  count: number;
}

interface CommentDto {
  content: string;
  courses: string[];
  rate: number;
}

const SQL_SCRIPT_CHECK_STORE_EXIST = 'SELECT COUNT(*) AS count FROM stores WHERE id = ?';

const SQL_SCRIPT_INSERT_COMMENT =
  'INSERT INTO comments (userId, storeId, content, isDeleted, rate, publishedAt) VALUES (?, ?, ?, ?, ?, ?)';

const SQL_SCRIPT_INSERT_COMMENTED_COURSES = 'INSERT INTO commentedCourses VALUES (?, ?)';

function transfromToPositiveInteger(value: string): TransformationResult<number> {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

function validateBody(body: string): TransformationResult<CommentDto> {
  try {
    const jsonBody = JSON.parse(body);
    if (typeof jsonBody !== 'object') {
      return [false, null];
    }

    if (typeof jsonBody.content !== 'string') {
      return [false, null];
    }

    if (typeof jsonBody.courses !== 'object' || jsonBody.courses.constructor !== Array) {
      return [false, null];
    }

    if (jsonBody.courses.some((item: any) => typeof item !== 'string')) {
      return [false, null];
    }

    if (
      typeof jsonBody.rate !== 'number' ||
      !Number.isInteger(jsonBody.rate) ||
      jsonBody.rate < 1 ||
      jsonBody.rate > 5
    ) {
      return [false, null];
    }

    return [true, jsonBody];
  } catch (err) {
    return [false, null];
  }
}

async function checkStoreExist(connection: DatabaseConnection, storeId: number): Promise<boolean> {
  const [counter] = (await connection.query(SQL_SCRIPT_CHECK_STORE_EXIST, [storeId])) as [Counter];
  return counter.count > 0;
}

async function createCommentToDatabase(
  connection: DatabaseConnection,
  commentDto: CommentDto,
  userId: string,
  storeId: number,
) {
  const result = await connection.query<UpsertResult>(SQL_SCRIPT_INSERT_COMMENT, [
    userId,
    storeId,
    commentDto.content,
    false,
    commentDto.rate,
    moment.utc().format(DATETIME_FORMATE),
  ]);

  const commentId: number = result.insertId;
  if (commentDto.courses.length > 0) {
    await connection.batch(
      SQL_SCRIPT_INSERT_COMMENTED_COURSES,
      commentDto.courses.map((course) => [course, commentId]),
    );
  }
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;
  const { storeId: rawStoreId } = event.pathParameters;
  let storeId: number;
  let commentDto: CommentDto;
  let success: boolean;

  // Parameter & Body Validation
  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest('The parameter id must be a positive integer or zero.');
  }

  [success, commentDto] = validateBody(event.body);
  if (!success) {
    return ResponseBuilder.createBadRequest('Invalid body format.');
  }

  // Examine the existence of the store & add a comment
  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    if (!(await checkStoreExist(connection, storeId))) {
      return ResponseBuilder.createNotFound('The store does not exist.');
    }

    await createCommentToDatabase(connection, commentDto, userId, storeId);

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
