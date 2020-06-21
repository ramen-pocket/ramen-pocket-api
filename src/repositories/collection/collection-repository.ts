import { StoreEntity } from '../../entities/store-entity';

export interface CollectionRepository {
  readStoresFromUserCollection(userId: string): Promise<StoreEntity[]>;
  createCollection(userId: string, storeId: number): Promise<void>;
  deleteCollection(userId: string, storeId: number): Promise<void>;
}
