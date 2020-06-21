export class StoreSchema {
  id?: number;
  name?: string;
  isDeleted?: number;
  address?: string;
  latitude?: number;
  longtitude?: number;
  rate?: number;
  featuredImage?: string;
}

export class StoreImageSchema {
  url?: string;
  storeId: number;
}

export class StoreBusinessHourSchema {
  day?: number;
  storeId?: number;
  off?: number;
  begin?: number;
  end?: number;
}

export class StoreCourseSchema {
  name?: string;
  storeId?: number;
  price?: number;
  isRamen?: number;
}
