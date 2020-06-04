import { APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { DatabaseConnection } from '../../utils/database-connection';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { Schema } from '../../interfaces/schemas';

type TransformationResult<T> = [boolean, T];

const SQL_SCRIPT_CHECK_COMMENT_EXIST =
  'SELECT isDeleted FROM comments WHERE id = ? AND storeId = ? ';

const SQL_SCRIPT_SET_COMMENT_DELETED = 'UPDATE comments SET isDeleted=true WHERE id = ?';

function transfromToPositiveInteger(value: string): TransformationResult<number> {
  const result = Number(value);
  return [Number.isInteger(result) && result >= 0, result];
}

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { storeId: rawStoreId, commentId: rawCommentId } = event.pathParameters;
  let storeId: number, commentId: number;
  let success: boolean;

  [success, storeId] = transfromToPositiveInteger(rawStoreId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The parameter storeId must be a positive integer or zero.',
    );
  }

  [success, commentId] = transfromToPositiveInteger(rawCommentId);
  if (!success) {
    return ResponseBuilder.createBadRequest(
      'The parameter commentId must be a positve integer or zero.',
    );
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();

    const results = (await connection.query(SQL_SCRIPT_CHECK_COMMENT_EXIST, [
      commentId,
      storeId,
    ])) as [Schema.Comment];
    if (results.length < 1) {
      return ResponseBuilder.createNotFound('The comment does not exist.');
    }

    const [comment] = results;
    if (comment.isDeleted) {
      return ResponseBuilder.createForbidden('The comment has been deleted.');
    }

    await connection.query(SQL_SCRIPT_SET_COMMENT_DELETED, [commentId]);

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
