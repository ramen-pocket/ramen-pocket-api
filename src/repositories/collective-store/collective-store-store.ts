import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { CollectiveStoreRepository } from './collective-store-repository';
import { CollectionSchema } from '../collection/collection-schema';

const SELECT_STORE_IDS_BY_USER_ID = `SELECT storeId FROM collections WHERE userId = ?`;

export class CollectiveStoreStore implements CollectiveStoreRepository {
  public constructor(private readonly queryAgent: QueryAgent) {}

  async readStoreIdCollectedByUser(userId: string): Promise<number[]> {
    const collections = await this.queryAgent.query<SelectQueryResult<CollectionSchema>>(
      SELECT_STORE_IDS_BY_USER_ID,
      [userId],
    );

    return collections.map((collection) => collection.storeId);
  }
}
