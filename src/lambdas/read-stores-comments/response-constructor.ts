import { DatabaseConnection } from '../../utils/database-connection';
import { Schema } from '../../interfaces/schemas';
import { CommentInfo, Response } from './interface';
import { CommentInfoConstructor } from './comment-info-constructor';

export class ResponseConstructor {
  private static readonly SQL_SCRIPT_COMMENTS = `SELECT id, userId, content, isDeleted, rate, publishedAt FROM comments WHERE storeId = ?`;

  public constructor(private readonly connection: DatabaseConnection) {}

  public async load(storeId: number): Promise<Response> {
    const rawComments = (await this.connection.query(ResponseConstructor.SQL_SCRIPT_COMMENTS, [
      storeId,
    ])) as Schema.Comment[];
    const userCommentMap = new Map<string, CommentInfoConstructor>();
    rawComments.forEach((rawComment) => {
      const userId = rawComment.userId;

      if (userCommentMap.has(userId)) {
        userCommentMap.get(userId).addRawComment(rawComment);
      } else {
        const newCommentInfoConstructor = new CommentInfoConstructor(this.connection, userId);
        newCommentInfoConstructor.addRawComment(rawComment);
        userCommentMap.set(userId, newCommentInfoConstructor);
      }
    });

    const promises: Promise<CommentInfo>[] = [];
    userCommentMap.forEach((commentInfoConstructor) => {
      promises.push(commentInfoConstructor.load());
    });

    return {
      comments: await Promise.all(promises),
    };
  }
}
