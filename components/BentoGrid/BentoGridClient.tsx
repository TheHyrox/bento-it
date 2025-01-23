import { Block as BlockType } from '@/lib/types';
import BentoGridClient from './BentoGridClient';

interface BentoGridProps {
  blocks: BlockType[];
  isEditable: boolean;
}

export default function BentoGrid(props: BentoGridProps) {
  return <BentoGridClient {...props} />;
}