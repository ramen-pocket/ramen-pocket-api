import { Store } from '../../interfaces/store';
import { Record } from '../../interfaces/record';

export interface StoreCommentGroup {
  store: Store;
  records: Record[];
}

export interface Response {
  comments: StoreCommentGroup[];
}
