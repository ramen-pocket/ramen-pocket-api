import { Profile } from '../../interfaces/profile';
import { Record } from '../../interfaces/record';

export interface CommentInfo {
  user: Profile;
  records: Record[];
}

export interface Response {
  comments: CommentInfo[];
}
