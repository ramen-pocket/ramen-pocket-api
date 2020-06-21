export namespace Schema {
  export interface User {
    id?: string;
    name?: string;
    avatar?: string;
    email?: string;
    points?: number;
    token?: string;
    expire?: string;
  }

  export interface Store {
    id?: number;
    name?: string;
    isDeleted?: number;
    address?: string;
    latitude?: number;
    longtitude?: number;
    rate?: number;
    featuredImage?: string;
  }

  export interface Image {
    url?: string;
    storeId?: number;
  }

  export interface BusinessHour {
    day?: number;
    storeId?: number;
    off?: number;
    begin?: number;
    end?: number;
  }

  export interface Course {
    name?: string;
    storeId?: number;
    price?: number;
    isRamen?: number;
  }

  export interface Collection {
    userId?: string;
    storeId?: number;
  }

  export interface Schedule {
    id?: number;
    userId?: string;
    storeId?: number;
    date?: string;
  }

  export interface Comment {
    id?: number;
    userId?: string;
    storeId?: number;
    content?: string;
    isDeleted?: number;
    rate?: number;
    publishedAt?: string;
  }

  export interface CommentedCourse {
    name?: string;
    commentId?: number;
  }

  export interface Tag {
    id: number;
    name: string;
  }

  export interface StoreTag {
    storeId: number;
    tagId: number;
  }
}
