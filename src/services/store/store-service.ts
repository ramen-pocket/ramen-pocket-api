import { StoreEntity, NewStoreEntity } from '../../entities/store-entity';
import { StoreRepository } from '../../repositories/store/store-repository';
import { StoreUsecase } from './store-usecase';

export class StoreService implements StoreUsecase {
  public constructor(private readonly storeRepository: StoreRepository) {}

  async checkIdExistence(id: number): Promise<boolean> {
    return this.storeRepository.checkIdExistence(id);
  }

  async readManyByIds(ids: number[]): Promise<StoreEntity[]> {
    return this.storeRepository.readManyByIds(ids);
  }

  async readMany(limit: number = 10, skip: number = 0): Promise<StoreEntity[]> {
    return this.storeRepository.readMany(limit, skip);
  }

  async createOne(newStore: NewStoreEntity): Promise<number> {
    return this.storeRepository.createOne(newStore);
  }
}
