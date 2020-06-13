import { StoreEntity, NewStoreEntity } from '../../entities/store-entity';

export interface StoreUsecase {
  checkIdExistence(id: number): Promise<boolean>;
  readManyByIds(ids: number[]): Promise<StoreEntity[]>;
  readMany(limit: number, skip: number): Promise<StoreEntity[]>;
  createOne(newStore: NewStoreEntity): Promise<number>;
}
