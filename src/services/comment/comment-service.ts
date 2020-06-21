import { CommentUsecase } from './comment-usecase';
import { CommentRepository } from '../../repositories/comment/comment-repository';
import { NewCommentEntity } from '../../entities/new-comment-entity';
import { UpdatedCommentEntity } from '../../entities/updated-comment-entity';
import { UserProfileCommentGroupEntity } from '../../entities/user-profile-comment-group-entity';
import { StoreCommentGroupEntity } from '../../entities/store-comment-group-entity';

export class CommentService implements CommentUsecase {
  public constructor(private readonly commentRepository: CommentRepository) {}

  async readManyGroupedByUserByStoreId(
    storeId: number,
    limit: number,
    skip: number,
  ): Promise<UserProfileCommentGroupEntity[]> {
    return this.commentRepository.readManyGroupedByUserByStoreId(storeId, limit, skip);
  }

  async readManyGroupedByStoreByUserId(userId: string): Promise<StoreCommentGroupEntity[]> {
    return this.commentRepository.readManyGroupedByStoreByUserId(userId);
  }

  async createOne(newComment: NewCommentEntity): Promise<number> {
    return this.commentRepository.createOne(newComment);
  }

  async updateOne(updatedComment: UpdatedCommentEntity): Promise<void> {
    return this.commentRepository.updateOne(updatedComment);
  }

  async deleteOne(id: number, userId: string, storeId: number): Promise<void> {
    return this.commentRepository.deleteOne(id, userId, storeId);
  }
}
