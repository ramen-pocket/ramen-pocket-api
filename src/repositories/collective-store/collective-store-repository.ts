export interface CollectiveStoreRepository {
  readStoreIdCollectedByUser(userId: string): Promise<number[]>;
}
