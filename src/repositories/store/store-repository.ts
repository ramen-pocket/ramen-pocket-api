import { StoreEntity, NewStoreEntity } from '../../entities/store-entity';

export interface StoreRepository {
  checkIdExistence(id: number): Promise<boolean>;
  readOneById(id: number): Promise<StoreEntity>;
  readManyByIds(ids: number[]): Promise<StoreEntity[]>;
  readMany(limit: number, skip: number): Promise<StoreEntity[]>;
  createOne(newStore: NewStoreEntity): Promise<number>;
}
