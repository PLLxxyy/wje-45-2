import { Calendar, Edit3, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Excerpt } from '../types';
import { useBookStore } from '../store/useBookStore';
import { formatDate } from '../utils/export';
import { TagBadge } from './TagBadge';
import { Modal } from './Modal';
import { Button } from './Button';

interface ExcerptCardProps {
  excerpt: Excerpt;
  showPageNumber?: boolean;
  index: number;
}

export function ExcerptCard({ excerpt, showPageNumber = false, index }: ExcerptCardProps) {
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteExcerpt = useBookStore(state => state.deleteExcerpt);

  const handleDelete = () => {
    deleteExcerpt(excerpt.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className="group relative rounded-2xl bg-paper-50 p-6 shadow-card transition-all duration-300 hover:shadow-float animate-fade-in-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {showPageNumber && (
              <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-500/10 px-3 py-1 text-sm font-medium text-terracotta-500">
                <FileText className="h-4 w-4" />
                第 {excerpt.pageNumber} 页
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-ink-600">
              <Calendar className="h-4 w-4" />
              {formatDate(excerpt.date)}
            </span>
          </div>
          <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {excerpt.originalImage && (
              <button
                onClick={() => setShowImage(true)}
                className="rounded-full p-2 text-ink-600 hover:bg-paper-200 transition-colors"
                title="查看原图"
              >
                <FileText className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => navigate(`/book/${excerpt.bookId}/edit/${excerpt.id}`)}
              className="rounded-full p-2 text-ink-600 hover:bg-paper-200 transition-colors"
              title="编辑"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full p-2 text-terracotta-500 hover:bg-terracotta-500/10 transition-colors"
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {excerpt.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {excerpt.tags.map(tag => (
              <TagBadge key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        <div className="border-l-4 border-sage-500 pl-4">
          <p className="font-serif text-lg leading-relaxed text-ink-800 whitespace-pre-wrap">
            {excerpt.content}
          </p>
        </div>

        {excerpt.thought && (
          <div className="mt-4 rounded-xl bg-paper-100 p-4">
            <p className="text-sm italic text-ink-600 leading-relaxed">
              💭 {excerpt.thought}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showImage}
        onClose={() => setShowImage(false)}
        title="书页原图"
        size="lg"
      >
        {excerpt.originalImage && (
          <img
            src={excerpt.originalImage}
            alt="书页原图"
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />
        )}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除书摘"
        size="sm"
      >
        <p className="text-ink-700">确定要删除这条书摘吗？删除后无法恢复。</p>
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
