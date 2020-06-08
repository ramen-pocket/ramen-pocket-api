import { UpsertResult } from 'mariadb';
import { DatabaseConnection } from '../../utils/database-connection';
import { StoreDto, BusinessHour, Course } from './validation';

interface Counter {
  count: number;
}

export class StoreCreator {
  private static readonly SQL_SCRIPT_CREATE_STORE = `
    INSERT INTO stores (name, isDeleted, address, latitude, longtitude, rate, featuredImage)
    VALUES (?, false, ?, ?, ?, 2.5, ?);`;

  private static readonly SQL_SCRIPT_CREATE_IMAGES = `INSERT INTO images VALUES (?, ?)`;
  private static readonly SQL_SCRIPT_CREATE_BUSINESS_HOURS = `INSERT INTO businessHours VALUES (?, ?, ?, ?, ?)`;
  private static readonly SQL_SCRIPT_CREATE_COURSES = `INSERT INTO courses VALUES (?, ?, ?, ?)`;
  private static readonly SQL_SCRIPT_CREATE_STORE_TAGS = `INSERT INTO storeTags VALUES (?, ?)`;
  private static readonly SQL_SCRIPT_CHECK_TAG_IDS = `SELECT COUNT(*) AS count FROM tags WHERE id IN ?`;

  constructor(private readonly connection: DatabaseConnection) {}

  private async checkEveryTagExist(tagIds: string[]): Promise<boolean> {
    if (tagIds.length <= 0) return true;
    const [counter] = (await this.connection.query(StoreCreator.SQL_SCRIPT_CHECK_TAG_IDS, [
      tagIds,
    ])) as [Counter];
    return counter.count === tagIds.length;
  }

  private async createStore(storeDto: StoreDto): Promise<number> {
    const result = await this.connection.query<UpsertResult>(StoreCreator.SQL_SCRIPT_CREATE_STORE, [
      storeDto.name,
      storeDto.location.address,
      storeDto.location.lat,
      storeDto.location.lng,
      storeDto.featuredImage,
    ]);

    return result.insertId;
  }

  private async createImages(storeId: number, imageUrls: string[]) {
    if (imageUrls.length <= 0) return;
    await this.connection.batch(
      StoreCreator.SQL_SCRIPT_CREATE_IMAGES,
      imageUrls.map((url) => [url, storeId]),
    );
  }

  private async createBusinessHours(storeId: number, businessHours: BusinessHour[]) {
    if (businessHours.length <= 0) return;
    await this.connection.batch(
      StoreCreator.SQL_SCRIPT_CREATE_BUSINESS_HOURS,
      businessHours.map((item, index) => [index, storeId, item.off, item.begin, item.end]),
    );
  }

  private async createCourses(storeId: number, courses: Course[]) {
    if (courses.length <= 0) return;
    await this.connection.batch(
      StoreCreator.SQL_SCRIPT_CREATE_COURSES,
      courses.map((course) => [course.name, storeId, course.price, course.isRamen]),
    );
  }

  private async createStoreTags(storeId: number, tagIds: string[]) {
    if (tagIds.length <= 0) return;
    await this.connection.batch(
      StoreCreator.SQL_SCRIPT_CREATE_STORE_TAGS,
      tagIds.map((id) => [storeId, id]),
    );
  }

  async create(storeDto: StoreDto): Promise<[boolean, string]> {
    if (!(await this.checkEveryTagExist(storeDto.tags))) {
      return [false, 'One or many tag ids do not exist.'];
    }

    const storeId = await this.createStore(storeDto);
    await Promise.all([
      this.createImages(storeId, storeDto.images),
      this.createBusinessHours(storeId, storeDto.businessHours),
      this.createCourses(storeId, storeDto.courses),
      this.createStoreTags(storeId, storeDto.tags),
    ]);
    return [true, null];
  }
}
