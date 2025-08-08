import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, Settings, Maximize2, Camera, Zap } from 'lucide-react';
import { RobotSimulator } from '@/lib/robotSimulator';
import { Slider } from '@/components/ui/slider';

interface SimulationViewportProps {
  project?: any;
  blocks?: any[];
  runTrigger?: number;
  fullWidth?: boolean;
}

export default function SimulationViewport({
  project,
  blocks = [],
  runTrigger = 0,
  fullWidth = false
}: SimulationViewportProps) {
  const [isRunning, setIsRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulatorRef = useRef<RobotSimulator | null>(null);
  const [speed, setSpeed] = useState([1]);
  const [stats, setStats] = useState({
    fps: 60,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    commands: 0
  });
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side'>('3d');

  useEffect(() => {
    if (canvasRef.current) {
      simulatorRef.current = new RobotSimulator(
        (state) => {
          setStats(prev => ({
            ...prev,
            position: state.position,
            rotation: state.rotation.y
          }));
        },
        (command) => {
          setStats(prev => ({
            ...prev,
            commands: prev.commands + 1
          }));
        }
      );
      
      const updateStats = () => {
        if (simulatorRef.current) {
          const robotStats = simulatorRef.current.getStats();
          setStats(robotStats);
        }
      };

      const interval = setInterval(updateStats, 100);
      return () => {
        clearInterval(interval);
        if (simulatorRef.current) {
          simulatorRef.current.cleanup();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setSpeed(speed[0]);
    }
  }, [speed]);

  // Run simulation when trigger changes
  useEffect(() => {
    if (runTrigger > 0 && simulatorRef.current && blocks.length > 0) {
      setIsRunning(true);
      simulatorRef.current.executeCommands(simulatorRef.current.generateCommandsFromBlocks(blocks));
    }
  }, [runTrigger, blocks]);

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
                onClick={() => setIsRunning(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsRunning(false)}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setIsRunning(false);
                if (simulatorRef.current) {
                  simulatorRef.current.stop();
                }
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
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
      <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f172a 100%)' }}
        />
        
        {/* Overlay Stats */}
        <div className="absolute top-4 right-4 bg-panel-bg/90 backdrop-blur-sm border border-border-color rounded-lg p-3 shadow-lg">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-text-muted">FPS:</span>
              <span className="text-text-primary font-mono">{stats.fps}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-text-muted">Position:</span>
              <span className="text-text-primary font-mono">
                ({stats.position.x.toFixed(1)}, {stats.position.y.toFixed(1)}, {stats.position.z.toFixed(1)})
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-text-muted">Rotation:</span>
              <span className="text-text-primary font-mono">{stats.rotation.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-text-muted">Commands:</span>
              <span className="text-text-primary font-mono">{stats.commands}</span>
            </div>
          </div>
        </div>

        {/* Speed Control */}
        <div className="absolute bottom-4 left-4 bg-panel-bg/90 backdrop-blur-sm border border-border-color rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-3 text-xs">
            <Zap className="w-3.5 h-3.5 text-accent-yellow" />
            <span className="text-text-muted">Speed:</span>
            <div className="w-20">
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={3}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-text-primary font-mono w-8">{speed[0].toFixed(1)}x</span>
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