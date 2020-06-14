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
}
