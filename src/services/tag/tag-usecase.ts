import { TagEntity } from '../../entities/tag-entity';

export interface TagUsecase {
  readManyByIds(ids: number[]): Promise<TagEntity[]>;
  readAll(): Promise<TagEntity[]>;
}
