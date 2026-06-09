import type { Book, Excerpt, SortType } from '../types';

export function sortExcerpts(excerpts: Excerpt[], sortType: SortType): Excerpt[] {
  const sorted = [...excerpts];
  
  switch (sortType) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'page-desc':
      return sorted.sort((a, b) => {
        const pageA = parseInt(a.pageNumber) || 0;
        const pageB = parseInt(b.pageNumber) || 0;
        return pageB - pageA;
      });
    case 'page-asc':
      return sorted.sort((a, b) => {
        const pageA = parseInt(a.pageNumber) || 0;
        const pageB = parseInt(b.pageNumber) || 0;
        return pageA - pageB;
      });
    default:
      return sorted;
  }
}

export function filterExcerpts(
  excerpts: Excerpt[],
  searchQuery: string,
  activeTags: string[]
): Excerpt[] {
  return excerpts.filter(excerpt => {
    const matchesSearch = !searchQuery || 
      excerpt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.thought.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = activeTags.length === 0 || 
      activeTags.every(tag => excerpt.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
}

export function generateMarkdown(book: Book, excerpts: Excerpt[], sortType: SortType): string {
  const sortedExcerpts = sortExcerpts(excerpts, sortType);
  const today = new Date().toLocaleDateString('zh-CN');
  
  let md = `# 《${book.title}》\n\n`;
  md += `> 作者：${book.author}\n`;
  md += `> 导出日期：${today}\n`;
  md += `> 共 ${sortedExcerpts.length} 条书摘\n\n`;
  md += `---\n\n`;
  
  sortedExcerpts.forEach((excerpt, index) => {
    md += `## 书摘 ${index + 1}\n\n`;
    md += `- **页码**：第 ${excerpt.pageNumber} 页\n`;
    md += `- **日期**：${excerpt.date}\n`;
    if (excerpt.tags.length > 0) {
      md += `- **标签**：${excerpt.tags.map(t => `\`${t}\``).join(' ')}\n`;
    }
    md += '\n';
    md += `### 原文\n\n`;
    const lines = excerpt.content.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      md += `> ${line}\n`;
    });
    md += '\n';
    if (excerpt.thought.trim()) {
      md += `### 感想\n\n`;
      md += `*${excerpt.thought.trim()}*\n\n`;
    }
    md += `---\n\n`;
  });
  
  return md;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function todayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
