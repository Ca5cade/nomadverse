import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface TrashBinProps {
  onDeleteBlock: (blockId: string) => void;
}

export default function TrashBin({ onDeleteBlock }: TrashBinProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blockId = e.dataTransfer.getData('text/plain');
    if (blockId && !blockId.startsWith('{')) { // Ensure it's an existing block, not a new one
      onDeleteBlock(blockId);
    }
    setIsOver(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`fixed bottom-8 right-8 z-50 p-4 rounded-full transition-all duration-300 ${
        isOver
          ? 'bg-red-500 scale-125 shadow-lg'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      <Trash2
        className={`w-8 h-8 text-white transition-transform duration-300 ${isOver ? 'rotate-12' : ''}`}
      />
    </div>
  );
}
