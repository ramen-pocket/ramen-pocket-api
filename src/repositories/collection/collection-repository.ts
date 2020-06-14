import { CollectiveStoreEntity } from '../../entities/collective-store-entity';

export interface CollectionRepository {
  readStoresFromUserCollection(
    callerUserId: string,
    targetUserId: string,
  ): Promise<CollectiveStoreEntity[]>;
  createCollection(userId: string, storeId: number): Promise<void>;
  deleteCollection(userId: string, storeId: number): Promise<void>;
}
