import { Validator } from '../../validators/validator';
import { InvalidBodyFormatError } from '../../../errors/validation-error';
import { PutStoreCommentDto } from '../../dtos/put-store-comment-dto';

export class PutStoreCommentBodyValidator implements Validator<string, PutStoreCommentDto> {
  public validate(value: string): PutStoreCommentDto {
    let obj: any;
    try {
      obj = JSON.parse(value);
    } catch (err) {
      throw new InvalidBodyFormatError();
    }

    if (typeof obj !== 'object') throw new InvalidBodyFormatError();
    if (typeof obj.content !== 'string') throw new InvalidBodyFormatError();
    if (typeof obj.rate !== 'number') throw new InvalidBodyFormatError();
    if (!Number.isInteger(obj.rate)) throw new InvalidBodyFormatError();
    if (typeof obj.courses !== 'object') throw new InvalidBodyFormatError();
    if (obj.courses.constructor !== Array) throw new InvalidBodyFormatError();

    const courseSet = new Set<string>();
    obj.courses.forEach((item: any) => {
      if (typeof item !== 'string') throw new InvalidBodyFormatError();
      if (courseSet.has(item)) throw new InvalidBodyFormatError();
      courseSet.add(item);
    });

    return obj as PutStoreCommentDto;
  }
}
