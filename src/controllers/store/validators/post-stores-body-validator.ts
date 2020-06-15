import { Validator } from '../../validators/validator';
import { NewStoreEntity } from '../../../entities/store-entity';
import { InvalidBodyFormatError } from '../../../errors/validation-error';

export class PostStoresBodyValidator implements Validator<string, NewStoreEntity> {
  private validateLocation(location: any) {
    if (typeof location !== 'object') throw new InvalidBodyFormatError();
    if (typeof location.address !== 'string') throw new InvalidBodyFormatError();
    if (typeof location.lat !== 'number' && !Number.isInteger(location.lat))
      throw new InvalidBodyFormatError();
    if (typeof location.lng !== 'number' && !Number.isInteger(location.lng))
      throw new InvalidBodyFormatError();

    return {
      address: location.address,
      latitude: location.lat,
      longtitude: location.lng,
    };
  }

  private validateArray(obj: any) {
    if (typeof obj !== 'object') throw new InvalidBodyFormatError();
    if (obj.constructor !== Array) throw new InvalidBodyFormatError();
  }

  private validateImages(images: any) {
    this.validateArray(images);
    if (images.some((image: any) => typeof image !== 'string')) throw new InvalidBodyFormatError();
  }

  private validateTagIds(tagIds: any) {
    this.validateArray(tagIds);
    if (tagIds.some((id: any) => typeof id !== 'number')) throw new InvalidBodyFormatError();
  }

  private validateBusinessHours(businessHours: any) {
    this.validateArray(businessHours);
    if (businessHours.length !== 7) throw new InvalidBodyFormatError();
    businessHours.forEach((item: any) => {
      if (typeof item !== 'object') throw new InvalidBodyFormatError();
      if (typeof item.off !== 'boolean') throw new InvalidBodyFormatError();
      if (typeof item.begin !== 'number') throw new InvalidBodyFormatError();
      if (typeof item.end !== 'number') throw new InvalidBodyFormatError();
      if (item.begin > item.end) throw new InvalidBodyFormatError();
    });
  }

  private validateCourses(courses: any) {
    this.validateArray(courses);
    courses.forEach((item: any) => {
      if (typeof item !== 'object') throw new InvalidBodyFormatError();
      if (typeof item.name !== 'string') throw new InvalidBodyFormatError();
      if (typeof item.price !== 'number') throw new InvalidBodyFormatError();
      if (!Number.isInteger(item.price)) throw new InvalidBodyFormatError();
      if (typeof item.isRamen !== 'boolean') throw new InvalidBodyFormatError();
    });
  }

  public validate(value: string): NewStoreEntity {
    let obj: any;
    try {
      obj = JSON.stringify(value);
    } catch (err) {
      throw new InvalidBodyFormatError();
    }

    if (typeof obj.name !== 'string') throw new InvalidBodyFormatError();
    if (typeof obj.featuredImage !== 'string') throw new InvalidBodyFormatError();
    this.validateLocation(obj.location);
    this.validateImages(obj.images);
    this.validateBusinessHours(obj.businessHours);
    this.validateCourses(obj.courses);
    this.validateTagIds(obj.tagIds);

    return obj as NewStoreEntity;
  }
}
