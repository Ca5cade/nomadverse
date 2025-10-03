import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, Square, Bot, Save, Download, Upload, Zap, Eye, EyeOff, Sidebar, Palette, Terminal, Sparkles, Code2, MonitorPlay, BookOpen, LogOut } from "lucide-react";
import { Course } from "@/lib/courses";
import { User } from "@shared/schema";

interface TopMenuBarProps {
  onToggleTestRunner?: () => void;
  onRunSimulation?: () => void;
  onToggleFileExplorer?: () => void;
  onToggleBlockPalette?: () => void;
  onToggleConsole?: () => void;
  showFileExplorer?: boolean;
  showBlockPalette?: boolean;
  showConsole?: boolean;
  courses: Course[];
  courseCompletions: boolean[];
  currentCourseIndex: number;
  onSelectCourse: (index: number) => void;
  user?: User | null;
  logout?: () => void;
}

export default function TopMenuBar({ 
  onToggleTestRunner, 
  onRunSimulation, 
  onToggleFileExplorer,
  onToggleBlockPalette,
  onToggleConsole,
  showFileExplorer = true,
  showBlockPalette = true,
  showConsole = true,
  courses,
  courseCompletions,
  currentCourseIndex,
  onSelectCourse,
  user,
  logout
}: TopMenuBarProps) {
  return (
    <header className="bg-gradient-to-r from-panel-bg via-panel-hover to-panel-bg border-b border-border-color px-6 py-3 flex items-center justify-between shadow-premium backdrop-blur-lg">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-lg">
            <Bot className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-text-primary tracking-tight">NomadVerse</h1>
          </div>
        </div>
        
        <nav className="flex space-x-1">
          {['File', 'Edit', 'View', 'Run', 'Help'].map((item) => (
            <Button 
              key={item}
              variant="ghost" 
              size="sm" 
              className="hover:bg-panel-active text-text-primary transition-all hover:scale-105 font-medium"
              data-testid={`menu-${item.toLowerCase()}`}
            >
              {item}
            </Button>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses List
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {courses.map((course, index) => {
              const isCompleted = courseCompletions[index];
              const isCurrent = currentCourseIndex === index;
              if (isCompleted || isCurrent) {
                return (
                  <DropdownMenuItem key={course.id} onSelect={() => onSelectCourse(index)}>
                    {course.title}
                  </DropdownMenuItem>
                );
              }
              return null;
            })}
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 bg-panel-active rounded-lg p-1.5 border border-border-color shadow-sm">
          <Button 
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showFileExplorer 
                ? 'bg-accent-blue text-white shadow-md transform scale-105' 
                : 'text-text-muted hover:text-text-primary hover:bg-panel-hover'
            }`}
            onClick={onToggleFileExplorer}
            title="Toggle File Explorer"
            data-testid="button-toggle-files"
          >
            <Sidebar className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showBlockPalette 
                ? 'bg-accent-purple text-white shadow-md transform scale-105' 
                : 'text-text-muted hover:text-text-primary hover:bg-panel-hover'
            }`}
            onClick={onToggleBlockPalette}
            title="Toggle Block Palette"
            data-testid="button-toggle-blocks"
          >
            <Palette className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              showConsole 
                ? 'bg-accent-green text-white shadow-md transform scale-105' 
                : 'text-text-muted hover:text-text-primary hover:bg-panel-hover'
            }`}
            onClick={onToggleConsole}
            title="Toggle Console"
            data-testid="button-toggle-console"
          >
            <Terminal className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        <div className="w-px h-6 bg-border-color mx-2" />
        
        <div className="flex items-center space-x-2">
          <Button 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold px-4"
            size="sm"
            onClick={onRunSimulation}
            data-testid="button-run"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </Button>
        </div>

        <div className="w-px h-6 bg-border-color mx-2" />

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary font-medium">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-text-secondary hover:text-text-primary">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}