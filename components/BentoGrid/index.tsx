'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  onUpdateBlock: (id: string, updates: Partial<BlockType>) => void;
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
  const [resizePreview, setResizePreview] = useState<{w: number, h: number} | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const VALID_SIZES = [
    { w: 1, h: 1 }, // square
    { w: 2, h: 1 }, // horizontal rectangle
    { w: 1, h: 2 }, // vertical rectangle
    { w: 2, h: 2 }, // big square
    { w: 2, h: 3 }, // tall rectangle
  ];

  const handleUpdateContent = (blockId: string, content: string) => {
    onUpdateBlock(blockId, { content });
  };

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

  const isValidPosition = (x: number, y: number, w: number, h: number, blockId: string) => {
    // Check grid bounds
    if (x + w > 6 || y + h > 4) return false;
  
    // Check if position is occupied by other blocks
    return !localBlocks.some(block => 
      block.id !== blockId && // Ignore self
      x < block.position.x + block.position.w &&
      x + w > block.position.x &&
      y < block.position.y + block.position.h &&
      y + h > block.position.y
    );
  };

  const handleBlockDrop = async (x: number, y: number, blockId: string) => {
    try {
      const currentBlock = localBlocks.find(block => block.id === blockId);
      if (!currentBlock) return;
  
      // Check if new position is valid
      if (!isValidPosition(x, y, currentBlock.position.w, currentBlock.position.h, blockId)) {
        return; // Cancel drop if invalid
      }
  
      const updatedPosition = { 
        x, 
        y, 
        w: currentBlock.position.w,
        h: currentBlock.position.h
      };
  
      await onUpdateBlock(blockId, { 
        position: updatedPosition
      });
      
      setLocalBlocks(current =>
        current.map(block =>
          block.id === blockId 
            ? { ...block, position: updatedPosition }
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
  
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartPos || !resizingBlock) return;
    
    const deltaX = Math.floor((e.clientX - resizeStartPos.x) / 200);
    const deltaY = Math.floor((e.clientY - resizeStartPos.y) / 200);
    
    const newW = resizingBlock.position.w + deltaX;
    const newH = resizingBlock.position.h + deltaY;
    
    const closestSize = VALID_SIZES.reduce((closest, size) => {
      const currentDiff = Math.abs(size.w - newW) + Math.abs(size.h - newH);
      const closestDiff = Math.abs(closest.w - newW) + Math.abs(closest.h - newH);
      return currentDiff < closestDiff ? size : closest;
    });
  
    setResizePreview(closestSize);
    
    // Update local state immediately
    if (isValidPosition(
      resizingBlock.position.x, 
      resizingBlock.position.y, 
      closestSize.w, 
      closestSize.h,
      resizingBlock.id
    )) {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set local state immediately
      setLocalBlocks(current =>
        current.map(block =>
          block.id === resizingBlock.id
            ? {
                ...block,
                position: {
                  ...block.position,
                  w: closestSize.w,
                  h: closestSize.h
                }
              }
            : block
        )
      );

      // Debounce server update
      debounceTimer.current = setTimeout(() => {
        onUpdateBlock(resizingBlock.id, {
          position: {
            ...resizingBlock.position,
            w: closestSize.w,
            h: closestSize.h
          }
        });
      }, 100); // Adjust debounce delay as needed
    }
  }, [isResizing, resizeStartPos, resizingBlock, onUpdateBlock, isValidPosition]);

  
  
  // Update handleResizeEnd
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeStartPos(null);
    setResizingBlock(null);
    setResizePreview(null);
  }, []);

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
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid gap-4 w-[90vw] max-w-[1280px] relative" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 200px))',
        gridTemplateRows: 'repeat(4, 200px)',
        minHeight: '840px',
        backgroundColor: 'rgb(23, 23, 23)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}>
        {/* Resize Preview Overlay */}
        {isResizing && resizingBlock && resizePreview && (
          <div
            className="absolute pointer-events-none transition-all duration-150"
            style={{
              gridColumn: `${resizingBlock.position.x + 1} / span ${resizePreview.w}`,
              gridRow: `${resizingBlock.position.y + 1} / span ${resizePreview.h}`,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '3px dashed rgba(255, 255, 255, 0.5)',
              zIndex: 50,
              borderRadius: '0.5rem',
              margin: '0.5rem'
            }}
          />
        )}
  
        {/* Blocks */}
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
            <Block 
              block={block} 
              isEditable={isEditable} 
              onUpdateContent={handleUpdateContent}
            />
            
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
                              onUpdateBlock(block.id, { type });
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
                      onUpdateBlock(block.id, { 
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
  
        {/* Empty Cells */}
        {isEditable && gridCells.flat().map((cell) => !cell.occupied && (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`relative transition-all duration-150 ${
              isDragging ? 'border-2 border-dashed border-neutral-700' : ''
            } cursor-pointer`}
            style={{
              gridColumn: `${cell.x + 1}`,
              gridRow: `${cell.y + 1}`,
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