import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings, Zap, Activity, Maximize2, Minimize2, Camera } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RobotSimulator } from '@/lib/robotSimulator';
import { Project } from '@shared/schema';
import { Course } from '@/lib/courses';

interface SimulationViewportProps {
  project?: any;
  blocks?: any[];
  runTrigger?: number;
  fullWidth?: boolean;
  onToggleSimulation?: () => void;
  onStopSimulation?: () => void;
  onCourseComplete?: () => void;
  course?: Course;
  isCourseComplete?: boolean;
  unlockedCharacters: string[];
  selectedCharacter: string;
  onCharacterChange: (characterName: string) => void;
}

export default function SimulationViewport({
  project,
  blocks = [],
  runTrigger = 0,
  fullWidth = false,
  onToggleSimulation = () => {},
  onStopSimulation = () => {},
  onCourseComplete = () => {},
  course,
  isCourseComplete,
  unlockedCharacters,
  selectedCharacter,
  onCharacterChange,
}: SimulationViewportProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side'>('3d');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCharacterLoading, setIsCharacterLoading] = useState(false); // NEW state
  const [characterLoadError, setCharacterLoadError] = useState<string | null>(null); // NEW state
  const mountRef = useRef<HTMLDivElement>(null);
  const simulatorRef = useRef<RobotSimulator | null>(null);
  const animationIdRef = useRef<number>();

  const runSimulation = useCallback(() => {
    if (simulatorRef.current && blocks.length > 0) {
      simulatorRef.current.executeCommands(blocks);
      setIsRunning(true);
    }
  }, [blocks]);

  const pauseSimulation = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.pause();
      setIsRunning(false);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.softReset();
      setIsRunning(false);
      setExecutionStep(0);
    }
  }, []);

  const handleViewChange = (mode: '3d' | 'top' | 'side') => {
    setViewMode(mode);
    if (simulatorRef.current) {
      simulatorRef.current.setViewMode(mode);
    }
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      mountRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const handleCharacterLoadComplete = useCallback(() => {
    setIsCharacterLoading(false);
    setCharacterLoadError(null);
    setIsLoading(false); // Only set overall loading to false after character is loaded
  }, []);

  const handleCharacterLoadError = useCallback((error: any) => {
    setIsCharacterLoading(false);
    setCharacterLoadError(`Failed to load character: ${error.message || error}`);
    setIsLoading(false); // Still set overall loading to false, but with an error
    console.error("Character loading error:", error);
  }, []);

  // Effect to initialize the simulator
  useEffect(() => {
    if (!mountRef.current || !course) return;

    setIsCharacterLoading(true); // Set loading true before simulator init
    const simulator = new RobotSimulator(
      mountRef.current,
      onCourseComplete,
      course,
      selectedCharacter,
      handleCharacterLoadComplete, // Pass callback
      handleCharacterLoadError // Pass callback
    );
    simulatorRef.current = simulator;
    // setIsLoading(false); // Moved to handleCharacterLoadComplete

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      simulator.animate();
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      simulator.cleanup();
    };
  }, [onCourseComplete, course, selectedCharacter, handleCharacterLoadComplete, handleCharacterLoadError]); // Added selectedCharacter to dependencies

  // Effect to handle character changes
  useEffect(() => {
    if (simulatorRef.current && !isLoading) { // Only try to load if simulator is initialized
      setIsCharacterLoading(true);
      setCharacterLoadError(null); // Clear previous errors
      simulatorRef.current.loadCharacter(
        selectedCharacter,
        handleCharacterLoadComplete,
        handleCharacterLoadError
      );
    }
  }, [selectedCharacter, isLoading, handleCharacterLoadComplete, handleCharacterLoadError]);
  
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

  return (
    <div className={`h-full bg-transparent border-l border-border-color shadow-premium flex flex-col relative overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50' : ''}`} ref={mountRef}>
      {/* Header */}
      {!isFullScreen && (
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
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <>
                <Button
                  size="sm"
                  onClick={runSimulation}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center space-x-2 shadow-md hover:shadow-lg transition-all hover:scale-105 font-semibold px-4"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <label htmlFor="character-select" className="text-sm font-medium text-text-secondary">Character:</label>
                  <Select value={selectedCharacter} onValueChange={onCharacterChange}>
                    <SelectTrigger id="character-select" className="w-[150px] bg-panel-bg border-border-color text-text-primary">
                      <SelectValue placeholder="Character" />
                    </SelectTrigger>
                    <SelectContent>
                      {unlockedCharacters.map(charName => (
                        <SelectItem key={charName} value={charName}>{charName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
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
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={toggleFullScreen}
        className="absolute top-4 right-4 h-6 px-3 text-xs transition-all bg-panel-bg hover:bg-panel-hover text-text-secondary hover:text-text-primary z-50"
      >
        {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </Button>

      {/* Canvas */}
      {(isLoading || isCharacterLoading) && ( // Show loading if either is true
        <div className="absolute inset-0 flex items-center justify-center bg-panel-bg/50 backdrop-blur-sm z-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-text-muted">
              {characterLoadError ? characterLoadError : (isCharacterLoading ? `Loading ${selectedCharacter} model...` : 'Initializing 3D simulation...')}
            </p>
          </div>
        </div>
      )}
      {characterLoadError && !isCharacterLoading && ( // Show error if present and not loading
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur-sm z-20">
          <div className="text-center text-white p-4 rounded-lg bg-red-700 shadow-lg">
            <p className="text-lg font-bold">Error Loading Model</p>
            <p className="text-sm">{characterLoadError}</p>
            <p className="text-xs mt-2">Please try again or select a different character.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      {!isFullScreen && (
      <div className="p-3 border-t border-border-color bg-panel-bg flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Advanced 3D Simulation Engine v2.0
        </p>
        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span>{isRunning ? 'Simulating' : 'Ready'}</span>
        </div>
      </div>
      )}
    </div>
  );
}
