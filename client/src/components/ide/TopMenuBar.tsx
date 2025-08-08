import { Button } from "@/components/ui/button";
import { Play, Square, Bot, Save, Download, Upload, Zap } from "lucide-react";

interface TopMenuBarProps {
  onToggleTestRunner?: () => void;
  onRunSimulation?: () => void;
}

export default function TopMenuBar({ onToggleTestRunner, onRunSimulation }: TopMenuBarProps) {
  return (
    <header className="bg-panel-bg border-b border-border-color px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Bot className="text-accent-blue text-xl" />
          <span className="font-semibold text-lg text-text-primary">RobotIDE</span>
        </div>
        <nav className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-border-color text-text-primary"
            data-testid="menu-file"
          >
            File
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-border-color text-text-primary"
            data-testid="menu-edit"
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-border-color text-text-primary"
            data-testid="menu-view"
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-border-color text-text-primary"
            data-testid="menu-run"
          >
            Run
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-border-color text-text-primary"
            data-testid="menu-help"
          >
            Help
          </Button>
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost"
          size="sm"
          className="hover:bg-border-color text-text-primary"
          data-testid="button-save"
        >
          <Save className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          className="hover:bg-border-color text-text-primary"
          data-testid="button-export"
        >
          <Download className="w-3 h-3" />
        </Button>
        <div className="w-px h-4 bg-border-color mx-2" />
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
          size="sm"
          onClick={onRunSimulation}
          data-testid="button-run"
        >
          <Play className="w-3 h-3" />
          <span>Run</span>
        </Button>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
          size="sm"
          data-testid="button-stop"
        >
          <Square className="w-3 h-3" />
          <span>Stop</span>
        </Button>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          size="sm"
          onClick={onToggleTestRunner}
          data-testid="button-test"
        >
          <Zap className="w-3 h-3" />
          <span>Test</span>
        </Button>
      </div>
    </header>
  );
}
