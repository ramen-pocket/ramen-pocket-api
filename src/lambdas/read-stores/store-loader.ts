import { DatabaseConnection } from '../../utils/database-connection';
import { Schema } from '../../interfaces/schemas';
import { Store } from '../../interfaces/store';

const SQL_SCRIPT_STORES = `
  SELECT
    id,
    name,
    isDeleted,
    address,
    latitude,
    longtitude,
    rate,
    featuredImage
  FROM stores
  ORDER BY name
  LIMIT ?
  OFFSET ?
`;

const SQL_SCRIPT_COLLECTION = `SELECT storeId FROM collections WHERE userId = ?`;

const SQL_SCRIPT_IMAGES = `SELECT url FROM images WHERE storeId = ?`;

const SQL_SCRIPT_BUSINESS_HOURS = `SELECT day, off, begin, end FROM businessHours WHERE storeId = ? ORDER BY day DESC`;

const SQL_SCRIPT_COURSES = `SELECT name, price, isRamen FROM courses WHERE storeId = ?`;

export class StoreLoader {
  private connection: DatabaseConnection;

  public constructor(connection: DatabaseConnection) {
    this.connection = connection;
  }

  private async constructStore(rawStore: Schema.Store, isCollected: boolean): Promise<Store> {
    const [rawImages, rawBusinessHours, rawCourses] = (await Promise.all([
      this.connection.query(SQL_SCRIPT_IMAGES, [rawStore.id]),
      this.connection.query(SQL_SCRIPT_BUSINESS_HOURS, [rawStore.id]),
      this.connection.query(SQL_SCRIPT_COURSES, [rawStore.id]),
    ])) as [Schema.Image[], Schema.BusinessHour[], Schema.Course[]];

    return {
      id: rawStore.id,
      name: rawStore.name,
      isDeleted: Boolean(rawStore.isDeleted),
      isCollected: isCollected,
      location: {
        address: rawStore.address,
        lat: rawStore.latitude,
        lng: rawStore.longtitude,
      },
      rate: rawStore.rate,
      featuredImage: rawStore.featuredImage,
      images: rawImages.map((image) => image.url),
      businessHours: rawBusinessHours.map((item) => ({
        off: Boolean(item.off),
        begin: item.begin,
        end: item.end,
      })),
      courses: rawCourses.map((item) => ({
        name: item.name,
        price: item.price,
        isRamen: Boolean(item.isRamen),
      })),
    };
  }

  public async readStores(userId: string, limit: number, skip: number): Promise<Store[]> {
    const [rawStores, rawCollections] = (await Promise.all([
      this.connection.query(SQL_SCRIPT_STORES, [limit, skip]),
      this.connection.query(SQL_SCRIPT_COLLECTION, [userId]),
    ])) as [Schema.Store[], Schema.Collection[]];

    const collectionMap = new Map<number, boolean>();
    rawCollections.forEach((item) => {
      collectionMap.set(item.storeId, true);
    });

    const promises = rawStores.map((rawStore) => {
      const isCollected = collectionMap.has(rawStore.id);
      return this.constructStore(rawStore, isCollected);
    });

    return Promise.all(promises);
  }
}
