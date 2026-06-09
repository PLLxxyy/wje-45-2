import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  Download,
  FileText,
  Plus,
  Search,
  Tag as TagIcon,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SortType } from '../types';
import { PRESET_TAGS } from '../types';
import { useBookStore } from '../store/useBookStore';
import { filterExcerpts, generateMarkdown, downloadMarkdown, sortExcerpts, formatDate } from '../utils/export';
import { ExcerptCard } from '../components/ExcerptCard';
import { TagBadge } from '../components/TagBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export default function ExcerptList() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { 
    getBook, 
    getExcerptsByBook, 
    searchQuery, 
    setSearchQuery,
    activeTags, 
    setActiveTags,
    sortType, 
    setSortType,
    getAllTags,
    loadData,
    isLoaded
  } = useBookStore();

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadData();
    }
  }, [isLoaded, loadData]);

  const book = bookId ? getBook(bookId) : undefined;
  const allExcerpts = bookId ? getExcerptsByBook(bookId) : [];
  const allTags = getAllTags();

  const filteredExcerpts = useMemo(() => {
    const filtered = filterExcerpts(allExcerpts, searchQuery, activeTags);
    return sortExcerpts(filtered, sortType);
  }, [allExcerpts, searchQuery, activeTags, sortType]);

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'date-desc', label: '日期 · 最新在前' },
    { value: 'date-asc', label: '日期 · 最早在前' },
    { value: 'page-asc', label: '页码 · 从小到大' },
    { value: 'page-desc', label: '页码 · 从大到小' },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortType)?.label || '排序';

  const handleExport = () => {
    if (!book) return;
    const md = generateMarkdown(book, allExcerpts, sortType);
    const filename = `${book.title}-书摘`;
    downloadMarkdown(md, filename);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTags([]);
  };

  const showPageNumber = sortType.startsWith('page');

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

  const hasFilters = searchQuery || activeTags.length > 0;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-2 text-ink-600 hover:text-ink-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回书架
          </button>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {book.coverImage && (
                <div className="h-16 w-12 overflow-hidden rounded-lg shadow-book">
                  <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="font-serif text-2xl font-semibold text-ink-800">{book.title}</h1>
                <p className="text-ink-600">{book.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-600">
                共 {allExcerpts.length} 条书摘
              </span>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-30 -mx-4 mb-6 bg-paper-100/90 px-4 py-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索书摘、感想、标签..."
                className="w-full rounded-xl border border-paper-300 bg-paper-50 py-2.5 pl-10 pr-4 text-sm text-ink-800 placeholder-ink-400 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <ArrowUpDown className="h-4 w-4" />
                {currentSortLabel}
              </Button>
              {showSortMenu && (
                <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl bg-paper-50 shadow-float animate-fade-in-up">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortType(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-paper-100 ${
                        sortType === option.value ? 'bg-sage-50 text-sage-700 font-medium' : 'text-ink-700'
                      }`}
                    >
                      {option.value.startsWith('date') ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTagFilter(!showTagFilter)}
            >
              <TagIcon className="h-4 w-4" />
              标签
              {activeTags.length > 0 && (
                <span className="ml-1 rounded-full bg-sage-600 px-1.5 py-0.5 text-xs text-white">
                  {activeTags.length}
                </span>
              )}
            </Button>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                清除筛选
              </Button>
            )}

            <div className="ml-auto flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={allExcerpts.length === 0}
              >
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/book/${bookId}/new`)}
              >
                <Plus className="h-4 w-4" />
                新书摘
              </Button>
            </div>
          </div>

          {showTagFilter && (
            <div className="mt-3 rounded-xl bg-paper-50 p-4 shadow-card animate-fade-in">
              <p className="mb-3 text-sm font-medium text-ink-700">
                选择标签筛选
              </p>
              <div className="flex flex-wrap gap-2">
                {[...PRESET_TAGS, ...allTags.filter(t => !PRESET_TAGS.includes(t))].map(tag => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    active={activeTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
                {allTags.length === 0 && PRESET_TAGS.length === 0 && (
                  <p className="text-sm text-ink-400">还没有添加任何标签</p>
                )}
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <div className="mb-4 text-sm text-ink-600">
            找到 <span className="font-semibold text-ink-800">{filteredExcerpts.length}</span> 条匹配的书摘
            {activeTags.length > 0 && (
              <span className="ml-2">
                （标签：{activeTags.join('、')}）
              </span>
            )}
          </div>
        )}

        {filteredExcerpts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {hasFilters ? (
              <>
                <Search className="mb-4 h-12 w-12 text-ink-300" />
                <h2 className="mb-2 font-serif text-xl font-semibold text-ink-800">
                  没有找到匹配的书摘
                </h2>
                <p className="text-ink-600">试试调整搜索条件或清除筛选</p>
              </>
            ) : (
              <>
                <FileText className="mb-4 h-12 w-12 text-ink-300" />
                <h2 className="mb-2 font-serif text-xl font-semibold text-ink-800">
                  还没有书摘
                </h2>
                <p className="mb-6 text-ink-600">上传书页照片，开始记录第一条书摘</p>
                <Button onClick={() => navigate(`/book/${bookId}/new`)}>
                  <Plus className="h-4 w-4" />
                  添加第一条书摘
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            {!showPageNumber && (
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-paper-200" />
            )}
            
            <div className={!showPageNumber ? 'space-y-6 pl-16' : 'space-y-6'}>
              {filteredExcerpts.map((excerpt, index) => {
                const showDate = !showPageNumber && (
                  index === 0 || 
                  formatDate(excerpt.date) !== formatDate(filteredExcerpts[index - 1].date)
                );
                
                return (
                  <div key={excerpt.id} className="relative">
                    {!showPageNumber && showDate && (
                      <div className="absolute -left-16 top-6 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-terracotta-500 shadow-md" />
                        <span className="whitespace-nowrap text-sm font-medium text-ink-600">
                          {formatDate(excerpt.date)}
                        </span>
                      </div>
                    )}
                    <ExcerptCard
                      excerpt={excerpt}
                      showPageNumber={showPageNumber}
                      index={index}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="导出成功"
        size="sm"
      >
        <p className="text-ink-700">
          《{book.title}》的书摘已导出为 Markdown 文件并开始下载。
        </p>
      </Modal>
    </div>
  );
}
