'use client';

import dynamic from 'next/dynamic';
import { Block } from '@/lib/types';

const BentoGridWrapper = dynamic(
  () => import('@/components/BentoGrid/BentoGridWrapper'),
  { ssr: false }
);

interface ClientWrapperProps {
  blocks: Block[];
  isEditable: boolean;
}

export default function ClientWrapper({ blocks, isEditable }: ClientWrapperProps) {
  return (
    <BentoGridWrapper 
      initialBlocks={blocks}
      isEditable={isEditable}
    />
  );
}