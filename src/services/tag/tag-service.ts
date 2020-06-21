import { TagEntity } from '../../entities/tag-entity';
import { TagRepository } from '../../repositories/tag/tag-repository';
import { TagUsecase } from './tag-usecase';

export class TagService implements TagUsecase {
  public constructor(private readonly tagRepository: TagRepository) {}

  async readManyByIds(ids: number[]): Promise<TagEntity[]> {
    return this.tagRepository.readManyByIds(ids);
  }

  async readAll(): Promise<TagEntity[]> {
    return this.tagRepository.readAll();
  }
}
