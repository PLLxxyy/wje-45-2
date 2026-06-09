import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Scan,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { OCRProgress } from '../types';
import { PRESET_TAGS } from '../types';
import { useBookStore } from '../store/useBookStore';
import { recognizeText } from '../utils/ocr';
import { compressImage, validateImageFile } from '../utils/image';
import { todayString } from '../utils/export';
import { TagBadge } from '../components/TagBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export default function ExcerptEditor() {
  const { bookId, excerptId } = useParams<{ bookId: string; excerptId: string }>();
  const navigate = useNavigate();
  const isEditing = !!excerptId;
  
  const {
    getBook,
    getExcerpt,
    addExcerpt,
    updateExcerpt,
    getAllTags,
    loadData,
    isLoaded
  } = useBookStore();

  const [pageNumber, setPageNumber] = useState('');
  const [date, setDate] = useState(todayString());
  const [content, setContent] = useState('');
  const [thought, setThought] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [originalImage, setOriginalImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const book = bookId ? getBook(bookId) : undefined;
  const existingExcerpt = isEditing && excerptId ? getExcerpt(excerptId) : undefined;
  const allTags = getAllTags();

  useEffect(() => {
    if (!isLoaded) {
      loadData();
    }
  }, [isLoaded, loadData]);

  useEffect(() => {
    if (existingExcerpt) {
      setPageNumber(existingExcerpt.pageNumber);
      setDate(existingExcerpt.date);
      setContent(existingExcerpt.content);
      setThought(existingExcerpt.thought);
      setTags(existingExcerpt.tags);
      setOriginalImage(existingExcerpt.originalImage);
      setImagePreview(existingExcerpt.originalImage);
    }
  }, [existingExcerpt]);

  const handleImageUpload = async (file: File) => {
    if (!validateImageFile(file)) return;
    
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      setOriginalImage(compressed);
      setImagePreview(compressed);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('图片处理失败，请重试');
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
  };

  const handleOCR = async () => {
    if (!originalImage) {
      alert('请先上传图片');
      return;
    }
    
    try {
      const text = await recognizeText(originalImage, (progress) => {
        setOcrProgress(progress);
      });
      setContent(text);
    } catch (err) {
      console.error('OCR failed:', err);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pageNumber.trim()) {
      alert('请填写页码');
      return;
    }
    if (!content.trim()) {
      alert('请填写书摘内容');
      return;
    }
    if (!bookId) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing && excerptId) {
        updateExcerpt(excerptId, {
          pageNumber: pageNumber.trim(),
          date,
          content: content.trim(),
          thought: thought.trim(),
          tags,
          originalImage,
        });
      } else {
        addExcerpt({
          bookId,
          pageNumber: pageNumber.trim(),
          date,
          content: content.trim(),
          thought: thought.trim(),
          tags,
          originalImage,
        });
      }
      navigate(`/book/${bookId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (excerptId) {
      useBookStore.getState().deleteExcerpt(excerptId);
      navigate(`/book/${bookId}`);
    }
  };

  const removeImage = () => {
    setOriginalImage('');
    setImagePreview('');
    setOcrProgress(null);
  };

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-ink-600 mb-4">找不到这本书</p>
          <Button onClick={() => navigate('/')}>返回书架</Button>
        </div>
      </div>
    );
  }

  const availableTags = [...new Set([...PRESET_TAGS, ...allTags])];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <button
          onClick={() => navigate(`/book/${bookId}`)}
          className="mb-6 inline-flex items-center gap-2 text-ink-600 hover:text-ink-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回书摘列表
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            {book.coverImage && (
              <div className="h-14 w-10 overflow-hidden rounded-lg shadow-book">
                <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl font-semibold text-ink-800">
                {isEditing ? '编辑书摘' : '添加书摘'}
              </h1>
              <p className="text-ink-600">《{book.title}》 - {book.author}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-paper-50 p-6 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-ink-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-sage-600" />
              书页照片
            </h2>
            
            {!imagePreview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-sage-500 bg-sage-50/50'
                    : 'border-paper-300 hover:border-sage-400 hover:bg-paper-100'
                }`}
              >
                <Upload className="mx-auto mb-3 h-10 w-10 text-ink-400" />
                <p className="mb-1 text-ink-700 font-medium">
                  拖拽图片到这里，或
                  <label className="ml-1 cursor-pointer text-sage-600 hover:text-sage-700 font-medium">
                    点击上传
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-ink-400">支持 JPG、PNG、WebP 格式，最大 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative rounded-xl overflow-hidden bg-paper-100">
                    <img
                      src={imagePreview}
                      alt="书页预览"
                      className="w-full max-h-[300px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center rounded-xl bg-paper-100 p-6">
                    {ocrProgress ? (
                      <div className="w-full">
                        <p className="mb-2 text-center text-sm text-ink-600">
                          {ocrProgress.message}
                        </p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-paper-200">
                          <div
                            className="h-full rounded-full bg-sage-500 transition-all duration-300"
                            style={{ width: `${ocrProgress.progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-center text-xs text-ink-400">
                          {Math.round(ocrProgress.progress)}%
                        </p>
                      </div>
                    ) : (
                      <>
                        <Scan className="mb-3 h-10 w-10 text-sage-500" />
                        <p className="mb-4 text-center text-ink-600">
                          点击按钮识别图片中的文字<br />
                          <span className="text-sm text-ink-400">支持中文和英文</span>
                        </p>
                        <Button type="button" onClick={handleOCR}>
                          <Scan className="h-4 w-4" />
                          开始识别
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700">
                页码 <span className="text-terracotta-500">*</span>
              </label>
              <input
                type="text"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
                placeholder="例如：42"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700">
                日期 <span className="text-terracotta-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-paper-50 p-6 shadow-card">
            <label className="mb-3 block text-sm font-medium text-ink-700">
              书摘内容 <span className="text-terracotta-500">*</span>
              <span className="ml-2 text-xs font-normal text-ink-400">
                （OCR识别后可手动修正）
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 font-serif text-lg leading-relaxed text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors scrollbar-thin"
              placeholder="在这里输入或粘贴书摘内容..."
            />
          </div>

          <div className="rounded-2xl bg-paper-50 p-6 shadow-card">
            <label className="mb-3 block text-sm font-medium text-ink-700">
              个人感想
              <span className="ml-2 text-xs font-normal text-ink-400">（可选）</span>
            </label>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 text-ink-700 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors scrollbar-thin"
              placeholder="写下你的感想、思考、联想..."
            />
          </div>

          <div className="rounded-2xl bg-paper-50 p-6 shadow-card">
            <label className="mb-3 block text-sm font-medium text-ink-700">
              标签
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  active={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="flex-1 rounded-xl border border-paper-300 bg-paper-50 px-4 py-2 text-sm text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
                placeholder="添加自定义标签..."
              />
              <Button type="button" size="sm" onClick={addCustomTag} disabled={!customTag.trim()}>
                <Plus className="h-4 w-4" />
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-ink-500">已选：</span>
                {tags.map(tag => (
                  <TagBadge key={tag} tag={tag} active onRemove={() => toggleTag(tag)} />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-paper-200 pt-6">
            {isEditing ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/book/${bookId}`)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : isEditing ? '保存修改' : '保存书摘'}
              </Button>
            </div>
          </div>
        </form>
      </div>

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
    </div>
  );
}
