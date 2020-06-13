import { TagEntity } from './tag-entity';

export class StoreEntity {
  id: number;
  name: string;
  location: StoreLocationEntity;
  rate: number;
  featuredImage: string;
  images: string[];
  businessHours: StoreBusinessHourEntity[];
  courses: StoreCourseEntity[];
  tags: TagEntity[];
}

export class NewStoreEntity {
  name: string;
  location: StoreLocationEntity;
  rate: number;
  featuredImage: string;
  images: string[];
  businessHours: StoreBusinessHourEntity[];
  courses: StoreCourseEntity[];
  tagIds: number[];
}

export class StoreLocationEntity {
  address: string;
  latitude: number;
  longtitude: number;
}

export class StoreBusinessHourEntity {
  off: boolean;
  begin: number;
  end: number;
}

export class StoreCourseEntity {
  name: string;
  price: number;
  isRamen: boolean;
}
