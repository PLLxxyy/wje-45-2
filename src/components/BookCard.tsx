import { BookOpen, Edit3, Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { useBookStore } from '../store/useBookStore';
import { Modal } from './Modal';
import { Button } from './Button';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  index: number;
}

export function BookCard({ book, onEdit, index }: BookCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteBook = useBookStore(state => state.deleteBook);
  const getExcerptsByBook = useBookStore(state => state.getExcerptsByBook);
  const getFavoriteCountByBook = useBookStore(state => state.getFavoriteCountByBook);
  const excerptCount = getExcerptsByBook(book.id).length;
  const favoriteCount = getFavoriteCountByBook(book.id);

  const handleDelete = () => {
    deleteBook(book.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className="group relative cursor-pointer rounded-xl bg-paper-50 shadow-book overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-float animate-fade-in-up"
        style={{ animationDelay: `${index * 80}ms` }}
        onClick={() => navigate(`/book/${book.id}`)}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage-500 to-sage-700">
              <BookOpen className="h-16 w-16 text-white/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(book);
              }}
              className="rounded-full bg-white/90 p-2 text-ink-700 shadow-md hover:bg-white transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="rounded-full bg-white/90 p-2 text-terracotta-500 shadow-md hover:bg-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            {excerptCount > 0 && (
              <div className="rounded-full bg-terracotta-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                {excerptCount} 条书摘
              </div>
            )}
            {favoriteCount > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                <Heart className="h-3 w-3 fill-current" />
                {favoriteCount}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-ink-800 line-clamp-1">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-ink-600 line-clamp-1">{book.author}</p>
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除书籍"
        size="sm"
      >
        <p className="text-ink-700">
          确定要删除《{book.title}》吗？这本书的所有书摘也会被删除，且无法恢复。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            确认删除
          </Button>
        </div>
      </Modal>
    </>
  );
}
