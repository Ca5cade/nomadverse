import { useState, useRef, useCallback, useEffect } from "react";
import { useBlocks } from "@/hooks/use-blocks";
import { Block } from "@shared/schema";
import { Flag, ArrowUp, Repeat, RotateCw, RotateCcw, Clock, Eye, Ruler } from "lucide-react";
import { blockTypes, getBlockConfig } from "@/lib/blockTypes";
import { generatePythonCode } from "@/lib/codeGenerator";
import type { Project } from "@shared/schema";
import { useUpdateProject } from "@/hooks/use-projects";

interface BlockCanvasProps {
  project?: Project;
}

interface CanvasBlock extends Block {
  isDragging?: boolean;
}

export default function BlockCanvas({ project }: BlockCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { mutate: updateProject } = useUpdateProject();
  const [blocks, setBlocks] = useState<CanvasBlock[]>([
    {
      id: 'start-1',
      type: 'when_flag_clicked',
      category: 'events',
      x: 32,
      y: 32,
    },
    {
      id: 'motion-1', 
      type: 'move_forward',
      category: 'motion',
      x: 48,
      y: 80,
      inputs: { steps: 10 },
    },
    {
      id: 'control-1',
      type: 'repeat',
      category: 'control', 
      x: 48,
      y: 128,
      inputs: { times: 5 },
      children: ['motion-2'],
    },
    {
      id: 'motion-2',
      type: 'turn_right',
      category: 'motion',
      x: 64,
      y: 176,
      inputs: { degrees: 90 },
    },
  ]);

  // Load blocks from project on mount
  useEffect(() => {
    if (project?.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) {
      setBlocks(project.blocks as CanvasBlock[]);
    }
  }, [project?.id]); // Only run when project changes

  // Auto-save blocks and generated code when blocks change
  useEffect(() => {
    if (project && blocks.length > 0) {
      const pythonCode = generatePythonCode(blocks);
      updateProject({ 
        id: project.id, 
        updates: { 
          blocks: blocks, 
          pythonCode 
        } 
      });
    }
  }, [blocks, project?.id, updateProject]); // Don't include project itself to avoid loops

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const blockData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const newBlock: CanvasBlock = {
        id: `${blockData.type}-${Date.now()}`,
        type: blockData.type,
        category: getBlockConfig(blockData.type)?.category || 'motion',
        x: e.clientX - rect.left - 264, // Account for palette width
        y: e.clientY - rect.top,
        inputs: {},
      };

      setBlocks(prev => [...prev, newBlock]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('text/plain', blockId);
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, isDragging: true } : b
    ));
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect && blockId) {
      setBlocks(prev => prev.map(b => 
        b.id === blockId 
          ? { 
              ...b, 
              x: e.clientX - rect.left - 264,
              y: e.clientY - rect.top,
              isDragging: false 
            }
          : { ...b, isDragging: false }
      ));
    }
  };

  const updateBlockInput = (blockId: string, inputName: string, value: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, inputs: { ...block.inputs, [inputName]: value } }
        : block
    ));
  };

  const renderBlock = (block: CanvasBlock) => {
    const config = getBlockConfig(block.type);
    if (!config) return null;

    const getBlockColor = (category: Block['category']) => {
      switch (category) {
        case 'motion': return 'bg-block-motion';
        case 'control': return 'bg-block-control';
        case 'sensing': return 'bg-block-sensing';
        case 'events': return 'bg-block-events';
        default: return 'bg-gray-600';
      }
    };

    const getIcon = () => {
      switch (block.type) {
        case 'when_flag_clicked': return <Flag className="w-4 h-4 text-white" />;
        case 'move_forward': return <ArrowUp className="w-4 h-4 text-white" />;
        case 'move_backward': return <ArrowUp className="w-4 h-4 text-white rotate-180" />;
        case 'turn_left': return <RotateCcw className="w-4 h-4 text-white" />;
        case 'turn_right': return <RotateCw className="w-4 h-4 text-white" />;
        case 'repeat': return <Repeat className="w-4 h-4 text-white" />;
        case 'wait': return <Clock className="w-4 h-4 text-white" />;
        case 'touching': return <Eye className="w-4 h-4 text-white" />;
        case 'distance': return <Ruler className="w-4 h-4 text-white" />;
        default: return null;
      }
    };

    return (
      <div
        key={block.id}
        className={`absolute ${getBlockColor(block.category)} p-3 rounded-lg shadow-lg cursor-grab flex items-center space-x-2 min-w-32 hover:scale-105 transition-transform ${
          block.isDragging ? 'opacity-50 scale-110' : ''
        }`}
        style={{ left: block.x, top: block.y, zIndex: block.isDragging ? 1000 : 1 }}
        draggable
        onDragStart={(e) => handleBlockDragStart(e, block.id)}
        data-testid={`canvas-block-${block.id}`}
      >
        {getIcon()}
        <span className="text-white text-sm font-medium">{config.label}</span>
        
        {config.inputs?.map((input) => (
          <div key={input.name} className="flex items-center space-x-1">
            <input
              type={input.type === 'number' ? 'number' : 'text'}
              className="bg-black bg-opacity-30 text-white border border-white border-opacity-20 rounded px-2 py-1 w-16 text-xs text-center focus:bg-opacity-50 focus:outline-none"
              value={block.inputs?.[input.name] || input.defaultValue || ''}
              onChange={(e) => updateBlockInput(block.id, input.name, 
                input.type === 'number' ? Number(e.target.value) || 0 : e.target.value
              )}
              placeholder={input.defaultValue?.toString()}
              data-testid={`input-${block.id}-${input.name}`}
              onClick={(e) => e.stopPropagation()}
            />
            {input.label && (
              <span className="text-white text-xs opacity-90">{input.label}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={canvasRef}
      className="h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 overflow-auto relative"
      onDrop={handleBlockDrop}
      onDragOver={handleDragOver}
      data-testid="block-canvas"
    >
      {/* Enhanced Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Drop Zone Indicator */}
      <div className="absolute inset-4 border-2 border-dashed border-gray-600 opacity-20 rounded-lg pointer-events-none" />
      
      {/* Blocks */}
      <div className="relative z-10 min-h-full">
        {blocks.map(renderBlock)}
        
        {/* Helper Text */}
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <p className="text-lg mb-2">Drop blocks here to start programming</p>
              <p className="text-sm opacity-75">Drag blocks from the palette to create your robot program</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
