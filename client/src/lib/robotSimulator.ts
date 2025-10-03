import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Simulation, RobotState, SimulationCommand } from './simulation';

export class RobotSimulator {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private robot!: THREE.Group;
  private robotMesh!: THREE.Mesh;
  private animationId: number | null = null;
  private controls!: OrbitControls;
  private simulation: Simulation;
  private resizeObserver!: ResizeObserver;

  private onCourseComplete: () => void;

  private obstacles: { position: { x: number; y: number; z: number }; size: { x: number; y: number; z: number } }[] = [];

  constructor(container: HTMLElement, onCourseComplete: () => void, obstacles?: { position: { x: number; y: number; z: number }; size: { x: number; y: number; z: number } }[]) {
    this.container = container;
    this.onCourseComplete = onCourseComplete;
    if (obstacles) {
      this.obstacles = obstacles;
    }
    this.initThreeJS();
    this.createRobot();
    this.createEnvironment();
    this.setupLighting();
    this.handleResize();

    this.simulation = new Simulation(
      this.handleStateChange,
      this.handleCommandComplete
    );
  }

  private initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = null;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 0, 0);
  }

  private createRobot() {
    this.robot = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 0.6, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.8, roughness: 0.2, envMapIntensity: 0.8 });
    this.robotMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.robotMesh.position.y = 0.5;
    this.robotMesh.castShadow = true;
    this.robot.add(this.robotMesh);

    const headGeometry = new THREE.SphereGeometry(0.3, 32, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.7, roughness: 0.3 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2;
    head.castShadow = true;
    this.robot.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(0, 1.25, 0.25);
    this.robot.add(eye);

    const wheelGeometry = new THREE.TorusGeometry(0.25, 0.1, 16, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.9, roughness: 0.5 });

    const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftWheel.position.set(-0.6, 0.3, 0);
    leftWheel.rotation.y = Math.PI / 2;
    this.robot.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rightWheel.position.set(0.6, 0.3, 0);
    rightWheel.rotation.y = Math.PI / 2;
    this.robot.add(rightWheel);

    this.robot.scale.set(0.5, 0.5, 0.5);
    this.scene.add(this.robot);
  }

  private createEnvironment() {
    const gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(gridHelper);

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.2, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const finishLineGeometry = new THREE.BoxGeometry(0.1, 1, 10);
    const finishLineMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.position.set(10, 0.5, 0);
    this.scene.add(finishLine);

    this.obstacles.forEach(obstacleData => {
      const obstacleGeometry = new THREE.BoxGeometry(obstacleData.size.x, obstacleData.size.y, obstacleData.size.z);
      const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(obstacleData.position.x, obstacleData.position.y, obstacleData.position.z);
      obstacle.castShadow = true;
      this.scene.add(obstacle);
    });
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

  private courseCompleted = false;

  public animate = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (!this.courseCompleted && this.robot.position.x > 10) {
      this.courseCompleted = true;
      this.onCourseComplete();
    }
  }

  private handleResize = () => {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.container) {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.controls.update();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private handleStateChange = (state: RobotState) => {
    this.robot.position.set(state.position.x, state.position.y, state.position.z);
    this.robot.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
  }

  private handleCommandComplete = (command: SimulationCommand) => {
    switch (command.type) {
      case 'moveForward': this.smoothMoveRobot(command.value, command.delay); break;
      case 'moveBackward': this.smoothMoveRobot(-command.value, command.delay); break;
      case 'turnLeft': this.smoothRotateRobot(-command.value, command.delay); break;
      case 'turnRight': this.smoothRotateRobot(command.value, command.delay); break;
      case 'wait': setTimeout(() => this.simulation.executeNextCommand(), command.delay); break;
    }
  }

  private checkCollisions(): boolean {
    const robotBoundingBox = new THREE.Box3().setFromObject(this.robot);
    for (const obstacle of this.scene.children) {
      if (obstacle !== this.robot && obstacle.castShadow) {
        const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);
        if (robotBoundingBox.intersectsBox(obstacleBoundingBox)) {
          return true;
        }
      }
    }
    return false;
  }

  private smoothMoveRobot(distance: number, duration: number): void {
    const startPosition = this.robot.position.clone();
    const direction = new THREE.Vector3(0, 0, distance * 0.1).applyQuaternion(this.robot.quaternion);
    const targetPosition = startPosition.clone().add(direction);
    const startTime = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const newPosition = new THREE.Vector3().lerpVectors(startPosition, targetPosition, easedProgress);
      const oldPosition = this.robot.position.clone();
      this.robot.position.copy(newPosition);
      if (this.checkCollisions()) {
        this.robot.position.copy(oldPosition);
        this.simulation.executeNextCommand();
        return;
      }
      this.simulation.getRobotState().position = { x: this.robot.position.x, y: this.robot.position.y, z: this.robot.position.z };
      this.simulation.onStateChange(this.simulation.getRobotState());
      if (progress < 1) { requestAnimationFrame(animate); } else { this.simulation.executeNextCommand(); }
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
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      this.robot.rotation.y = startRotation + (targetRotation - startRotation) * easedProgress;
      this.simulation.getRobotState().rotation = { x: this.robot.rotation.x, y: this.robot.rotation.y, z: this.robot.rotation.z };
      this.simulation.onStateChange(this.simulation.getRobotState());
      if (progress < 1) { requestAnimationFrame(animate); } else { this.simulation.executeNextCommand(); }
    };
    animate();
  }

  public executeCommands(blocks: any[]): void {
    const commands = this.simulation.generateCommandsFromBlocks(blocks);
    this.simulation.executeCommands(commands);
  }

  public pause(): void { this.simulation.pause(); }
  public setSpeed(speed: number): void { this.simulation.setSpeed(speed); }
  public reset(): void { this.simulation.reset(); }
  public softReset(): void { this.simulation.softReset(); }

  public setViewMode(mode: '3d' | 'top' | 'side'): void {
    switch (mode) {
      case '3d': this.camera.position.set(10, 10, 10); this.controls.target.set(0, 0, 0); break;
      case 'top': this.camera.position.set(0, 20, 0); this.controls.target.set(0, 0, 0); break;
      case 'side': this.camera.position.set(20, 5, 0); this.controls.target.set(0, 0, 0); break;
    }
    this.camera.lookAt(this.controls.target);
  }

  public getRobotMesh(): THREE.Mesh { return this.robotMesh; }

  public setModel(model: THREE.Object3D) {
    if (this.robot) { this.scene.remove(this.robot); }
    this.robot = new THREE.Group();
    this.robot.add(model);
    this.scene.add(this.robot);
  }

  public loadModel(url: string) {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => { this.setModel(gltf.scene); }, undefined, (error) => {
      console.error('An error happened while loading the model.', error);
    });
  }

  public followRobotSmooth(robotPosition: THREE.Vector3) {
    if (!this.camera || !this.controls) return;
    const targetPosition = new THREE.Vector3(robotPosition.x + 5, robotPosition.y + 8, robotPosition.z + 5);
    this.camera.position.lerp(targetPosition, 0.05);
    const currentTarget = this.controls.target.clone();
    const targetLookAt = new THREE.Vector3(robotPosition.x, robotPosition.y, robotPosition.z);
    currentTarget.lerp(targetLookAt, 0.08);
    this.controls.target.copy(currentTarget);
    this.camera.lookAt(this.controls.target);
  }

  public cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.scene) {
      this.scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.parentElement?.removeChild(this.renderer.domElement);
    }
  }
}
