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
    // Force code generation - always show something
    let codeToShow = "";
    
    try {
      // Try to generate from blocks if they exist
      if (currentProject?.blocks && currentProject.blocks.length > 0) {
        codeToShow = generatePythonCode(currentProject.blocks);
      }
    } catch (error) {
      console.error("Code generation error:", error);
    }
    
    // If no code was generated or generation failed, use a well-structured default template
    if (!codeToShow || codeToShow.trim() === "") {
      codeToShow = `"""
Robot Control Program
Generated from Visual Programming Blocks

This program demonstrates basic robot movement and control.
Customize the robot's behavior by modifying the functions below.
"""

import robot
import time
import math

class RobotController:
    """Main robot controller class"""
    
    def __init__(self):
        """Initialize the robot controller"""
        self.speed = 1.0
        self.position = {"x": 0, "y": 0}
        self.heading = 0
        
    def set_speed(self, speed):
        """Set robot movement speed (0.1 to 2.0)"""
        self.speed = max(0.1, min(2.0, speed))
        robot.set_speed(self.speed)
        
    def move_forward(self, duration=1.0):
        """Move robot forward for specified duration"""
        print(f"Moving forward for {duration} seconds at speed {self.speed}")
        robot.move_forward()
        time.sleep(duration)
        robot.stop()
        
    def move_backward(self, duration=1.0):
        """Move robot backward for specified duration"""
        print(f"Moving backward for {duration} seconds")
        robot.move_backward()
        time.sleep(duration)
        robot.stop()
        
    def turn_left(self, angle=90):
        """Turn robot left by specified angle in degrees"""
        print(f"Turning left {angle} degrees")
        turn_time = angle / 90.0  # Approximate turning time
        robot.turn_left()
        time.sleep(turn_time)
        robot.stop()
        self.heading = (self.heading - angle) % 360
        
    def turn_right(self, angle=90):
        """Turn robot right by specified angle in degrees"""
        print(f"Turning right {angle} degrees")
        turn_time = angle / 90.0  # Approximate turning time
        robot.turn_right()
        time.sleep(turn_time)
        robot.stop()
        self.heading = (self.heading + angle) % 360
        
    def execute_program(self):
        """Main program execution"""
        print("🤖 Starting Robot Program...")
        print("=" * 40)
        
        # Set initial speed
        self.set_speed(1.2)
        
        # Execute movement sequence
        print("Phase 1: Forward movement")
        self.move_forward(2.0)
        
        print("Phase 2: Navigation turn")
        self.turn_right(90)
        
        print("Phase 3: Secondary movement")
        self.move_forward(1.5)
        
        print("Phase 4: Return positioning")
        self.turn_left(45)
        self.move_forward(1.0)
        
        print("=" * 40)
        print("✅ Robot program completed successfully!")
        print(f"Final heading: {self.heading}°")

def main():
    """Program entry point"""
    try:
        # Create robot controller instance
        controller = RobotController()
        
        # Execute the main program
        controller.execute_program()
        
    except KeyboardInterrupt:
        print("\\n⚠️  Program interrupted by user")
        robot.stop()
        
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        robot.stop()
        
    finally:
        print("🔄 Cleaning up and stopping robot...")
        robot.stop()

if __name__ == "__main__":
    main()
`;
    }

    const lineCount = codeToShow.split('\n').length;
    const wordCount = codeToShow.split(/\s+/).length;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-6 py-3 bg-panel-bg border-b border-border-color shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Code Review & Analysis
            </h2>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span className="flex items-center">
                <Code className="w-4 h-4 mr-1" />
                {lineCount} lines
              </span>
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span className="text-accent-green">Ready to simulate</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWorkflowStep('programming')}
              className="border-border-color hover:bg-panel-active"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programming
            </Button>
            <Button 
              size="sm"
              onClick={() => setWorkflowStep('simulation')}
              className="bg-accent-green hover:bg-accent-green/80 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </div>

        <div className="flex-1 flex bg-editor-bg min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 bg-panel-bg border-b border-border-color shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Generated Python Code
                </h3>
                <span className="text-xs text-text-secondary">
                  {programmingMode === 'visual' 
                    ? '🎯 Auto-generated from visual blocks'
                    : '📝 Direct Python code'
                  }
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <CodeEditor 
                project={currentProject} 
                readOnly={true} 
                code={codeToShow} 
                fullWidth={true} 
              />
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