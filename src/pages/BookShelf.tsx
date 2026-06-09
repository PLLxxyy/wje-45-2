import { BookOpen, Plus, Library } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import type { Book } from '../types';
import { useBookStore } from '../store/useBookStore';
import { compressImage, validateImageFile } from '../utils/image';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export default function BookShelf() {
  const books = useBookStore(state => state.books);
  const isLoaded = useBookStore(state => state.isLoaded);
  const loadData = useBookStore(state => state.loadData);
  const addBook = useBookStore(state => state.addBook);
  const updateBook = useBookStore(state => state.updateBook);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadData();
    }
  }, [isLoaded, loadData]);

  useEffect(() => {
    if (showAddModal || editingBook) {
      if (editingBook) {
        setTitle(editingBook.title);
        setAuthor(editingBook.author);
        setCoverImage(editingBook.coverImage);
        setCoverPreview(editingBook.coverImage);
      } else {
        setTitle('');
        setAuthor('');
        setCoverImage('');
        setCoverPreview('');
      }
    }
  }, [showAddModal, editingBook]);

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!validateImageFile(file)) return;
    
    try {
      const compressed = await compressImage(file, 600, 0.9);
      setCoverImage(compressed);
      setCoverPreview(compressed);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('图片处理失败，请重试');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('请填写书名和作者');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingBook) {
        updateBook(editingBook.id, title.trim(), author.trim(), coverImage);
      } else {
        addBook(title.trim(), author.trim(), coverImage);
      }
      setShowAddModal(false);
      setEditingBook(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, author, coverImage, editingBook, updateBook, addBook]);

  const handleEdit = useCallback((book: Book) => {
    setEditingBook(book);
    setShowAddModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setEditingBook(null);
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sage-600 p-3 text-white shadow-lg">
              <Library className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-ink-800">我的书架</h1>
              <p className="text-ink-600">收集阅读中的灵感与思考</p>
            </div>
          </div>
        </header>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-full bg-paper-200 p-8">
              <BookOpen className="h-16 w-16 text-ink-400" />
            </div>
            <h2 className="mb-2 font-serif text-2xl font-semibold text-ink-800">
              书架还是空的
            </h2>
            <p className="mb-6 max-w-md text-ink-600">
              添加你的第一本书，开始记录阅读中那些让你心动的文字。
            </p>
            <Button size="lg" onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5" />
              添加书籍
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-ink-600">
                共 <span className="font-semibold text-ink-800">{books.length}</span> 本书
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                添加书籍
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={handleEdit}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingBook ? '编辑书籍' : '添加书籍'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">
              书名 <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
              placeholder="请输入书名"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">
              作者 <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
              placeholder="请输入作者"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">
              封面图片
            </label>
            <div className="flex gap-4">
              {coverPreview && (
                <div className="h-32 w-24 overflow-hidden rounded-lg bg-paper-200 shadow-book">
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-paper-300 bg-paper-50 hover:border-sage-500 hover:bg-sage-50/30 transition-colors">
                  <Plus className="mb-2 h-6 w-6 text-ink-400" />
                  <span className="text-sm text-ink-600">点击上传封面</span>
                  <span className="mt-1 text-xs text-ink-400">JPG/PNG, 10MB以内</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : editingBook ? '保存修改' : '添加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
