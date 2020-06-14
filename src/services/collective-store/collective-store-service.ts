import { StoreEntity } from '../../entities/store-entity';
import { CollectiveStoreEntity } from '../../entities/collective-store-entity';
import { CollectiveStoreRepository } from '../../repositories/collective-store/collective-store-repository';
import { CollectiveStoreUsecase } from './collective-store-usecase';

export class CollectiveStoreService implements CollectiveStoreUsecase {
  public constructor(private readonly collectiveStoreRepository: CollectiveStoreRepository) {}

  async tranfromToCollectiveStore(
    stores: StoreEntity[],
    userId: string,
  ): Promise<CollectiveStoreEntity[]> {
    const collectedStoreIds = await this.collectiveStoreRepository.readStoreIdCollectedByUser(
      userId,
    );
    const collectedStoreIdSet = new Set<number>();
    collectedStoreIds.forEach(collectedStoreIdSet.add);

    return stores.map((store) => ({
      ...store,
      isCollected: collectedStoreIdSet.has(store.id),
    }));
  }
}
