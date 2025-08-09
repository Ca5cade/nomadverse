import * as THREE from 'three';
import { Block } from "@shared/schema";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private robot!: THREE.Group;
  private robotMesh!: THREE.Mesh;
  private animationId: number | null = null;
  private controls!: OrbitControls;

  private robotState: RobotState;
  private commands: SimulationCommand[] = [];
  private isRunning: boolean = false;
  private onStateChange: (state: RobotState) => void;
  private onCommandComplete: (command: SimulationCommand) => void;
  private simulationSpeed: number = 1.0;

  constructor(
    container: HTMLElement,
    onStateChange: (state: RobotState) => void,
    onCommandComplete?: (command: SimulationCommand) => void
  ) {
    this.container = container;
    this.robotState = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      isMoving: false,
      speed: 1.0,
    };
    this.onStateChange = onStateChange;
    this.onCommandComplete = onCommandComplete || (() => {});

    this.initThreeJS();
    this.createRobot();
    this.createEnvironment();
    this.setupLighting();
    this.animate();
    this.handleResize();
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Append the renderer's canvas to the container
    this.container.appendChild(this.renderer.domElement);

    // Initialize OrbitControls for smoother camera interaction
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Enables smooth damping
    this.controls.dampingFactor = 0.05; // Adjust this value for smoothness
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 0, 0); // Set initial target to origin
  }

  private createRobot() {
    this.robot = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4299ff });
    this.robotMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.robotMesh.position.y = 0.25;
    this.robotMesh.castShadow = true;
    this.robot.add(this.robotMesh);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.4, 0.6);
    this.robot.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.4, 0.6);
    this.robot.add(rightEye);

    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftWheel.position.set(-0.6, 0.2, 0);
    leftWheel.rotation.z = Math.PI / 2;
    this.robot.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rightWheel.position.set(0.6, 0.2, 0);
    rightWheel.rotation.z = Math.PI / 2;
    this.robot.add(rightWheel);

    this.scene.add(this.robot);
  }

  private createEnvironment() {
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
    this.scene.add(gridHelper);

    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });

    for (let i = 0; i < 5; i++) {
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(
        (Math.random() - 0.5) * 20,
        0.5,
        (Math.random() - 0.5) * 20
      );
      obstacle.castShadow = true;
      this.scene.add(obstacle);
    }
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  private animate = () => {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.animationId = requestAnimationFrame(this.animate);

    // Update camera controls for smooth movement and interaction
    this.controls.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize = () => {
    const resizeObserver = new ResizeObserver(() => {
      if (this.container) {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        // Update controls on resize to maintain correct aspect ratio
        this.controls.update();
      }
    });

    resizeObserver.observe(this.container);
  }

  public generateCommandsFromBlocks(blocks: Block[]): SimulationCommand[] {
    const commands: SimulationCommand[] = [];

    const startBlock = blocks.find(b => b.type === 'when_flag_clicked');
    if (startBlock) {
      this.processBlock(startBlock, blocks, commands);
    }

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
          delay: 1000 / this.simulationSpeed
        });
        break;

      case 'move_backward':
        commands.push({
          type: 'move_backward',
          value: block.inputs?.steps || 10,
          delay: 1000 / this.simulationSpeed
        });
        break;

      case 'turn_left':
        commands.push({
          type: 'turn_left',
          value: block.inputs?.degrees || 90,
          delay: 800 / this.simulationSpeed
        });
        break;

      case 'turn_right':
        commands.push({
          type: 'turn_right',
          value: block.inputs?.degrees || 90,
          delay: 800 / this.simulationSpeed
        });
        break;

      case 'wait':
        commands.push({
          type: 'wait',
          value: block.inputs?.seconds || 1,
          delay: (block.inputs?.seconds || 1) * 1000 / this.simulationSpeed
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
    }
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
    this.executeCommand(command);
  }

  private executeCommand(command: SimulationCommand): void {
    this.robotState.isMoving = true;
    this.onStateChange(this.robotState);

    switch (command.type) {
      case 'move_forward':
        this.smoothMoveRobot(command.value, command.delay);
        break;
      case 'move_backward':
        this.smoothMoveRobot(-command.value, command.delay);
        break;
      case 'turn_left':
        this.smoothRotateRobot(-command.value, command.delay);
        break;
      case 'turn_right':
        this.smoothRotateRobot(command.value, command.delay);
        break;
      case 'wait':
        setTimeout(() => {
          this.robotState.isMoving = false;
          this.onCommandComplete(command);
          this.onStateChange(this.robotState);
          this.executeNextCommand();
        }, command.delay);
        return;
    }
  }

  private smoothMoveRobot(distance: number, duration: number): void {
    const startPosition = this.robot.position.clone();
    const direction = new THREE.Vector3(0, 0, distance * 0.1);
    direction.applyQuaternion(this.robot.quaternion);
    const targetPosition = startPosition.clone().add(direction);
    
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeInOutCubic for smoother movement
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      this.robot.position.lerpVectors(startPosition, targetPosition, easedProgress);
      
      this.robotState.position = {
        x: this.robot.position.x,
        y: this.robot.position.y,
        z: this.robot.position.z
      };
      this.onStateChange(this.robotState);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.robotState.isMoving = false;
        this.onCommandComplete({ type: 'move_forward', value: distance, delay: duration });
        this.onStateChange(this.robotState);
        this.executeNextCommand();
      }
    };
    
    animate();
  }

  private smoothRotateRobot(degrees: number, duration: number): void {
    const startRotation = this.robot.rotation.y;
    const radians = (degrees * Math.PI) / 180;
    const targetRotation = startRotation + radians;
    
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeInOutCubic for smoother rotation
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      this.robot.rotation.y = startRotation + (targetRotation - startRotation) * easedProgress;
      
      this.robotState.rotation = {
        x: this.robot.rotation.x,
        y: this.robot.rotation.y,
        z: this.robot.rotation.z
      };
      this.onStateChange(this.robotState);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.robotState.isMoving = false;
        this.onCommandComplete({ type: 'turn_right', value: degrees, delay: duration });
        this.onStateChange(this.robotState);
        this.executeNextCommand();
      }
    };
    
    animate();
  }

  public setSpeed(speed: number): void {
    this.simulationSpeed = Math.max(0.1, Math.min(3.0, speed));
    this.robotState.speed = this.simulationSpeed;
  }

  public reset(): void {
    this.robot.position.set(0, 0, 0);
    this.robot.rotation.set(0, 0, 0);
    this.robotState = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      isMoving: false,
      speed: this.simulationSpeed,
    };
    this.onStateChange(this.robotState);
  }

  public pause(): void {
    this.isRunning = false;
    this.robotState.isMoving = false;
    this.onStateChange(this.robotState);
  }

  public stop(): void {
    this.isRunning = false;
    this.commands = [];
    this.robotState.isMoving = false;
    this.onStateChange(this.robotState);
  }

  public setViewMode(mode: '3d' | 'top' | 'side'): void {
    switch (mode) {
      case '3d':
        this.camera.position.set(10, 10, 10);
        this.controls.target.set(0, 0, 0);
        break;
      case 'top':
        this.camera.position.set(0, 20, 0);
        this.controls.target.set(0, 0, 0);
        break;
      case 'side':
        this.camera.position.set(20, 5, 0);
        this.controls.target.set(0, 0, 0);
        break;
    }
    this.camera.lookAt(this.controls.target); // Ensure camera looks at the target
  }

  // Method to get the robot mesh for external use (e.g., for camera following)
  public getRobotMesh(): THREE.Mesh {
    return this.robotMesh;
  }

  // Method to make the camera follow the robot smoothly
  public followRobotSmooth(robotPosition: THREE.Vector3) {
    if (!this.camera || !this.controls) return;

    // Define the target position for the camera, offset from the robot
    const targetPosition = new THREE.Vector3(
      robotPosition.x + 5, // Offset X
      robotPosition.y + 8, // Offset Y for a better view angle
      robotPosition.z + 5  // Offset Z
    );

    // Smoothly interpolate the camera's position towards the target position
    this.camera.position.lerp(targetPosition, 0.05); // 0.05 is the interpolation factor for smoothness

    // Smoothly interpolate the controls' target to follow the robot's position
    const currentTarget = this.controls.target.clone();
    const targetLookAt = new THREE.Vector3(robotPosition.x, robotPosition.y, robotPosition.z);
    currentTarget.lerp(targetLookAt, 0.08); // 0.08 is the interpolation factor for target smoothness
    this.controls.target.copy(currentTarget);

    // Ensure the camera always looks at the updated target
    this.camera.lookAt(this.controls.target);
  }

  public getStats(): { fps: number; position: { x: number; y: number; z: number }; rotation: number; commands: number } {
    return {
      fps: 60, // This is a placeholder, actual FPS calculation would be more complex
      position: this.robotState.position,
      rotation: this.robotState.rotation.y * (180 / Math.PI),
      commands: this.commands.length
    };
  }

  public cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }
  }
}