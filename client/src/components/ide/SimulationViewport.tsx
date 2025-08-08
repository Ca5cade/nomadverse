import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Maximize, Play, Pause, Square } from "lucide-react";
import { initializeThreeScene, updateRobotPosition, updateRobotRotation } from "@/lib/threeUtils";
import { RobotSimulator, type RobotState } from "@/lib/robotSimulator";
import type { Project } from "@shared/schema";
import { Block } from "@shared/schema";

interface SimulationViewportProps {
  project?: Project;
  fullWidth?: boolean;
  blocks?: Block[];
  onRun?: () => void;
  runTrigger?: number;
}

export default function SimulationViewport({ project, fullWidth = false, blocks = [], onRun, runTrigger }: SimulationViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const simulatorRef = useRef<RobotSimulator | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [robotState, setRobotState] = useState<RobotState>({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    isMoving: false,
    speed: 1.0
  });
  const [stats, setStats] = useState({
    fps: 60,
    objects: 3,
    time: 0,
  });
  
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);

  useEffect(() => {
    if (canvasRef.current && !sceneRef.current) {
      sceneRef.current = initializeThreeScene(canvasRef.current);
      
      // Initialize robot simulator
      simulatorRef.current = new RobotSimulator(
        (state: RobotState) => {
          setRobotState(state);
          if (sceneRef.current) {
            updateRobotPosition(sceneRef.current, state.position);
            updateRobotRotation(sceneRef.current, state.rotation);
          }
        },
        (command) => {
          console.log('Command completed:', command.type, command.value);
        }
      );
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      simulatorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (project?.sceneConfig && sceneRef.current) {
      // Update scene with project configuration
      console.log('Updating scene with config:', project.sceneConfig);
    }
  }, [project?.sceneConfig]);

  const handlePlay = async () => {
    if (!simulatorRef.current || isRunning) return;
    
    setIsRunning(true);
    setStats(prev => ({ ...prev, time: 0 }));
    
    // Generate commands from current blocks
    const commands = simulatorRef.current.generateCommandsFromBlocks(blocks);
    console.log('Generated commands:', commands);
    
    // Execute simulation
    const startTime = Date.now();
    const timer = setInterval(() => {
      setStats(prev => ({ ...prev, time: (Date.now() - startTime) / 1000 }));
    }, 100);
    
    try {
      await simulatorRef.current.executeCommands(commands);
    } catch (error) {
      console.error('Simulation error:', error);
    }
    
    clearInterval(timer);
    setIsRunning(false);
    
    if (onRun) {
      onRun();
    }
  };

  const handlePause = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stopSimulation();
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStats(prev => ({ ...prev, time: 0 }));
    
    if (simulatorRef.current) {
      simulatorRef.current.resetRobot();
    }
  };

  const handleResetView = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  };

  // Update simulation speed
  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setSimulationSpeed(simulationSpeed);
    }
  }, [simulationSpeed]);

  // Handle external run trigger
  useEffect(() => {
    if (runTrigger && runTrigger > 0) {
      handlePlay();
    }
  }, [runTrigger]);

  const handleFullscreen = () => {
    if (canvasRef.current) {
      canvasRef.current.requestFullscreen();
    }
  };

  return (
    <div className={`bg-black border-l border-border-color flex flex-col ${fullWidth ? 'flex-1' : 'w-96'}`}>
      <div className="bg-panel-bg px-4 py-2 border-b border-border-color flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">3D Simulation</span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={handleResetView}
            data-testid="button-reset-view"
          >
            <Home className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={handleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          data-testid="simulation-canvas"
        />

        {/* Simulation Controls */}
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handlePlay}
            disabled={isRunning}
            data-testid="button-play-simulation"
          >
            <Play className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white"
            onClick={handlePause}
            disabled={!isRunning}
            data-testid="button-pause-simulation"
          >
            <Pause className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleReset}
            data-testid="button-reset-simulation"
          >
            <Square className="w-3 h-3" />
          </Button>
        </div>

        {/* Simulation Stats */}
        <div 
          className="absolute top-4 right-4 bg-black bg-opacity-70 rounded p-3 text-xs space-y-2"
          data-testid="simulation-stats"
        >
          <div className="flex justify-between">
            <span className="text-text-secondary">FPS:</span>
            <span className="text-green-400">{stats.fps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Objects:</span>
            <span className="text-text-primary">{stats.objects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Time:</span>
            <span className="text-text-primary">{stats.time.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Speed:</span>
            <div className="flex items-center space-x-1">
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1" 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-12 h-1"
                data-testid="simulation-speed-slider"
              />
              <span className="text-text-primary w-8">{simulationSpeed.toFixed(1)}x</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Status:</span>
            <span className={isRunning ? "text-green-400" : robotState.isMoving ? "text-blue-400" : "text-orange-400"}>
              {isRunning ? "Running" : robotState.isMoving ? "Moving" : "Ready"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Position:</span>
            <span className="text-text-primary">
              ({robotState.position.x.toFixed(1)}, {robotState.position.z.toFixed(1)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Angle:</span>
            <span className="text-text-primary">{robotState.rotation.y.toFixed(0)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
