import { useState } from "react";
import TopMenuBar from "@/components/ide/TopMenuBar";
import FileExplorer from "@/components/ide/FileExplorer";
import { useProjects, useUpdateProject } from '@/hooks/use-projects';
import { Block } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Puzzle, Play, ArrowRight, ArrowLeft, CheckCircle, Code } from "lucide-react";
import BlockPalette from "@/components/ide/BlockPalette";
import BlockCanvas from "@/components/ide/BlockCanvas";
import CodeEditor from "@/components/ide/CodeEditor";
import SimulationViewport from "@/components/ide/SimulationViewport";
import ConsolePanel from "@/components/ide/ConsolePanel";
import TestRunner from "@/components/ide/TestRunner";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import { generatePythonCode } from '@/lib/codeGenerator';

export type ProgrammingMode = 'visual' | 'python';
export type WorkflowStep = 'select-mode' | 'programming' | 'code-review' | 'simulation';

export default function IDE() {
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('select-mode');
  const [programmingMode, setProgrammingMode] = useState<ProgrammingMode>('visual');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [simulationTrigger, setSimulationTrigger] = useState(0);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const { data: projects, isLoading } = useProjects();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Select first project by default
  if (!selectedProject && projects && projects.length > 0) {
    setSelectedProject(projects[0].id);
  }

  const currentProject = projects?.find(p => p.id === selectedProject);
  const blocks = currentProject?.blocks || [];

  if (isLoading) {
    return <div className="h-screen bg-editor-bg flex items-center justify-center text-text-primary">
      Loading IDE...
    </div>;
  }

  const handleModeSelection = (mode: ProgrammingMode) => {
    setProgrammingMode(mode);
    setWorkflowStep('programming');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 py-4 bg-panel-bg border-b border-border-color">
      {[
        { key: 'select-mode', label: 'Choose Mode', icon: Puzzle },
        { key: 'programming', label: programmingMode === 'visual' ? 'Visual Programming' : 'Code Editor', icon: Code2 },
        { key: 'code-review', label: 'Review Code', icon: CheckCircle },
        { key: 'simulation', label: '3D Simulation', icon: Play }
      ].map((step, index) => {
        const isActive = workflowStep === step.key;
        const isCompleted = ['select-mode', 'programming', 'code-review', 'simulation'].indexOf(workflowStep) > index;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isActive ? 'bg-accent-blue text-white' : 
              isCompleted ? 'bg-accent-green text-white' : 
              'bg-panel-active text-text-muted'
            }`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {index < 3 && <ArrowRight className="w-4 h-4 text-text-muted mx-2" />}
          </div>
        );
      })}
    </div>
  );

  const renderModeSelection = () => (
    <div className="flex-1 flex items-center justify-center bg-editor-bg">
      <div className="max-w-4xl w-full px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Welcome to RobotIDE
          </h1>
          <p className="text-xl text-text-secondary">
            Choose your programming approach to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-panel-bg border-border-color hover:border-accent-blue transition-all hover:scale-105 cursor-pointer group"
                onClick={() => handleModeSelection('visual')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Puzzle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-text-primary">Visual Programming</CardTitle>
              <CardDescription className="text-text-secondary">
                Drag and drop blocks to create robot programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Beginner-friendly interface</li>
                <li>• No coding experience required</li>
                <li>• Real-time code generation</li>
                <li>• Visual feedback and validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-panel-bg border-border-color hover:border-accent-green transition-all hover:scale-105 cursor-pointer group"
                onClick={() => handleModeSelection('python')}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-text-primary">Pure Python</CardTitle>
              <CardDescription className="text-text-secondary">
                Write Python code directly with full control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>• Full programming flexibility</li>
                <li>• Syntax highlighting</li>
                <li>• Advanced debugging tools</li>
                <li>• Professional development</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProgrammingStep = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-panel-bg border-b border-border-color">
        <h2 className="text-lg font-semibold text-text-primary">
          {programmingMode === 'visual' ? 'Visual Programming Workspace' : 'Python Code Editor'}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setWorkflowStep('select-mode')}
            className="border-border-color hover:bg-panel-active"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setWorkflowStep('code-review');
              if (programmingMode === 'visual' && blocks) {
                setGeneratedCode(generatePythonCode(blocks));
              }
            }}
            className="bg-accent-blue hover:bg-accent-blue-hover text-white"
          >
            Next: Review Code
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

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
          {programmingMode === 'visual' ? (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={25} minSize={20}>
                <BlockPalette />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={75} minSize={50}>
                <BlockCanvas project={currentProject} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <CodeEditor project={currentProject} fullWidth />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );

  const renderCodeReviewStep = () => {
    const codeToShow = generatedCode || generatePythonCode(currentProject?.blocks || []);

    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-panel-bg border-b border-border-color">
          <h2 className="text-lg font-semibold text-text-primary">
            Generated Python Code
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWorkflowStep('programming')}
              className="border-border-color hover:bg-panel-active"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <Button 
              size="sm"
              onClick={() => setWorkflowStep('simulation')}
              className="bg-accent-green hover:bg-accent-green/80 text-white"
            >
              Run Simulation
              <Play className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 bg-editor-bg">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Review Your Robot Program
              </h3>
              <p className="text-text-secondary">
                {programmingMode === 'visual' 
                  ? 'This Python code was automatically generated from your visual blocks. Review it before running the simulation.'
                  : 'Review your Python code before running the simulation.'
                }
              </p>
            </div>

            <div className="bg-panel-bg border border-border-color rounded-lg overflow-hidden">
              <CodeEditor project={currentProject} readOnly={true} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimulationStep = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-panel-bg border-b border-border-color">
        <h2 className="text-lg font-semibold text-text-primary">
          3D Robot Simulation
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setWorkflowStep('code-review')}
            className="border-border-color hover:bg-panel-active"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Code
          </Button>
          <Button 
            size="sm"
            onClick={() => setSimulationTrigger(prev => prev + 1)}
            className="bg-accent-green hover:bg-accent-green/80 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={85}>
          <SimulationViewport 
            project={currentProject}
            blocks={currentProject?.blocks as any[] || []}
            runTrigger={simulationTrigger}
            fullWidth={true}
          />
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

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-text-primary font-interface overflow-hidden">
      <TopMenuBar 
        onToggleTestRunner={() => setShowTestRunner(!showTestRunner)}
        onRunSimulation={() => setSimulationTrigger(prev => prev + 1)}
        onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        onToggleBlockPalette={() => {}}
        onToggleConsole={() => setShowConsole(!showConsole)}
        showFileExplorer={showFileExplorer}
        showBlockPalette={true}
        showConsole={showConsole}
      />

      {workflowStep !== 'select-mode' && renderStepIndicator()}

      {workflowStep === 'select-mode' && renderModeSelection()}
      {workflowStep === 'programming' && renderProgrammingStep()}
      {workflowStep === 'code-review' && renderCodeReviewStep()}
      {workflowStep === 'simulation' && renderSimulationStep()}
    </div>
  );
}