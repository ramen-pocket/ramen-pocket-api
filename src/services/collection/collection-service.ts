import { CollectionUsecase } from './collection-usecase';
import { StoreEntity } from '../../entities/store-entity';
import { CollectionRepository } from '../../repositories/collection/collection-repository';

export class CollectionService implements CollectionUsecase {
  public constructor(private readonly collectionRepository: CollectionRepository) {}

  async readStoresFromUserCollection(userId: string): Promise<StoreEntity[]> {
    return this.collectionRepository.readStoresFromUserCollection(userId);
  }

  async addStoreToUserCollection(userId: string, storeId: number): Promise<void> {
    return this.collectionRepository.createCollection(userId, storeId);
  }

  async deleteStoreFromUserCollection(userId: string, storeId: number): Promise<void> {
    return this.collectionRepository.deleteCollection(userId, storeId);
  }
}
