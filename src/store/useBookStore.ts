import { create } from 'zustand';
import type { Book, Excerpt, SortType } from '../types';
import { loadBooks, loadExcerpts, saveBooks, saveExcerpts, generateId } from '../utils/storage';

interface BookStore {
  books: Book[];
  excerpts: Excerpt[];
  searchQuery: string;
  activeTags: string[];
  sortType: SortType;
  showFavoritesOnly: boolean;
  isLoaded: boolean;
  
  loadData: () => void;
  
  addBook: (title: string, author: string, coverImage: string) => Book;
  updateBook: (id: string, title: string, author: string, coverImage: string) => void;
  deleteBook: (id: string) => void;
  getBook: (id: string) => Book | undefined;
  
  addExcerpt: (excerpt: Omit<Excerpt, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => Excerpt;
  updateExcerpt: (id: string, data: Partial<Excerpt>) => void;
  deleteExcerpt: (id: string) => void;
  getExcerpt: (id: string) => Excerpt | undefined;
  getExcerptsByBook: (bookId: string) => Excerpt[];
  
  toggleFavorite: (id: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  getFavoriteCountByBook: (bookId: string) => number;
  
  setSearchQuery: (query: string) => void;
  setActiveTags: (tags: string[]) => void;
  setSortType: (sort: SortType) => void;
  
  getAllTags: () => string[];
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  excerpts: [],
  searchQuery: '',
  activeTags: [],
  sortType: 'date-desc',
  showFavoritesOnly: false,
  isLoaded: false,

  loadData: () => {
    const books = loadBooks();
    const excerpts = loadExcerpts();
    set({ books, excerpts, isLoaded: true });
  },

  addBook: (title, author, coverImage) => {
    const now = new Date().toISOString();
    const newBook: Book = {
      id: generateId(),
      title,
      author,
      coverImage,
      createdAt: now,
      updatedAt: now,
    };
    const books = [...get().books, newBook];
    set({ books });
    saveBooks(books);
    return newBook;
  },

  updateBook: (id, title, author, coverImage) => {
    const books = get().books.map(book =>
      book.id === id
        ? { ...book, title, author, coverImage, updatedAt: new Date().toISOString() }
        : book
    );
    set({ books });
    saveBooks(books);
  },

  deleteBook: (id) => {
    const books = get().books.filter(book => book.id !== id);
    const excerpts = get().excerpts.filter(excerpt => excerpt.bookId !== id);
    set({ books, excerpts });
    saveBooks(books);
    saveExcerpts(excerpts);
  },

  getBook: (id) => get().books.find(book => book.id === id),

  addExcerpt: (excerptData) => {
    const now = new Date().toISOString();
    const newExcerpt: Excerpt = {
      id: generateId(),
      ...excerptData,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    const excerpts = [...get().excerpts, newExcerpt];
    set({ excerpts });
    saveExcerpts(excerpts);
    return newExcerpt;
  },

  updateExcerpt: (id, data) => {
    const excerpts = get().excerpts.map(excerpt =>
      excerpt.id === id
        ? { ...excerpt, ...data, updatedAt: new Date().toISOString() }
        : excerpt
    );
    set({ excerpts });
    saveExcerpts(excerpts);
  },

  deleteExcerpt: (id) => {
    const excerpts = get().excerpts.filter(excerpt => excerpt.id !== id);
    set({ excerpts });
    saveExcerpts(excerpts);
  },

  getExcerpt: (id) => get().excerpts.find(excerpt => excerpt.id === id),

  getExcerptsByBook: (bookId) => get().excerpts.filter(e => e.bookId === bookId),

  toggleFavorite: (id) => {
    const excerpts = get().excerpts.map(excerpt =>
      excerpt.id === id
        ? { ...excerpt, isFavorite: !excerpt.isFavorite, updatedAt: new Date().toISOString() }
        : excerpt
    );
    set({ excerpts });
    saveExcerpts(excerpts);
  },

  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  getFavoriteCountByBook: (bookId) => 
    get().excerpts.filter(e => e.bookId === bookId && e.isFavorite).length,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTags: (tags) => set({ activeTags: tags }),
  setSortType: (sort) => set({ sortType: sort }),

  getAllTags: () => {
    const tagSet = new Set<string>();
    get().excerpts.forEach(excerpt => {
      excerpt.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },
}));
