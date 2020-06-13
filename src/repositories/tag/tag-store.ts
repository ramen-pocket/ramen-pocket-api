import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { TagEntity } from '../../entities/tag-entity';
import { ResourceNotFound } from '../../errors/service-error';
import { TagRepository } from './tag-repository';
import { TagSchema } from './tag-schema';

const SQL_SELECT_TAGS_BY_IDS = `SELECT id, name FROM tags WHERE id IN ?`;
const SQL_SELECT_ALL_TAGS = `SELECT id, name FROM tags`;

export class TagStore implements TagRepository {
  public constructor(private readonly queryAgent: QueryAgent) {}

  async readManyByIds(ids: number[]): Promise<TagEntity[]> {
    const tags = await this.queryAgent.query<SelectQueryResult<TagSchema>>(SQL_SELECT_TAGS_BY_IDS, [
      ids,
    ]);

    if (tags.length !== ids.length) {
      throw new ResourceNotFound('One or many tags do not exist.');
    }

    return tags as TagEntity[];
  }

  async readAll(): Promise<TagEntity[]> {
    return this.queryAgent.query<SelectQueryResult<TagSchema>>(SQL_SELECT_ALL_TAGS);
  }
}
