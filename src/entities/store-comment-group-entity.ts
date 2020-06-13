import { StoreEntity } from './store-entity';
import { CommentEntity } from './comment-entity';

export class StoreCommentGroupEntity {
  store: StoreEntity;
  comments: CommentEntity[];
}
