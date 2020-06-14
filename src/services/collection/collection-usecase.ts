import { CollectiveStoreEntity } from '../../entities/collective-store-entity';

export interface CollectionUsecase {
  readStoresFromUserCollection(userId: string): Promise<CollectiveStoreEntity[]>;
  addStoreToUserCollection(userId: string, storeId: number): Promise<void>;
  deleteStoreFromUserCollection(userId: string, storeId: number): Promise<void>;
}
