import { StoreEntity } from '../../entities/store-entity';

export interface CollectionUsecase {
  readStoresFromUserCollection(userId: string): Promise<StoreEntity[]>;
  addStoreToUserCollection(userId: string, storeId: number): Promise<void>;
  deleteStoreFromUserCollection(userId: string, storeId: number): Promise<void>;
}
