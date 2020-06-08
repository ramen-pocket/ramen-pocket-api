import { DatabaseConnection } from '../../utils/database-connection';
import { Schema } from '../../interfaces/schemas';
import { Store } from '../../interfaces/store';

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

export async function constructStore(
  rawStore: Schema.Store,
  conn: DatabaseConnection,
): Promise<Store> {
  const [images, businessHours, courses] = await Promise.all([
    conn.query<Schema.Image[]>(SQL_SCRIPT_IMAGES, [rawStore.id]),
    conn.query<Schema.BusinessHour[]>(SQL_SCRIPT_BUSINESS_HOURS, [rawStore.id]),
    conn.query<Schema.Course[]>(SQL_SCRIPT_COURSES, [rawStore.id]),
  ]);

  return {
    id: rawStore.id,
    name: rawStore.name,
    isDeleted: Boolean(rawStore.isDeleted),
    isCollected: true,
    location: {
      address: rawStore.address,
      lat: rawStore.latitude,
      lng: rawStore.longtitude,
    },
    rate: rawStore.rate,
    featuredImage: rawStore.featuredImage,
    images: images.map((image) => image.url),
    businessHours: businessHours.map((item) => ({
      off: Boolean(item.off),
      begin: item.begin,
      end: item.end,
    })),
    courses: courses.map((course) => ({
      name: course.name,
      price: course.price,
      isRamen: Boolean(course.isRamen),
    })),
  };
}
