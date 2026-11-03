import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlacedFurniture } from '../../types/game';
import { HOUSE_PAINTINGS, FURNITURE_CATALOG } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface Homestead3DViewProps {
  roomSize: number;
  wallStyle: string;
  wallPaintingId: string;
  flooring: string;
  placedFurniture: PlacedFurniture[];
  selectedFurnitureId: string | null;
  isMoveMode: boolean;
  onSelectFurniture: (id: string | null) => void;
  onTileClick: (x: number, y: number) => void;
  onRotateFurniture?: (id: string) => void;
  onOpenPaintingsTab?: () => void;
}

// Procedural texture generator for walls
function createWallTexture(style: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const styleColors: Record<string, { bg: string; pattern?: string; accent?: string }> = {
    cream_plaster: { bg: '#fef3c7', pattern: 'plaster' },
    capiz_lattice: { bg: '#f8fafc', pattern: 'grid', accent: '#cbd5e1' },
    sawali_bamboo: { bg: '#b45309', pattern: 'bamboo', accent: '#78350f' },
    vintage_rose: { bg: '#fce7f3', pattern: 'floral', accent: '#f43f5e' },
    emerald_damask: { bg: '#064e3b', pattern: 'damask', accent: '#047857' },
    terracotta_adobe: { bg: '#9a3412', pattern: 'adobe', accent: '#7c2d12' },
    midnight_slate: { bg: '#0f172a', pattern: 'slate', accent: '#334155' },
  };

  const current = styleColors[style] || styleColors.cream_plaster;
  ctx.fillStyle = current.bg;
  ctx.fillRect(0, 0, 512, 512);

  if (current.pattern === 'grid') {
    ctx.strokeStyle = current.accent || '#cbd5e1';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (current.pattern === 'bamboo') {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 6;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
      // Bamboo nodes
      for (let y = 30; y < 512; y += 80) {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 4, y, 8, 4);
      }
    }
  } else {
    // Subtle plaster grain
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let i = 0; i < 4000; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Procedural texture generator for floors
function createFloorTexture(style: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (style === 'bamboo_parquet') {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    const sz = 64;
    for (let x = 0; x < 512; x += sz) {
      for (let y = 0; y < 512; y += sz) {
        ctx.strokeRect(x, y, sz, sz);
        ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#b45309' : '#d97706';
        ctx.fillRect(x + 2, y + 2, sz - 4, sz - 4);
      }
    }
  } else if (style === 'spanish_terracotta') {
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 6;
    for (let x = 0; x < 512; x += 128) {
      for (let y = 0; y < 512; y += 128) {
        ctx.strokeRect(x, y, 128, 128);
      }
    }
  } else if (style === 'marble_checker') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#0f172a';
    for (let x = 0; x < 512; x += 128) {
      for (let y = 0; y < 512; y += 128) {
        if ((x / 128 + y / 128) % 2 === 0) {
          ctx.fillRect(x, y, 128, 128);
        }
      }
    }
  } else {
    // Default hardwood oak planks
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    const plankH = 40;
    for (let y = 0; y <= 512; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    // Vertical joints
    for (let y = 0; y < 512; y += plankH) {
      const offset = (y / plankH) % 2 === 0 ? 0 : 80;
      for (let x = offset; x < 512; x += 160) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + plankH);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Procedural texture for Masterpiece Wall Painting
function createPaintingTexture(paintingId: string): THREE.CanvasTexture {
  const p = HOUSE_PAINTINGS.find((item) => item.id === paintingId) || HOUSE_PAINTINGS[0];
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Ornate Gold / Narra frame border
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 512, 340);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(16, 16, 480, 308);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(24, 24, 464, 292);

  // Background scenic canvas gradient
  const grad = ctx.createLinearGradient(0, 30, 0, 310);
  if (p.id.includes('rice') || p.id.includes('sunset')) {
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#65a30d');
  } else if (p.id.includes('mayon') || p.id.includes('banaue')) {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#4ade80');
    grad.addColorStop(1, '#15803d');
  } else {
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(0.6, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(32, 32, 448, 276);

  // Paint iconography / silhouette
  ctx.font = '80px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.icon || '🌾', 256, 140);

  // Artwork plaque title
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(60, 240, 392, 54);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 240, 392, 54);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(p.title, 256, 260);

  ctx.fillStyle = '#fed7aa';
  ctx.font = 'italic 16px system-ui, sans-serif';
  ctx.fillText(p.artist, 256, 282);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const Homestead3DView: React.FC<Homestead3DViewProps> = ({
  roomSize,
  wallStyle,
  wallPaintingId,
  flooring,
  placedFurniture,
  selectedFurnitureId,
  isMoveMode,
  onSelectFurniture,
  onTileClick,
  onRotateFurniture,
  onOpenPaintingsTab,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const furnitureGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const floorTilesRef = useRef<THREE.Mesh[]>([]);
  const animFrameId = useRef<number | null>(null);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const cameraAngle = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.4, radius: roomSize * 2.3 });
  const [controlsHint, setControlsHint] = useState(true);

  // Update camera position from spherical angles
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngle.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 1.2, 0);
  }, []);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.03);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    cameraAngle.current.radius = roomSize * 2.3;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    // Directional window light casting soft shadows
    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(-roomSize, roomSize * 1.8, roomSize * 0.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Warm ceiling chandelier/pendant light
    const ceilingLight = new THREE.PointLight('#fef08a', 2.0, roomSize * 2.5);
    ceilingLight.position.set(0, 3.6, 0);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    // Chandelier lamp fixture mesh
    const lampGroup = new THREE.Group();
    const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8, roughness: 0.2 });
    const cord = new THREE.Mesh(cordGeo, brassMat);
    cord.position.y = 4.2;
    lampGroup.add(cord);

    const shadeGeo = new THREE.ConeGeometry(0.5, 0.35, 16, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', side: THREE.DoubleSide, roughness: 0.3 });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.y = 3.65;
    lampGroup.add(shade);

    const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#fffbeb' });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = 3.6;
    lampGroup.add(bulb);
    scene.add(lampGroup);

    // Resize handler
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

      // Subtle light breathing
      ceilingLight.intensity = 2.0 + Math.sin(elapsed * 2) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      scene.clear();
    };
  }, [roomSize, updateCameraPosition]);

  // Rebuild Room Architecture (Walls, Flooring, Painting, Tile Grid)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing room elements
    const oldRoom = scene.getObjectByName('room_structure');
    if (oldRoom) scene.remove(oldRoom);

    const roomGroup = new THREE.Group();
    roomGroup.name = 'room_structure';

    const TILE_SIZE = 1.0;
    const roomSpan = roomSize * TILE_SIZE;
    const wallHeight = 4.2;
    const halfSpan = roomSpan / 2;

    // 1. Flooring
    const floorTexture = createFloorTexture(flooring);
    const floorGeo = new THREE.PlaneGeometry(roomSpan, roomSpan);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.45,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // 2. Interactive Floor Tiles (Raycasting targets)
    floorTilesRef.current = [];
    for (let x = 0; x < roomSize; x++) {
      for (let y = 0; y < roomSize; y++) {
        const tileGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.96, TILE_SIZE * 0.96);
        const tileMat = new THREE.MeshBasicMaterial({
          color: (x + y) % 2 === 0 ? 0xffffff : 0x000000,
          transparent: true,
          opacity: 0.04,
          depthWrite: false,
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
          (x - roomSize / 2 + 0.5) * TILE_SIZE,
          0.01,
          (y - roomSize / 2 + 0.5) * TILE_SIZE
        );
        tile.userData = { isFloorTile: true, gridX: x, gridY: y };
        roomGroup.add(tile);
        floorTilesRef.current.push(tile);
      }
    }

    // 3. Grid Lines
    const gridHelper = new THREE.GridHelper(roomSpan, roomSize, '#e2e8f0', '#94a3b8');
    gridHelper.position.y = 0.012;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
    }
    roomGroup.add(gridHelper);

    // 4. Back Wall (along -Z axis)
    const wallTexture = createWallTexture(wallStyle);
    const backWallGeo = new THREE.PlaneGeometry(roomSpan, wallHeight);
    const backWallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, wallHeight / 2, -halfSpan);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Baseboard trim for Back Wall
    const baseboardGeo = new THREE.BoxGeometry(roomSpan, 0.2, 0.08);
    const trimMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.5 });
    const backTrim = new THREE.Mesh(baseboardGeo, trimMat);
    backTrim.position.set(0, 0.1, -halfSpan + 0.04);
    roomGroup.add(backTrim);

    // 5. Left Wall (along -X axis)
    const leftWallGeo = new THREE.PlaneGeometry(roomSpan, wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeo, backWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-halfSpan, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Baseboard trim for Left Wall
    const leftTrim = new THREE.Mesh(baseboardGeo, trimMat);
    leftTrim.rotation.y = Math.PI / 2;
    leftTrim.position.set(-halfSpan + 0.04, 0.1, 0);
    roomGroup.add(leftTrim);

    // 6. Arched Countryside Window on Left Wall
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-halfSpan + 0.05, 2.4, -0.4);
    windowGroup.rotation.y = Math.PI / 2;

    const winFrameGeo = new THREE.BoxGeometry(1.6, 2.2, 0.08);
    const winFrameMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.4 });
    const winFrame = new THREE.Mesh(winFrameGeo, winFrameMat);
    windowGroup.add(winFrame);

    // Sky/Sun view plane
    const winPaneGeo = new THREE.PlaneGeometry(1.4, 2.0);
    const winPaneMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const winPane = new THREE.Mesh(winPaneGeo, winPaneMat);
    winPane.position.z = 0.02;
    windowGroup.add(winPane);

    // Window muntin bars
    const barMat = new THREE.MeshBasicMaterial({ color: '#451a03' });
    const vertBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.0, 0.04), barMat);
    vertBar.position.z = 0.04;
    windowGroup.add(vertBar);
    const horizBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.04), barMat);
    horizBar.position.z = 0.04;
    windowGroup.add(horizBar);

    roomGroup.add(windowGroup);

    // 7. CENTERPIECE: 3D HUNG MASTERPIECE WALL PAINTING (on Back Wall)
    const paintingTexture = createPaintingTexture(wallPaintingId);
    const paintingGroup = new THREE.Group();
    paintingGroup.name = 'masterpiece_painting';
    paintingGroup.position.set(0, 2.4, -halfSpan + 0.08);

    // Ornate Carved Wood / Gold Frame
    const frameGeo = new THREE.BoxGeometry(2.4, 1.6, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      metalness: 0.65,
      roughness: 0.3,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.castShadow = true;
    paintingGroup.add(frameMesh);

    // Painting Canvas
    const canvasGeo = new THREE.PlaneGeometry(2.24, 1.44);
    const canvasMat = new THREE.MeshStandardMaterial({
      map: paintingTexture,
      roughness: 0.4,
    });
    const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
    canvasMesh.position.z = 0.045;
    canvasMesh.userData = { isPainting: true };
    paintingGroup.add(canvasMesh);

    // Brass Picture Lamp above painting
    const picLampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.2 })
    );
    picLampArm.rotation.x = Math.PI / 2;
    picLampArm.position.set(0, 0.95, 0.15);
    paintingGroup.add(picLampArm);

    const picLampHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 })
    );
    picLampHead.position.set(0, 0.95, 0.25);
    paintingGroup.add(picLampHead);

    // Subtle down-light spotlight for the artwork
    const artLight = new THREE.SpotLight('#fef08a', 2.0, 4, Math.PI / 4, 0.5);
    artLight.position.set(0, 0.95, 0.26);
    artLight.target = canvasMesh;
    paintingGroup.add(artLight);

    roomGroup.add(paintingGroup);

    scene.add(roomGroup);
  }, [roomSize, wallStyle, wallPaintingId, flooring]);

  // Build Procedural 3D Furniture Models
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous furniture groups
    furnitureGroupsRef.current.forEach((grp) => scene.remove(grp));
    furnitureGroupsRef.current.clear();

    const TILE_SIZE = 1.0;

    placedFurniture.forEach((item) => {
      const group = new THREE.Group();
      group.name = `furniture_${item.id}`;
      group.userData = { isFurniture: true, furnitureId: item.id };

      // Base materials with custom swatches
      const mainColor = item.color || '#b45309';
      const woodMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.6 });
      const darkWoodMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.5 });
      const cushionMat = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: 0.7,
      });
      const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7, roughness: 0.3 });

      // Determine model based on catalog item category or id
      const cat = item.category || 'seating';
      const fid = item.furnitureId || '';

      if (cat === 'seating') {
        if (fid.includes('armchair') || fid.includes('sofa')) {
          // 1. Armchair / Loveseat: 6 parts
          // Seat cushion
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.75), cushionMat);
          seat.position.y = 0.25;
          seat.castShadow = true;
          group.add(seat);

          // Tufted backrest
          const back = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.2), cushionMat);
          back.position.set(0, 0.55, -0.28);
          back.castShadow = true;
          group.add(back);

          // Left Armrest
          const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.75), cushionMat);
          leftArm.position.set(-0.38, 0.35, 0);
          group.add(leftArm);

          // Right Armrest
          const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.75), cushionMat);
          rightArm.position.set(0.38, 0.35, 0);
          group.add(rightArm);

          // 4 Turned Wooden Feet
          for (let fx of [-0.3, 0.3]) {
            for (let fz of [-0.3, 0.3]) {
              const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.15, 8), darkWoodMat);
              foot.position.set(fx, 0.075, fz);
              group.add(foot);
            }
          }
        } else {
          // Standard Dining Chair: 7 parts
          // Seat
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), woodMat);
          seat.position.y = 0.45;
          seat.castShadow = true;
          group.add(seat);

          // Backrest
          const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.06), woodMat);
          back.position.set(0, 0.75, -0.24);
          back.castShadow = true;
          group.add(back);

          // Spindles
          for (let sx of [-0.15, 0, 0.15]) {
            const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), darkWoodMat);
            spindle.position.set(sx, 0.7, -0.24);
            group.add(spindle);
          }

          // 4 Tapered Legs
          for (let lx of [-0.22, 0.22]) {
            for (let lz of [-0.22, 0.22]) {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.45, 8), darkWoodMat);
              leg.position.set(lx, 0.225, lz);
              leg.castShadow = true;
              group.add(leg);
            }
          }
        }
      } else if (cat === 'tables') {
        // Table: Tabletop, 4 turned legs, apron
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.75), woodMat);
        top.position.y = 0.65;
        top.castShadow = true;
        group.add(top);

        // Center Table Runner cloth
        const runner = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.01, 0.78),
          new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.8 })
        );
        runner.position.y = 0.695;
        group.add(runner);

        // 4 Legs
        for (let lx of [-0.38, 0.38]) {
          for (let lz of [-0.3, 0.3]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.65, 8), darkWoodMat);
            leg.position.set(lx, 0.325, lz);
            leg.castShadow = true;
            group.add(leg);
          }
        }
      } else if (cat === 'bedroom') {
        // Grand Canopy Bed: 4 posts, canopy frame, mattress, pillows, quilt
        const mattress = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.3, 0.95),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 })
        );
        mattress.position.y = 0.35;
        mattress.castShadow = true;
        group.add(mattress);

        // Quilt / Blanket with swatch color
        const quilt = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.65), cushionMat);
        quilt.position.set(0, 0.45, 0.15);
        group.add(quilt);

        // Pillows
        const pillowMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.22), pillowMat);
        p1.position.set(-0.22, 0.48, -0.32);
        group.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.22), pillowMat);
        p2.position.set(0.22, 0.48, -0.32);
        group.add(p2);

        // 4 Canopy Posts
        for (let px of [-0.43, 0.43]) {
          for (let pz of [-0.48, 0.48]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), darkWoodMat);
            post.position.set(px, 0.7, pz);
            group.add(post);
          }
        }

        // Top Canopy rails
        const railMat = darkWoodMat;
        const topR1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04), railMat);
        topR1.position.set(0, 1.4, -0.48);
        group.add(topR1);
        const topR2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04), railMat);
        topR2.position.set(0, 1.4, 0.48);
        group.add(topR2);
      } else if (cat === 'hearth') {
        // Stone Fireplace: Brick body, mantel shelf, glowing hearth opening
        const hearthBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.9, 0.45),
          new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.9 })
        );
        hearthBody.position.y = 0.45;
        hearthBody.castShadow = true;
        group.add(hearthBody);

        // Mantle shelf
        const mantle = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.55), darkWoodMat);
        mantle.position.y = 0.94;
        group.add(mantle);

        // Fireplace cutout niche
        const niche = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.45, 0.3),
          new THREE.MeshBasicMaterial({ color: '#1c1917' })
        );
        niche.position.set(0, 0.3, 0.1);
        group.add(niche);

        // Glowing Embers / Flame light
        const flameLight = new THREE.PointLight('#f97316', 1.5, 2.0);
        flameLight.position.set(0, 0.25, 0.2);
        group.add(flameLight);

        const flameMesh = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.25, 8),
          new THREE.MeshBasicMaterial({ color: '#fbbf24' })
        );
        flameMesh.position.set(0, 0.22, 0.15);
        group.add(flameMesh);
      } else if (cat === 'rugs') {
        // Decorative Rug
        const rugGeo = new THREE.BoxGeometry(0.9, 0.015, 0.9);
        const rugMat = new THREE.MeshStandardMaterial({
          color: mainColor,
          roughness: 0.85,
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.position.y = 0.01;
        rug.receiveShadow = true;
        group.add(rug);
      } else if (cat === 'plants') {
        // Terracotta Potted Plant: Pot, Soil, Leaves
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.16, 0.35, 12),
          new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.8 })
        );
        pot.position.y = 0.175;
        pot.castShadow = true;
        group.add(pot);

        const soil = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12),
          new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.9 })
        );
        soil.position.y = 0.34;
        group.add(soil);

        // Monstera leaves
        const leafMat = new THREE.MeshStandardMaterial({
          color: '#15803d',
          roughness: 0.4,
          side: THREE.DoubleSide,
        });
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 6), leafMat);
          leaf.position.set(Math.cos(angle) * 0.12, 0.5, Math.sin(angle) * 0.12);
          leaf.rotation.z = Math.cos(angle) * 0.5;
          leaf.rotation.x = Math.sin(angle) * 0.5;
          group.add(leaf);
        }
      } else {
        // Generic Bookshelf / Cabinet
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.35), darkWoodMat);
        cabinet.position.y = 0.55;
        cabinet.castShadow = true;
        group.add(cabinet);

        // Books on shelf
        const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706'];
        for (let b = 0; b < 6; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.22, 0.2),
            new THREE.MeshStandardMaterial({ color: colors[b % colors.length] })
          );
          book.position.set(-0.25 + b * 0.1, 0.6, 0.08);
          group.add(book);
        }
      }

      // Position in Room Grid
      const worldX = (item.x - roomSize / 2 + 0.5) * TILE_SIZE;
      const worldZ = (item.y - roomSize / 2 + 0.5) * TILE_SIZE;
      group.position.set(worldX, 0, worldZ);

      // Rotation around Y
      const rotDeg = item.rotation || 0;
      group.rotation.y = (rotDeg * Math.PI) / 180;

      // Selection Highlight Glow
      if (item.id === selectedFurnitureId) {
        const selRingGeo = new THREE.RingGeometry(0.45, 0.55, 32);
        const selRingMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
        });
        const selRing = new THREE.Mesh(selRingGeo, selRingMat);
        selRing.rotation.x = -Math.PI / 2;
        selRing.position.y = 0.02;
        group.add(selRing);

        // 3D Floating Arrow above selected piece
        const arrowCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.22, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        arrowCone.rotation.x = Math.PI;
        arrowCone.position.y = 1.35;
        group.add(arrowCone);
      }

      scene.add(group);
      furnitureGroupsRef.current.set(item.id, group);
    });
  }, [placedFurniture, selectedFurnitureId, roomSize]);

  // Pointer Interaction (Orbit & Raycasting)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousPointerPosition.current.x;
    const deltaY = e.clientY - previousPointerPosition.current.y;

    // Adjust camera orbit angles
    cameraAngle.current.theta -= deltaX * 0.008;
    cameraAngle.current.phi = Math.max(0.2, Math.min(Math.PI / 2.1, cameraAngle.current.phi + deltaY * 0.008));

    updateCameraPosition();
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const movedDist = Math.hypot(
      e.clientX - previousPointerPosition.current.x,
      e.clientY - previousPointerPosition.current.y
    );
    isDraggingRef.current = false;

    // If tap/click without dragging, perform 3D raycast
    if (movedDist < 6) {
      handleRaycast(e.clientX, e.clientY);
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.003;
    cameraAngle.current.radius = Math.max(
      roomSize * 1.2,
      Math.min(roomSize * 4.0, cameraAngle.current.radius + zoomDelta)
    );
    updateCameraPosition();
  };

  // 3D Raycasting logic
  const handleRaycast = (clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Check Wall Painting first
    const painting = sceneRef.current.getObjectByName('masterpiece_painting');
    if (painting) {
      const paintingHits = raycaster.intersectObjects(painting.children, true);
      if (paintingHits.length > 0 && onOpenPaintingsTab) {
        sound.playTap();
        onOpenPaintingsTab();
        return;
      }
    }

    // Check Furniture pieces
    const allFurnitureMeshes: THREE.Object3D[] = [];
    furnitureGroupsRef.current.forEach((grp) => {
      grp.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) allFurnitureMeshes.push(child);
      });
    });

    const furnitureHits = raycaster.intersectObjects(allFurnitureMeshes, false);
    if (furnitureHits.length > 0) {
      // Find parent group
      let curr: THREE.Object3D | null = furnitureHits[0].object;
      while (curr && !curr.userData?.isFurniture) {
        curr = curr.parent;
      }
      if (curr && curr.userData?.furnitureId) {
        sound.playTap();
        onSelectFurniture(curr.userData.furnitureId);
        return;
      }
    }

    // Check Floor Tiles
    const tileHits = raycaster.intersectObjects(floorTilesRef.current, false);
    if (tileHits.length > 0) {
      const hitTile = tileHits[0].object;
      const { gridX, gridY } = hitTile.userData;
      if (gridX !== undefined && gridY !== undefined) {
        onTileClick(gridX, gridY);
      }
    } else {
      // Deselect if clicked empty void
      onSelectFurniture(null);
    }
  };

  // Preset Camera Angles
  const setCameraPreset = (preset: 'isometric' | 'top' | 'front') => {
    sound.playTap();
    if (preset === 'isometric') {
      cameraAngle.current = { theta: Math.PI / 4, phi: Math.PI / 3.4, radius: roomSize * 2.3 };
    } else if (preset === 'top') {
      cameraAngle.current = { theta: 0, phi: 0.25, radius: roomSize * 2.5 };
    } else if (preset === 'front') {
      cameraAngle.current = { theta: 0, phi: Math.PI / 2.3, radius: roomSize * 2.2 };
    }
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-amber-900/40 shadow-2xl select-none">
      {/* 3D Canvas Mounting Target */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D HUD Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto">
        <span className="px-2.5 py-1 bg-amber-950/80 backdrop-blur-md text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          3D Sims Studio
        </span>

        {/* Camera Views */}
        <div className="flex items-center bg-slate-900/85 backdrop-blur-md rounded-xl p-1 border border-slate-700/60 shadow-lg text-xs gap-1">
          <button
            onClick={() => setCameraPreset('isometric')}
            className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Isometric Orbit"
          >
            Iso 45°
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Front Eye Level"
          >
            Eye Level
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Top Blueprint View"
          >
            Top Down
          </button>
        </div>
      </div>

      {/* Touch & Drag Orbit Hint */}
      {controlsHint && (
        <div className="absolute bottom-3 left-3 pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/50 text-[11px] text-slate-300">
          <span>🖐️ Drag to orbit • Scroll to zoom • Tap to select or place</span>
          <button
            onClick={() => setControlsHint(false)}
            className="text-slate-400 hover:text-white ml-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Fast Rotate 90° overlay if furniture is selected */}
      {selectedFurnitureId && onRotateFurniture && (
        <div className="absolute top-3 right-3 pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => onRotateFurniture(selectedFurnitureId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg border border-sky-300/40 cursor-pointer active:scale-95 transition-all"
          >
            <span>🔄</span>
            <span>Rotate 3D 90°</span>
          </button>
        </div>
      )}
    </div>
  );
};
