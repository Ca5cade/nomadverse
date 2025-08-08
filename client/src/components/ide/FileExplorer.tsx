import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, FileText, Plus, Search, ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  selectedProject: string | null;
  onSelectProject: (projectId: string) => void;
}

export default function FileExplorer({ selectedProject, onSelectProject }: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['projects']));
  const { data: projects, createProject } = useProjects();
  const { toast } = useToast();

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject.mutateAsync({
        name: `Project ${(projects?.length || 0) + 1}`,
        blocks: [],
        generatedCode: ""
      });
      onSelectProject(newProject.id);
      toast({
        title: "Success",
        description: "New project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="h-full bg-gradient-to-b from-panel-bg to-panel-hover border-r border-border-color shadow-premium flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-gradient-to-r from-panel-hover to-panel-active">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-accent-blue" />
            <span>Explorer</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateProject}
            className="h-7 w-7 p-0 hover:bg-accent-blue/10 hover:text-accent-blue transition-all hover:scale-110"
            title="New Project"
            data-testid="button-new-project"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 bg-panel-bg border-border-color focus:border-accent-blue text-sm transition-all"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Projects Folder */}
        <div className="mb-1">
          <Button
            variant="ghost"
            className="w-full justify-start h-7 px-2 hover:bg-panel-active text-text-secondary hover:text-text-primary transition-all"
            onClick={() => toggleFolder('projects')}
          >
            {expandedFolders.has('projects') ? (
              <ChevronDown className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 mr-1" />
            )}
            <Folder className="w-3.5 h-3.5 mr-2 text-accent-blue" />
            <span className="text-sm font-medium">Projects</span>
          </Button>
        </div>

        {/* Project Files */}
        {expandedFolders.has('projects') && (
          <div className="ml-4 space-y-0.5">
            {filteredProjects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className={`w-full justify-start h-7 px-2 text-sm transition-all hover:scale-105 ${
                  selectedProject === project.id
                    ? 'bg-accent-blue/15 text-accent-blue border-l-2 border-accent-blue shadow-sm'
                    : 'hover:bg-panel-active text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => onSelectProject(project.id)}
                data-testid={`project-${project.id}`}
              >
                <FileText className="w-3.5 h-3.5 mr-2" />
                <span className="truncate">{project.name}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderPlus className="w-8 h-8 text-text-muted mb-2" />
            <p className="text-sm text-text-muted mb-2">No projects found</p>
            <Button
              size="sm"
              onClick={handleCreateProject}
              className="bg-accent-blue hover:bg-accent-blue-hover text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-color bg-panel-bg">
        <p className="text-xs text-text-muted text-center">
          {projects?.length || 0} project{(projects?.length || 0) !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}