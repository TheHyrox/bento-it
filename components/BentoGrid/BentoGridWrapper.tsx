'use client';

import { Block } from '@/lib/types';
import { useState, useEffect } from 'react';
import BentoGrid from '.';

interface BentoGridWrapperProps {
  initialBlocks: Block[];
  isEditable: boolean;
}

const DEFAULT_CENTER_BLOCK: Block = {
  id: 'center',
  type: 'text',
  content: 'Welcome to my page',
  position: { x: 2, y: 1, w: 2, h: 2 }, // Centered in 6x4 grid
  isCenter: true,
  style: {
    backgroundColor: 'rgb(38, 38, 38)',
    textColor: 'white'
  }
};

export default function BentoGridWrapper({ initialBlocks, isEditable }: BentoGridWrapperProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    // Ensure center block exists
    const hasCenter = initialBlocks.some(block => block.isCenter);
    if (!hasCenter) {
      setBlocks([DEFAULT_CENTER_BLOCK, ...initialBlocks]);
    } else {
      setBlocks(initialBlocks);
    }
  }, [initialBlocks]);

  const handleAddBlock = async (clickedPosition: { x: number, y: number }) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'New block',
      position: { ...clickedPosition, w: 1, h: 1 }, // Always 1x1
      isCenter: false,
      style: {
        backgroundColor: 'rgb(23, 23, 23)',
        textColor: 'white'
      }
    };
      
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock)
      });
  
      if (response.ok) {
        const serverBlocks = await response.json();
        // Ensure center block exists in the new state
        const hasCenter = serverBlocks.some((block: Block) => block.isCenter);
        setBlocks(hasCenter ? serverBlocks : [DEFAULT_CENTER_BLOCK, ...serverBlocks]);
      }
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  const handleUpdateBlock = async (id: string, updates: Partial<Block>) => {
    // Don't allow updating center block type
    if (id === 'center' && updates.type) return;
    
    try {
      const response = await fetch(`/api/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setBlocks(current =>
          current.map(block =>
            block.id === id ? { ...block, ...updates } : block
          )
        );
      }
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  return (
    <div className="relative w-full aspect-[11/7]">
      <BentoGrid
        blocks={blocks}
        isEditable={isEditable}
        onUpdateBlock={handleUpdateBlock}
        onAddBlock={handleAddBlock}
      />
    </div>
  );
}