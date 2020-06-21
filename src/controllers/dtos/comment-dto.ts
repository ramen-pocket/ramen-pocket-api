import { CommentEntity } from '../../entities/comment-entity';

export class CommentDto {
  id: number;
  content: string;
  courses: string[];
  rate: number;
  publishedAt: string;

  static transformFromCommentEntity(comment: CommentEntity): CommentDto {
    return {
      ...comment,
      publishedAt: comment.publishedAt.toISOString(),
    };
  }
}
