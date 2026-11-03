import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  FarmTile,
  GameState,
  ToolMode,
  CropType,
  AnimalType,
  Season,
  TimeOfDay,
  WeatherType,
} from '../../types/game';
import { sound } from '../../services/audio';

interface Farm3DCanvasProps {
  gameState: GameState;
  onTileAction: (tile: FarmTile, actionType: ToolMode) => void;
  onAnimalPet: (animalId: string, tile: FarmTile) => void;
  onStructureClick: (structureType: string, tile: FarmTile) => void;
  movingTile: FarmTile | null;
  onPlaceMovedTile: (targetX: number, targetY: number) => void;
  onCancelMove: () => void;
}

export const Farm3DCanvas: React.FC<Farm3DCanvasProps> = ({
  gameState,
  onTileAction,
  onAnimalPet,
  onStructureClick,
  movingTile,
  onPlaceMovedTile,
  onCancelMove,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Dynamic Scene Objects
  const tilesMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const animalsMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const waterSurfacesRef = useRef<THREE.Mesh[]>([]);
  const swimmingFishRef = useRef<{ mesh: THREE.Group; cx: number; cz: number; angle: number; speed: number }[]>([]);
  const firefliesGroupRef = useRef<THREE.Points | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const cameraAngle = useRef({
    theta: Math.PI / 4,
    phi: Math.PI / 3.2,
    radius: gameState.gridSize * 2.2,
    target: new THREE.Vector3(0, 0, 0),
  });

  const [controlsHint, setControlsHint] = useState(true);

  // Synchronize Camera
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, target } = cameraAngle.current;
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // 1. Initial Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    cameraRef.current = camera;
    cameraAngle.current.radius = gameState.gridSize * 2.2;
    updateCamera();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    // Main Sun/Moon Directional Light
    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = gameState.gridSize * 1.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // Ground Surrounding Meadow (infinite green landscape beyond farm)
    const meadowGeo = new THREE.PlaneGeometry(160, 160);
    const meadowMat = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.9,
    });
    const meadowMesh = new THREE.Mesh(meadowGeo, meadowMat);
    meadowMesh.rotation.x = -Math.PI / 2;
    meadowMesh.position.y = -0.05;
    meadowMesh.receiveShadow = true;
    scene.add(meadowMesh);

    // Weather Particles (Rain)
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 60;
      rainPositions[i * 3 + 1] = Math.random() * 25;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: '#bae6fd',
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    rainSystemRef.current = rainPoints;
    scene.add(rainPoints);

    // Fireflies System for nighttime
    const ffCount = 60;
    const ffGeo = new THREE.BufferGeometry();
    const ffPositions = new Float32Array(ffCount * 3);
    for (let i = 0; i < ffCount; i++) {
      ffPositions[i * 3] = (Math.random() - 0.5) * gameState.gridSize * 1.5;
      ffPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      ffPositions[i * 3 + 2] = (Math.random() - 0.5) * gameState.gridSize * 1.5;
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPositions, 3));
    const ffMat = new THREE.PointsMaterial({
      color: '#fef08a',
      size: 0.25,
      transparent: true,
      opacity: 0.9,
    });
    const ffPoints = new THREE.Points(ffGeo, ffMat);
    ffPoints.visible = false;
    firefliesGroupRef.current = ffPoints;
    scene.add(ffPoints);

    // Resize Listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate swimming fish
      swimmingFishRef.current.forEach((fish) => {
        fish.angle += fish.speed * delta;
        const rad = 0.45;
        fish.mesh.position.x = fish.cx + Math.cos(fish.angle) * rad;
        fish.mesh.position.z = fish.cz + Math.sin(fish.angle) * rad;
        fish.mesh.rotation.y = -fish.angle + Math.PI / 2;
        // Tail wiggle
        fish.mesh.rotation.z = Math.sin(elapsed * 8) * 0.15;
      });

      // Animate Water ripples
      waterSurfacesRef.current.forEach((w) => {
        w.position.y = 0.05 + Math.sin(elapsed * 2 + w.position.x) * 0.015;
      });

      // Animate rain falling
      if (rainSystemRef.current && rainSystemRef.current.visible) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 30;
          if (positions[i] < 0) positions[i] = 25;
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate fireflies floating
      if (firefliesGroupRef.current && firefliesGroupRef.current.visible) {
        const pos = firefliesGroupRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] += Math.sin(elapsed + i) * 0.01;
          pos[i + 1] += Math.cos(elapsed * 1.5 + i) * 0.005;
          pos[i + 2] += Math.cos(elapsed + i) * 0.01;
        }
        firefliesGroupRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      scene.clear();
    };
  }, [updateCamera, gameState.gridSize]);

  // 2. Synchronize Day/Night Lighting and Weather
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const time = gameState.timeOfDay || 'day';
    const weather = gameState.weather || 'sunny';

    // Set Sky / Fog color and Light intensity based on Time of Day
    if (time === 'night') {
      scene.background = new THREE.Color('#0a1128');
      scene.fog = new THREE.FogExp2('#0a1128', 0.02);
      if (sunLightRef.current) {
        sunLightRef.current.color.set('#60a5fa');
        sunLightRef.current.intensity = 0.45;
        sunLightRef.current.position.set(-20, 30, -20);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set('#1e293b');
        ambientLightRef.current.intensity = 0.35;
      }
      if (firefliesGroupRef.current) firefliesGroupRef.current.visible = true;
    } else if (time === 'sunset') {
      scene.background = new THREE.Color('#fdba74');
      scene.fog = new THREE.FogExp2('#fdba74', 0.015);
      if (sunLightRef.current) {
        sunLightRef.current.color.set('#ea580c');
        sunLightRef.current.intensity = 1.4;
        sunLightRef.current.position.set(-40, 15, 20);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set('#ffedd5');
        ambientLightRef.current.intensity = 0.6;
      }
      if (firefliesGroupRef.current) firefliesGroupRef.current.visible = false;
    } else if (time === 'morning') {
      scene.background = new THREE.Color('#fed7aa');
      scene.fog = new THREE.FogExp2('#fed7aa', 0.015);
      if (sunLightRef.current) {
        sunLightRef.current.color.set('#fde047');
        sunLightRef.current.intensity = 1.3;
        sunLightRef.current.position.set(40, 20, -20);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set('#fef3c7');
        ambientLightRef.current.intensity = 0.7;
      }
      if (firefliesGroupRef.current) firefliesGroupRef.current.visible = false;
    } else {
      // Crisp Bright Daytime
      scene.background = new THREE.Color('#7dd3fc');
      scene.fog = new THREE.FogExp2('#7dd3fc', 0.01);
      if (sunLightRef.current) {
        sunLightRef.current.color.set('#fffbeb');
        sunLightRef.current.intensity = 1.8;
        sunLightRef.current.position.set(25, 45, 20);
      }
      if (ambientLightRef.current) {
        ambientLightRef.current.color.set('#ffffff');
        ambientLightRef.current.intensity = 0.8;
      }
      if (firefliesGroupRef.current) firefliesGroupRef.current.visible = false;
    }

    // Weather Rain System
    if (rainSystemRef.current) {
      rainSystemRef.current.visible = weather === 'rain' || weather === 'thunderstorm';
    }
  }, [gameState.timeOfDay, gameState.weather]);

  // 3. Rebuild 3D Farm Grid, Crops, Structures & Animals
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing tile representations
    const oldFarm = scene.getObjectByName('naga_farm_entities');
    if (oldFarm) scene.remove(oldFarm);

    const farmGroup = new THREE.Group();
    farmGroup.name = 'naga_farm_entities';

    tilesMapRef.current.clear();
    animalsMapRef.current.clear();
    waterSurfacesRef.current = [];
    swimmingFishRef.current = [];

    const TILE_SIZE = 1.6;
    const gridN = gameState.gridSize || 12;
    const offset = (gridN * TILE_SIZE) / 2;

    // Helper: Map grid (x, y) to world (wx, wz)
    const getPos = (gx: number, gy: number) => {
      return {
        x: (gx + 0.5) * TILE_SIZE - offset,
        z: (gy + 0.5) * TILE_SIZE - offset,
      };
    };

    // Shared Geometries & Materials
    const tileBaseGeo = new THREE.BoxGeometry(TILE_SIZE * 0.94, 0.2, TILE_SIZE * 0.94);
    const grassMat = new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.8 });
    const drySoilMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const wetSoilMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.7 });
    const stonePathMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.6 });
    const woodPathMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.7 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    gameState.tiles.forEach((tile) => {
      const pos = getPos(tile.x, tile.y);
      const tileGroup = new THREE.Group();
      tileGroup.position.set(pos.x, 0.1, pos.z);
      tileGroup.userData = { isTile: true, tile };

      // Base Tile Mesh
      let tMat = grassMat;
      if (tile.type === 'soil') {
        tMat = tile.crop?.watered ? wetSoilMat : drySoilMat;
      } else if (tile.type === 'stone_path') {
        tMat = stonePathMat;
      } else if (tile.type === 'wood_path') {
        tMat = woodPathMat;
      } else if (tile.type === 'water_pond' || tile.type === 'fish_pond') {
        tMat = drySoilMat;
      }

      const tileMesh = new THREE.Mesh(tileBaseGeo, tMat);
      tileMesh.receiveShadow = true;
      tileMesh.castShadow = true;
      tileMesh.userData = { isTileMesh: true, tile };
      tileGroup.add(tileMesh);

      // Water Pond / Fish Pond Surface
      if (tile.type === 'water_pond' || tile.type === 'fish_pond') {
        const pondGeo = new THREE.BoxGeometry(TILE_SIZE * 0.88, 0.12, TILE_SIZE * 0.88);
        const pondMesh = new THREE.Mesh(pondGeo, waterMat);
        pondMesh.position.y = 0.08;
        tileGroup.add(pondMesh);
        waterSurfacesRef.current.push(pondMesh);

        // Swimming Tilapia / Bangus Fish
        const fishGroup = new THREE.Group();
        const fishBody = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.28, 6),
          new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3 })
        );
        fishBody.rotation.x = Math.PI / 2;
        fishGroup.add(fishBody);

        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.12, 4),
          new THREE.MeshStandardMaterial({ color: '#ea580c' })
        );
        tail.position.z = -0.16;
        tail.rotation.x = -Math.PI / 2;
        fishGroup.add(tail);

        fishGroup.position.set(0, 0.12, 0);
        tileGroup.add(fishGroup);

        swimmingFishRef.current.push({
          mesh: fishGroup,
          cx: 0,
          cz: 0,
          angle: Math.random() * Math.PI * 2,
          speed: 1.2 + Math.random() * 0.8,
        });
      }

      // 3D Crop Rendering
      if (tile.crop) {
        const crop = tile.crop;
        const progress = crop.growthProgress || 0;
        const isMature = crop.isReady || progress >= 1;
        const cropGroup = new THREE.Group();
        cropGroup.position.y = 0.1;

        if (!isMature && progress < 0.4) {
          // Sprout stage: 2 small green leaflets
          for (let s = -1; s <= 1; s += 2) {
            const sprout = new THREE.Mesh(
              new THREE.ConeGeometry(0.06, 0.2, 5),
              new THREE.MeshStandardMaterial({ color: '#86efac' })
            );
            sprout.position.set(s * 0.1, 0.1, 0);
            sprout.rotation.z = s * -0.3;
            cropGroup.add(sprout);
          }
        } else if (crop.type === 'palay' || crop.type === 'wheat') {
          // Rice / Wheat stalks
          const stemColor = isMature ? '#eab308' : '#84cc16';
          for (let i = 0; i < 5; i++) {
            const stalk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.03, 0.55 * (0.5 + progress * 0.5), 6),
              new THREE.MeshStandardMaterial({ color: stemColor })
            );
            const ang = (i * Math.PI * 2) / 5;
            stalk.position.set(Math.cos(ang) * 0.15, 0.28, Math.sin(ang) * 0.15);
            cropGroup.add(stalk);

            // Grain head
            if (isMature) {
              const head = new THREE.Mesh(
                new THREE.ConeGeometry(0.06, 0.22, 6),
                new THREE.MeshStandardMaterial({ color: '#facc15' })
              );
              head.position.set(Math.cos(ang) * 0.18, 0.55, Math.sin(ang) * 0.18);
              head.rotation.z = Math.cos(ang) * 0.2;
              cropGroup.add(head);
            }
          }
        } else if (crop.type === 'corn') {
          // Tall Corn Stalk with ears
          const stalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.85, 6),
            new THREE.MeshStandardMaterial({ color: '#4ade80' })
          );
          stalk.position.y = 0.42;
          cropGroup.add(stalk);

          if (isMature) {
            const ear = new THREE.Mesh(
              new THREE.ConeGeometry(0.09, 0.3, 6),
              new THREE.MeshStandardMaterial({ color: '#facc15' })
            );
            ear.position.set(0.12, 0.45, 0);
            ear.rotation.z = -0.4;
            cropGroup.add(ear);
          }
        } else if (crop.type === 'pumpkin') {
          // Pumpkin: Big orange sphere with ribs & leafy vines
          if (isMature) {
            const pump = new THREE.Mesh(
              new THREE.SphereGeometry(0.32, 12, 10),
              new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.6 })
            );
            pump.scale.set(1, 0.75, 1);
            pump.position.y = 0.24;
            cropGroup.add(pump);

            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.04, 0.15, 6),
              new THREE.MeshStandardMaterial({ color: '#15803d' })
            );
            stem.position.y = 0.5;
            cropGroup.add(stem);
          } else {
            const bud = new THREE.Mesh(
              new THREE.SphereGeometry(0.16, 8, 8),
              new THREE.MeshStandardMaterial({ color: '#84cc16' })
            );
            bud.position.y = 0.12;
            cropGroup.add(bud);
          }
        } else if (crop.type === 'mango') {
          // Mini Mango Tree
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 0.7, 6),
            new THREE.MeshStandardMaterial({ color: '#78350f' })
          );
          trunk.position.y = 0.35;
          cropGroup.add(trunk);

          const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 10, 10),
            new THREE.MeshStandardMaterial({ color: '#15803d' })
          );
          foliage.position.y = 0.8;
          cropGroup.add(foliage);

          if (isMature) {
            for (let m = 0; m < 3; m++) {
              const mango = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.18, 6),
                new THREE.MeshStandardMaterial({ color: '#fbbf24' })
              );
              const mangAng = (m * Math.PI * 2) / 3;
              mango.position.set(Math.cos(mangAng) * 0.3, 0.65, Math.sin(mangAng) * 0.3);
              mango.rotation.z = Math.PI;
              cropGroup.add(mango);
            }
          }
        } else {
          // Generic Berry / Bush crop
          const bush = new THREE.Mesh(
            new THREE.SphereGeometry(0.25 * (0.5 + progress * 0.5), 8, 8),
            new THREE.MeshStandardMaterial({ color: isMature ? '#dc2626' : '#22c55e' })
          );
          bush.position.y = 0.2;
          cropGroup.add(bush);
        }

        // Ready Glow Indicator
        if (isMature) {
          const readyRing = new THREE.Mesh(
            new THREE.RingGeometry(0.35, 0.42, 16),
            new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide })
          );
          readyRing.rotation.x = -Math.PI / 2;
          readyRing.position.y = 0.05;
          cropGroup.add(readyRing);
        }

        tileGroup.add(cropGroup);
      }

      // 3D Structure Rendering
      if (tile.structure) {
        const st = tile.structure;
        const structGroup = new THREE.Group();
        structGroup.userData = { isStructure: true, structureType: st.type, tile };

        if (st.type === 'bahay_kubo' || st.type === 'farmhouse' || st.type === 'cottage') {
          // PHILIPPINES BAHAY KUBO (Traditional Nipa Hut on Stilts)
          // 4 Stilt Pilings
          const stiltMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
          for (let sx of [-0.45, 0.45]) {
            for (let sz of [-0.45, 0.45]) {
              const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 8), stiltMat);
              stilt.position.set(sx, 0.25, sz);
              stilt.castShadow = true;
              structGroup.add(stilt);
            }
          }

          // Raised Bamboo Floor
          const floorMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.7 });
          const floorP = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), floorMat);
          floorP.position.y = 0.52;
          floorP.castShadow = true;
          structGroup.add(floorP);

          // Woven Sawali Walls
          const wallMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9 });
          const wallP = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.9), wallMat);
          wallP.position.y = 0.88;
          wallP.castShadow = true;
          structGroup.add(wallP);

          // Front Door Opening
          const doorP = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.48, 0.05),
            new THREE.MeshBasicMaterial({ color: '#451a03' })
          );
          doorP.position.set(0, 0.8, 0.46);
          structGroup.add(doorP);

          // High-Pitched Thatched Cogon Roof
          const roofMat = new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.95 });
          const roofP = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.85, 4), roofMat);
          roofP.rotation.y = Math.PI / 4;
          roofP.position.y = 1.6;
          roofP.castShadow = true;
          structGroup.add(roofP);

          // Capiz Porch Lantern
          const lantern = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({ color: '#fde047' })
          );
          lantern.position.set(0.3, 1.05, 0.5);
          structGroup.add(lantern);

          const lanternLight = new THREE.PointLight('#fef08a', 0.8, 3.0);
          lanternLight.position.set(0.3, 1.05, 0.55);
          structGroup.add(lanternLight);

          // Bamboo Entrance Ladder
          const ladderMat = stiltMat;
          const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.4, 0.04), ladderMat);
          ladder.position.set(0, 0.22, 0.55);
          ladder.rotation.x = -0.4;
          structGroup.add(ladder);
        } else if (st.type === 'barn') {
          // Big Red Barn with gambrel roof
          const barnMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.7 });
          const barnBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 1.0), barnMat);
          barnBody.position.y = 0.4;
          barnBody.castShadow = true;
          structGroup.add(barnBody);

          const barnRoof = new THREE.Mesh(
            new THREE.ConeGeometry(0.95, 0.6, 4),
            new THREE.MeshStandardMaterial({ color: '#450a0a', roughness: 0.8 })
          );
          barnRoof.rotation.y = Math.PI / 4;
          barnRoof.position.y = 1.05;
          structGroup.add(barnRoof);
        } else if (st.type === 'windmill' || st.type === 'shed') {
          // Silo / Tower
          const silo = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.4, 1.1, 12),
            new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 })
          );
          silo.position.y = 0.55;
          silo.castShadow = true;
          structGroup.add(silo);

          const siloCap = new THREE.Mesh(
            new THREE.ConeGeometry(0.38, 0.35, 12),
            new THREE.MeshStandardMaterial({ color: '#334155' })
          );
          siloCap.position.y = 1.25;
          structGroup.add(siloCap);
        }

        tileGroup.add(structGroup);
      }

      // 3D Animal Rendering
      if (tile.animal) {
        const animal = tile.animal;
        const animalGroup = new THREE.Group();
        animalGroup.position.y = 0.1;
        animalGroup.userData = { isAnimal: true, animalId: animal.id, tile };

        if (animal.type === 'carabao') {
          // FILIPINO CARABAO (Water Buffalo)
          const buffaloMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 });
          const hornMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });

          // Broad sturdy torso
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.9), buffaloMat);
          body.position.y = 0.38;
          body.castShadow = true;
          animalGroup.add(body);

          // Head & broad snout
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.38), buffaloMat);
          head.position.set(0, 0.5, 0.45);
          animalGroup.add(head);

          // Majestic Curved Horns (Left & Right)
          const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12, Math.PI * 0.8), hornMat);
          hornL.position.set(-0.2, 0.65, 0.42);
          hornL.rotation.y = Math.PI / 2;
          hornL.rotation.z = 0.4;
          animalGroup.add(hornL);

          const hornR = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12, Math.PI * 0.8), hornMat);
          hornR.position.set(0.2, 0.65, 0.42);
          hornR.rotation.y = -Math.PI / 2;
          hornR.rotation.z = -0.4;
          animalGroup.add(hornR);

          // 4 Sturdy Legs
          for (let lx of [-0.22, 0.22]) {
            for (let lz of [-0.28, 0.28]) {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.35, 6), buffaloMat);
              leg.position.set(lx, 0.175, lz);
              animalGroup.add(leg);
            }
          }
        } else if (animal.type === 'ostrich') {
          // Ostrich: Plumed body, long slender neck, beak, legs
          const featherMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });
          const neckMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.6 });

          const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), featherMat);
          body.position.y = 0.5;
          body.scale.set(0.9, 1, 1.2);
          animalGroup.add(body);

          // Long Neck
          const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 6), neckMat);
          neck.position.set(0, 0.85, 0.25);
          neck.rotation.x = -0.2;
          animalGroup.add(neck);

          // Head & Beak
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), neckMat);
          head.position.set(0, 1.15, 0.32);
          animalGroup.add(head);

          const beak = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.14, 4),
            new THREE.MeshStandardMaterial({ color: '#f59e0b' })
          );
          beak.position.set(0, 1.13, 0.44);
          beak.rotation.x = Math.PI / 2;
          animalGroup.add(beak);

          // 2 Tall Legs
          for (let lx of [-0.1, 0.1]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.5, 6), neckMat);
            leg.position.set(lx, 0.25, 0);
            animalGroup.add(leg);
          }
        } else if (animal.type === 'rabbit') {
          // Fluffy Rabbit: Small body, upright tall ears, cotton ball tail
          const furMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 });
          const pinkMat = new THREE.MeshStandardMaterial({ color: '#f472b6' });

          const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), furMat);
          body.position.y = 0.18;
          animalGroup.add(body);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), furMat);
          head.position.set(0, 0.28, 0.12);
          animalGroup.add(head);

          // 2 Tall upright ears
          for (let ex of [-0.05, 0.05]) {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.02), pinkMat);
            ear.position.set(ex, 0.44, 0.1);
            ear.rotation.x = -0.2;
            animalGroup.add(ear);
          }

          // Round cotton tail
          const tail = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), furMat);
          tail.position.set(0, 0.18, -0.16);
          animalGroup.add(tail);
        } else {
          // Standard Dairy Cow / Sheep
          const cowMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.75), cowMat);
          body.position.y = 0.35;
          animalGroup.add(body);

          const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.28), cowMat);
          head.position.set(0, 0.45, 0.38);
          animalGroup.add(head);

          for (let lx of [-0.18, 0.18]) {
            for (let lz of [-0.22, 0.22]) {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), cowMat);
              leg.position.set(lx, 0.15, lz);
              animalGroup.add(leg);
            }
          }
        }

        // Ready product bubble indicator
        if (animal.produceReady) {
          const bubble = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshBasicMaterial({ color: '#fef08a' })
          );
          bubble.position.y = 1.0;
          animalGroup.add(bubble);
        }

        tileGroup.add(animalGroup);
        animalsMapRef.current.set(animal.id, animalGroup);
      }

      farmGroup.add(tileGroup);
      tilesMapRef.current.set(`${tile.x}_${tile.y}`, tileGroup);
    });

    scene.add(farmGroup);
  }, [gameState.tiles, gameState.gridSize]);

  // Pointer Interaction (Orbit & Raycast)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointer.current.x;
    const dy = e.clientY - prevPointer.current.y;

    cameraAngle.current.theta -= dx * 0.007;
    cameraAngle.current.phi = Math.max(0.2, Math.min(Math.PI / 2.15, cameraAngle.current.phi + dy * 0.007));

    updateCamera();
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dist = Math.hypot(e.clientX - prevPointer.current.x, e.clientY - prevPointer.current.y);
    isDraggingRef.current = false;
    if (dist < 6) {
      handleRaycast(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.02;
    cameraAngle.current.radius = Math.max(
      gameState.gridSize * 0.8,
      Math.min(gameState.gridSize * 4.5, cameraAngle.current.radius + zoomDelta)
    );
    updateCamera();
  };

  // 3D Raycasting logic for clicking farm tiles, crops, animals, and buildings
  const handleRaycast = (clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const farmGroup = sceneRef.current.getObjectByName('naga_farm_entities');
    if (!farmGroup) return;

    const hits = raycaster.intersectObjects(farmGroup.children, true);
    if (hits.length === 0) return;

    // If movingTile is active: any click on a tile places the moving item
    if (movingTile) {
      let hitTile: FarmTile | null = null;
      let currObj: THREE.Object3D | null = hits[0].object;
      while (currObj && currObj !== farmGroup) {
        if (currObj.userData?.tile) {
          hitTile = currObj.userData.tile;
          break;
        }
        currObj = currObj.parent;
      }
      if (hitTile) {
        onPlaceMovedTile(hitTile.x, hitTile.y);
        return;
      }
    }

    // If Move tool is active: pick up the tile (field, house, animal)
    if (gameState.selectedTool === 'move') {
      let hitTile: FarmTile | null = null;
      let currObj: THREE.Object3D | null = hits[0].object;
      while (currObj && currObj !== farmGroup) {
        if (currObj.userData?.tile) {
          hitTile = currObj.userData.tile;
          break;
        }
        currObj = currObj.parent;
      }
      if (hitTile) {
        sound.playTap();
        onTileAction(hitTile, 'move');
        return;
      }
    }

    // Traverse upwards from hit object to identify clicked game component
    let hitObject: THREE.Object3D | null = hits[0].object;
    while (hitObject && hitObject !== farmGroup) {
      // 1. Check if hit Animal
      if (hitObject.userData?.isAnimal) {
        sound.playAnimalPet();
        onAnimalPet(hitObject.userData.animalId, hitObject.userData.tile);
        // Play quick 3D jump bounce animation
        const grp = hitObject;
        let jumpY = 0;
        const jumpInterval = setInterval(() => {
          jumpY += 0.08;
          grp.position.y = 0.1 + Math.sin(jumpY * Math.PI) * 0.35;
          if (jumpY >= 1) {
            clearInterval(jumpInterval);
            grp.position.y = 0.1;
          }
        }, 20);
        return;
      }

      // 2. Check if hit Structure (Bahay Kubo, Barn, Fish Pond)
      if (hitObject.userData?.isStructure) {
        sound.playTap();
        onStructureClick(hitObject.userData.structureType, hitObject.userData.tile);
        return;
      }

      // 3. Check if hit Tile
      if (hitObject.userData?.isTile || hitObject.userData?.isTileMesh) {
        const tile: FarmTile = hitObject.userData.tile;
        if (movingTile) {
          onPlaceMovedTile(tile.x, tile.y);
        } else {
          onTileAction(tile, gameState.selectedTool);
        }
        return;
      }

      hitObject = hitObject.parent;
    }
  };

  // Center Camera Preset
  const resetCamera = () => {
    sound.playTap();
    cameraAngle.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.2,
      radius: gameState.gridSize * 2.2,
      target: new THREE.Vector3(0, 0, 0),
    };
    updateCamera();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* 3D Canvas Mounting Target */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Navigation Controls */}
      <div className="absolute top-20 left-4 z-10 pointer-events-auto flex items-center gap-2">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/85 hover:bg-slate-800 text-emerald-400 font-semibold text-xs rounded-xl border border-emerald-500/30 shadow-lg cursor-pointer transition-all active:scale-95"
          title="Reset 3D Camera"
        >
          <span>🎯</span>
          <span>Center Farm</span>
        </button>

        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs rounded-xl border border-slate-700/60 shadow-md">
          {gameState.gridSize}×{gameState.gridSize} 3D Naga Farm
        </span>
      </div>

      {/* Quick Move Cancel Banner if moving */}
      {movingTile && (
        <div className="absolute top-20 right-4 z-10 pointer-events-auto flex items-center gap-2 bg-amber-900/90 text-amber-200 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-xl text-xs">
          <span>📦 Tap target 3D tile to relocate</span>
          <button
            onClick={onCancelMove}
            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Touch & Drag Orbit Hint */}
      {controlsHint && (
        <div className="absolute bottom-20 left-4 z-10 pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/50 text-[11px] text-slate-300">
          <span>🎮 3D Naga Mode: Drag to rotate camera • Tap crops & animals to interact</span>
          <button
            onClick={() => setControlsHint(false)}
            className="text-slate-400 hover:text-white ml-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
