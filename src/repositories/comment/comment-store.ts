import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { OkPacket } from '../../database/ok-packet';
import { StoreCommentGroupEntity } from '../../entities/store-comment-group-entity';
import { UserProfileCommentGroupEntity } from '../../entities/user-profile-comment-group-entity';
import { NewCommentEntity } from '../../entities/new-comment-entity';
import { UpdatedCommentEntity } from '../../entities/updated-comment-entity';
import { CommentEntity } from '../../entities/comment-entity';
import { ResourceNotFound } from '../../errors/service-error';
import { DateProvider } from '../../providers/date-provider/date-provider';
import { UserRepository } from '../../repositories/user/user-repository';
import { StoreRepository } from '../../repositories/store/store-repository';
import { CommentRepository } from './comment-repository';
import { CommentSchema, CommentedCourseSchema } from './comment-schema';
import { Counter } from '../../utils/database-connection';

const SQL_SELECT_COMMENTS_BY_USER_ID = `SELECT id, storeId, content, rate, publishedAt FROM comments WHERE userId = ? AND isDeleted = false`;
const SQL_SELECT_COMMENTS_BY_STORE_ID = `SELECT id, userId, content, rate, publishedAt FROM comments WHERE storeId = ? AND isDeleted = false`;
const SQL_SELECT_COMMENTED_COURSES_BY_COMMENT_ID = `SELECT name, commentId FROM commentedCourses WHERE commentId = ?`;
const SQL_INSERT_COMMENT = `
  INSERT INTO comments (userId, storeId, content, isDeleted, rate, publishedAt)
  VALUES (?, ?, ?, false, ?, ?)
`;
const SQL_UPDATE_COMMENT_BY_ID = `UPDATE comments SET content = ?, rate = ? WHERE id = ? AND isDeleted = false`;
const SQL_INSERT_COMMENTED_COURSES = `INSERT INTO commentedCourses VALUES (?, ?)`;
const SQL_DELETE_COMMENTED_COURSES_BY_COMMENT_ID = `DELETE FROM commentedCourses WHERE commentId = ?`;
const SQL_CHECK_ID_EXISTENCE = `SELECT COUNT(*) AS count FROM comments WHERE id = ? AND isDeleted = false`;
const SQL_DELETE_COMMENT_BY_ID = `UPDATE comments SET isDeleted = true WHERE id = ?`;

export class CommentStore implements CommentRepository {
  public constructor(
    private readonly queryAgent: QueryAgent,
    private readonly userRepository: UserRepository,
    private readonly storeRepository: StoreRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  private async constructCommentEntity(rawComment: CommentSchema): Promise<CommentEntity> {
    const rawCommentedCourses = await this.queryAgent.query<
      SelectQueryResult<CommentedCourseSchema>
    >(SQL_SELECT_COMMENTED_COURSES_BY_COMMENT_ID, [rawComment.id]);

    return {
      id: rawComment.id,
      content: rawComment.content,
      courses: rawCommentedCourses.map((item) => item.name),
      rate: rawComment.rate,
      publishedAt: rawComment.publishedAt,
    };
  }

  private async constructStoreCommentGroupEntity(
    storeId: number,
    rawComments: CommentSchema[],
  ): Promise<StoreCommentGroupEntity> {
    const storePromise = this.storeRepository.readOneById(storeId);
    const commentPromises = rawComments.map(this.constructCommentEntity);
    const allCommentPromisesInOne = Promise.all(commentPromises);
    const [store, comments] = await Promise.all([storePromise, allCommentPromisesInOne]);

    return { store, comments };
  }

  async readManyGroupedByStoreByUserId(userId: string): Promise<StoreCommentGroupEntity[]> {
    if (!(await this.userRepository.checkIdExistence(userId))) {
      throw new ResourceNotFound('The user does not exist.');
    }

    const rawComments = await this.queryAgent.query<SelectQueryResult<CommentSchema>>(
      SQL_SELECT_COMMENTS_BY_USER_ID,
      [userId],
    );

    const storeCommentGroupMap = new Map<number, CommentSchema[]>();
    rawComments.forEach((rawComment) => {
      if (storeCommentGroupMap.has(rawComment.storeId)) {
        storeCommentGroupMap.get(rawComment.storeId).push(rawComment);
      } else {
        storeCommentGroupMap.set(rawComment.storeId, [rawComment]);
      }
    });

    const storeCommentGroupEntityPromises: Promise<StoreCommentGroupEntity>[] = [];
    storeCommentGroupMap.forEach((rawComments, storeId) => {
      const promise = this.constructStoreCommentGroupEntity(storeId, rawComments);
      storeCommentGroupEntityPromises.push(promise);
    });

    const storeCommentGroupEntities = await Promise.all(storeCommentGroupEntityPromises);
    return storeCommentGroupEntities;
  }

  private async constructUserProfileCommentGroupEntity(
    userId: string,
    rawComments: CommentSchema[],
  ): Promise<UserProfileCommentGroupEntity> {
    const profilePromise = this.userRepository.readProfileById(userId);
    const commentPromises = rawComments.map(this.constructCommentEntity);
    const allCommentPromisesInOne = Promise.all(commentPromises);
    const [userProfile, comments] = await Promise.all([profilePromise, allCommentPromisesInOne]);

    return { userProfile, comments };
  }

  async readManyGroupedByUserByStoreId(storeId: number): Promise<UserProfileCommentGroupEntity[]> {
    if (!(await this.storeRepository.checkIdExistence(storeId))) {
      throw new ResourceNotFound('The store does not exist.');
    }

    const rawComments = await this.queryAgent.query<SelectQueryResult<CommentSchema>>(
      SQL_SELECT_COMMENTS_BY_STORE_ID,
      [storeId],
    );

    const userCommentGroupMap = new Map<string, CommentSchema[]>();
    rawComments.forEach((rawComment) => {
      if (userCommentGroupMap.has(rawComment.userId)) {
        userCommentGroupMap.get(rawComment.userId).push(rawComment);
      } else {
        userCommentGroupMap.set(rawComment.userId, [rawComment]);
      }
    });

    const userProfileCommentGroupEntityPromises: Promise<UserProfileCommentGroupEntity>[] = [];
    userCommentGroupMap.forEach((rawComments, userId) => {
      const promise = this.constructUserProfileCommentGroupEntity(userId, rawComments);
      userProfileCommentGroupEntityPromises.push(promise);
    });

    const userProfileCommentGroupEntities = await Promise.all(
      userProfileCommentGroupEntityPromises,
    );
    return userProfileCommentGroupEntities;
  }

  private async createManyCommentedCourses(commentId: number, courses: string[]): Promise<void> {
    await this.queryAgent.batch(
      SQL_INSERT_COMMENTED_COURSES,
      courses.map((course) => [course, commentId]),
    );
  }

  private async deleteManyCommentedCoursesByCommentId(commentId: number): Promise<void> {
    await this.queryAgent.query(SQL_DELETE_COMMENTED_COURSES_BY_COMMENT_ID, [commentId]);
  }

  private async checkIdExistence(id: number): Promise<boolean> {
    const [counter] = await this.queryAgent.query<SelectQueryResult<Counter>>(
      SQL_CHECK_ID_EXISTENCE,
      [id],
    );

    return counter.count > 0;
  }

  async createOne(newComment: NewCommentEntity): Promise<number> {
    if (!(await this.userRepository.checkIdExistence(newComment.userId))) {
      throw new ResourceNotFound('The user does not exist.');
    }

    if (!(await this.storeRepository.checkIdExistence(newComment.storeId))) {
      throw new ResourceNotFound('The store does not exist.');
    }

    let newCommentId: number;
    await this.queryAgent.runTransactionTask(async () => {
      const nowUtcDate = this.dateProvider.getUtc();
      const result = await this.queryAgent.query<OkPacket>(SQL_INSERT_COMMENT, [
        newComment.userId,
        newComment.storeId,
        newComment.content,
        newComment.rate,
        this.dateProvider.formatToDatabase(nowUtcDate),
      ]);

      newCommentId = result.insertId;
      await this.createManyCommentedCourses(newCommentId, newComment.courses);
    });

    return newCommentId;
  }

  async updateOne(updatedComment: UpdatedCommentEntity): Promise<void> {
    if (!(await this.checkIdExistence(updatedComment.id))) {
      throw new ResourceNotFound('The comment does not exist.');
    }

    await this.queryAgent.runTransactionTask(async () => {
      await this.queryAgent.query<OkPacket>(SQL_UPDATE_COMMENT_BY_ID, [
        updatedComment.content,
        updatedComment.rate,
        updatedComment.id,
      ]);

      await this.deleteManyCommentedCoursesByCommentId(updatedComment.id);
      await this.createManyCommentedCourses(updatedComment.id, updatedComment.courses);
    });
  }

  async deleteOne(id: number, userId: string, storeId: number): Promise<void> {
    if (!(await this.userRepository.checkIdExistence(userId))) {
      throw new ResourceNotFound('The user does not exist.');
    }

    if (!(await this.storeRepository.checkIdExistence(storeId))) {
      throw new ResourceNotFound('The store does not exist.');
    }

    if (!(await this.checkIdExistence(id))) {
      throw new ResourceNotFound('The comment does not exist.');
    }

    await this.queryAgent.query<OkPacket>(SQL_DELETE_COMMENT_BY_ID, [id]);
  }
}
