'use client';

import { useState, useEffect } from 'react';
import { Block as BlockType } from '@/lib/types';
import { FiTrash2, FiType, FiDroplet, FiPlus } from 'react-icons/fi';
import Block from './Block';
import ResizeHandle from '../ui/ReziseHandle';


const BLOCK_TYPES = ['text', 'image', 'link', 'code'];

interface BentoGridProps {
  blocks: BlockType[];
  isEditable: boolean;
  onUpdateBlock: (id: string, updates: Partial<BlockType>) => void;
  onAddBlock: (position: { x: number; y: number }) => void;
}

export default function BentoGrid({ blocks, isEditable, onUpdateBlock, onAddBlock }: BentoGridProps) {
  const [localBlocks, setLocalBlocks] = useState<BlockType[]>(blocks);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [hoveredEmptyCell, setHoveredEmptyCell] = useState<{x: number, y: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTypeList, setShowTypeList] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState<{ x: number, y: number } | null>(null);
  const [resizingBlock, setResizingBlock] = useState<BlockType | null>(null);


  const handleMouseLeave = (e: React.MouseEvent, blockId: string) => {
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !(relatedTarget instanceof HTMLElement)) {
      setHoveredBlockId(null);
      return;
    }
    if (!relatedTarget.closest('.block-toolbar')) {
      setHoveredBlockId(null);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setLocalBlocks(current => current.filter(block => block.id !== blockId));
      }
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleBlockDrop = async (x: number, y: number, blockId: string) => {
    try {
      // Update server first
      await onUpdateBlock(blockId, { 
        position: { x, y, w: 1, h: 1 } 
      });
      
      // Then update local state
      setLocalBlocks(current =>
        current.map(block =>
          block.id === blockId 
            ? { ...block, position: { x, y, w: 1, h: 1 } }
            : block
        )
      );
    } catch (error) {
      console.error('Error updating block position:', error);
    } finally {
      setIsDragging(false);
    }
  };

  const gridCells = Array(4).fill(null).map((_, y) =>
    Array(6).fill(null).map((_, x) => ({
      x,
      y,
      occupied: localBlocks.some(block => 
        x >= block.position.x && 
        x < block.position.x + block.position.w &&
        y >= block.position.y && 
        y < block.position.y + block.position.h
      )
    }))
  );

  const handleResizeStart = (e: React.MouseEvent, block: BlockType) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizingBlock(block);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !resizeStartPos || !resizingBlock) return;
    
    const deltaX = Math.floor((e.clientX - resizeStartPos.x) / 200);
    const deltaY = Math.floor((e.clientY - resizeStartPos.y) / 200);
    
    const newW = Math.max(1, Math.min(3, resizingBlock.position.w + deltaX));
    const newH = Math.max(1, Math.min(3, resizingBlock.position.h + deltaY));
    
    const validSizes = [
      {w: 1, h: 1}, {w: 1, h: 2}, {w: 2, h: 1},
      {w: 2, h: 2}, {w: 2, h: 3}, {w: 3, h: 1}
    ];
    
    const newSize = validSizes.find(size => size.w === newW && size.h === newH);
    if (newSize) {
      handleBlockUpdate(resizingBlock.id, {
        position: { ...resizingBlock.position, w: newSize.w, h: newSize.h }
      });
    }
  };
  
  // Update handleResizeEnd
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeStartPos(null);
    setResizingBlock(null);
  };

  useEffect(() => {
    const localBlocksJSON = JSON.stringify(localBlocks);
    const blocksJSON = JSON.stringify(blocks);
    
    if (localBlocksJSON !== blocksJSON && !isDragging) {
      setLocalBlocks(blocks);
    }
  }, [blocks, isDragging]);

  useEffect(() => {
    const handleClickOutside = () => setShowTypeList(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    }
  }, [isResizing, resizingBlock, resizeStartPos]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid gap-4 w-[90vw] max-w-[1280px]" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 200px))',
        gridTemplateRows: 'repeat(4, 200px)',
        minHeight: '840px',
        backgroundColor: 'rgb(23, 23, 23)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}>
        {localBlocks.map(block => (
          <div
            key={block.id}
            className={`relative group ${
              isEditable && !block.isCenter ? 'cursor-move' : ''
            }`}
            style={{
              gridColumn: `${block.position.x + 1} / span ${block.position.w}`,
              gridRow: `${block.position.y + 1} / span ${block.position.h}`,
            }}
            onMouseEnter={() => setHoveredBlockId(block.id)}
            onMouseLeave={(e) => handleMouseLeave(e, block.id)}
            draggable={isEditable && !block.isCenter}
            onDragStart={(e) => {
              setIsDragging(true);
              e.dataTransfer.setData('blockId', block.id);
            }}
            onDragEnd={() => setIsDragging(false)}
          >
            <Block block={block} isEditable={isEditable} />
            
            {isEditable && hoveredBlockId === block.id && !block.isCenter && (
              <>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-lg shadow-lg z-10">
                  <div className="relative">
                    <button 
                      className="p-1.5 rounded hover:bg-neutral-700 text-white/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTypeList(showTypeList === block.id ? null : block.id);
                      }}
                    >
                      <FiType size={14} />
                    </button>
                    {showTypeList === block.id && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-neutral-800 rounded-lg shadow-lg">
                        {BLOCK_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockUpdate(block.id, { type });
                              setShowTypeList(null);
                            }}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-neutral-700 ${
                              block.type === type ? 'text-blue-400' : 'text-white/80'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      const newColor = block.style.backgroundColor === 'rgb(23, 23, 23)' 
                        ? 'rgb(38, 38, 38)' 
                        : 'rgb(23, 23, 23)';
                      handleBlockUpdate(block.id, { 
                        style: { ...block.style, backgroundColor: newColor } 
                      });
                    }}
                    className="p-1.5 rounded hover:bg-neutral-700 text-white/80"
                  >
                    <FiDroplet size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1.5 rounded hover:bg-neutral-700 text-red-400"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <ResizeHandle onMouseDown={(e) => handleResizeStart(e, block)} />
              </>
            )}
          </div>
        ))}

        {isEditable && gridCells.flat().map((cell) => !cell.occupied && (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`relative transition-all duration-150 ${
              isDragging ? 'border-2 border-dashed border-neutral-700' : ''
            } cursor-pointer`}
            style={{
              gridColumn: `${cell.x + 1}`,
              gridRow: `${cell.y + 1}`,
              opacity: '1'
            }}
            onMouseEnter={() => !isDragging && setHoveredEmptyCell(cell)}
            onMouseLeave={() => !isDragging && setHoveredEmptyCell(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDragging) {
                onAddBlock({ x: cell.x, y: cell.y });
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setHoveredEmptyCell(cell);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const blockId = e.dataTransfer.getData('blockId');
              if (blockId) {
                handleBlockDrop(cell.x, cell.y, blockId);
              }
            }}
          >
            {!isDragging && hoveredEmptyCell?.x === cell.x && hoveredEmptyCell?.y === cell.y && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 hover:text-white/80">
                <FiPlus size={50} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}