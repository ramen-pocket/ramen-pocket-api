import { DatabaseConnection } from '../../utils/database-connection';
import { Schema } from '../../interfaces/schemas';
import { CommentInfo } from './interface';

export class CommentInfoConstructor {
  private static readonly SQL_SCRIPT_USER = `SELECT name, avatar, points FROM users WHERE id = ?`;
  private static readonly SQL_SCRIPT_COMMENTED_COURSES = `SELECT name FROM commentedCourses WHERE commentId = ?`;

  private readonly rawComments: Schema.Comment[] = [];

  public constructor(
    private readonly connection: DatabaseConnection,
    private readonly userId: string,
  ) {}

  public addRawComment(rawComment: Schema.Comment) {
    this.rawComments.push(rawComment);
  }

  public async load(): Promise<CommentInfo> {
    const CLASS = CommentInfoConstructor;

    // Read User
    const [user] = (await this.connection.query(CLASS.SQL_SCRIPT_USER, [this.userId])) as [
      Schema.User,
    ];

    // Read courses' name of each comment
    const promises = this.rawComments.map((item) =>
      this.connection.query(CLASS.SQL_SCRIPT_COMMENTED_COURSES, [item.id]),
    ) as Promise<Schema.CommentedCourse[]>[];
    const commentedCourses = await Promise.all(promises);

    return {
      user: {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        points: user.points,
      },
      records: this.rawComments.map((item, index) => ({
        id: item.id,
        isDeleted: Boolean(item.isDeleted),
        content: item.content,
        courses: commentedCourses[index].map((item) => item.name),
        rate: item.rate,
        publishedAt: item.publishedAt,
      })),
    };
  }
}
