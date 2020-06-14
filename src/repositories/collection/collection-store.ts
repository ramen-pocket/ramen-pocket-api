import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { StoreEntity } from '../../entities/store-entity';
import { ResourceNotFound, ResourceCreationConflict } from '../../errors/service-error';
import { UserRepository } from '../user/user-repository';
import { StoreRepository } from '../store/store-repository';
import { CollectionRepository } from './collection-repository';
import { CollectionSchema } from './collection-schema';
import { Counter } from '../../utils/database-connection';
import { OkPacket } from '../../database/ok-packet';

const SQL_SELECT_STORE_IDS_BY_USER_ID = `SELECT storeId FROM collections WHERE userId = ?`;
const SQL_CHECK_COLLECTION_EXIST = `SELECT COUNT(*) AS count FROM collections WHERE userId = ? AND storeId = ?`;
const SQL_INSERT_COLLECTION = `INSERT INTO collections VALUES (?, ?)`;
const SQL_DELETE_COLLECTION = `DELETE FROM collections WHERE userId = ? AND storeId = ?`;

export class CollectionStore implements CollectionRepository {
  public constructor(
    private readonly queryAgent: QueryAgent,
    private readonly userRepository: UserRepository,
    private readonly storeRepository: StoreRepository,
  ) {}

  async readStoresFromUserCollection(userId: string): Promise<StoreEntity[]> {
    if (!(await this.userRepository.checkIdExistence(userId))) {
      throw new ResourceNotFound('The target user does not exist.');
    }

    const collections = await this.queryAgent.query<SelectQueryResult<CollectionSchema>>(
      SQL_SELECT_STORE_IDS_BY_USER_ID,
      [userId],
    );

    const storeIds = collections.map((collection) => collection.storeId);
    return this.storeRepository.readManyByIds(storeIds);
  }

  private async checkRecordExistenceByIds(userId: string, storeId: number): Promise<boolean> {
    const [counter] = await this.queryAgent.query<SelectQueryResult<Counter>>(
      SQL_CHECK_COLLECTION_EXIST,
      [userId, storeId],
    );
    return counter.count > 0;
  }

  async createCollection(userId: string, storeId: number): Promise<void> {
    if (!(await this.userRepository.checkIdExistence(userId))) {
      throw new ResourceNotFound('The user does not exist.');
    }

    if (!(await this.storeRepository.checkIdExistence(storeId))) {
      throw new ResourceNotFound('The store does not exist.');
    }

    if (!(await this.checkRecordExistenceByIds(userId, storeId))) {
      throw new ResourceCreationConflict('The collection has already existed.');
    }

    await this.queryAgent.query(SQL_INSERT_COLLECTION, [userId, storeId]);
  }

  async deleteCollection(userId: string, storeId: number): Promise<void> {
    const result = await this.queryAgent.query<OkPacket>(SQL_DELETE_COLLECTION, [userId, storeId]);
    if (result.affectedRows < 1) {
      throw new ResourceNotFound('The collection does not exist.');
    }
  }
}
