import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings, Zap, Activity, Maximize2, Camera } from "lucide-react";
import { RobotSimulator } from '@/lib/robotSimulator';
import { Project } from '@/shared/schema';
import { generatePythonCode } from '@/lib/codeGenerator';

interface SimulationViewportProps {
  project?: any;
  blocks?: any[];
  runTrigger?: number;
  fullWidth?: boolean;
  onToggleSimulation?: () => void;
  onStopSimulation?: () => void;
}

export default function SimulationViewport({
  project,
  blocks = [],
  runTrigger = 0,
  fullWidth = false,
  onToggleSimulation = () => {},
  onStopSimulation = () => {}
}: SimulationViewportProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0, z: 0 });
  const [executionStep, setExecutionStep] = useState(0);
  const [cameraFollowRobot, setCameraFollowRobot] = useState(true);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<RobotSimulator | null>(null);
  const animationIdRef = useRef<number>();
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const [stats, setStats] = useState({
    fps: 60,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    commands: 0
  });
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side'>('3d');


  const runSimulation = useCallback(() => {
    if (simulatorRef.current && blocks.length > 0) {
      setIsRunning(true);
      simulatorRef.current.executeCommands(simulatorRef.current.generateCommandsFromBlocks(blocks));
    }
  }, [blocks]);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
    if (simulatorRef.current) {
      simulatorRef.current.pause();
    }
  }, []);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    if (simulatorRef.current) {
      simulatorRef.current.reset();
    }
    setExecutionStep(0);
    setStats(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 }, rotation: 0, commands: 0 }));
  }, []);


  const animate = useCallback(() => {
    if (!simulatorRef.current) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;

    // Target 60 FPS, skip frames if needed for performance
    if (deltaTime >= 16.67) {
      simulatorRef.current.animate();

      // Update robot position smoothly
      const robotMesh = simulatorRef.current.getRobotMesh();
      if (robotMesh) {
        setRobotPosition({
          x: robotMesh.position.x,
          y: robotMesh.position.y,
          z: robotMesh.position.z
        });

        // Smooth camera following
        if (cameraFollowRobot) {
          simulatorRef.current.followRobotSmooth(robotMesh.position);
        }
      }

      frameCountRef.current++;
      lastFrameTimeRef.current = currentTime;
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }, [cameraFollowRobot]);

  useEffect(() => {
    if (!mountRef.current) return;

    const handleStateChange = (state: any) => {
      setRobotPosition(state.position);
      setStats(prev => ({
        ...prev,
        position: state.position,
        rotation: state.rotation.y * (180 / Math.PI)
      }));
    };

    const handleCommandComplete = (command: any) => {
      setExecutionStep(prev => prev + 1);
    };

    const simulator = new RobotSimulator(
      mountRef.current,
      handleStateChange,
      handleCommandComplete
    );
    simulatorRef.current = simulator;
    lastFrameTimeRef.current = performance.now();

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      simulator.cleanup();
    };
  }, [animate]);

  useEffect(() => {
    if (runTrigger > 0) {
      runSimulation();
    }
  }, [runTrigger]);

  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setSpeed(simulationSpeed);
    }
  }, [simulationSpeed]);

  const handleReset = () => {
    if (simulatorRef.current) {
      simulatorRef.current.reset();
      setStats(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 }, rotation: 0, commands: 0 }));
    }
  };

  const handleViewChange = (mode: '3d' | 'top' | 'side') => {
    setViewMode(mode);
    if (simulatorRef.current) {
      simulatorRef.current.setViewMode(mode);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-panel-bg via-panel-hover to-panel-bg border-l border-border-color shadow-premium flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-color bg-gradient-to-r from-panel-hover to-panel-active backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-green to-accent-purple shadow-sm">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span>3D Simulation</span>
            <span className="text-xs text-text-muted bg-panel-bg px-2 py-0.5 rounded-full">
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </h3>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 w-7 p-0 hover:bg-orange-500/10 hover:text-orange-400 transition-all hover:scale-110"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-accent-blue/10 hover:text-accent-blue transition-all hover:scale-110"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-accent-purple/10 hover:text-accent-purple transition-all hover:scale-110"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={runSimulation}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={pauseSimulation}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={resetSimulation}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-panel-bg rounded-lg p-1 border border-border-color">
            {[
              { mode: '3d' as const, label: '3D' },
              { mode: 'top' as const, label: 'Top' },
              { mode: 'side' as const, label: 'Side' }
            ].map(({ mode, label }) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                className={`h-6 px-3 text-xs transition-all ${
                  viewMode === mode
                    ? 'bg-accent-blue text-white shadow-sm'
                    : 'hover:bg-panel-hover text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => handleViewChange(mode)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden" ref={mountRef}>

        {/* Control Buttons */}
        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-glass-bg border border-glass-border text-text-primary hover:bg-panel-active backdrop-blur-sm shadow-premium transition-all hover:scale-105"
            data-testid="simulation-play"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={pauseSimulation}
            disabled={!isRunning}
            className="bg-glass-bg border border-glass-border text-text-primary hover:bg-panel-active backdrop-blur-sm shadow-premium transition-all hover:scale-105"
            data-testid="simulation-pause"
          >
            <Pause className="w-4 h-4 mr-1" />
            Pause
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetSimulation}
            className="bg-glass-bg border border-glass-border text-text-primary hover:bg-panel-active backdrop-blur-sm shadow-premium transition-all hover:scale-105"
            data-testid="simulation-reset"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCameraFollowRobot(!cameraFollowRobot)}
            className={`bg-glass-bg border border-glass-border backdrop-blur-sm shadow-premium transition-all hover:scale-105 ${
              cameraFollowRobot ? 'text-accent-blue' : 'text-text-primary hover:bg-panel-active'
            }`}
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Follow
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className={`bg-glass-bg border border-glass-border backdrop-blur-sm shadow-premium transition-all hover:scale-105 ${
              showDebugInfo ? 'text-accent-green' : 'text-text-primary hover:bg-panel-active'
            }`}
          >
            <Activity className="w-4 h-4 mr-1" />
            Debug
          </Button>
        </div>


        {/* Overlay Stats */}
        <div className="absolute top-4 right-4 z-10">
        <div className="bg-glass-bg border border-glass-border rounded-lg p-4 backdrop-blur-sm shadow-premium max-w-xs transition-all duration-300">
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isRunning ? 'bg-accent-green animate-pulse shadow-lg shadow-accent-green/50' : 'bg-text-muted'
            }`} />
            <h3 className="text-sm font-semibold text-text-primary">
              Simulation Status
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>State:</span>
              <span className={`transition-colors duration-300 ${
                isRunning ? 'text-accent-green font-medium' : 'text-text-muted'
              }`}>
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Speed:</span>
              <span className="text-accent-blue font-medium">{simulationSpeed}x</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Step:</span>
              <span className="text-text-primary font-mono">{executionStep}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Position:</span>
              <span className="text-text-primary font-mono">
                ({robotPosition.x.toFixed(1)}, {robotPosition.z.toFixed(1)})
              </span>
            </div>
            {showDebugInfo && (
              <>
                <div className="flex justify-between text-text-secondary">
                  <span>FPS:</span>
                  <span className="text-accent-purple font-mono">
                    {Math.round(1000 / Math.max(16.67, performance.now() - lastFrameTimeRef.current))}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Camera:</span>
                  <span className={cameraFollowRobot ? 'text-accent-blue' : 'text-text-muted'}>
                    {cameraFollowRobot ? 'Following' : 'Free'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3">
            <label className="text-xs text-text-secondary mb-1 block">Speed Control</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-panel-active rounded-lg appearance-none cursor-pointer transition-all hover:scale-105"
              style={{
                background: `linear-gradient(to right, var(--accent-blue) 0%, var(--accent-blue) ${((simulationSpeed - 0.5) / 2.5) * 100}%, var(--panel-active) ${((simulationSpeed - 0.5) / 2.5) * 100}%, var(--panel-active) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>0.5x</span>
              <span>3x</span>
            </div>
          </div>
        </div>
      </div>

        {/* Loading Overlay */}
        {!simulatorRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-panel-bg/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-text-muted">Initializing 3D simulation...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border-color bg-panel-bg flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Advanced 3D Simulation Engine v2.0
        </p>
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span>{isRunning ? 'Simulating' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}