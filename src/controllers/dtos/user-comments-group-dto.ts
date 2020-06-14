import { ProfileDto } from './profile-dto';
import { CommentDto } from './comment-dto';

export class UserCommentsGroupDto {
  user: ProfileDto;
  records: CommentDto[];
}
