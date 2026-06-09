import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, onRemove, onClick, active, size = 'md' }: TagBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200',
        sizeClasses,
        active
          ? 'bg-sage-600 text-white shadow-sm'
          : 'bg-sage-50 text-sage-700 hover:bg-sage-100',
        onClick && 'cursor-pointer',
        'select-none'
      )}
    >
      <span className="font-sans">{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-white/30 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
