import { StoreEntity } from '../../entities/store-entity';
import { CollectiveStoreEntity } from '../../entities/collective-store-entity';

export interface CollectiveStoreUsecase {
  tranfromToCollectiveStore(
    stores: StoreEntity[],
    userId: string,
  ): Promise<CollectiveStoreEntity[]>;
}
