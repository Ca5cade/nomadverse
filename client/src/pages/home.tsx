import { useState, useEffect, useCallback } from "react";
import TopMenuBar from "@/components/ide/TopMenuBar";
import FileExplorer from "@/components/ide/FileExplorer";
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/use-projects';
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Puzzle, BookOpen } from "lucide-react";
import CourseDisplay from "@/components/ide/CourseDisplay";
import { courses, Course } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [simulationTrigger, setSimulationTrigger] = useState(0);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [generatedCode, setGeneratedCode] = useState<string>('');

  useEffect(() => {
    // If loading is finished and there are no projects, create one.
    if (!isLoading && projects && projects.length === 0) {
      createProject.mutateAsync({
        name: 'My First Project',
        blocks: [],
        pythonCode: "# Your amazing code will appear here!\n"
      })
    }
  }, [isLoading, projects, createProject]);
  const { mutate: updateProject } = useUpdateProject();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [programmingMode, setProgrammingMode] = useState<'visual' | 'python' | null>(() => {
    return localStorage.getItem('programmingMode') as 'visual' | 'python' | null;
  });

  const [showCourse, setShowCourse] = useState(true);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(() => {
    const savedCourseIndex = localStorage.getItem('currentCourseIndex');
    return savedCourseIndex ? parseInt(savedCourseIndex, 10) : 0;
  });

  const [courseCompletions, setCourseCompletions] = useState<boolean[]>(() => {
    const savedCompletions = localStorage.getItem('courseCompletions');
    return savedCompletions ? JSON.parse(savedCompletions) : new Array(courses.length).fill(false);
  });

  const course = courses[currentCourseIndex];
  const isCourseComplete = courseCompletions[currentCourseIndex];

  const handleCourseComplete = useCallback(() => {
    const newCompletions = [...courseCompletions];
    newCompletions[currentCourseIndex] = true;
    setCourseCompletions(newCompletions);
    localStorage.setItem('courseCompletions', JSON.stringify(newCompletions));
  }, [courseCompletions, currentCourseIndex]);

  const handleNextCourse = () => {
    if (currentCourseIndex < courses.length - 1) {
      if (currentProject) {
        updateProject({ id: currentProject.id, updates: { blocks: [] } });
      }
      const nextCourseIndex = currentCourseIndex + 1;
      localStorage.setItem('currentCourseIndex', nextCourseIndex.toString());
      window.location.reload();
    }
  };

  const handleClaimCertificate = () => {
    setLocation("/certificate");
  };

  // Select first project by default
  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const currentProject = projects?.find(p => p.id === selectedProject);
  const blocks = currentProject?.blocks || [];

  const handleBlocksChange = useCallback((newBlocks: any[]) => {
    if (currentProject) {
      try {
        const pythonCode = generatePythonCode(newBlocks);
        setGeneratedCode(pythonCode);
        updateProject({
          id: currentProject.id,
          updates: {
            blocks: newBlocks,
            pythonCode,
          },
        });
      } catch (error) {
        console.error("Code generation error:", error);
        setGeneratedCode("# Error generating code");
      }
    }
  }, [currentProject, updateProject]);

  if (isLoading || !currentProject) {
    return <div className="h-screen bg-editor-bg flex items-center justify-center text-text-primary">
      Loading IDE...
    </div>;
  }

  const handleModeSelection = (mode: 'visual' | 'python') => {
    setProgrammingMode(mode);
    localStorage.setItem('programmingMode', mode);
  };

  if (!programmingMode) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (
      <div className="h-screen flex-1 flex items-center justify-center bg-editor-bg">
        <div className="max-w-4xl w-full px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Hi {user.username}, Welcome to NomadVerse
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
  }

  const handleSelectCourse = (index: number) => {
    localStorage.setItem('currentCourseIndex', index.toString());
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-text-primary font-interface overflow-hidden">
      <TopMenuBar 
        onToggleTestRunner={() => setShowTestRunner(!showTestRunner)}
        onRunSimulation={() => setSimulationTrigger(prev => prev + 1)}
        onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        onToggleBlockPalette={() => {}} // This might need a state if we want to toggle it
        onToggleConsole={() => setShowConsole(!showConsole)}
        showFileExplorer={showFileExplorer}
        showBlockPalette={true} // Assuming it's always visible in the new layout
        showConsole={showConsole}
        courses={courses}
        courseCompletions={courseCompletions}
        currentCourseIndex={currentCourseIndex}
        onSelectCourse={handleSelectCourse}
        user={user}
        logout={logout}
      />

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
            <ResizablePanelGroup direction="horizontal">
              {/* Visual Programming Panel */}
              <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <BlockPalette />
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={70} minSize={30}>
                    <BlockCanvas project={currentProject} onBlocksChange={handleBlocksChange} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle />

              {/* Code and Simulation Panel */}
              <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="vertical">
                  {/* Code Editor Panel */}
                  <ResizablePanel defaultSize={40}>
                    <div className="h-full flex flex-col">
                      <div className="bg-panel-bg px-4 py-2 border-b border-border-color flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">Generated Python</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowCourse(!showCourse)}>
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="h-full overflow-y-auto">
                        <CodeEditor project={currentProject} code={generatedCode} readOnly fullWidth height="100%" />
                      </div>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  {/* Simulation Panel */}
                  <ResizablePanel defaultSize={60}>
                    <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={70}>
                        <SimulationViewport 
                          project={currentProject}
                          blocks={blocks as any[]}
                          runTrigger={simulationTrigger}
                          fullWidth
                          onCourseComplete={handleCourseComplete}
                          course={course}
                        />
                      </ResizablePanel>
                      {showConsole && (
                        <>
                          <ResizableHandle />
                          <ResizablePanel defaultSize={30} minSize={10}>
                            {showTestRunner ? <TestRunner /> : <ConsolePanel />}
                          </ResizablePanel>
                        </>
                      )}
                    </ResizablePanelGroup>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              {showCourse && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={20}>
                    <CourseDisplay 
                      title={course.title}
                      instructions={course.instructions}
                      isComplete={isCourseComplete}
                      onNextCourse={handleNextCourse}
                      isLastCourse={currentCourseIndex === courses.length - 1}
                      onClaimCertificate={handleClaimCertificate}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          ) : (
            <CodeEditor project={currentProject} fullWidth />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}