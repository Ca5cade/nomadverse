import { ArrowUp, RotateCcw, RotateCw, Repeat, HelpCircle, Clock, Eye, Ruler } from "lucide-react";
import { blockTypes } from "@/lib/blockTypes";

export default function BlockPalette() {
  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: blockType }));
  };

  return (
    <div className="absolute left-0 top-0 w-64 h-full bg-panel-bg border-r border-border-color overflow-y-auto z-10">
      <div className="p-3">
        <h4 className="text-sm font-semibold mb-3 text-text-primary">Block Palette</h4>
        
        {/* Motion Blocks */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            Motion
          </h5>
          <div className="space-y-2">
            {blockTypes.motion.map((block) => (
              <div
                key={block.type}
                className="bg-block-motion hover:bg-blue-700 p-2 rounded cursor-grab flex items-center space-x-2 transition-colors select-none"
                draggable
                onDragStart={(e) => handleDragStart(e, block.type)}
                data-testid={`block-${block.type}`}
              >
                <ArrowUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white">{block.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Control Blocks */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            Control
          </h5>
          <div className="space-y-2">
            {blockTypes.control.map((block) => (
              <div
                key={block.type}
                className="bg-block-control hover:bg-orange-700 p-2 rounded cursor-grab flex items-center space-x-2 transition-colors select-none"
                draggable
                onDragStart={(e) => handleDragStart(e, block.type)}
                data-testid={`block-${block.type}`}
              >
                {block.type === 'repeat' && <Repeat className="w-3 h-3 text-white" />}
                {block.type === 'if' && <HelpCircle className="w-3 h-3 text-white" />}
                {block.type === 'wait' && <Clock className="w-3 h-3 text-white" />}
                <span className="text-xs text-white">{block.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sensing Blocks */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            Sensing
          </h5>
          <div className="space-y-2">
            {blockTypes.sensing.map((block) => (
              <div
                key={block.type}
                className="bg-block-sensing hover:bg-cyan-700 p-2 rounded cursor-grab flex items-center space-x-2 transition-colors select-none"
                draggable
                onDragStart={(e) => handleDragStart(e, block.type)}
                data-testid={`block-${block.type}`}
              >
                {block.type === 'touching' && <Eye className="w-3 h-3 text-white" />}
                {block.type === 'distance' && <Ruler className="w-3 h-3 text-white" />}
                <span className="text-xs text-white">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
