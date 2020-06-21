import { ProfileEntity } from './profile-entity';
import { CommentEntity } from './comment-entity';

export class UserProfileCommentGroupEntity {
  userProfile: ProfileEntity;
  comments: CommentEntity[];
}
