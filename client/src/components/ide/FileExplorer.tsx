import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, FileCode, Puzzle, Box, Folder, Circle } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  selectedProject: string | null;
  onSelectProject: (projectId: string) => void;
}

export default function FileExplorer({ selectedProject, onSelectProject }: FileExplorerProps) {
  const { data: projects } = useProjects();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.py')) return <FileCode className="w-3 h-3 text-accent-blue" />;
    if (filename.endsWith('.scratch')) return <Puzzle className="w-3 h-3 text-green-400" />;
    if (filename.endsWith('.world')) return <Box className="w-3 h-3 text-purple-400" />;
    return <FileCode className="w-3 h-3 text-text-secondary" />;
  };

  return (
    <aside className="w-64 bg-panel-bg border-r border-border-color flex flex-col">
      <div className="border-b border-border-color p-3">
        <h3 className="text-sm font-semibold mb-2 text-text-primary">Project Explorer</h3>
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            className="flex-1 bg-accent-blue hover:bg-blue-700 text-white"
            data-testid="button-new-project"
          >
            <Plus className="w-3 h-3 mr-1" />
            New
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            className="flex-1 bg-border-color hover:bg-gray-600 text-text-primary"
            data-testid="button-open-project"
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            Open
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {projects?.map((project) => (
            <div key={project.id}>
              <div 
                className={cn(
                  "flex items-center space-x-2 p-1 hover:bg-border-color rounded cursor-pointer text-sm",
                  selectedProject === project.id && "bg-border-color"
                )}
                onClick={() => {
                  onSelectProject(project.id);
                  toggleProjectExpansion(project.id);
                }}
                data-testid={`project-${project.id}`}
              >
                <Folder className="w-3 h-3 text-yellow-400" />
                <span className="text-text-primary">{project.name}</span>
              </div>
              
              {expandedProjects.has(project.id) && (
                <div className="ml-4 space-y-1 mt-1">
                  <div className="flex items-center space-x-2 p-1 hover:bg-border-color rounded cursor-pointer text-sm">
                    {getFileIcon("main.py")}
                    <span className="text-text-primary">main.py</span>
                  </div>
                  <div className="flex items-center space-x-2 p-1 hover:bg-border-color rounded cursor-pointer text-sm">
                    {getFileIcon("blocks.scratch")}
                    <span className="text-text-primary">blocks.scratch</span>
                  </div>
                  <div className="flex items-center space-x-2 p-1 hover:bg-border-color rounded cursor-pointer text-sm">
                    {getFileIcon("scene.world")}
                    <span className="text-text-primary">scene.world</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border-color p-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Connected: Gazebo</span>
          <Circle className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>
    </aside>
  );
}
