'use client';

import { Block as BlockType } from '@/lib/types';
import Image from 'next/image';

interface BlockProps {
  block: BlockType;
  isEditable: boolean;
}

export default function Block({ block, isEditable }: BlockProps) {
  const renderContent = () => {
    switch (block.type) {
      case 'image':
        return block.content ? (
          <Image
            src={block.content}
            alt=""
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Drop image here
          </div>
        );
      case 'video':
        return block.content ? (
          <iframe
            src={block.content}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Add video URL
          </div>
        );
      case 'link':
        return (
          <a 
            href={block.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-full"
          >
            {block.content || 'Add link URL'}
          </a>
        );
      default:
        return (
          <div className="h-full p-4">
            {block.content || 'Add text here'}
          </div>
        );
    }
  };

  return (
    <div
      className={`w-full h-full rounded-lg border border-neutral-800 overflow-hidden
        ${block.isCenter ? 'bg-neutral-800' : 'bg-neutral-900'}
        ${isEditable ? 'cursor-pointer' : ''}
      `}
      style={{
        backgroundColor: block.style.backgroundColor,
        color: block.style.textColor,
      }}
    >
      {renderContent()}
    </div>
  );
}