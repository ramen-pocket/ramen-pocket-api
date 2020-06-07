export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface BusinessHour {
  off: boolean;
  begin: number;
  end: number;
}

export interface Course {
  name: string;
  price: number;
  isRamen: boolean;
}

export interface StoreDto {
  name: string;
  featuredImage: string;
  location: Location;
  images: string[];
  businessHours: BusinessHour[];
  courses: Course[];
  tags: string[];
}

const INCORRECT_FORMAT_ERROR = new Error('Incorrect format.');

function validateLocation(obj: any): Location {
  if (typeof obj !== 'object') throw INCORRECT_FORMAT_ERROR;

  if (
    typeof obj.address !== 'string' ||
    typeof obj.lat !== 'number' ||
    typeof obj.lng !== 'number'
  ) {
    throw INCORRECT_FORMAT_ERROR;
  }

  return {
    address: obj.address,
    lat: obj.lat,
    lng: obj.lng,
  };
}

function validateImages(obj: any): string[] {
  if (typeof obj !== 'object' || obj.constructor !== Array) throw INCORRECT_FORMAT_ERROR;
  const urlSet = new Set<string>();
  const result = obj.every((url: any) => {
    if (typeof url !== 'string' || urlSet.has(url)) return false;
    urlSet.add(url);
    return true;
  });
  if (!result) throw INCORRECT_FORMAT_ERROR;
  return obj;
}

function validateBusinessHours(obj: any): BusinessHour[] {
  if (typeof obj !== 'object' || obj.constructor !== Array) throw INCORRECT_FORMAT_ERROR;
  if (obj.length !== 7) throw INCORRECT_FORMAT_ERROR;
  const isEveryItemBusinessHour = obj.every(
    (item: any) =>
      typeof item.off === 'boolean' &&
      typeof item.begin === 'number' &&
      typeof item.end === 'number',
  );
  if (!isEveryItemBusinessHour) throw INCORRECT_FORMAT_ERROR;
  return obj;
}

function validateCourses(obj: any): Course[] {
  if (typeof obj !== 'object' || obj.constructor !== Array) throw INCORRECT_FORMAT_ERROR;
  const nameSet = new Set<string>();
  const isEveryItemCourse = obj.every((item: any) => {
    if (
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      typeof item.isRamen !== 'boolean' ||
      nameSet.has(item.name)
    ) {
      return false;
    }
    nameSet.add(item.name);
    return true;
  });
  if (!isEveryItemCourse) throw INCORRECT_FORMAT_ERROR;
  return obj;
}

function validateTags(obj: any): string[] {
  if (typeof obj !== 'object' || obj.constructor !== Array) throw INCORRECT_FORMAT_ERROR;
  const idSet = new Set<string>();
  const isEveryIdStringAndUnique = obj.every((id: any) => {
    if (typeof id !== 'string' || idSet.has(id)) return false;
    idSet.add(id);
    return true;
  });
  if (!isEveryIdStringAndUnique) throw INCORRECT_FORMAT_ERROR;
  return obj;
}

function validateStore(obj: any): StoreDto {
  if (typeof obj !== 'object') throw INCORRECT_FORMAT_ERROR;
  if (typeof obj.name !== 'string') throw INCORRECT_FORMAT_ERROR;
  if (typeof obj.featuredImage !== 'string') throw INCORRECT_FORMAT_ERROR;
  const location = validateLocation(obj.location);
  const images = validateImages(obj.images);
  const businessHours = validateBusinessHours(obj.businessHours);
  const courses = validateCourses(obj.courses);
  const tags = validateTags(obj.tags);

  return {
    name: obj.name,
    featuredImage: obj.featuredImage,
    location,
    images,
    businessHours,
    courses,
    tags,
  };
}

export function validateBody(raw: string): [boolean, StoreDto] {
  try {
    const body = JSON.parse(raw);
    return [true, validateStore(body)];
  } catch (err) {
    return [false, null];
  }
}
