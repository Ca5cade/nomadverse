import { Block } from "@shared/schema";

export interface RobotState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isMoving: boolean;
  speed: number;
}

export interface SimulationCommand {
  type: 'move_forward' | 'move_backward' | 'turn_left' | 'turn_right' | 'wait';
  value: number;
  delay: number;
}

export class RobotSimulator {
  private robot: RobotState;
  private commands: SimulationCommand[] = [];
  private isRunning: boolean = false;
  private onStateChange: (state: RobotState) => void;
  private onCommandComplete: (command: SimulationCommand) => void;
  private simulationSpeed: number = 1.0;

  constructor(
    onStateChange: (state: RobotState) => void,
    onCommandComplete?: (command: SimulationCommand) => void
  ) {
    this.robot = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      isMoving: false,
      speed: 1.0,
    };
    this.onStateChange = onStateChange;
    this.onCommandComplete = onCommandComplete || (() => {});
  }

  public generateCommandsFromBlocks(blocks: Block[]): SimulationCommand[] {
    const commands: SimulationCommand[] = [];
    
    // Find the start block and process the sequence
    const startBlock = blocks.find(b => b.type === 'when_flag_clicked');
    if (startBlock) {
      this.processBlock(startBlock, blocks, commands);
    }

    // Process other standalone blocks
    blocks.forEach(block => {
      if (block.type !== 'when_flag_clicked' && !this.isChildBlock(block, blocks)) {
        this.processBlock(block, blocks, commands);
      }
    });

    return commands;
  }

  private isChildBlock(block: Block, allBlocks: Block[]): boolean {
    return allBlocks.some(b => b.children?.includes(block.id));
  }

  private processBlock(block: Block, allBlocks: Block[], commands: SimulationCommand[]): void {
    switch (block.type) {
      case 'move_forward':
        commands.push({
          type: 'move_forward',
          value: block.inputs?.steps || 10,
          delay: 1000
        });
        break;
      
      case 'move_backward':
        commands.push({
          type: 'move_backward',
          value: block.inputs?.steps || 10,
          delay: 1000
        });
        break;
      
      case 'turn_left':
        commands.push({
          type: 'turn_left',
          value: block.inputs?.degrees || 90,
          delay: 800
        });
        break;
      
      case 'turn_right':
        commands.push({
          type: 'turn_right',
          value: block.inputs?.degrees || 90,
          delay: 800
        });
        break;
      
      case 'wait':
        commands.push({
          type: 'wait',
          value: block.inputs?.seconds || 1,
          delay: (block.inputs?.seconds || 1) * 1000
        });
        break;
      
      case 'repeat':
        const times = block.inputs?.times || 10;
        for (let i = 0; i < times; i++) {
          if (block.children) {
            block.children.forEach(childId => {
              const childBlock = allBlocks.find(b => b.id === childId);
              if (childBlock) {
                this.processBlock(childBlock, allBlocks, commands);
              }
            });
          }
        }
        break;
      
      case 'if':
        // For now, always execute if blocks (simplified logic)
        if (block.children) {
          block.children.forEach(childId => {
            const childBlock = allBlocks.find(b => b.id === childId);
            if (childBlock) {
              this.processBlock(childBlock, allBlocks, commands);
            }
          });
        }
        break;
    }
  }

  public async executeCommands(commands: SimulationCommand[]): Promise<void> {
    this.commands = commands;
    this.isRunning = true;

    for (const command of this.commands) {
      if (!this.isRunning) break;

      await this.executeCommand(command);
      this.onCommandComplete(command);
    }

    this.robot.isMoving = false;
    this.onStateChange(this.robot);
    this.isRunning = false;
  }

  private async executeCommand(command: SimulationCommand): Promise<void> {
    this.robot.isMoving = true;
    this.onStateChange(this.robot);

    return new Promise((resolve) => {
      const delay = command.delay / this.simulationSpeed;
      
      switch (command.type) {
        case 'move_forward':
          this.moveRobot(command.value);
          break;
        case 'move_backward':
          this.moveRobot(-command.value);
          break;
        case 'turn_left':
          this.turnRobot(-command.value);
          break;
        case 'turn_right':
          this.turnRobot(command.value);
          break;
        case 'wait':
          // Just wait, no robot movement
          break;
      }

      this.onStateChange(this.robot);
      
      setTimeout(() => {
        this.robot.isMoving = false;
        this.onStateChange(this.robot);
        resolve();
      }, delay);
    });
  }

  private moveRobot(distance: number): void {
    // Calculate movement based on current rotation
    const angleInRadians = (this.robot.rotation.y * Math.PI) / 180;
    const deltaX = Math.sin(angleInRadians) * distance * 0.5; // Scale factor for visualization
    const deltaZ = Math.cos(angleInRadians) * distance * 0.5;
    
    this.robot.position.x += deltaX;
    this.robot.position.z += deltaZ;
  }

  private turnRobot(degrees: number): void {
    this.robot.rotation.y += degrees;
    // Normalize rotation to 0-360 degrees
    this.robot.rotation.y = ((this.robot.rotation.y % 360) + 360) % 360;
  }

  public setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
  }

  public getRobotState(): RobotState {
    return { ...this.robot };
  }

  public resetRobot(): void {
    this.robot = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      isMoving: false,
      speed: 1.0,
    };
    this.onStateChange(this.robot);
  }

  public stopSimulation(): void {
    this.isRunning = false;
    this.robot.isMoving = false;
    this.onStateChange(this.robot);
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }
}