import { TagEntity } from '../../entities/tag-entity';

export interface TagRepository {
  readManyByIds(ids: number[]): Promise<TagEntity[]>;
  readAll(): Promise<TagEntity[]>;
}
