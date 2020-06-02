import { Schema } from '../../interfaces/schemas';
import { Store } from '../../interfaces/store';
import { Record } from '../../interfaces/record';
import { DatabaseConnection } from '../../utils/database-connection';
import { StoreCommentGroup } from './interfaces';

interface Counter {
  count: number;
}

export class StoreCommentGroupConstructor {
  private static readonly SQL_SCRIPT_STORE = `SELECT name, isDeleted, address, latitude, longtitude, rate, featuredImage FROM stores WHERE id = ?`;
  private static readonly SQL_SCRIPT_IMAGES = `SELECT url FROM images WHERE storeId = ?`;
  private static readonly SQL_SCRIPT_BUSINESS_HOURS = `SELECT day, off, begin, end FROM businessHours WHERE storeId = ? ORDER BY day DESC`;
  private static readonly SQL_SCRIPT_COURSES = `SELECT name, price, isRamen FROM courses WHERE storeId = ?`;
  private static readonly SQL_SCRIPT_COURSES_IN_COMMENT = `SELECT name FROM commentedCourses WHERE commentId = ?`;
  private static readonly SQL_SCRIPT_CHECK_COLLECTION = `SELECT COUNT(*) AS count FROM collections WHERE userId = ?`;

  private readonly rawComments: Schema.Comment[] = [];

  constructor(private readonly storeId: number, private readonly connection: DatabaseConnection) {}

  public addRawComment(rawComment: Schema.Comment) {
    this.rawComments.push(rawComment);
  }

  private async buildStore(callerUserId: string): Promise<Store> {
    const CLASS = StoreCommentGroupConstructor;
    const [rawStores, rawImages, rawBusinessHours, rawCourses, counter] = (await Promise.all([
      this.connection.query(CLASS.SQL_SCRIPT_STORE, [this.storeId]),
      this.connection.query(CLASS.SQL_SCRIPT_IMAGES, [this.storeId]),
      this.connection.query(CLASS.SQL_SCRIPT_BUSINESS_HOURS, [this.storeId]),
      this.connection.query(CLASS.SQL_SCRIPT_COURSES, [this.storeId]),
      this.connection.query(CLASS.SQL_SCRIPT_CHECK_COLLECTION, [callerUserId]),
    ])) as [Schema.Store[], Schema.Image[], Schema.BusinessHour[], Schema.Course[], Counter];

    const isStoreCollectedByCaller = counter.count > 0;
    const [rawStore] = rawStores;
    return {
      id: this.storeId,
      name: rawStore.name,
      isDeleted: Boolean(rawStore.isDeleted),
      isCollected: isStoreCollectedByCaller,
      location: {
        address: rawStore.address,
        lat: rawStore.latitude,
        lng: rawStore.longtitude,
      },
      rate: rawStore.rate,
      featuredImage: rawStore.featuredImage,
      images: rawImages.map((rawImage) => rawImage.url),
      businessHours: rawBusinessHours.map((item) => ({
        off: Boolean(item.off),
        begin: item.begin,
        end: item.end,
      })),
      courses: rawCourses.map((course) => ({
        name: course.name,
        price: course.price,
        isRamen: Boolean(course.isRamen),
      })),
    };
  }

  private async buildRecords(): Promise<Record[]> {
    const CLASS = StoreCommentGroupConstructor;
    const promises = this.rawComments.map((rawComment) =>
      this.connection.query(CLASS.SQL_SCRIPT_COURSES_IN_COMMENT, [rawComment.id]),
    );

    const commentsToCourses = (await Promise.all(promises)) as Schema.CommentedCourse[][];

    return this.rawComments.map((rawComment, index) => ({
      id: rawComment.id,
      isDeleted: Boolean(rawComment.isDeleted),
      content: rawComment.content,
      courses: commentsToCourses[index].map((item) => item.name),
      rate: rawComment.rate,
      publishedAt: rawComment.publishedAt,
    }));
  }

  public async load(callerUserId: string): Promise<StoreCommentGroup> {
    const [store, records] = await Promise.all([
      this.buildStore(callerUserId),
      this.buildRecords(),
    ]);

    return { store, records };
  }
}
