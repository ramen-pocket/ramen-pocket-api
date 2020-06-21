export class CommentSchema {
  id?: number;
  userId?: string;
  storeId?: number;
  content?: string;
  isDeleted?: number;
  rate?: number;
  publishedAt?: Date;
}

export class CommentedCourseSchema {
  name?: string;
  commentId?: number;
}
