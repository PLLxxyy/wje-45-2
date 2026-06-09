export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface Excerpt {
  id: string;
  bookId: string;
  pageNumber: string;
  date: string;
  content: string;
  thought: string;
  originalImage: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SortType = 'date-desc' | 'date-asc' | 'page-desc' | 'page-asc';

export const PRESET_TAGS = ['共鸣', '方法论', '金句', '待重读', '行动项', '观点', '故事'];

export interface AppState {
  books: Book[];
  excerpts: Excerpt[];
  activeBookId: string | null;
  searchQuery: string;
  activeTags: string[];
  sortType: SortType;
  showFavoritesOnly: boolean;
}

export interface OCRProgress {
  status: 'loading' | 'recognizing' | 'done' | 'error';
  progress: number;
  message: string;
}
