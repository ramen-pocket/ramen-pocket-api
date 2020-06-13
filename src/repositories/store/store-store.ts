import { ResourceNotFound } from '../../errors/service-error';
import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { OkPacket } from '../../database/ok-packet';
import { Counter } from '../../database/counter';
import {
  StoreEntity,
  NewStoreEntity,
  StoreBusinessHourEntity,
  StoreCourseEntity,
} from '../../entities/store-entity';
import { StoreRepository } from './store-repository';
import {
  StoreSchema,
  StoreImageSchema,
  StoreBusinessHourSchema,
  StoreCourseSchema,
} from './store-schema';
import { TagSchema } from '../tag/tag-schema';
import { TagEntity } from '../../entities/tag-entity';

const SQL_CHECK_ID_EXISTENCE = `SELECT COUNT(*) AS count FROM stores WHERE id = ?`;
const SQL_SELECT_STORE_BY_ID = `
  SELECT id, name, address, latitude, longtitude, rate, featuredImage
  FROM stores
  WHERE id = ? AND isDeleted = false
`;
const SQL_SELECT_STORE_IMAGES_BY_ID = `SELECT url FROM images WHERE storeId = ?`;
const SQL_SELECT_BUSINESS_HOURS_BY_ID = `SELECT day, off, begin, end FROM businessHours WHERE storeId = ? ORDER BY day ASC`;
const SQL_SELECT_COURSES_BY_ID = `SELECT name, price, isRamen FROM courses WHERE storeId = ?`;
const SQL_SELECT_TAGS_BY_STORE_ID = `
  SELECT tags.id AS id, tags.name AS name
  FROM tags
  LEFT JOIN storeTags
  ON storeTags.tagId = tags.id
  LEFT JOIN stores
  ON stores.id = storeTags.storeId
  WHERE stores.id = ?
`;
const SQL_SELECT_STORE_PAGINATION = `
  SELECT id, name, address, latitude, longtitude, rate, featuredImage
  FROM stores
  WHERE isDeleted = false
  LIMIT ? OFFSET ?
`;
const SQL_CHECK_ALL_TAGS_EXISTENCE = `SELECT COUNT(*) AS count FROM tags WHERE id IN ?`;
const SQL_INSERT_STORE = `
  INSERT INTO stores (name, isDeleted, address, latitude, longtitude, rate, featuredImage)
  VALUES (?, false, ?, ?, ?, ?, ?)
`;
const SQL_INSERT_STORE_IMAGES = `INSERT INTO images VALUES (?, ?)`;
const SQL_INSERT_STORE_BUSINESS_HOURS = `INSERT INTO businessHours VALUES (?, ?, ?, ?, ?)`;
const SQL_INSERT_STORE_COURSES = `INSERT INTO courses VALUES (?, ?, ?, ?)`;
const SQL_INSERT_STORE_TAGS = `INSERT INTO storeTags VALUES (?, ?)`;

export class StoreStore implements StoreRepository {
  public constructor(private readonly queryAgent: QueryAgent) {}

  async checkIdExistence(id: number): Promise<boolean> {
    const [counter] = await this.queryAgent.query<SelectQueryResult<Counter>>(
      SQL_CHECK_ID_EXISTENCE,
      [id],
    );

    return counter.count > 0;
  }

  private async readImagesById(id: number): Promise<string[]> {
    const results = await this.queryAgent.query<SelectQueryResult<StoreImageSchema>>(
      SQL_SELECT_STORE_IMAGES_BY_ID,
      [id],
    );
    return results.map((image) => image.url);
  }

  private async readBusinessHoursById(id: number): Promise<StoreBusinessHourEntity[]> {
    const results = await this.queryAgent.query<SelectQueryResult<StoreBusinessHourSchema>>(
      SQL_SELECT_BUSINESS_HOURS_BY_ID,
      [id],
    );
    return results.map((businessHour) => ({
      off: Boolean(businessHour.off),
      begin: businessHour.begin,
      end: businessHour.end,
    }));
  }

  private async readCoursesById(id: number): Promise<StoreCourseEntity[]> {
    const results = await this.queryAgent.query<SelectQueryResult<StoreCourseSchema>>(
      SQL_SELECT_COURSES_BY_ID,
      [id],
    );
    return results.map((course) => ({
      name: course.name,
      price: course.price,
      isRamen: Boolean(course.isRamen),
    }));
  }

  private async readTagsById(id: number): Promise<TagEntity[]> {
    const results = await this.queryAgent.query<SelectQueryResult<TagSchema>>(
      SQL_SELECT_TAGS_BY_STORE_ID,
      [id],
    );
    return results;
  }

  async readOneById(id: number): Promise<StoreEntity> {
    const results = await this.queryAgent.query<SelectQueryResult<StoreSchema>>(
      SQL_SELECT_STORE_BY_ID,
      [id],
    );

    if (results.length < 1) {
      throw new ResourceNotFound(`The store with id ${id} does not exist.`);
    }

    const [store] = results;
    const [images, businessHours, courses, tags] = await Promise.all([
      this.readImagesById(id),
      this.readBusinessHoursById(id),
      this.readCoursesById(id),
      this.readTagsById(id),
    ]);

    return {
      id,
      name: store.name,
      location: {
        address: store.address,
        latitude: store.latitude,
        longtitude: store.longtitude,
      },
      rate: store.rate,
      featuredImage: store.featuredImage,
      images: images,
      businessHours: businessHours,
      courses: courses,
      tags: tags,
    };
  }

  async readManyByIds(ids: number[]): Promise<StoreEntity[]> {
    const promises = ids.map((id) => this.readOneById(id));
    const stores = await Promise.all(promises);
    return stores;
  }

  async readMany(limit: number, skip: number): Promise<StoreEntity[]> {
    const rawStores = await this.queryAgent.query<SelectQueryResult<StoreSchema>>(
      SQL_SELECT_STORE_PAGINATION,
      [limit, skip],
    );

    const promises = rawStores.map(
      async (rawStore): Promise<StoreEntity> => {
        const [images, businessHours, courses, tags] = await Promise.all([
          this.readImagesById(rawStore.id),
          this.readBusinessHoursById(rawStore.id),
          this.readCoursesById(rawStore.id),
          this.readTagsById(rawStore.id),
        ]);

        return {
          id: rawStore.id,
          name: rawStore.name,
          location: {
            address: rawStore.address,
            latitude: rawStore.latitude,
            longtitude: rawStore.longtitude,
          },
          rate: rawStore.rate,
          featuredImage: rawStore.featuredImage,
          images: images,
          businessHours: businessHours,
          courses: courses,
          tags: tags,
        };
      },
    );

    const stores = await Promise.all(promises);
    return stores;
  }

  private async createStore(newStore: NewStoreEntity): Promise<number> {
    const result = await this.queryAgent.query<OkPacket>(SQL_INSERT_STORE, [
      newStore.name,
      newStore.location.address,
      newStore.location.latitude,
      newStore.location.longtitude,
      newStore.rate,
      newStore.featuredImage,
    ]);

    return result.insertId;
  }

  private async createStoreImages(id: number, urls: string[]) {
    await this.queryAgent.batch(
      SQL_INSERT_STORE_IMAGES,
      urls.map((url) => [url, id]),
    );
  }

  private async createStoreBusinessHours(id: number, businessHours: StoreBusinessHourEntity[]) {
    await this.queryAgent.batch(
      SQL_INSERT_STORE_BUSINESS_HOURS,
      businessHours.map((businessHour, index) => [
        index,
        id,
        businessHour.off,
        businessHour.begin,
        businessHour.end,
      ]),
    );
  }

  private async createStoreCourses(id: number, courses: StoreCourseEntity[]) {
    await this.queryAgent.batch(
      SQL_INSERT_STORE_COURSES,
      courses.map((course) => [course.name, id, course.price, course.isRamen]),
    );
  }

  private async createStoreTags(id: number, tagIds: number[]) {
    await this.queryAgent.batch(
      SQL_INSERT_STORE_TAGS,
      tagIds.map((tagId) => [id, tagId]),
    );
  }

  async createOne(newStore: NewStoreEntity): Promise<number> {
    const [counter] = await this.queryAgent.query<SelectQueryResult<Counter>>(
      SQL_CHECK_ALL_TAGS_EXISTENCE,
      [newStore.tagIds],
    );

    if (counter.count !== newStore.tagIds.length) {
      throw new ResourceNotFound('One or many tag ids do not exist.');
    }

    let newStoreId: number;
    await this.queryAgent.runTransactionTask(async () => {
      newStoreId = await this.createStore(newStore);
      await Promise.all([
        this.createStoreImages(newStoreId, newStore.images),
        this.createStoreBusinessHours(newStoreId, newStore.businessHours),
        this.createStoreCourses(newStoreId, newStore.courses),
        this.createStoreTags(newStoreId, newStore.tagIds),
      ]);
    });

    return newStoreId;
  }
}
