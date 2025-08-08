import { useState, useCallback } from "react";
import { Block } from "@shared/schema";
import { generatePythonCode } from "@/lib/codeGenerator";

export function useBlocks(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const addBlock = useCallback((block: Omit<Block, 'id'>) => {
    const newBlock: Block = {
      ...block,
      id: `${block.type}-${Date.now()}`,
    };
    setBlocks(prev => [...prev, newBlock]);
    return newBlock;
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const moveBlock = useCallback((id: string, x: number, y: number) => {
    updateBlock(id, { x, y });
  }, [updateBlock]);

  const connectBlocks = useCallback((parentId: string, childId: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === parentId 
        ? { ...block, children: [...(block.children || []), childId] }
        : block
    ));
  }, []);

  const getGeneratedCode = useCallback(() => {
    return generatePythonCode(blocks);
  }, [blocks]);

  return {
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    connectBlocks,
    getGeneratedCode,
  };
}
