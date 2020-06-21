import { StoreCommentGroupEntity } from '../../entities/store-comment-group-entity';
import { UserProfileCommentGroupEntity } from '../../entities/user-profile-comment-group-entity';
import { NewCommentEntity } from '../../entities/new-comment-entity';
import { UpdatedCommentEntity } from '../../entities/updated-comment-entity';

export interface CommentRepository {
  readManyGroupedByStoreByUserId(userId: string): Promise<StoreCommentGroupEntity[]>;
  readManyGroupedByUserByStoreId(
    storeId: number,
    limit: number,
    skip: number,
  ): Promise<UserProfileCommentGroupEntity[]>;
  createOne(newComment: NewCommentEntity): Promise<number>;
  updateOne(updatedComment: UpdatedCommentEntity): Promise<void>;
  deleteOne(id: number, userId: string, storeId: number): Promise<void>;
}
