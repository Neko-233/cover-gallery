export interface Cover {
  id: string;
  filename: string;
  title?: string;
  source?: string;
  url: string;
  pageUrl?: string;
  liked?: boolean;
  likesCount?: number;
}
