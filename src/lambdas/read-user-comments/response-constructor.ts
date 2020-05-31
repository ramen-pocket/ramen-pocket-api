import { Schema } from '../../interfaces/schemas';
import { DatabaseConnection } from '../../utils/database-connection';
import { StoreCommentGroup, Response } from './interfaces';
import { StoreCommentGroupConstructor } from './store-comment-group-constructor';

export class ResponseConstructor {
  private static readonly SQL_SCRIPT_COMMENTS = `SELECT id, storeId, content, isDeleted, rate, publishedAt FROM comments WHERE userId = ?`;

  private readonly groupMap: Map<number, StoreCommentGroupConstructor> = new Map();

  constructor(private readonly connection: DatabaseConnection) {}

  public async load(userId: string): Promise<Response> {
    const rawComments = (await this.connection.query(ResponseConstructor.SQL_SCRIPT_COMMENTS, [
      userId,
    ])) as Schema.Comment[];

    // Grouping comments
    rawComments.forEach((rawComment) => {
      const storeId = rawComment.storeId;

      if (this.groupMap.has(storeId)) {
        this.groupMap.get(storeId).addRawComment(rawComment);
      } else {
        const scgConstructor = new StoreCommentGroupConstructor(storeId, this.connection);
        scgConstructor.addRawComment(rawComment);
        this.groupMap.set(storeId, scgConstructor);
      }
    });

    // Constructing the response
    const promises: Promise<StoreCommentGroup>[] = [];
    this.groupMap.forEach((scgConstructor) => {
      promises.push(scgConstructor.load());
    });

    return { comments: await Promise.all(promises) };
  }
}
