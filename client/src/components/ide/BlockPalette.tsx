import { ArrowUp, RotateCcw, RotateCw, Repeat, HelpCircle, Clock, Eye, Ruler, Move3D, ChevronDown, ChevronRight, Palette } from "lucide-react";
import { blockTypes } from "@/lib/blockTypes";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BlockPalette() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['motion', 'control', 'sensing', 'events'])
  );

  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: blockType }));
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryIcons = {
    motion: Move3D,
    control: Repeat,
    sensing: Eye,
    events: Clock
  };

  const categoryColors = {
    motion: 'from-blue-500 to-blue-600',
    control: 'from-orange-500 to-orange-600',
    sensing: 'from-cyan-500 to-cyan-600',
    events: 'from-green-500 to-green-600'
  };

  return (
    <div className="absolute left-0 top-0 w-72 h-full bg-gradient-to-b from-panel-bg to-panel-hover border-r border-border-color shadow-premium overflow-hidden z-10">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border-color bg-gradient-to-r from-panel-hover to-panel-active">
          <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue shadow-sm">
              <Palette className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Block Palette</span>
          </h4>
          <p className="text-xs text-text-muted mt-1">Drag blocks to create programs</p>
        </div>

        {/* Block Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Motion Blocks */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 hover:bg-panel-active text-text-primary transition-all"
              onClick={() => toggleCategory('motion')}
            >
              {expandedCategories.has('motion') ? (
                <ChevronDown className="w-3.5 h-3.5 mr-2" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 mr-2" />
              )}
              <div className={`p-1 rounded-md bg-gradient-to-r ${categoryColors.motion} mr-2 shadow-sm`}>
                <Move3D className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm">Motion</span>
              <span className="ml-auto text-xs text-text-muted">{blockTypes.motion?.length || 0}</span>
            </Button>
            
            {expandedCategories.has('motion') && (
              <div className="ml-4 space-y-1.5">
                {(blockTypes.motion || []).map((block) => (
                  <div
                    key={block.type}
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-3 rounded-lg cursor-grab flex items-center space-x-3 transition-all duration-200 select-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.type)}
                    onDragEnd={handleDragEnd}
                    data-testid={`block-${block.type}`}
                  >
                    <ArrowUp className="w-4 h-4 text-white flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white block truncate">{block.label}</span>
                      <span className="text-xs text-blue-100 opacity-75">Motion control</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Control Blocks */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 hover:bg-panel-active text-text-primary transition-all"
              onClick={() => toggleCategory('control')}
            >
              {expandedCategories.has('control') ? (
                <ChevronDown className="w-3.5 h-3.5 mr-2" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 mr-2" />
              )}
              <div className={`p-1 rounded-md bg-gradient-to-r ${categoryColors.control} mr-2 shadow-sm`}>
                <Repeat className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm">Control</span>
              <span className="ml-auto text-xs text-text-muted">{blockTypes.control?.length || 0}</span>
            </Button>
            
            {expandedCategories.has('control') && (
              <div className="ml-4 space-y-1.5">
                {(blockTypes.control || []).map((block) => (
                  <div
                    key={block.type}
                    className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 p-3 rounded-lg cursor-grab flex items-center space-x-3 transition-all duration-200 select-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.type)}
                    onDragEnd={handleDragEnd}
                    data-testid={`block-${block.type}`}
                  >
                    <Repeat className="w-4 h-4 text-white flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white block truncate">{block.label}</span>
                      <span className="text-xs text-orange-100 opacity-75">Program flow</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sensing Blocks */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 hover:bg-panel-active text-text-primary transition-all"
              onClick={() => toggleCategory('sensing')}
            >
              {expandedCategories.has('sensing') ? (
                <ChevronDown className="w-3.5 h-3.5 mr-2" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 mr-2" />
              )}
              <div className={`p-1 rounded-md bg-gradient-to-r ${categoryColors.sensing} mr-2 shadow-sm`}>
                <Eye className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm">Sensing</span>
              <span className="ml-auto text-xs text-text-muted">{blockTypes.sensing?.length || 0}</span>
            </Button>
            
            {expandedCategories.has('sensing') && (
              <div className="ml-4 space-y-1.5">
                {(blockTypes.sensing || []).map((block) => (
                  <div
                    key={block.type}
                    className="group bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 p-3 rounded-lg cursor-grab flex items-center space-x-3 transition-all duration-200 select-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.type)}
                    onDragEnd={handleDragEnd}
                    data-testid={`block-${block.type}`}
                  >
                    <Eye className="w-4 h-4 text-white flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white block truncate">{block.label}</span>
                      <span className="text-xs text-cyan-100 opacity-75">Robot sensors</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events Blocks */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 hover:bg-panel-active text-text-primary transition-all"
              onClick={() => toggleCategory('events')}
            >
              {expandedCategories.has('events') ? (
                <ChevronDown className="w-3.5 h-3.5 mr-2" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 mr-2" />
              )}
              <div className={`p-1 rounded-md bg-gradient-to-r ${categoryColors.events} mr-2 shadow-sm`}>
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm">Events</span>
              <span className="ml-auto text-xs text-text-muted">{blockTypes.events?.length || 0}</span>
            </Button>
            
            {expandedCategories.has('events') && (
              <div className="ml-4 space-y-1.5">
                {(blockTypes.events || []).map((block) => (
                  <div
                    key={block.type}
                    className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-3 rounded-lg cursor-grab flex items-center space-x-3 transition-all duration-200 select-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.type)}
                    onDragEnd={handleDragEnd}
                    data-testid={`block-${block.type}`}
                  >
                    <Clock className="w-4 h-4 text-white flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white block truncate">{block.label}</span>
                      <span className="text-xs text-green-100 opacity-75">Event triggers</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-color bg-panel-bg">
          <p className="text-xs text-text-muted text-center">
            {Object.values(blockTypes).flat().length} blocks available
          </p>
        </div>
      </div>
    </div>
  );
}