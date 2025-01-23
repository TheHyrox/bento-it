import { useState, useRef } from 'react';
import { Block as BlockType } from '@/lib/types';

interface BlockProps {
  block: BlockType;
  isEditable: boolean;
  onUpdateContent: (id: string, content: string) => void;
}

export default function Block({ block, isEditable, onUpdateContent }: BlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditable && block.type === 'text') {
      e.stopPropagation();
      setIsEditing(true);
      contentRef.current?.focus();
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      const newContent = contentRef.current?.innerText || '';
      if (newContent !== block.content) {
        onUpdateContent(block.id, newContent);
      }
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      contentRef.current?.blur();
    }
  };

  return (
    <div 
      className={`relative w-full h-full rounded-lg p-4 transition-all duration-200
        border border-white/10 hover:border-white/20
        ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${isEditable && block.type === 'text' ? 'cursor-text' : ''}`
      }
      style={block.style}
      onDoubleClick={handleDoubleClick}
    >
      {block.type === 'text' ? (
        <div
          ref={contentRef}
          contentEditable={isEditable && isEditing}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning
          className="w-full h-full outline-none text-white/80"
        >
          {block.content}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/80">
          {block.type}
        </div>
      )}
    </div>
  );
}