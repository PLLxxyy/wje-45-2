import type { Book, Excerpt } from '../types';

const BOOKS_KEY = 'bookexcerpt_books';
const EXCERPTS_KEY = 'bookexcerpt_excerpts';

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save books:', e);
    alert('存储空间不足，请删除一些旧数据后重试');
  }
}

export function loadBooks(): Book[] {
  try {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load books:', e);
    return [];
  }
}

export function saveExcerpts(excerpts: Excerpt[]): void {
  try {
    localStorage.setItem(EXCERPTS_KEY, JSON.stringify(excerpts));
  } catch (e) {
    console.error('Failed to save excerpts:', e);
    alert('存储空间不足，请删除一些旧数据后重试');
  }
}

export function loadExcerpts(): Excerpt[] {
  try {
    const data = localStorage.getItem(EXCERPTS_KEY);
    if (!data) return [];
    const excerpts = JSON.parse(data);
    return excerpts.map((excerpt: Excerpt) => ({
      isFavorite: false,
      ...excerpt,
    }));
  } catch (e) {
    console.error('Failed to load excerpts:', e);
    return [];
  }
}

export function clearAllData(): void {
  localStorage.removeItem(BOOKS_KEY);
  localStorage.removeItem(EXCERPTS_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
