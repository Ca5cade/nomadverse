import { Button } from "@/components/ui/button";
import { Puzzle, FileCode, Box } from "lucide-react";
import { ActiveTab } from "@/pages/ide";

interface TabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="bg-panel-bg border-b border-border-color flex">
      <Button
        variant="ghost"
        className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 rounded-none border-b-2 ${
          activeTab === 'visual' 
            ? 'border-accent-blue text-accent-blue' 
            : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onTabChange('visual')}
        data-testid="tab-visual"
      >
        <Puzzle className="w-4 h-4" />
        <span>Visual Programming</span>
      </Button>
      <Button
        variant="ghost"
        className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 rounded-none border-b-2 ${
          activeTab === 'python' 
            ? 'border-accent-blue text-accent-blue' 
            : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onTabChange('python')}
        data-testid="tab-python"
      >
        <FileCode className="w-4 h-4" />
        <span>Python Editor</span>
      </Button>
      <Button
        variant="ghost"
        className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 rounded-none border-b-2 ${
          activeTab === '3d' 
            ? 'border-accent-blue text-accent-blue' 
            : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
        onClick={() => onTabChange('3d')}
        data-testid="tab-3d"
      >
        <Box className="w-4 h-4" />
        <span>3D Simulation</span>
      </Button>
    </div>
  );
}
