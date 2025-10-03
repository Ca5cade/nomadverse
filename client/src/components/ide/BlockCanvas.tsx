import { useState, useRef, useCallback, useEffect } from "react";
import { useBlocks } from "@/hooks/use-blocks";
import { Block } from "@shared/schema";
import { Flag, ArrowUp, Repeat, RotateCw, RotateCcw, Clock, Eye, Ruler } from "lucide-react";
import { blockTypes, getBlockConfig } from "@/lib/blockTypes";
import { generatePythonCode } from "@/lib/codeGenerator";
import type { Project } from "@shared/schema";
import { useUpdateProject } from "@/hooks/use-projects";

const BLOCK_HEIGHT = 50; // Define BLOCK_HEIGHT here
const SNAP_THRESHOLD = 100; // pixels for snapping (increased for testing)
const BLOCK_VERTICAL_SPACING = 5; // Vertical space between stacked blocks
const BLOCK_HORIZONTAL_INDENT = 20; // Horizontal indent for nested blocks

interface BlockCanvasProps {
  project?: Project;
  onBlocksChange?: (blocks: Block[]) => void;
}

interface CanvasBlock extends Block {
  isDragging?: boolean;
}

export default function BlockCanvas({ project, onBlocksChange }: BlockCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { mutate: updateProject } = useUpdateProject();
  const [blocks, setBlocks] = useState<CanvasBlock[]>([
    {
      id: 'start-1',
      type: 'onStart',
      category: 'events',
      x: 32,
      y: 32,
    },
  ]);

  // Load blocks from project on mount
  useEffect(() => {
    if (project?.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) {
      setBlocks(project.blocks as CanvasBlock[]);
    }
  }, [project?.id]); // Only run when project changes

  useEffect(() => {
    if (onBlocksChange) {
      onBlocksChange(blocks);
    }
  }, [blocks, onBlocksChange]);



  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Drop event triggered');
    console.log('DataTransfer types:', e.dataTransfer.types);
    const data = e.dataTransfer.getData('text/plain');
    console.log('DataTransfer text/plain:', data);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let droppedBlock: CanvasBlock | null = null;
    let isNewBlock = false;

    try {
      // Check if the data is a JSON string (new block from palette)
      if (data.startsWith('{')) {
        const blockData = JSON.parse(data);
        console.log('Parsed block data (new block):', blockData);
        const config = getBlockConfig(blockData.type);
        droppedBlock = {
          id: `${blockData.type}-${Date.now()}`,
          type: blockData.type,
          category: config?.category || 'motion',
          x: Math.max(0, e.clientX - rect.left), // Adjusted for palette width, block should appear under cursor
          y: Math.max(0, e.clientY - rect.top),
          inputs: config?.inputs?.reduce((acc, input) => ({
            ...acc,
            [input.name]: input.defaultValue
          }), {}) || {},
        };
        isNewBlock = true;
        console.log('New block to be added:', droppedBlock);
      } else {
        // Data is a block ID (existing block being dragged)
        const blockId = data;
        console.log('Existing block being dragged:', blockId);
        // Find the existing block in the current state
        droppedBlock = blocks.find(b => b.id === blockId) || null;
        if (droppedBlock) {
          // Update its position based on the drop event
          droppedBlock.x = Math.max(0, e.clientX - rect.left);
          droppedBlock.y = Math.max(0, e.clientY - rect.top);
        }
        isNewBlock = false; // It's an existing block
      }
    } catch (error) {
      console.error('Error parsing block data in handleDrop:', error);
      return; // Exit if parsing fails
    }

    if (!droppedBlock) return; // Should not happen if logic is correct

    setBlocks(prev => {
      let snapped = false;
      let parentId: string | null = null;

      let nextBlocks: CanvasBlock[] = isNewBlock ? [...prev, droppedBlock] : prev.map(b => b.id === droppedBlock!.id ? droppedBlock! : b);

      console.log('handleDrop: Initial nextBlocks (with droppedBlock):', nextBlocks);

      // Try to snap to an existing block
      for (let i = 0; i < nextBlocks.length; i++) {
        const existingBlock = nextBlocks[i];
        if (existingBlock.id === droppedBlock.id) continue; 

        const existingBlockRight = existingBlock.x + 100;
        const existingBlockBottom = existingBlock.y + BLOCK_HEIGHT;

        // Check for snapping inside (for repeat/if blocks) FIRST
        if (
          (existingBlock.type === 'repeat' || existingBlock.type === 'if') &&
          droppedBlock.x > existingBlock.x && // Check if dropped to the right of the parent's start
          droppedBlock.y > existingBlock.y &&
          droppedBlock.y < existingBlockBottom + SNAP_THRESHOLD // Looser check for y
        ) {
          // Find the last child in the container
          const nestedChildren = nextBlocks.filter(b => existingBlock.children?.includes(b.id) && b.x > existingBlock.x);
          const lastChildInContainer = nestedChildren.sort((a,b) => b.y - a.y)[0];

          if (lastChildInContainer) {
            droppedBlock.x = lastChildInContainer.x;
            droppedBlock.y = lastChildInContainer.y + BLOCK_HEIGHT + BLOCK_VERTICAL_SPACING;
            parentId = lastChildInContainer.id; // Snap to the last child
          } else {
            // First child in container
            droppedBlock.x = existingBlock.x + BLOCK_HORIZONTAL_INDENT;
            droppedBlock.y = existingBlock.y + BLOCK_HEIGHT + BLOCK_VERTICAL_SPACING;
            parentId = existingBlock.id;
          }
          snapped = true;
          console.log('handleDrop: Snapped inside. parentId:', parentId, 'droppedBlock pos:', droppedBlock.x, droppedBlock.y);
          break;
        }

        // Check for snapping below
        if (
          droppedBlock.x >= existingBlock.x - SNAP_THRESHOLD &&
          droppedBlock.x <= existingBlockRight + SNAP_THRESHOLD &&
          Math.abs(droppedBlock.y - existingBlockBottom) < SNAP_THRESHOLD
        ) {
          droppedBlock.x = existingBlock.x;
          droppedBlock.y = existingBlockBottom + BLOCK_VERTICAL_SPACING;
          parentId = existingBlock.id;
          snapped = true;
          console.log('handleDrop: Snapped below. parentId:', parentId, 'droppedBlock pos:', droppedBlock.x, droppedBlock.y);
          break;
        }
      }

      console.log('handleDrop: After loop. snapped:', snapped, 'parentId:', parentId);

      if (snapped && parentId) {
        nextBlocks = nextBlocks.map(block => {
          if (block.id === parentId) {
            const updatedParent = { ...block, children: [...(block.children || []), droppedBlock!.id] };
            console.log('handleDrop: Updated parent block:', updatedParent);
            return updatedParent;
          }
          return block;
        });
      } else if (!isNewBlock) {
        nextBlocks = nextBlocks.map(block => block.id === droppedBlock!.id ? droppedBlock! : block);
      }
      
      console.log('Blocks state after update (final):', nextBlocks);
      return nextBlocks;
    });
  }, [blocks]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Get the element being dragged
    const draggedElement = e.currentTarget as HTMLElement;
    const rect = draggedElement.getBoundingClientRect();
    
    // Store the offset from mouse to top-left of element
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('application/offset', JSON.stringify({ offsetX, offsetY }));
    
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, isDragging: true } : b
    ));
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const blockId = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect && blockId) {
      let offsetX = 0, offsetY = 0;
      try {
        const offsetData = e.dataTransfer.getData('application/offset');
        if (offsetData) {
          const offset = JSON.parse(offsetData);
          offsetX = offset.offsetX || 0;
          offsetY = offset.y || 0;
        }
      } catch (error) {
        console.error('Error parsing offset data:', error);
      }
      
      setBlocks(prev => {
        const draggedBlock = prev.find(b => b.id === blockId);
        if (!draggedBlock) return prev;

        const deltaX = (e.clientX - rect.left - offsetX) - draggedBlock.x;
        const deltaY = (e.clientY - rect.top - offsetY) - draggedBlock.y;

        const updatePositions = (currentBlockId: string, dx: number, dy: number, blocksToUpdate: CanvasBlock[]): CanvasBlock[] => {
          return blocksToUpdate.map(block => {
            if (block.id === currentBlockId) {
              const newBlock = {
                ...block,
                x: block.x + dx,
                y: block.y + dy,
              };
              if (block.children && block.children.length > 0) {
                newBlock.children = newBlock.children.map(childId => {
                  const childBlock = blocksToUpdate.find(b => b.id === childId);
                  if (childBlock) {
                    // Recursively update children's positions
                    const updatedChildBlock = updatePositions(childId, dx, dy, blocksToUpdate).find(b => b.id === childId);
                    return updatedChildBlock ? updatedChildBlock.id : childId;
                  }
                  return childId;
                });
              }
              return newBlock;
            }
            return block;
          });
        };

        const updatedBlocks = updatePositions(blockId, deltaX, deltaY, prev);

        return updatedBlocks.map(b => b.id === blockId ? { ...b, isDragging: false } : b);
      });
    }
  };

  const updateBlockInput = (blockId: string, inputName: string, value: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, inputs: { ...block.inputs, [inputName]: value } }
        : block
    ));
  };

  const isChildBlock = (block: CanvasBlock, allBlocks: CanvasBlock[]): boolean => {
    return allBlocks.some(b => b.children?.includes(block.id));
  };

  

  const renderBlock = (block: CanvasBlock, allBlocks: CanvasBlock[]) => {
    const config = getBlockConfig(block.type);
    if (!config) return null;

    const parent = allBlocks.find(p => p.children?.includes(block.id));
    const isNested = parent && (parent.type === 'repeat' || parent.type === 'if') && block.x > parent.x;

    const getBlockColor = (category: Block['category']) => {
      switch (category) {
        case 'motion': return 'bg-block-motion';
        case 'control': return 'bg-block-control';
        case 'sensing': return 'bg-block-sensing';
        case 'events': return 'bg-block-events';
        default: return 'bg-gray-600';
      }
    };

    const blockColor = getBlockColor(block.category);
    const finalColor = isNested ? `${blockColor} bg-opacity-70` : blockColor;

    const getIcon = () => {
      switch (block.type) {
        case 'when_flag_clicked': return <Flag className="w-4 h-4 text-white" />;
        case 'moveForward': return <ArrowUp className="w-4 h-4 text-white" />;
        case 'moveBackward': return <ArrowUp className="w-4 h-4 text-white rotate-180" />;
        case 'turnLeft': return <RotateCcw className="w-4 h-4 text-white" />;
        case 'turnRight': return <RotateCw className="w-4 h-4 text-white" />;
        case 'repeat': return <Repeat className="w-4 h-4 text-white" />;
        case 'wait': return <Clock className="w-4 h-4 text-white" />;
        case 'touching': return <Eye className="w-4 h-4 text-white" />;
        case 'distance': return <Ruler className="w-4 h-4 text-white" />;
        case 'if': return <Repeat className="w-4 h-4 text-white" />;
        case 'isPathAhead': return <Eye className="w-4 h-4 text-white" />;
        case 'isPathLeft': return <Eye className="w-4 h-4 text-white" />;
        case 'isPathRight': return <Eye className="w-4 h-4 text-white" />;
        case 'onStart': return <Flag className="w-4 h-4 text-white" />;
        default: return null;
      }
    };

    return (
        <div
          key={block.id}
          className={`absolute ${finalColor} p-3 rounded-lg shadow-lg cursor-grab flex items-center space-x-2 min-w-32 hover:scale-105 transition-transform ${block.isDragging ? 'opacity-50 scale-110' : ''}`}
          style={{ left: block.x, top: block.y, zIndex: block.isDragging ? 1000 : 1, transition: 'left 0.1s ease-out, top 0.1s ease-out' }} // Use block.x and block.y directly
          draggable={block.type !== 'onStart'} // Make 'onStart' non-draggable
          onDragStart={(e) => handleBlockDragStart(e, block.id)}
          onDragEnd={() => setBlocks(prev => prev.map(b => ({ ...b, isDragging: false })))}          data-testid={`canvas-block-${block.id}`}
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
      onDrop={handleDrop}
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
        {blocks.map(block => renderBlock(block, blocks))}
        
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
