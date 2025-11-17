import { Block } from "@shared/schema";

export interface RobotState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isMoving: boolean;
  speed: number;
}

export interface SimulationCommand {
  type: 'moveForward' | 'moveBackward' | 'turnLeft' | 'turnRight' | 'wait';
  value: number;
  delay: number;
}

export class Simulation {
  private robotState: RobotState;
  private initialState: RobotState; // Store the initial state
  private commands: SimulationCommand[] = [];
  private isRunning: boolean = false;
  private onStateChange: (state: RobotState) => void;
  private onCommandComplete: (command: SimulationCommand) => void;
  private simulationSpeed: number = 1.0;

  constructor(
    onStateChange: (state: RobotState) => void,
    onCommandComplete?: (command: SimulationCommand) => void
  ) {
    this.robotState = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      isMoving: false,
      speed: 1.0,
    };
    // Deep copy the initial state to preserve it
    this.initialState = JSON.parse(JSON.stringify(this.robotState));
    this.onStateChange = onStateChange;
    this.onCommandComplete = onCommandComplete || (() => {});
  }

  /**
   * Updates the initial state of the simulation, which is used on reset.
   * This is useful for setting the correct starting height of a model.
   */
  public setInitialState(config: { position?: { y: number }; rotation?: { y: number } }) {
    if (config.position) {
      this.initialState.position.y = config.position.y;
    }
    if (config.rotation) {
      this.initialState.rotation.y = config.rotation.y;
    }
    // Apply this new initial state immediately
    this.reset();
  }

  public generateCommandsFromBlocks(blocks: Block[]): SimulationCommand[] {
    const commands: SimulationCommand[] = [];

    const startBlock = blocks.find(b => b.type === 'onStart');
    if (startBlock) {
      this.processBlock(startBlock, blocks, commands);
    }

    blocks.forEach(block => {
      if (block.type !== 'onStart' && !this.isChildBlock(block, blocks)) {
        this.processBlock(block, blocks, commands);
      }
    });

    console.log('Generated Simulation Commands:', commands); // Added for debugging
    return commands;
  }

  private isChildBlock(block: Block, allBlocks: Block[]): boolean {
    return allBlocks.some(b => b.children?.includes(block.id));
  }

  private processBlock(block: Block, allBlocks: Block[], commands: SimulationCommand[]): void {
    const children = (block.children || [])
        .map(childId => allBlocks.find(b => b.id === childId))
        .filter((b): b is Block => !!b)
        .sort((a, b) => a.y - b.y);

    const nestedChildren = (block.type === 'repeat' || block.type === 'if') 
        ? children.filter(child => child.x > block.x)
        : [];
    
    const sequentialChildren = (block.type === 'repeat' || block.type === 'if')
        ? children.filter(child => child.x <= block.x)
        : children;

    // 1. Generate command for the current block
    switch (block.type) {
        case 'onStart':
            break;
        case 'moveForward':
            commands.push({ type: 'moveForward', value: block.inputs?.steps || 10, delay: 1000 / this.simulationSpeed });
            break;
        case 'moveBackward':
            commands.push({ type: 'moveBackward', value: block.inputs?.steps || 10, delay: 1000 / this.simulationSpeed });
            break;
        case 'turnLeft':
            commands.push({ type: 'turnLeft', value: block.inputs?.degrees || 90, delay: 800 / this.simulationSpeed });
            break;
        case 'turnRight':
            commands.push({ type: 'turnRight', value: block.inputs?.degrees || 90, delay: 800 / this.simulationSpeed });
            break;
        case 'wait':
            commands.push({ type: 'wait', value: block.inputs?.seconds || 1, delay: (block.inputs?.seconds || 1) * 1000 / this.simulationSpeed });
            break;
        case 'repeat':
            const times = block.inputs?.times || 10;
            for (let i = 0; i < times; i++) {
                nestedChildren.forEach(child => {
                    this.processBlock(child, allBlocks, commands);
                });
            }
            break;
        case 'if':
            const condition = block.inputs?.condition || 'True';
            if (eval(condition)) { // WARNING: eval is dangerous in real apps, but okay for simulation
                nestedChildren.forEach(child => {
                    this.processBlock(child, allBlocks, commands);
                });
            }
            break;
        case 'touching':
            console.log(`Simulation: Checking if touching ${block.inputs?.object || 'wall'}`);
            break;
        case 'distance':
            console.log(`Simulation: Getting distance to ${block.inputs?.object || 'wall'}`);
            break;
    }

    // 2. Process sequential children
    sequentialChildren.forEach(child => {
        this.processBlock(child, allBlocks, commands);
    });
  }

  public executeCommands(commands: SimulationCommand[]): void {
    this.commands = [...commands];
    this.isRunning = true;
    this.executeNextCommand();
  }

  private executeNextCommand(): void {
    if (this.commands.length === 0 || !this.isRunning) {
      this.isRunning = false;
      this.robotState.isMoving = false;
      this.onStateChange(this.robotState);
      return;
    }

    const command = this.commands.shift()!;
    this.onCommandComplete(command);
  }

  public setSpeed(speed: number): void {
    this.simulationSpeed = Math.max(0.1, Math.min(3.0, speed));
    this.robotState.speed = this.simulationSpeed;
  }

  public reset(): void {
    // Reset to a deep copy of the initial state
    this.robotState = JSON.parse(JSON.stringify(this.initialState));
    this.onStateChange(this.robotState);
  }

  public pause(): void {
    this.isRunning = false;
    this.robotState.isMoving = false;
    this.onStateChange(this.robotState);
  }

  public softReset(): void {
    this.isRunning = false;
    this.commands = [];
    this.robotState.isMoving = false;
    this.onStateChange(this.robotState);
  }

  public stop(): void {
    this.isRunning = false;
    this.commands = [];
    this.robotState.isMoving = false;
    this.onStateChange(this.robotState);
  }

  public getRobotState(): RobotState {
    return this.robotState;
  }
}