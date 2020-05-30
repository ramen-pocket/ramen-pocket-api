export interface Record {
  id: number;
  isDeleted: boolean;
  content: string;
  courses: string[];
  rate: number;
  publishedAt: string;
}
