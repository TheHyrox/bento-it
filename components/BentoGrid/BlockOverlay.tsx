'use client';

import { Block, BlockType } from '@/lib/types';
import { useEffect, useRef } from 'react';

interface BlockOverlayProps {
  block: Block;
  onClose: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

export default function BlockOverlay({ block, onClose, onUpdate, onDelete }: BlockOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={overlayRef} className="bg-neutral-900 p-6 rounded-lg w-[500px]">
        <h3 className="text-xl mb-4">Edit Block</h3>
        
        {/* Block Type */}
        <div className="mb-4">
          <label className="block mb-2">Type</label>
          <select
            value={block.type}
            onChange={(e) => onUpdate({ type: e.target.value as BlockType })}
            className="w-full bg-neutral-800 p-2 rounded"
            disabled={block.isCenter}
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block mb-2">Content</label>
          {block.type === 'text' ? (
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full bg-neutral-800 p-2 rounded min-h-[100px]"
            />
          ) : (
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder={`Enter ${block.type} URL`}
              className="w-full bg-neutral-800 p-2 rounded"
            />
          )}
        </div>

        {/* Size Controls */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Width</label>
            <input
              type="number"
              min="1"
              max="11"
              value={block.position.w}
              onChange={(e) => onUpdate({
                position: { ...block.position, w: Number(e.target.value) }
              })}
              className="w-full bg-neutral-800 p-2 rounded"
              disabled={block.isCenter}
            />
          </div>
          <div>
            <label className="block mb-2">Height</label>
            <input
              type="number"
              min="1"
              max="7"
              value={block.position.h}
              onChange={(e) => onUpdate({
                position: { ...block.position, h: Number(e.target.value) }
              })}
              className="w-full bg-neutral-800 p-2 rounded"
              disabled={block.isCenter}
            />
          </div>
        </div>

        {/* Colors */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Background Color</label>
            <input
              type="color"
              value={block.style.backgroundColor}
              onChange={(e) => onUpdate({
                style: { ...block.style, backgroundColor: e.target.value }
              })}
              className="w-full h-10 bg-neutral-800 rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Text Color</label>
            <input
              type="color"
              value={block.style.textColor}
              onChange={(e) => onUpdate({
                style: { ...block.style, textColor: e.target.value }
              })}
              className="w-full h-10 bg-neutral-800 rounded"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600"
          >
            Close
          </button>
          {!block.isCenter && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
            >
              Delete Block
            </button>
          )}
        </div>
      </div>
    </div>
  );
}