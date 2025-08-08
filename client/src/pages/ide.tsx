import { useState } from "react";
import TopMenuBar from "@/components/ide/TopMenuBar";
import FileExplorer from "@/components/ide/FileExplorer";
import TabBar from "@/components/ide/TabBar";
import BlockPalette from "@/components/ide/BlockPalette";
import BlockCanvas from "@/components/ide/BlockCanvas";
import CodeEditor from "@/components/ide/CodeEditor";
import SimulationViewport from "@/components/ide/SimulationViewport";
import ConsolePanel from "@/components/ide/ConsolePanel";
import { useProjects } from "@/hooks/use-projects";

export type ActiveTab = 'visual' | 'python' | '3d';

export default function IDE() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('visual');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();

  // Select first project by default
  if (!selectedProject && projects && projects.length > 0) {
    setSelectedProject(projects[0].id);
  }

  const currentProject = projects?.find(p => p.id === selectedProject);

  if (isLoading) {
    return <div className="h-screen bg-editor-bg flex items-center justify-center text-text-primary">
      Loading IDE...
    </div>;
  }

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-text-primary font-interface overflow-hidden">
      <TopMenuBar />
      
      <div className="flex-1 flex overflow-hidden">
        <FileExplorer 
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'visual' && (
              <>
                <div className="flex-1 bg-editor-bg relative overflow-hidden">
                  <BlockPalette />
                  <BlockCanvas project={currentProject} />
                </div>
                <CodeEditor project={currentProject} />
                <SimulationViewport project={currentProject} />
              </>
            )}
            
            {activeTab === 'python' && (
              <>
                <div className="flex-1">
                  <CodeEditor project={currentProject} fullWidth />
                </div>
                <SimulationViewport project={currentProject} />
              </>
            )}
            
            {activeTab === '3d' && (
              <div className="flex-1">
                <SimulationViewport project={currentProject} fullWidth />
              </div>
            )}
          </div>
        </main>
      </div>
      
      <ConsolePanel />
    </div>
  );
}
