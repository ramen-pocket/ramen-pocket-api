import { CollectionUsecase } from './collection-usecase';
import { CollectiveStoreEntity } from '../../entities/collective-store-entity';
import { CollectionRepository } from '../../repositories/collection/collection-repository';
import { UserSessionReadable } from '../user-session/user-session';

export class CollectionService implements CollectionUsecase {
  public constructor(
    private readonly userSession: UserSessionReadable,
    private readonly collectionRepository: CollectionRepository,
  ) {}

  async readStoresFromUserCollection(userId: string): Promise<CollectiveStoreEntity[]> {
    const { userId: callerUserId } = this.userSession.getSessionData();
    return this.collectionRepository.readStoresFromUserCollection(callerUserId, userId);
  }

  async addStoreToUserCollection(userId: string, storeId: number): Promise<void> {
    return this.collectionRepository.createCollection(userId, storeId);
  }

  async deleteStoreFromUserCollection(userId: string, storeId: number): Promise<void> {
    return this.collectionRepository.deleteCollection(userId, storeId);
  }
}
