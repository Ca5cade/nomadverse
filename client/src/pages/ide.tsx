import { useState } from "react";
import TopMenuBar from "@/components/ide/TopMenuBar";
import FileExplorer from "@/components/ide/FileExplorer";
import TabBar from "@/components/ide/TabBar";
import BlockPalette from "@/components/ide/BlockPalette";
import BlockCanvas from "@/components/ide/BlockCanvas";
import CodeEditor from "@/components/ide/CodeEditor";
import SimulationViewport from "@/components/ide/SimulationViewport";
import ConsolePanel from "@/components/ide/ConsolePanel";
import TestRunner from "@/components/ide/TestRunner";
import { useProjects } from "@/hooks/use-projects";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";

export type ActiveTab = 'visual' | 'python' | '3d';

export default function IDE() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('visual');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [simulationTrigger, setSimulationTrigger] = useState(0);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showBlockPalette, setShowBlockPalette] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
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
      <TopMenuBar 
        onToggleTestRunner={() => setShowTestRunner(!showTestRunner)}
        onRunSimulation={() => setSimulationTrigger(prev => prev + 1)}
        onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        onToggleBlockPalette={() => setShowBlockPalette(!showBlockPalette)}
        onToggleConsole={() => setShowConsole(!showConsole)}
        showFileExplorer={showFileExplorer}
        showBlockPalette={showBlockPalette}
        showConsole={showConsole}
      />
      
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {showFileExplorer && (
              <>
                <ResizablePanel defaultSize={15} minSize={10}>
                  <FileExplorer 
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                  />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            
            <ResizablePanel defaultSize={showFileExplorer ? 85 : 100}>
              <div className="flex flex-col h-full">
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'visual' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={showBlockPalette ? 45 : 60} minSize={30}>
                        <div className="h-full bg-editor-bg relative overflow-hidden">
                          {showBlockPalette && <BlockPalette />}
                          <BlockCanvas project={currentProject} />
                        </div>
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={30} minSize={20}>
                        <CodeEditor project={currentProject} />
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={25} minSize={20}>
                        <SimulationViewport 
                          project={currentProject}
                          blocks={currentProject?.blocks as any[] || []}
                          runTrigger={simulationTrigger}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                  
                  {activeTab === 'python' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={70} minSize={50}>
                        <CodeEditor project={currentProject} fullWidth />
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={30} minSize={25}>
                        <SimulationViewport 
                          project={currentProject}
                          blocks={currentProject?.blocks as any[] || []}
                          runTrigger={simulationTrigger}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                  
                  {activeTab === '3d' && (
                    <div className="h-full">
                      <SimulationViewport 
                        project={currentProject}
                        blocks={currentProject?.blocks as any[] || []}
                        runTrigger={simulationTrigger}
                        fullWidth={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        {showConsole && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={15} minSize={10}>
              {showTestRunner ? <TestRunner /> : <ConsolePanel />}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
