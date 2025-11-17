import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Simulation, RobotState, SimulationCommand } from './simulation';
import { Course } from './courses';

import { getCharacterByName } from './characters';

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
  private course: Course;
  private loader = new GLTFLoader();

  private onCourseComplete: () => void;

  private obstacles: { position: { x: number; y: number; z: number }; size: { x: number; y: number; z: number } }[] = [];

  constructor(container: HTMLElement, onCourseComplete: () => void, course: Course, initialCharacterName: string) {
    this.container = container;
    this.onCourseComplete = onCourseComplete;
    this.course = course;
    if (course.obstacles) {
      this.obstacles = course.obstacles;
    }
    this.initThreeJS();
    this.loadCharacter(initialCharacterName);
    this.createEnvironment();
    this.setupLighting();
    this.handleResize();

    this.simulation = new Simulation(
      this.handleStateChange,
      this.handleCommandComplete
    );
  }

  private createEnvironment() {
    switch (this.course.id) {
      case 1:
        this.createDesertEnvironment();
        this.createRocks();
        break;
      case 2:
        this.createUnderwaterEnvironment();
        break;
      case 3:
        this.createJungleEnvironment();
        break;
      case 4:
        this.createVolcanoEnvironment();
        break;
      case 5:
        this.createSpaceEnvironment();
        break;
      default:
        this.createDesertEnvironment();
        break;
    }
    this.createFinishLine();
    this.createObstacles();
  }

  private createFinishLine() {
    const finishLineGeometry = new THREE.BoxGeometry(0.1, 1, 10);
    const finishLineMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.position.set(10, 0.5, 0);
    this.scene.add(finishLine);
  }

  private createObstacles() {
    this.obstacles.forEach(obstacleData => {
      const obstacleGeometry = new THREE.BoxGeometry(obstacleData.size.x, obstacleData.size.y, obstacleData.size.z);
      const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(obstacleData.position.x, obstacleData.position.y, obstacleData.position.z);
      obstacle.castShadow = true;
      this.scene.add(obstacle);
    });
  }
  
  private createUnderwaterEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7d9b, side: THREE.DoubleSide, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.scene.fog = new THREE.Fog(0x4a7d9b, 10, 80);
    this.scene.background = new THREE.Color(0x4a7d9b);

    // Corals and Seaweed
    const coralColors = [0xff6b6b, 0xffb366, 0xf9ff66, 0x66ffb3, 0x66b3ff];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 4 + 1;
      const geometry = Math.random() > 0.5 ? new THREE.CylinderGeometry(0.1, Math.random() * 0.5, height, 8) : new THREE.ConeGeometry(Math.random() * 0.6, height, 10);
      const material = new THREE.MeshStandardMaterial({ color: coralColors[Math.floor(Math.random() * coralColors.length)], roughness: 0.6 });
      const coral = new THREE.Mesh(geometry, material);
      coral.position.set((Math.random() - 0.5) * 90, height / 2, (Math.random() - 0.5) * 90);
      coral.castShadow = true;
      this.scene.add(coral);
    }

    // Rocks
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      const scale = Math.random() * 1.5 + 0.5;
      rock.position.set((Math.random() - 0.5) * 90, scale * 0.5, (Math.random() - 0.5) * 90);
      rock.scale.set(scale, scale, scale);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      this.scene.add(rock);
    }
  }
  
  private createJungleEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x556b2f, side: THREE.DoubleSide, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.scene.fog = new THREE.Fog(0x3d4a22, 15, 70);
    this.scene.background = new THREE.Color(0x3d4a22);

    // Trees
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 });
    for (let i = 0; i < 40; i++) {
      const trunkHeight = Math.random() * 8 + 4;
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 12);
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;

      const leavesSize = Math.random() * 3 + 2;
      const leavesGeometry = new THREE.SphereGeometry(leavesSize, 8, 6);
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.castShadow = true;
      leaves.position.y = trunkHeight;

      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set((Math.random() - 0.5) * 90, 0, (Math.random() - 0.5) * 90);
      this.scene.add(tree);
    }

    // Bushes
    for (let i = 0; i < 30; i++) {
      const bushSize = Math.random() * 1.5 + 0.5;
      const bushGeometry = new THREE.SphereGeometry(bushSize, 8, 6);
      const bush = new THREE.Mesh(bushGeometry, leavesMaterial);
      bush.castShadow = true;
      bush.position.set((Math.random() - 0.5) * 90, bushSize * 0.5, (Math.random() - 0.5) * 90);
      this.scene.add(bush);
    }
  }
  
  private createVolcanoEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, side: THREE.DoubleSide, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.scene.fog = new THREE.Fog(0x430d0d, 20, 90);
    this.scene.background = new THREE.Color(0x430d0d);

    // Volcanic Rocks
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.7 });
    for (let i = 0; i < 50; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      const scale = Math.random() * 2.5 + 0.5;
      rock.position.set((Math.random() - 0.5) * 90, scale * 0.4, (Math.random() - 0.5) * 90);
      rock.scale.set(scale, scale, scale);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      this.scene.add(rock);
    }

    // Lava Pools
    const lavaMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff6347, emissiveIntensity: 0.8 });
    for (let i = 0; i < 15; i++) {
      const lavaGeometry = new THREE.CylinderGeometry(Math.random() * 5 + 2, Math.random() * 4 + 1, 0.2, 32);
      const lavaPool = new THREE.Mesh(lavaGeometry, lavaMaterial);
      lavaPool.position.set((Math.random() - 0.5) * 90, 0.1, (Math.random() - 0.5) * 90);
      this.scene.add(lavaPool);
    }
  }
  
  private createSpaceEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, side: THREE.DoubleSide, metalness: 0.2, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.scene.background = new THREE.Color(0x000000);

    // Asteroids
    const asteroidGeometry = new THREE.DodecahedronGeometry(1, 0);
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    for (let i = 0; i < 60; i++) {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      const scale = Math.random() * 3 + 0.5;
      asteroid.position.set(
        (Math.random() - 0.5) * 100,
        Math.random() * 20 + scale, // Place them at various heights
        (Math.random() - 0.5) * 100
      );
      asteroid.scale.set(scale, scale, scale);
      asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroid.castShadow = true;
      this.scene.add(asteroid);
    }

    // Crystals
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0x4dd8ff,
      emissive: 0x00aaff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2
    });
    for (let i = 0; i < 25; i++) {
      const height = Math.random() * 5 + 1;
      const crystalGeometry = new THREE.CylinderGeometry(0, Math.random() * 0.8 + 0.2, height, 6);
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set((Math.random() - 0.5) * 90, height / 2, (Math.random() - 0.5) * 90);
      crystal.castShadow = true;
      this.scene.add(crystal);
    }
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

  public loadCharacter(characterName: string) {
    const character = getCharacterByName(characterName);
    if (!character) {
      console.error(`Character "${characterName}" not found.`);
      // Optionally, load a default character here
      if (this.robot) return; // Do not load default if a robot already exists
      const defaultChar = getCharacterByName('Fennec');
      if(defaultChar) this.loader.load(defaultChar.modelPath, (gltf) => this.setModel(gltf.scene, 'Fennec'));
      return;
    }

    this.loader.load(character.modelPath, (gltf) => {
      this.setModel(gltf.scene, character.name);
    }, undefined, (error) => {
      console.error(`An error happened while loading character "${characterName}".`, error);
    });
  }

  private createDesertEnvironment() {
    // Skybox
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      '/src/assets/dubai_skybox.jpg',
      () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(this.renderer, texture);
        this.scene.background = rt.texture;
        this.scene.environment = rt.texture;
      }
    );

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 200, 200);
    const sandTexture = loader.load('/src/assets/sand.jpg');
    sandTexture.wrapS = THREE.MirroredRepeatWrapping;
    sandTexture.wrapT = THREE.MirroredRepeatWrapping;
    sandTexture.repeat.set(10, 10);
    sandTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    sandTexture.minFilter = THREE.LinearMipmapLinearFilter;
    sandTexture.magFilter = THREE.LinearFilter;

    const displacementMap = loader.load('/src/assets/dunes_heightmap.png');
    displacementMap.wrapS = THREE.RepeatWrapping;
    displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.repeat.set(1, 1);

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: sandTexture,
      metalness: 0.1,
      roughness: 0.9,
      // displacementMap: displacementMap,
      // displacementScale: 10,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private createRocks() {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, metalness: 0.1, roughness: 0.9 });

    for (let i = 0; i < 20; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        (Math.random() - 0.5) * 100,
        0.5,
        (Math.random() - 0.5) * 100
      );
      rock.scale.set(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      this.scene.add(rock);
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

  private courseCompleted = false;

  public animate = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.robot && !this.courseCompleted && this.robot.position.x > 10) {
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

  public setModel(model: THREE.Object3D, characterName: string) {
    if (this.robot) {
      this.scene.remove(this.robot);
    }

    this.robot = new THREE.Group();

    // Pre-rotate the model's content to align its front with the simulation's forward (+Z axis).
    // This rotation is applied to all models to standardize their orientation.
    model.rotation.y = Math.PI / 2;
    
    this.robot.add(model);

    // Ensure all shadows are updated
    this.robot.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // 1. Calculate initial bounding box to determine scale
    const initialBox = new THREE.Box3().setFromObject(this.robot);
    const initialSize = new THREE.Vector3();
    initialBox.getSize(initialSize);

    // 2. Calculate and apply scale to normalize height to ~1.5 units
    if (initialSize.y > 0) {
      const scaleFactor = 1.5 / initialSize.y;
      this.robot.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // 3. Recalculate bounding box after scaling
    const scaledBox = new THREE.Box3().setFromObject(this.robot);

    // 4. Adjust position to sit on the ground (y=0)
    this.robot.position.y = -scaledBox.min.y;

    this.scene.add(this.robot);

    // 6. Update the simulation's internal state to match the new robot.
    // The base rotation is now 0, as it's handled by the model's pre-rotation.
    if (this.simulation) {
      this.simulation.setInitialState({
        position: { y: this.robot.position.y },
        rotation: { y: 0 }
      });
    }
  }

  public loadModelFromUrl(url: string) {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => { this.setModel(gltf.scene, 'custom'); }, undefined, (error) => {
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
