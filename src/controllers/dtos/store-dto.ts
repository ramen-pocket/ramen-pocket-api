import { StoreEntity } from '../../entities/store-entity';
import { CollectiveStoreEntity } from '../../entities/collective-store-entity';
import { StoreLocationDto } from './store-location-dto';
import { StoreBusinessHourDto } from './store-business-hour-dto';
import { StoreCourseDto } from './store-course-dto';
import { TagDto } from './tag-dto';

export class StoreDto {
  id: number;
  name: string;
  isCollected: boolean;
  location: StoreLocationDto;
  rate: number;
  featuredImage: string;
  images: string[];
  businessHours: StoreBusinessHourDto[];
  courses: StoreCourseDto[];
  tags: TagDto[];

  static transformFromStoreEntity(store: StoreEntity, isCollected: boolean = true): StoreDto {
    return {
      id: store.id,
      name: store.name,
      isCollected: isCollected,
      location: {
        address: store.location.address,
        lat: store.location.latitude,
        lng: store.location.longtitude,
      },
      rate: store.rate,
      featuredImage: store.featuredImage,
      images: store.images,
      businessHours: store.businessHours,
      courses: store.courses,
      tags: store.tags,
    };
  }

  static transformFromCollectiveStoreEntity(store: CollectiveStoreEntity): StoreDto {
    return StoreDto.transformFromStoreEntity(store as StoreEntity, store.isCollected);
  }
}
