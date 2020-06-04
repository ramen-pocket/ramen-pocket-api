import { APIGatewayProxyResult } from 'aws-lambda';
import { DatabaseConnection } from '../../utils/database-connection';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { Schema } from '../../interfaces/schemas';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';

type TransformationResult<T> = [boolean, T];

interface CommentDto {
  content: string;
  courses: string[];
  rate: number;
}

const SQL_SCRIPT_CHECK_COMMENT_EXIST =
  'SELECT userId, isDeleted FROM comments WHERE id = ? AND storeId = ?';

const SQL_SCRIPT_UPDATE_COMMENT = 'UPDATE comments SET content = ?, rate = ? WHERE id = ?';

const SQL_SCRIPT_DELETE_COMMENTED_COURSES = 'DELETE FROM commentedCourses WHERE commentId = ?';

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

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { authorizer } = event.requestContext;
  const { userId } = authorizer;
  let { storeId: rawStoreId, commentId: rawCommentId } = event.pathParameters;
  let requestBody = event.body;
  let storeId: number, commentId: number;
  let commentDto: CommentDto;
  let success: boolean;

  // Paramter & Body Validation
  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The value of parameter storeId must be a positive integer or zero.',
    );
  }

  [success, commentId] = transfromToPositiveInteger(rawCommentId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The value of paramter commentId must be a positive integer or zero.',
    );
  }

  [success, commentDto] = validateBody(requestBody);
  if (!success) {
    return ResponseBuilder.createBadRequest('Invalid body format.');
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    // Check whether the comment exists
    const selectCommentResults = (await connection.query(SQL_SCRIPT_CHECK_COMMENT_EXIST, [
      commentId,
      storeId,
    ])) as [Schema.Comment?];
    if (selectCommentResults.length <= 0) {
      return ResponseBuilder.createBadRequest('The comment does not exist.');
    }

    // Check whether the comment belongs to the caller
    const [comment] = selectCommentResults;
    if (comment.userId !== userId) {
      return ResponseBuilder.createForbidden(
        'You cannot modify the comment because it does not belongs to you.',
      );
    }

    // Check whether the comment is deleted.
    if (comment.isDeleted) {
      return ResponseBuilder.createForbidden('This comment is already deleted.');
    }

    // Update the comment data & delete the commented courses related to the comment
    await Promise.all([
      connection.query(SQL_SCRIPT_UPDATE_COMMENT, [commentDto.content, commentDto.rate, commentId]),
      connection.query(SQL_SCRIPT_DELETE_COMMENTED_COURSES, [commentId]),
    ]);

    // Insert the new commented courses
    if (commentDto.courses.length > 0) {
      await connection.batch(
        SQL_SCRIPT_INSERT_COMMENTED_COURSES,
        commentDto.courses.map((course) => [course, commentId]),
      );
    }

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
