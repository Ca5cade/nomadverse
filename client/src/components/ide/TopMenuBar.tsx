import { Button } from "@/components/ui/button";
import { Play, Square, Bot } from "lucide-react";

export default function TopMenuBar() {
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
          className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
          size="sm"
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
      </div>
    </header>
  );
}
