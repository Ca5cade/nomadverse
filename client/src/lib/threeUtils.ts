import * as THREE from 'three';

interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  robot: THREE.Group;
  animate: () => void;
  dispose: () => void;
  resetCamera: () => void;
}

export function initializeThreeScene(canvas: HTMLCanvasElement): ThreeScene {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
  scene.add(gridHelper);

  // Robot
  const robot = createRobot();
  scene.add(robot);

  // Sample objects
  createSampleObjects(scene);

  // Controls
  let animationId: number;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  // Handle resize
  const handleResize = () => {
    if (canvas.clientWidth && canvas.clientHeight) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvas);

  animate();

  return {
    scene,
    camera,
    renderer,
    robot,
    animate,
    dispose: () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
    },
    resetCamera: () => {
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
    }
  };
}

function createRobot(): THREE.Group {
  const robot = new THREE.Group();

  // Robot body
  const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.25;
  body.castShadow = true;
  robot.add(body);

  // Robot head
  const headGeometry = new THREE.SphereGeometry(0.3);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.8;
  head.castShadow = true;
  robot.add(head);

  // Robot wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
  
  const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  leftWheel.position.set(-0.6, 0.2, 0);
  leftWheel.rotation.z = Math.PI / 2;
  robot.add(leftWheel);

  const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  rightWheel.position.set(0.6, 0.2, 0);
  rightWheel.rotation.z = Math.PI / 2;
  robot.add(rightWheel);

  return robot;
}

function createSampleObjects(scene: THREE.Scene): void {
  // Red cube
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(5, 0.5, 5);
  cube.castShadow = true;
  scene.add(cube);

  // Green cylinder
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
  const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(-5, 1, -5);
  cylinder.castShadow = true;
  scene.add(cylinder);
}

export function updateRobotPosition(threeScene: ThreeScene, position: { x: number; y: number; z: number }): void {
  threeScene.robot.position.set(position.x, position.y, position.z);
}

export function animateRobotMovement(
  threeScene: ThreeScene, 
  targetPosition: { x: number; y: number; z: number },
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = {
      x: threeScene.robot.position.x,
      y: threeScene.robot.position.y,
      z: threeScene.robot.position.z,
    };

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      threeScene.robot.position.set(
        startPosition.x + (targetPosition.x - startPosition.x) * easedProgress,
        startPosition.y + (targetPosition.y - startPosition.y) * easedProgress,
        startPosition.z + (targetPosition.z - startPosition.z) * easedProgress
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    animate();
  });
}
