import { DatabaseConnection } from '../../utils/database-connection';
import { Schema } from '../../interfaces/schemas';
import { Store } from '../../interfaces/store';

interface Counter {
  count: number;
}

const SQL_SCRIPT_IMAGES = `SELECT url FROM images WHERE images.storeId = ?`;

const SQL_SCRIPT_BUSINESS_HOURS = `
SELECT day, off, begin, end
FROM \`businessHours\`
WHERE \`businessHours\`.storeId = ?
`;

const SQL_SCRIPT_COURSES = `
SELECT name, price, \`isRamen\`
FROM courses
WHERE courses.storeId = ?
`;

const SQL_SCRIPT_CHECK_COLLECTED = `SELECT COUNT(*) AS count FROM collections WHERE userId = ? AND storeId = ?`;

export async function constructStore(
  rawStore: Schema.Store,
  userId: string,
  conn: DatabaseConnection,
): Promise<Store> {
  const [images, businessHours, courses, collectedStoreCounts] = (await Promise.all([
    conn.query(SQL_SCRIPT_IMAGES, [rawStore.id]),
    conn.query(SQL_SCRIPT_BUSINESS_HOURS, [rawStore.id]),
    conn.query(SQL_SCRIPT_COURSES, [rawStore.id]),
    conn.query(SQL_SCRIPT_CHECK_COLLECTED, [userId, rawStore.id]),
  ])) as [Schema.Image[], Schema.BusinessHour[], Schema.Course[], Counter[]];

  const [countResult] = collectedStoreCounts;
  const isCollected = countResult.count > 0;

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
    images: images.map((image: Schema.Image) => image.url),
    businessHours: businessHours.map((item: Schema.BusinessHour) => ({
      off: Boolean(item.off),
      begin: item.begin,
      end: item.end,
    })),
    courses: courses.map((course: Schema.Course) => ({
      name: course.name,
      price: course.price,
      isRamen: Boolean(course.isRamen),
    })),
  };
}
