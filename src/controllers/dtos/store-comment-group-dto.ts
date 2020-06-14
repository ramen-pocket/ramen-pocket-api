import { StoreDto } from './store-dto';
import { CommentDto } from './comment-dto';

export class StoreCommentGroupDto {
  store: StoreDto;
  records: CommentDto[];
}
