import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FarmTile, GameState, ToolMode, CropType, AnimalType, Season, TimeOfDay, WeatherType } from '../../types/game';
import { CROPS, GRID_SIZE } from '../../constants/gameData';
import { sound } from '../../services/audio';

const TILE_WIDTH = 78;
const TILE_HEIGHT = 40;
const TILE_DEPTH = 10; // 3D diorama bevel height for smooth graphics

interface FloatingParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'text' | 'heart' | 'sparkle' | 'water' | 'smoke' | 'weather' | 'lightning';
  text?: string;
  color?: string;
  size?: number;
  angle?: number;
  spin?: number;
}

interface IsometricCanvasProps {
  gameState: GameState;
  onTileAction: (tile: FarmTile, actionType: ToolMode) => void;
  onAnimalPet: (animalId: string, tile: FarmTile) => void;
  onStructureClick: (structureType: string, tile: FarmTile) => void;
  movingTile: FarmTile | null;
  onPlaceMovedTile: (targetX: number, targetY: number) => void;
  onCancelMove: () => void;
}

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({
  gameState,
  onTileAction,
  onAnimalPet,
  onStructureClick,
  movingTile,
  onPlaceMovedTile,
  onCancelMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to avoid stale state in 60fps loop
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const movingTileRef = useRef<FarmTile | null>(movingTile);
  movingTileRef.current = movingTile;

  // Camera state
  const cameraRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    zoom: 1.0,
    targetZoom: 1.0,
  });

  // Touch and interaction tracking
  const interactionRef = useRef({
    isPointerDown: false,
    dragStartX: 0,
    dragStartY: 0,
    hasMovedSignificantly: false,
    lastPinchDistance: 0,
    hoveredGridX: -1,
    hoveredGridY: -1,
    lastSwipedTileKey: '',
  });

  const particlesRef = useRef<FloatingParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const windmillAngleRef = useRef(0);
  const animalSquashRef = useRef<Record<string, number>>({});
  const lightningFlashRef = useRef(0); // 0 to 1 intensity
  const nextThunderTimeRef = useRef(Date.now() + 6000);

  // Helper to add floating visual particle
  const spawnParticle = useCallback((
    x: number,
    y: number,
    type: FloatingParticle['type'],
    options: Partial<FloatingParticle> = {}
  ) => {
    particlesRef.current.push({
      id: Math.random().toString(36).slice(2, 9),
      x,
      y,
      vx: (Math.random() - 0.5) * 1.2,
      vy: type === 'text' ? -1.8 - Math.random() * 0.8 : -1.0 - Math.random() * 0.8,
      alpha: 1,
      life: 0,
      maxLife: type === 'text' ? 55 : 40,
      type,
      ...options,
    });
  }, []);

  // Weather particles pooling
  useEffect(() => {
    particlesRef.current = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: 'weather_' + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 1 + Math.random() * 2,
        vy: 2 + Math.random() * 3,
        alpha: 0.5 + Math.random() * 0.5,
        life: Math.random() * 200,
        maxLife: 300,
        type: 'weather',
        size: 3 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.08,
      });
    }
  }, [gameState.weather]);

  // Center camera on the farm on initial mount
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const isMobile = width < 600;
      const idealZoom = isMobile ? 0.95 : 1.15;
      cameraRef.current.zoom = idealZoom;
      cameraRef.current.targetZoom = idealZoom;

      cameraRef.current.x = 0;
      cameraRef.current.targetX = 0;
      cameraRef.current.y = isMobile ? -20 : 0;
      cameraRef.current.targetY = isMobile ? -20 : 0;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Grid to screen conversion
  const gridToScreen = useCallback((gx: number, gy: number, canvasWidth: number, canvasHeight: number) => {
    const isoX = (gx - gy) * (TILE_WIDTH / 2);
    const isoY = (gx + gy) * (TILE_HEIGHT / 2);
    const zoom = cameraRef.current.zoom;
    const sx = canvasWidth / 2 + isoX * zoom + cameraRef.current.x;
    const sy = canvasHeight / 3 + isoY * zoom + cameraRef.current.y;
    return { sx, sy };
  }, []);

  // Screen to grid conversion
  const screenToGrid = useCallback((screenX: number, screenY: number, canvasWidth: number, canvasHeight: number) => {
    const zoom = cameraRef.current.zoom;
    const relX = (screenX - canvasWidth / 2 - cameraRef.current.x) / zoom;
    const relY = (screenY - canvasHeight / 3 - cameraRef.current.y) / zoom;

    const gx = (relX / (TILE_WIDTH / 2) + relY / (TILE_HEIGHT / 2)) / 2;
    const gy = (relY / (TILE_HEIGHT / 2) - relX / (TILE_WIDTH / 2)) / 2;

    return {
      gx: Math.floor(gx),
      gy: Math.floor(gy),
    };
  }, []);

  // Perform action on tile at (gx, gy)
  const executeActionOnTile = useCallback((gx: number, gy: number) => {
    const state = gameStateRef.current;
    const maxGrid = state.gridSize || GRID_SIZE;
    if (gx < 0 || gx >= maxGrid || gy < 0 || gy >= maxGrid) return;

    if (movingTileRef.current) {
      onPlaceMovedTile(gx, gy);
      return;
    }

    const tile = state.tiles.find((t) => t.x === gx && t.y === gy);
    if (!tile) return;

    const currentTool = state.selectedTool;

    // DIRECT MOVE TOOL: Pick up any item (field, house, animal, decor)
    if (currentTool === 'move') {
      sound.playTap();
      onTileAction(tile, 'move');
      return;
    }

    // Direct animal tap?
    if (tile.animal && (currentTool === 'inspect' || currentTool === 'harvest')) {
      animalSquashRef.current[tile.animal.id] = 1.0;
      sound.playAnimalPet(tile.animal.type);
      onAnimalPet(tile.animal.id, tile);

      if (canvasRef.current) {
        const { sx, sy } = gridToScreen(gx, gy, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        spawnParticle(sx, sy - 24, 'heart', { color: '#ec4899', size: 16 });
        spawnParticle(sx + 10, sy - 34, 'heart', { color: '#f43f5e', size: 12 });
      }
      return;
    }

    // Direct structure or fish pond tap?
    if (tile.type === 'fish_pond' || (tile.structure && (tile.structure.type === 'fish_pond' || currentTool === 'inspect'))) {
      if (tile.structure?.type === 'fish_pond' || tile.type === 'fish_pond') {
        sound.playFishCatch();
        onStructureClick('fish_pond', tile);
        if (canvasRef.current) {
          const { sx, sy } = gridToScreen(gx, gy, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
          const fishType = Math.random() > 0.5 ? 'Bangus 🐟' : 'Tilapia 🐠';
          spawnParticle(sx, sy - 25, 'text', {
            text: `+1 ${fishType}`,
            color: '#38bdf8',
            size: 14,
          });
          spawnParticle(sx + 10, sy - 40, 'text', {
            text: '+35 🪙',
            color: '#fbbf24',
            size: 12,
          });
          for (let i = 0; i < 6; i++) {
            spawnParticle(sx + (Math.random() - 0.5) * 16, sy - 15 + (Math.random() - 0.5) * 10, 'water', {
              color: '#38bdf8',
              size: 3.5,
            });
          }
        }
        return;
      }

      if (tile.structure && currentTool === 'inspect') {
        sound.playTap();
        onStructureClick(tile.structure.type, tile);
        return;
      }
    }

    // Handle tool action on tile
    if (canvasRef.current) {
      const { sx, sy } = gridToScreen(gx, gy, canvasRef.current.clientWidth, canvasRef.current.clientHeight);

      if (currentTool === 'carabao_plow') {
        sound.playPlow();
        sound.playAnimalPet('carabao');
        for (let i = 0; i < 5; i++) {
          spawnParticle(sx + (Math.random() - 0.5) * 20, sy + (Math.random() - 0.5) * 12, 'sparkle', {
            color: '#78350f',
            size: 5,
          });
        }
      } else if (currentTool === 'plow' && tile.type === 'grass') {
        sound.playPlow();
        spawnParticle(sx, sy, 'sparkle', { color: '#a16207', size: 4 });
      } else if (currentTool === 'plant' && tile.type === 'soil' && !tile.crop) {
        sound.playPlant();
        const cropDef = CROPS[state.selectedSeed];
        spawnParticle(sx, sy - 10, 'sparkle', { color: cropDef?.color || '#22c55e', size: 5 });
      } else if (currentTool === 'water' && tile.type === 'soil' && tile.crop && !tile.crop.watered) {
        sound.playWater();
        for (let i = 0; i < 4; i++) {
          spawnParticle(sx + (Math.random() - 0.5) * 16, sy - 10 + (Math.random() - 0.5) * 10, 'water', {
            color: '#38bdf8',
            size: 3,
          });
        }
      } else if (currentTool === 'harvest' && tile.crop && tile.crop.isReady) {
        sound.playHarvest();
        sound.playCoin();
        const cropDef = CROPS[tile.crop.type];
        spawnParticle(sx, sy - 20, 'text', {
          text: `+${cropDef.sellPrice} 🪙`,
          color: '#fbbf24',
          size: 14,
        });
        spawnParticle(sx + 15, sy - 35, 'text', {
          text: `+${cropDef.xpYield} XP`,
          color: '#38bdf8',
          size: 12,
        });
        for (let i = 0; i < 6; i++) {
          spawnParticle(sx + (Math.random() - 0.5) * 20, sy - 15 + (Math.random() - 0.5) * 15, 'sparkle', {
            color: cropDef.color,
            size: 4,
          });
        }
      }
    }

    onTileAction(tile, currentTool);
  }, [gridToScreen, onAnimalPet, onPlaceMovedTile, onStructureClick, onTileAction, spawnParticle]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    interactionRef.current.isPointerDown = true;
    interactionRef.current.dragStartX = e.clientX;
    interactionRef.current.dragStartY = e.clientY;
    interactionRef.current.hasMovedSignificantly = false;
    sound.ensureUnlocked();

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { gx, gy } = screenToGrid(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
      interactionRef.current.hoveredGridX = gx;
      interactionRef.current.hoveredGridY = gy;
      interactionRef.current.lastSwipedTileKey = `${gx},${gy}`;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { gx, gy } = screenToGrid(mouseX, mouseY, rect.width, rect.height);
    interactionRef.current.hoveredGridX = gx;
    interactionRef.current.hoveredGridY = gy;

    if (interactionRef.current.isPointerDown) {
      const dx = e.clientX - interactionRef.current.dragStartX;
      const dy = e.clientY - interactionRef.current.dragStartY;

      if (Math.hypot(dx, dy) > 8) {
        interactionRef.current.hasMovedSignificantly = true;
      }

      const currentTool = gameStateRef.current.selectedTool;
      const isSwipeTool = currentTool === 'harvest' || currentTool === 'water' || currentTool === 'plant';

      if (isSwipeTool && !movingTileRef.current) {
        const tileKey = `${gx},${gy}`;
        if (tileKey !== interactionRef.current.lastSwipedTileKey) {
          interactionRef.current.lastSwipedTileKey = tileKey;
          executeActionOnTile(gx, gy);
        }
      } else {
        cameraRef.current.x += e.movementX;
        cameraRef.current.y += e.movementY;
        cameraRef.current.targetX = cameraRef.current.x;
        cameraRef.current.targetY = cameraRef.current.y;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (interactionRef.current.isPointerDown) {
      if (!interactionRef.current.hasMovedSignificantly) {
        const gx = interactionRef.current.hoveredGridX;
        const gy = interactionRef.current.hoveredGridY;
        executeActionOnTile(gx, gy);
      }
    }
    interactionRef.current.isPointerDown = false;
    interactionRef.current.lastSwipedTileKey = '';
  };

  // Touch gesture support (pinch zoom & swipe)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

      if (interactionRef.current.lastPinchDistance > 0) {
        const ratio = dist / interactionRef.current.lastPinchDistance;
        const newZoom = Math.max(0.65, Math.min(1.85, cameraRef.current.zoom * ratio));
        cameraRef.current.zoom = newZoom;
        cameraRef.current.targetZoom = newZoom;
      }
      interactionRef.current.lastPinchDistance = dist;
    }
  };

  const handleTouchEnd = () => {
    interactionRef.current.lastPinchDistance = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.65, Math.min(1.85, cameraRef.current.zoom * zoomFactor));
    cameraRef.current.targetZoom = newZoom;
  };

  // --- DRAWING PROCEDURAL HELPERS (Smooth Diorama 3D Bevel Tiles) ---
  const drawIsometricDioramaTile = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    depth: number,
    topFill: string,
    leftFill: string,
    rightFill: string,
    stroke?: string
  ) => {
    // 3D Left side face
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x, y + h / 2 + depth);
    ctx.lineTo(x - w / 2, y + depth);
    ctx.closePath();
    ctx.fillStyle = leftFill;
    ctx.fill();

    // 3D Right side face
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + depth);
    ctx.lineTo(x, y + h / 2 + depth);
    ctx.closePath();
    ctx.fillStyle = rightFill;
    ctx.fill();

    // Top surface diamond
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.fillStyle = topFill;
    ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Draw soft oval shadow for objects
  const drawSoftShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 60FPS Simulation and Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      cameraRef.current.zoom += (cameraRef.current.targetZoom - cameraRef.current.zoom) * 0.15;
      const zoom = cameraRef.current.zoom;

      // Rotate windmill sails smoothly
      windmillAngleRef.current += dt * 1.5;

      // Decay animal squashes
      Object.keys(animalSquashRef.current).forEach((id) => {
        if (animalSquashRef.current[id] > 0) {
          animalSquashRef.current[id] -= dt * 3;
          if (animalSquashRef.current[id] < 0) animalSquashRef.current[id] = 0;
        }
      });

      // Decay lightning flash
      if (lightningFlashRef.current > 0) {
        lightningFlashRef.current -= dt * 4;
        if (lightningFlashRef.current < 0) lightningFlashRef.current = 0;
      }

      const state = gameStateRef.current;
      const season = state.season;
      const timeOfDay = state.timeOfDay;
      const weather = state.weather || 'sunny';

      // Thunderstorm random lightning trigger
      if (weather === 'thunderstorm' && now > nextThunderTimeRef.current) {
        lightningFlashRef.current = 0.85;
        sound.playThunder();
        nextThunderTimeRef.current = now + 4000 + Math.random() * 8000;
      }

      // 1. Dynamic Horizon Background Palette
      const isNight = state.isNightMode || timeOfDay === 'night';
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isNight) {
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.45, '#0f172a');
        bgGrad.addColorStop(1, '#1e1b4b');
      } else if (timeOfDay === 'sunset') {
        bgGrad.addColorStop(0, '#7c2d12');
        bgGrad.addColorStop(0.5, '#c2410c');
        bgGrad.addColorStop(1, '#3b6e31');
      } else if (weather === 'thunderstorm') {
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(0.5, '#334155');
        bgGrad.addColorStop(1, '#1e2836');
      } else if (weather === 'rain') {
        bgGrad.addColorStop(0, '#334155');
        bgGrad.addColorStop(0.5, '#475569');
        bgGrad.addColorStop(1, '#293548');
      } else if (season === 'winter') {
        bgGrad.addColorStop(0, '#7395a8');
        bgGrad.addColorStop(0.5, '#99b3c4');
        bgGrad.addColorStop(1, '#c0d6df');
      } else if (season === 'autumn') {
        bgGrad.addColorStop(0, '#785433');
        bgGrad.addColorStop(0.5, '#a67c52');
        bgGrad.addColorStop(1, '#5a4d38');
      } else if (season === 'summer') {
        bgGrad.addColorStop(0, '#437637');
        bgGrad.addColorStop(0.5, '#629e47');
        bgGrad.addColorStop(1, '#3b6e31');
      } else {
        // Spring
        bgGrad.addColorStop(0, '#387346');
        bgGrad.addColorStop(0.5, '#569b59');
        bgGrad.addColorStop(1, '#31693d');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Twinkling stars in night sky
      if (isNight) {
        for (let s = 0; s < 35; s++) {
          const sx = (s * 157.3) % width;
          const sy = (s * 83.7) % (height * 0.45);
          const starAlpha = 0.25 + Math.sin(now / 400 + s * 2) * 0.25;
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Sort tiles by gx + gy for correct depth
      const sortedTiles = [...state.tiles].sort((a, b) => a.x + a.y - (b.x + b.y));

      // 2. Draw 3D Smooth Diorama Tiles
      sortedTiles.forEach((tile) => {
        const { sx, sy } = gridToScreen(tile.x, tile.y, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;
        const td = TILE_DEPTH * zoom;

        let topColor = '#5ea853';
        let leftColor = '#3e7536';
        let rightColor = '#2f5b2a';
        let strokeColor = 'rgba(255,255,255,0.06)';

        if (season === 'spring') {
          topColor = (tile.x + tile.y) % 2 === 0 ? '#63ad57' : '#6cb85f';
          leftColor = '#3d7436';
          rightColor = '#32602c';
        } else if (season === 'summer') {
          topColor = (tile.x + tile.y) % 2 === 0 ? '#72b842' : '#7cc24a';
          leftColor = '#4e8229';
          rightColor = '#3f6b21';
        } else if (season === 'autumn') {
          topColor = (tile.x + tile.y) % 2 === 0 ? '#a38446' : '#ad8f4e';
          leftColor = '#6d5528';
          rightColor = '#59441f';
        } else if (season === 'winter') {
          topColor = (tile.x + tile.y) % 2 === 0 ? '#d9e7ec' : '#e4eff4';
          leftColor = '#8ba1ab';
          rightColor = '#72858e';
          strokeColor = 'rgba(255,255,255,0.2)';
        }

        if (tile.type === 'soil') {
          const isWatered = tile.crop?.watered || weather === 'rain' || weather === 'thunderstorm';
          topColor = isWatered ? '#452b19' : '#784e31';
          leftColor = isWatered ? '#2e1c10' : '#4d301c';
          rightColor = isWatered ? '#22150c' : '#3d2616';
        } else if (tile.type === 'stone_path') {
          topColor = '#94a3b8';
          leftColor = '#64748b';
          rightColor = '#475569';
        } else if (tile.type === 'wood_path') {
          topColor = '#b45309';
          leftColor = '#78350f';
          rightColor = '#451a03';
        } else if (tile.type === 'flower_bed') {
          topColor = '#4d7c0f';
          leftColor = '#365314';
          rightColor = '#1a2e05';
        } else if (tile.type === 'water_pond') {
          topColor = '#38bdf8';
          leftColor = '#0284c7';
          rightColor = '#0369a1';
        } else if (tile.type === 'fish_pond') {
          // Tropical Philippine Aquaculture Fish Pond (Palaisdaan)
          topColor = '#0e7490';
          leftColor = '#155e75';
          rightColor = '#164e63';
          strokeColor = '#a16207';
        }

        // Draw 3D beveled block
        drawIsometricDioramaTile(ctx, sx, sy, tw, th, td, topColor, leftColor, rightColor, strokeColor);

        // Water sheen on wet soil
        if (tile.type === 'soil' && (tile.crop?.watered || weather === 'rain' || weather === 'thunderstorm')) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.beginPath();
          ctx.ellipse(sx, sy, tw * 0.28, th * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fish Pond (Palaisdaan) with swimming Tilapia and Bangus (Milkfish)!
        if (tile.type === 'fish_pond') {
          // Bamboo pond rim
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2 * zoom;
          ctx.beginPath();
          ctx.moveTo(sx, sy - th * 0.48);
          ctx.lineTo(sx + tw * 0.48, sy);
          ctx.lineTo(sx, sy + th * 0.48);
          ctx.lineTo(sx - tw * 0.48, sy);
          ctx.closePath();
          ctx.stroke();

          // Swimming Silver Milkfish (Bangus) - sleek silver with forked tail
          const fishPhase = now / 800 + tile.x * 2;
          const bangusX = sx + Math.cos(fishPhase) * tw * 0.24;
          const bangusY = sy + Math.sin(fishPhase) * th * 0.22;
          ctx.save();
          ctx.translate(bangusX, bangusY);
          ctx.rotate(fishPhase + Math.PI / 2);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(0, 0, 8 * zoom, 2.8 * zoom, 0, 0, Math.PI * 2);
          ctx.fill();
          // Bangus forked tail
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-7 * zoom, 0);
          ctx.lineTo(-12 * zoom, -3.5 * zoom);
          ctx.lineTo(-12 * zoom, 3.5 * zoom);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Swimming River Tilapia - olive/grey with banded stripes
          const tilapiaPhase = now / 950 + tile.y * 3 + 2;
          const tilapiaX = sx + Math.cos(tilapiaPhase) * tw * 0.2;
          const tilapiaY = sy + Math.sin(tilapiaPhase) * th * 0.18;
          ctx.save();
          ctx.translate(tilapiaX, tilapiaY);
          ctx.rotate(tilapiaPhase + Math.PI / 2);
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(0, 0, 7 * zoom, 4.2 * zoom, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-2 * zoom, -3 * zoom, 1.5 * zoom, 6 * zoom);
          ctx.fillRect(2 * zoom, -3 * zoom, 1.5 * zoom, 6 * zoom);
          ctx.restore();

          // Floating green kangkong / lily leaves
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(sx - 10 * zoom, sy - 4 * zoom, 4 * zoom, 0, Math.PI * 2);
          ctx.arc(sx + 12 * zoom, sy + 3 * zoom, 4.5 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Animated pond ripples
        if (tile.type === 'water_pond') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          const ripplePhase = (now / 1000 + tile.x) % 2;
          ctx.beginPath();
          ctx.ellipse(sx, sy, tw * 0.26 * ripplePhase, th * 0.26 * ripplePhase, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Flower bed blossoms
        if (tile.type === 'flower_bed') {
          const flowerColors = ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7'];
          for (let f = 0; f < 5; f++) {
            const fx = sx + (Math.sin(f * 2.3 + tile.x) * tw * 0.25);
            const fy = sy + (Math.cos(f * 1.7 + tile.y) * th * 0.25);
            ctx.fillStyle = flowerColors[f % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(fx, fy, 1 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 3. Draw Objects, Structures, Crops, and Animals with Smooth Shadows
      sortedTiles.forEach((tile) => {
        const { sx, sy } = gridToScreen(tile.x, tile.y, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;

        // FENCE
        if (tile.type === 'fence') {
          drawSoftShadow(ctx, sx, sy, 14 * zoom, 6 * zoom);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(sx - 4 * zoom, sy - 18 * zoom, 8 * zoom, 20 * zoom);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(sx - 16 * zoom, sy - 12 * zoom, 32 * zoom, 4 * zoom);
          ctx.fillRect(sx - 16 * zoom, sy - 6 * zoom, 32 * zoom, 4 * zoom);
        }

        // CROPS
        if (tile.crop) {
          const cropDef = CROPS[tile.crop.type];
          const isReady = tile.crop.isReady;
          const prog = tile.crop.growthProgress;
          const sway = Math.sin(now / 400 + tile.x * 2) * 2 * zoom;

          // Shadow under plant
          drawSoftShadow(ctx, sx, sy, 8 * zoom, 4 * zoom);

          if (prog < 0.35) {
            // Stage 1: Sprout
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.ellipse(sx - 5 * zoom, sy - 6 * zoom, 3 * zoom, 5 * zoom, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(sx + 5 * zoom, sy - 6 * zoom, 3 * zoom, 5 * zoom, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(sx - 1.5 * zoom, sy - 8 * zoom, 3 * zoom, 8 * zoom);
          } else if (prog < 0.9) {
            // Stage 2: Foliage
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.ellipse(sx + sway, sy - 14 * zoom, 8 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(sx - 6 * zoom + sway, sy - 12 * zoom, 6 * zoom, 8 * zoom, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(sx + 6 * zoom + sway, sy - 12 * zoom, 6 * zoom, 8 * zoom, 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Stage 3: Ripe
            const ripeBounce = Math.sin(now / 250 + tile.x) * 3 * zoom;

            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(sx + sway, sy - 12 * zoom, 10 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = cropDef.color;
            if (tile.crop.type === 'wheat') {
              for (let i = 0; i < 3; i++) {
                const offX = (i - 1) * 6 * zoom;
                ctx.beginPath();
                ctx.ellipse(sx + offX + sway, sy - 22 * zoom + ripeBounce, 3.5 * zoom, 10 * zoom, (i - 1) * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = cropDef.secondaryColor;
                ctx.stroke();
              }
            } else if (tile.crop.type === 'strawberry') {
              ctx.beginPath();
              ctx.ellipse(sx - 5 * zoom, sy - 15 * zoom + ripeBounce, 5 * zoom, 7 * zoom, -0.2, 0, Math.PI * 2);
              ctx.ellipse(sx + 5 * zoom, sy - 14 * zoom + ripeBounce, 5.5 * zoom, 7.5 * zoom, 0.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(sx + 4 * zoom, sy - 14 * zoom + ripeBounce, 1.5, 1.5);
              ctx.fillRect(sx - 4 * zoom, sy - 15 * zoom + ripeBounce, 1.5, 1.5);
            } else if (tile.crop.type === 'pumpkin') {
              ctx.beginPath();
              ctx.ellipse(sx, sy - 16 * zoom + ripeBounce, 12 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = cropDef.secondaryColor;
              ctx.lineWidth = 2 * zoom;
              ctx.stroke();
              ctx.fillStyle = '#65a30d';
              ctx.fillRect(sx - 2 * zoom, sy - 26 * zoom + ripeBounce, 4 * zoom, 7 * zoom);
            } else if (tile.crop.type === 'sunflower') {
              ctx.fillStyle = '#eab308';
              ctx.beginPath();
              ctx.arc(sx + sway, sy - 26 * zoom + ripeBounce, 11 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(sx + sway, sy - 26 * zoom + ripeBounce, 6 * zoom, 0, Math.PI * 2);
              ctx.fill();
            } else if (tile.crop.type === 'palay') {
              // Palay (Golden Rice stalks)
              for (let stalk = -1; stalk <= 1; stalk++) {
                const offX = stalk * 6 * zoom;
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.ellipse(sx + offX + sway, sy - 22 * zoom + ripeBounce, 3 * zoom, 11 * zoom, stalk * 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ca8a04';
                ctx.lineWidth = 1 * zoom;
                ctx.stroke();
                // Drooping golden grain panicles
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(sx + offX + sway + stalk * 4 * zoom, sy - 30 * zoom + ripeBounce, 2.5 * zoom, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (tile.crop.type === 'ube') {
              // Ube (Purple Yam with heart-shaped leaves & violet tubers)
              ctx.fillStyle = '#7e22ce';
              ctx.beginPath();
              ctx.ellipse(sx - 4 * zoom, sy - 12 * zoom + ripeBounce, 7 * zoom, 5 * zoom, -0.2, 0, Math.PI * 2);
              ctx.ellipse(sx + 5 * zoom, sy - 14 * zoom + ripeBounce, 8 * zoom, 6 * zoom, 0.3, 0, Math.PI * 2);
              ctx.fill();
              // Heart-shaped deep green leaves on top
              ctx.fillStyle = '#16a34a';
              ctx.beginPath();
              ctx.arc(sx - 3 * zoom, sy - 22 * zoom + ripeBounce, 5 * zoom, 0, Math.PI * 2);
              ctx.arc(sx + 4 * zoom, sy - 20 * zoom + ripeBounce, 4.5 * zoom, 0, Math.PI * 2);
              ctx.fill();
            } else if (tile.crop.type === 'mango') {
              // Carabao Mango (Golden hanging fruits)
              ctx.fillStyle = '#15803d';
              ctx.beginPath();
              ctx.ellipse(sx + sway, sy - 20 * zoom, 12 * zoom, 14 * zoom, 0, 0, Math.PI * 2);
              ctx.fill();
              // Golden yellow mangoes
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.ellipse(sx - 5 * zoom, sy - 16 * zoom + ripeBounce, 4 * zoom, 6 * zoom, 0.3, 0, Math.PI * 2);
              ctx.ellipse(sx + 6 * zoom, sy - 18 * zoom + ripeBounce, 4.5 * zoom, 6.5 * zoom, -0.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#eab308';
              ctx.fillRect(sx - 5 * zoom, sy - 23 * zoom + ripeBounce, 1.5 * zoom, 3 * zoom);
              ctx.fillRect(sx + 6 * zoom, sy - 25 * zoom + ripeBounce, 1.5 * zoom, 3 * zoom);
            } else {
              ctx.beginPath();
              ctx.ellipse(sx, sy - 16 * zoom + ripeBounce, 7 * zoom, 9 * zoom, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            if (isReady) {
              const badgeY = sy - 36 * zoom + Math.sin(now / 300) * 3;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.beginPath();
              ctx.arc(sx, badgeY, 11 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 2 * zoom;
              ctx.stroke();

              ctx.font = `${Math.floor(12 * zoom)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✨', sx, badgeY);
            }
          }
        }

        // STRUCTURES (Upgraded Architecture with Smooth Lighting)
        if (tile.structure) {
          const st = tile.structure.type;
          drawSoftShadow(ctx, sx, sy, 26 * zoom, 14 * zoom);

          if (st === 'farmhouse') {
            const houseLevel = state.house?.level || 1;
            const hColor = state.house?.exteriorColor || '#b91c1c';
            const roofColor = state.house?.roofColor || '#450a0a';

            if (houseLevel >= 3) {
              // Level 3: Grand Victorian Country Estate with wrap porch & turret
              ctx.fillStyle = hColor;
              ctx.fillRect(sx - 36 * zoom, sy - 48 * zoom, 72 * zoom, 48 * zoom);

              // Roof
              ctx.fillStyle = roofColor;
              ctx.beginPath();
              ctx.moveTo(sx, sy - 78 * zoom);
              ctx.lineTo(sx + 42 * zoom, sy - 48 * zoom);
              ctx.lineTo(sx - 42 * zoom, sy - 48 * zoom);
              ctx.closePath();
              ctx.fill();

              // Turret / Cupola
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(sx + 18 * zoom, sy - 88 * zoom, 16 * zoom, 18 * zoom);
              ctx.fillStyle = roofColor;
              ctx.beginPath();
              ctx.moveTo(sx + 26 * zoom, sy - 100 * zoom);
              ctx.lineTo(sx + 36 * zoom, sy - 88 * zoom);
              ctx.lineTo(sx + 16 * zoom, sy - 88 * zoom);
              ctx.closePath();
              ctx.fill();

              // Porch Columns & Railing
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(sx - 34 * zoom, sy - 18 * zoom, 4 * zoom, 18 * zoom);
              ctx.fillRect(sx - 12 * zoom, sy - 18 * zoom, 4 * zoom, 18 * zoom);
              ctx.fillRect(sx + 12 * zoom, sy - 18 * zoom, 4 * zoom, 18 * zoom);
              ctx.fillRect(sx + 30 * zoom, sy - 18 * zoom, 4 * zoom, 18 * zoom);
              ctx.fillRect(sx - 34 * zoom, sy - 10 * zoom, 68 * zoom, 3 * zoom);

              // Glowing Stained Glass Windows
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(sx - 26 * zoom, sy - 38 * zoom, 12 * zoom, 14 * zoom);
              ctx.fillRect(sx + 6 * zoom, sy - 38 * zoom, 12 * zoom, 14 * zoom);
            } else if (houseLevel === 2) {
              // Level 2: Pastoral 2-Story Manor with dormers
              ctx.fillStyle = hColor;
              ctx.fillRect(sx - 32 * zoom, sy - 42 * zoom, 64 * zoom, 42 * zoom);

              // Mansard Roof
              ctx.fillStyle = roofColor;
              ctx.beginPath();
              ctx.moveTo(sx, sy - 68 * zoom);
              ctx.lineTo(sx + 36 * zoom, sy - 42 * zoom);
              ctx.lineTo(sx - 36 * zoom, sy - 42 * zoom);
              ctx.closePath();
              ctx.fill();

              // Dormer windows
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(sx - 14 * zoom, sy - 60 * zoom, 10 * zoom, 12 * zoom);
              ctx.fillRect(sx + 4 * zoom, sy - 60 * zoom, 10 * zoom, 12 * zoom);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(sx - 12 * zoom, sy - 58 * zoom, 6 * zoom, 8 * zoom);
              ctx.fillRect(sx + 6 * zoom, sy - 58 * zoom, 6 * zoom, 8 * zoom);

              // Flower boxes
              ctx.fillStyle = '#f43f5e';
              ctx.fillRect(sx - 24 * zoom, sy - 18 * zoom, 10 * zoom, 3 * zoom);
              ctx.fillRect(sx + 14 * zoom, sy - 18 * zoom, 10 * zoom, 3 * zoom);
            } else {
              // Level 1: Cozy Timber Cabin
              ctx.fillStyle = hColor;
              ctx.fillRect(sx - 26 * zoom, sy - 38 * zoom, 52 * zoom, 38 * zoom);

              // Roof
              ctx.fillStyle = roofColor;
              ctx.beginPath();
              ctx.moveTo(sx, sy - 60 * zoom);
              ctx.lineTo(sx + 30 * zoom, sy - 38 * zoom);
              ctx.lineTo(sx - 30 * zoom, sy - 38 * zoom);
              ctx.closePath();
              ctx.fill();

              // Door & Window
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(sx - 6 * zoom, sy - 14 * zoom, 12 * zoom, 14 * zoom);
              ctx.fillRect(sx + 10 * zoom, sy - 28 * zoom, 10 * zoom, 10 * zoom);
            }

            // Chimney with cozy rising smoke
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx + 16 * zoom, sy - 72 * zoom, 8 * zoom, 18 * zoom);
            if (Math.random() < 0.1) {
              spawnParticle(sx + 20 * zoom, sy - 74 * zoom, 'smoke', {
                size: 4 + Math.random() * 4,
                color: 'rgba(240, 240, 240, 0.45)',
                maxLife: 60,
              });
            }
          } else if (st === 'cottage') {
            // Guest Cottage
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(sx - 22 * zoom, sy - 32 * zoom, 44 * zoom, 32 * zoom);
            ctx.fillStyle = '#134e4a';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 50 * zoom);
            ctx.lineTo(sx + 26 * zoom, sy - 32 * zoom);
            ctx.lineTo(sx - 26 * zoom, sy - 32 * zoom);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx - 5 * zoom, sy - 12 * zoom, 10 * zoom, 12 * zoom);
          } else if (st === 'greenhouse') {
            // Botanical Conservatory Glass Dome
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(sx, sy - 16 * zoom, 22 * zoom, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * zoom;
            ctx.stroke();

            // Lush greenery visible inside
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(sx - 8 * zoom, sy - 10 * zoom, 8 * zoom, 0, Math.PI * 2);
            ctx.arc(sx + 8 * zoom, sy - 10 * zoom, 8 * zoom, 0, Math.PI * 2);
            ctx.fill();
          } else if (st === 'gazebo') {
            // Garden Gazebo
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(sx - 18 * zoom, sy - 28 * zoom, 4 * zoom, 28 * zoom);
            ctx.fillRect(sx + 14 * zoom, sy - 28 * zoom, 4 * zoom, 28 * zoom);
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 42 * zoom);
            ctx.lineTo(sx + 22 * zoom, sy - 28 * zoom);
            ctx.lineTo(sx - 22 * zoom, sy - 28 * zoom);
            ctx.closePath();
            ctx.fill();
          } else if (st === 'shed') {
            // Artisan Workshop
            ctx.fillStyle = '#b45309';
            ctx.fillRect(sx - 20 * zoom, sy - 28 * zoom, 40 * zoom, 28 * zoom);
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 40 * zoom);
            ctx.lineTo(sx + 24 * zoom, sy - 28 * zoom);
            ctx.lineTo(sx - 24 * zoom, sy - 28 * zoom);
            ctx.closePath();
            ctx.fill();
          } else if (st === 'barn') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(sx - 28 * zoom, sy - 44 * zoom, 56 * zoom, 44 * zoom);
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 64 * zoom);
            ctx.lineTo(sx + 32 * zoom, sy - 44 * zoom);
            ctx.lineTo(sx - 32 * zoom, sy - 44 * zoom);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(sx - 14 * zoom, sy - 24 * zoom, 28 * zoom, 24 * zoom);
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2 * zoom;
            ctx.beginPath();
            ctx.moveTo(sx - 14 * zoom, sy - 24 * zoom);
            ctx.lineTo(sx + 14 * zoom, sy);
            ctx.moveTo(sx + 14 * zoom, sy - 24 * zoom);
            ctx.lineTo(sx - 14 * zoom, sy);
            ctx.stroke();
          } else if (st === 'windmill') {
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath();
            ctx.moveTo(sx - 12 * zoom, sy - 54 * zoom);
            ctx.lineTo(sx + 12 * zoom, sy - 54 * zoom);
            ctx.lineTo(sx + 20 * zoom, sy);
            ctx.lineTo(sx - 20 * zoom, sy);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.stroke();

            const cx = sx;
            const cy = sy - 54 * zoom;
            const rot = windmillAngleRef.current;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.fillStyle = '#fef08a';
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 1.5 * zoom;
            for (let b = 0; b < 4; b++) {
              ctx.rotate(Math.PI / 2);
              ctx.strokeRect(0, -3 * zoom, 28 * zoom, 6 * zoom);
              ctx.fillRect(4 * zoom, -2 * zoom, 22 * zoom, 4 * zoom);
            }
            ctx.restore();
          } else if (st === 'well') {
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.ellipse(sx, sy - 6 * zoom, 16 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(sx, sy - 8 * zoom, 12 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx - 14 * zoom, sy - 28 * zoom, 3 * zoom, 22 * zoom);
            ctx.fillRect(sx + 11 * zoom, sy - 28 * zoom, 3 * zoom, 22 * zoom);
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 38 * zoom);
            ctx.lineTo(sx + 18 * zoom, sy - 28 * zoom);
            ctx.lineTo(sx - 18 * zoom, sy - 28 * zoom);
            ctx.closePath();
            ctx.fill();
          } else if (st === 'beehive') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(sx - 12 * zoom, sy - 24 * zoom, 24 * zoom, 10 * zoom);
            ctx.fillStyle = '#d97706';
            ctx.fillRect(sx - 14 * zoom, sy - 14 * zoom, 28 * zoom, 12 * zoom);
            for (let b = 0; b < 3; b++) {
              const bx = sx + Math.cos(now / 300 + b * 2) * 16 * zoom;
              const by = sy - 22 * zoom + Math.sin(now / 200 + b * 2) * 8 * zoom;
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(bx, by, 2.5 * zoom, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (st === 'coop') {
            ctx.fillStyle = '#b45309';
            ctx.fillRect(sx - 20 * zoom, sy - 30 * zoom, 40 * zoom, 30 * zoom);
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 42 * zoom);
            ctx.lineTo(sx + 24 * zoom, sy - 30 * zoom);
            ctx.lineTo(sx - 24 * zoom, sy - 30 * zoom);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx - 6 * zoom, sy - 16 * zoom, 12 * zoom, 12 * zoom);
          } else if (st === 'bahay_kubo') {
            // Traditional Filipino Bahay Kubo (Bamboo Stilts + Nipa Thatch Roof)
            // 1. Bamboo Stilts (Haligi)
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(sx - 22 * zoom, sy - 16 * zoom, 4 * zoom, 18 * zoom);
            ctx.fillRect(sx + 18 * zoom, sy - 16 * zoom, 4 * zoom, 18 * zoom);
            ctx.fillRect(sx - 8 * zoom, sy - 14 * zoom, 3.5 * zoom, 16 * zoom);
            ctx.fillRect(sx + 6 * zoom, sy - 14 * zoom, 3.5 * zoom, 16 * zoom);

            // Bamboo Ladder (Hagdan)
            ctx.fillStyle = '#a16207';
            ctx.fillRect(sx - 3 * zoom, sy - 10 * zoom, 2 * zoom, 12 * zoom);
            ctx.fillRect(sx + 3 * zoom, sy - 10 * zoom, 2 * zoom, 12 * zoom);
            ctx.fillRect(sx - 3 * zoom, sy - 6 * zoom, 8 * zoom, 2 * zoom);
            ctx.fillRect(sx - 3 * zoom, sy - 2 * zoom, 8 * zoom, 2 * zoom);

            // 2. Bamboo Floor / Woven Sawali Walls
            ctx.fillStyle = '#b45309';
            ctx.fillRect(sx - 26 * zoom, sy - 38 * zoom, 52 * zoom, 24 * zoom);

            // Open Awning Windows (Tukod / bamboo prop)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx - 18 * zoom, sy - 32 * zoom, 10 * zoom, 10 * zoom);
            ctx.fillRect(sx + 8 * zoom, sy - 32 * zoom, 10 * zoom, 10 * zoom);
            ctx.fillStyle = '#fde047';
            ctx.fillRect(sx - 16 * zoom, sy - 30 * zoom, 6 * zoom, 6 * zoom);
            ctx.fillRect(sx + 10 * zoom, sy - 30 * zoom, 6 * zoom, 6 * zoom);

            // 3. High Thatched Nipa / Cogon Pyramid Roof (Palaspas)
            ctx.fillStyle = '#a16207';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 64 * zoom);
            ctx.lineTo(sx + 32 * zoom, sy - 36 * zoom);
            ctx.lineTo(sx - 32 * zoom, sy - 36 * zoom);
            ctx.closePath();
            ctx.fill();

            // Roof texture ridge lines
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2 * zoom;
            ctx.beginPath();
            ctx.moveTo(sx, sy - 64 * zoom);
            ctx.lineTo(sx, sy - 36 * zoom);
            ctx.stroke();

            // Overhanging thatch fringes
            ctx.fillStyle = '#ca8a04';
            for (let f = -5; f <= 5; f++) {
              ctx.fillRect(sx + f * 6 * zoom, sy - 36 * zoom, 4 * zoom, 4 * zoom);
            }
          }
        }

        // DECOR & TREES
        if (tile.decor) {
          const dt = tile.decor.type;
          drawSoftShadow(ctx, sx, sy, 18 * zoom, 8 * zoom);

          if (dt === 'apple_tree' || dt === 'cherry_tree' || dt === 'pine_tree') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx - 5 * zoom, sy - 18 * zoom, 10 * zoom, 18 * zoom);

            if (dt === 'cherry_tree') {
              ctx.fillStyle = '#f472b6';
              ctx.beginPath();
              ctx.arc(sx, sy - 34 * zoom, 22 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fbcfe8';
              ctx.beginPath();
              ctx.arc(sx - 8 * zoom, sy - 36 * zoom, 14 * zoom, 0, Math.PI * 2);
              ctx.fill();
            } else if (dt === 'apple_tree') {
              ctx.fillStyle = '#16a34a';
              ctx.beginPath();
              ctx.arc(sx, sy - 34 * zoom, 22 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ef4444';
              [[-8, -32], [6, -38], [-4, -44], [10, -28]].forEach(([ax, ay]) => {
                ctx.beginPath();
                ctx.arc(sx + ax * zoom, sy + ay * zoom, 3.5 * zoom, 0, Math.PI * 2);
                ctx.fill();
              });
            } else {
              ctx.fillStyle = '#14532d';
              ctx.beginPath();
              ctx.moveTo(sx, sy - 54 * zoom);
              ctx.lineTo(sx + 18 * zoom, sy - 18 * zoom);
              ctx.lineTo(sx - 18 * zoom, sy - 18 * zoom);
              ctx.closePath();
              ctx.fill();
            }
          } else if (dt === 'scarecrow') {
            ctx.fillStyle = '#eab308';
            ctx.fillRect(sx - 2 * zoom, sy - 30 * zoom, 4 * zoom, 30 * zoom);
            ctx.fillRect(sx - 12 * zoom, sy - 22 * zoom, 24 * zoom, 4 * zoom);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(sx - 5 * zoom, sy - 20 * zoom, 10 * zoom, 12 * zoom);
          } else if (dt === 'lantern') {
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx - 2 * zoom, sy - 28 * zoom, 4 * zoom, 28 * zoom);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(sx, sy - 28 * zoom, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();

            const glowGrad = ctx.createRadialGradient(sx, sy - 28 * zoom, 2 * zoom, sx, sy - 28 * zoom, 28 * zoom);
            glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
            glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(sx, sy - 28 * zoom, 28 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ANIMALS
        if (tile.animal) {
          const an = tile.animal;
          drawSoftShadow(ctx, sx + an.offsetX * zoom, sy + an.offsetY * zoom, 12 * zoom, 6 * zoom);

          const squash = animalSquashRef.current[an.id] || 0;
          const sxScale = 1 + squash * 0.4;
          const syScale = 1 - squash * 0.3;
          const idleWiggle = Math.sin(now / 350 + tile.x) * 1.5 * zoom;

          ctx.save();
          ctx.translate(sx + an.offsetX * zoom, sy - 4 * zoom + an.offsetY * zoom);
          ctx.scale(sxScale, syScale);

          if (an.type === 'cow') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, -12 * zoom, 16 * zoom, 11 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(-4 * zoom, -14 * zoom, 6 * zoom, 5 * zoom, 0.3, 0, Math.PI * 2);
            ctx.ellipse(5 * zoom, -11 * zoom, 7 * zoom, 6 * zoom, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-14 * zoom, -18 * zoom + idleWiggle, 8 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.ellipse(-18 * zoom, -16 * zoom + idleWiggle, 5 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-14 * zoom, -20 * zoom + idleWiggle, 1.5 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-12 * zoom, -26 * zoom + idleWiggle, 2 * zoom, 4 * zoom);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-10 * zoom, -3 * zoom, 4 * zoom, 8 * zoom);
            ctx.fillRect(6 * zoom, -3 * zoom, 4 * zoom, 8 * zoom);
          } else if (an.type === 'sheep') {
            ctx.fillStyle = '#f8fafc';
            for (let puff = 0; puff < 6; puff++) {
              const px = Math.cos((puff * Math.PI) / 3) * 8 * zoom;
              const py = Math.sin((puff * Math.PI) / 3) * 7 * zoom - 12 * zoom;
              ctx.beginPath();
              ctx.arc(px, py, 7 * zoom, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.ellipse(-11 * zoom, -14 * zoom + idleWiggle, 6 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-12 * zoom, -15 * zoom + idleWiggle, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#334155';
            ctx.fillRect(-6 * zoom, -2 * zoom, 3 * zoom, 6 * zoom);
            ctx.fillRect(4 * zoom, -2 * zoom, 3 * zoom, 6 * zoom);
          } else if (an.type === 'chicken') {
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(0, -9 * zoom + idleWiggle, 9 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-6 * zoom, -17 * zoom + idleWiggle, 3 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(-11 * zoom, -11 * zoom + idleWiggle);
            ctx.lineTo(-7 * zoom, -13 * zoom + idleWiggle);
            ctx.lineTo(-7 * zoom, -9 * zoom + idleWiggle);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-6 * zoom, -13 * zoom + idleWiggle, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-2 * zoom, -2 * zoom, 2 * zoom, 4 * zoom);
          } else if (an.type === 'dog') {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(0, -10 * zoom, 12 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-10 * zoom, -14 * zoom + idleWiggle, 6 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.ellipse(-7 * zoom, -12 * zoom + idleWiggle, 3 * zoom, 6 * zoom, 0.4, 0, Math.PI * 2);
            ctx.fill();
            const tailWag = Math.sin(now / 150) * 0.4;
            ctx.save();
            ctx.translate(10 * zoom, -11 * zoom);
            ctx.rotate(tailWag);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, -2 * zoom, 8 * zoom, 4 * zoom);
            ctx.restore();
          } else if (an.type === 'carabao') {
            // Water Buffalo (Kalabaw)
            // Heavy charcoal/slate body
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.ellipse(0, -13 * zoom, 18 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mud splatter details on lower belly
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.ellipse(-4 * zoom, -5 * zoom, 8 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // White / cream chevron neck band (Signature Kalabaw marking!)
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 3 * zoom;
            ctx.beginPath();
            ctx.arc(-8 * zoom, -15 * zoom + idleWiggle, 8 * zoom, 0.4, 1.8);
            ctx.stroke();

            // Sturdy Head
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(-15 * zoom, -17 * zoom + idleWiggle, 9 * zoom, 8 * zoom, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // Snout with broad nostrils
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.ellipse(-20 * zoom, -16 * zoom + idleWiggle, 6 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-22 * zoom, -17 * zoom + idleWiggle, 1.5 * zoom, 0, Math.PI * 2);
            ctx.arc(-22 * zoom, -14 * zoom + idleWiggle, 1.5 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Friendly Eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-15 * zoom, -20 * zoom + idleWiggle, 1.8 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-15.5 * zoom, -20.5 * zoom + idleWiggle, 0.6 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Sweeping Curved Horns (Majestic backward crescent horns)
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3.5 * zoom;
            ctx.beginPath();
            ctx.moveTo(-13 * zoom, -22 * zoom + idleWiggle);
            ctx.quadraticCurveTo(-6 * zoom, -32 * zoom + idleWiggle, 4 * zoom, -26 * zoom + idleWiggle);
            ctx.stroke();

            // Wooden Yoke on back (for plowing!)
            ctx.fillStyle = '#b45309';
            ctx.fillRect(-6 * zoom, -20 * zoom, 12 * zoom, 3 * zoom);

            // Sturdy Legs & Hooves
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-12 * zoom, -3 * zoom, 5 * zoom, 9 * zoom);
            ctx.fillRect(8 * zoom, -3 * zoom, 5 * zoom, 9 * zoom);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-12 * zoom, 4 * zoom, 5 * zoom, 2 * zoom);
            ctx.fillRect(8 * zoom, 4 * zoom, 5 * zoom, 2 * zoom);
          } else if (an.type === 'ostrich') {
            // Ostrich (Giant Bird with fluffy body, tall neck, plumes)
            // Fluffy dark body
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(0, -14 * zoom, 13 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // White tail feathers/plumes
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(10 * zoom, -16 * zoom, 6 * zoom, 5 * zoom, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Long graceful neck extending upward
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 3.5 * zoom;
            ctx.beginPath();
            ctx.moveTo(-6 * zoom, -14 * zoom);
            ctx.quadraticCurveTo(-10 * zoom, -26 * zoom, -12 * zoom, -34 * zoom + idleWiggle);
            ctx.stroke();

            // Ostrich Head
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(-12 * zoom, -35 * zoom + idleWiggle, 5 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Yellow Beak
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(-17 * zoom, -35 * zoom + idleWiggle);
            ctx.lineTo(-12 * zoom, -37 * zoom + idleWiggle);
            ctx.lineTo(-12 * zoom, -33 * zoom + idleWiggle);
            ctx.closePath();
            ctx.fill();

            // Alert Eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-12 * zoom, -36 * zoom + idleWiggle, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Long Sturdy Legs
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2.5 * zoom;
            ctx.beginPath();
            ctx.moveTo(-4 * zoom, -5 * zoom);
            ctx.lineTo(-4 * zoom, 6 * zoom);
            ctx.moveTo(4 * zoom, -5 * zoom);
            ctx.lineTo(4 * zoom, 6 * zoom);
            ctx.stroke();
          } else if (an.type === 'rabbit') {
            // Fluffy Country Bunny (White/Cream with twitching pink ears)
            const earWiggle = Math.sin(now / 150 + tile.x) * 0.2;
            const hopOffset = Math.abs(Math.sin(now / 200 + tile.y)) * 2 * zoom;

            // Round fluffy body
            ctx.fillStyle = '#fdf4ff';
            ctx.beginPath();
            ctx.ellipse(0, -8 * zoom - hopOffset, 10 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Round Head
            ctx.beginPath();
            ctx.ellipse(-7 * zoom, -13 * zoom + idleWiggle - hopOffset, 6 * zoom, 5.5 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Fluffy white cotton tail
            ctx.beginPath();
            ctx.arc(9 * zoom, -8 * zoom - hopOffset, 3.5 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Long upright ears with pink interior
            ctx.fillStyle = '#fdf4ff';
            ctx.beginPath();
            ctx.ellipse(-9 * zoom, -21 * zoom + idleWiggle - hopOffset, 2.5 * zoom, 6.5 * zoom, -0.15 + earWiggle, 0, Math.PI * 2);
            ctx.ellipse(-5 * zoom, -21 * zoom + idleWiggle - hopOffset, 2.5 * zoom, 6.5 * zoom, 0.15 - earWiggle, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.ellipse(-9 * zoom, -21 * zoom + idleWiggle - hopOffset, 1.2 * zoom, 4.5 * zoom, -0.15 + earWiggle, 0, Math.PI * 2);
            ctx.ellipse(-5 * zoom, -21 * zoom + idleWiggle - hopOffset, 1.2 * zoom, 4.5 * zoom, 0.15 - earWiggle, 0, Math.PI * 2);
            ctx.fill();

            // Pink nose & eye
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(-11 * zoom, -13 * zoom + idleWiggle - hopOffset, 1 * zoom, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.arc(-8 * zoom, -15 * zoom + idleWiggle - hopOffset, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (an.produceReady) {
            const bubbleY = sy - 28 * zoom + Math.sin(now / 300) * 3;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(sx, bubbleY, 11 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2 * zoom;
            ctx.stroke();

            ctx.font = `${Math.floor(11 * zoom)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon =
              an.type === 'ostrich'
                ? '🪺'
                : an.type === 'rabbit'
                  ? '🐇'
                  : an.type === 'cow' || an.type === 'carabao'
                    ? '🥛'
                    : an.type === 'chicken'
                      ? '🥚'
                      : an.type === 'sheep'
                        ? '🧶'
                        : '💖';
            ctx.fillText(icon, sx, bubbleY);
          }
        }
      });

      // 4. Hover Cursor
      const currentGridSize = state.gridSize || GRID_SIZE;
      const hx = interactionRef.current.hoveredGridX;
      const hy = interactionRef.current.hoveredGridY;
      if (hx >= 0 && hx < currentGridSize && hy >= 0 && hy < currentGridSize) {
        const { sx, sy } = gridToScreen(hx, hy, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;

        let cursorColor = 'rgba(255, 255, 255, 0.4)';
        let strokeColor = '#ffffff';

        if (movingTileRef.current) {
          cursorColor = 'rgba(56, 189, 248, 0.45)';
          strokeColor = '#38bdf8';
        } else if (state.selectedTool === 'carabao_plow') {
          cursorColor = 'rgba(180, 83, 9, 0.45)';
          strokeColor = '#f59e0b';
        } else if (state.selectedTool === 'harvest') {
          cursorColor = 'rgba(250, 204, 21, 0.45)';
          strokeColor = '#facc15';
        } else if (state.selectedTool === 'water') {
          cursorColor = 'rgba(56, 189, 248, 0.45)';
          strokeColor = '#38bdf8';
        } else if (state.selectedTool === 'plant') {
          cursorColor = 'rgba(74, 222, 128, 0.45)';
          strokeColor = '#4ade80';
        }

        // Draw 3-tile furrow preview if carabao_plow is active
        if (state.selectedTool === 'carabao_plow') {
          [-1, 1].forEach((dx) => {
            const sideX = hx + dx;
            if (sideX >= 0 && sideX < GRID_SIZE) {
              const sidePos = gridToScreen(sideX, hy, width, height);
              ctx.beginPath();
              ctx.moveTo(sidePos.sx, sidePos.sy - th / 2);
              ctx.lineTo(sidePos.sx + tw / 2, sidePos.sy);
              ctx.lineTo(sidePos.sx, sidePos.sy + th / 2);
              ctx.lineTo(sidePos.sx - tw / 2, sidePos.sy);
              ctx.closePath();
              ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
              ctx.fill();
              ctx.strokeStyle = '#d97706';
              ctx.lineWidth = 1.5 * zoom;
              ctx.stroke();
            }
          });
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy - th / 2);
        ctx.lineTo(sx + tw / 2, sy);
        ctx.lineTo(sx + tw / 2, sy);
        ctx.lineTo(sx, sy + th / 2);
        ctx.lineTo(sx - tw / 2, sy);
        ctx.closePath();
        ctx.fillStyle = cursorColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        if (movingTileRef.current) {
          ctx.font = `bold ${Math.max(10, Math.round(11 * zoom))}px sans-serif`;
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText('📦 Tap to Place', sx, sy - th / 2 - 6);
        }
      }

      // Draw dashed outline on source tile being relocated
      if (movingTileRef.current) {
        const srcPos = gridToScreen(movingTileRef.current.x, movingTileRef.current.y, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(srcPos.sx, srcPos.sy - th / 2);
        ctx.lineTo(srcPos.sx + tw / 2, srcPos.sy);
        ctx.lineTo(srcPos.sx, srcPos.sy + th / 2);
        ctx.lineTo(srcPos.sx - tw / 2, srcPos.sy);
        ctx.closePath();
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([5 * zoom, 4 * zoom]);
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        ctx.font = `bold ${Math.max(10, Math.round(11 * zoom))}px sans-serif`;
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('Moving...', srcPos.sx, srcPos.sy - th / 2 - 6);
        ctx.restore();
      }

      // 5. Particles Update & Render
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'text') {
          ctx.font = `bold ${p.size || 14}px 'Outfit', sans-serif`;
          ctx.fillStyle = p.color || '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(p.text || '', p.x, p.y);
        } else if (p.type === 'heart') {
          ctx.font = `${p.size || 14}px sans-serif`;
          ctx.fillText('💖', p.x, p.y);
        } else if (p.type === 'sparkle') {
          ctx.fillStyle = p.color || '#fef08a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.size || 3) * (1 - p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'water') {
          ctx.fillStyle = p.color || '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          ctx.fillStyle = p.color || 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.size || 5) * (1 + p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'weather') {
          // Weather Rendering
          if (weather === 'rain' || weather === 'thunderstorm') {
            // Rain drop streaks
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 3, p.y + 12);
            ctx.stroke();
          } else if (weather === 'snow' || season === 'winter') {
            // Snow flake
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.size || 2.5), 0, Math.PI * 2);
            ctx.fill();
          } else if (weather === 'petal_breeze' || season === 'spring') {
            // Sakura Petals
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, (p.size || 4), (p.size || 4) * 0.5, p.life * 0.05, 0, Math.PI * 2);
            ctx.fill();
          } else if (weather === 'autumn_wind' || season === 'autumn') {
            // Autumn leaves
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, (p.size || 4), (p.size || 4) * 0.6, p.life * 0.08, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Sunny sunbeams & dust motes
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Screen wrapping
          if (p.x > width + 20) p.x = -10;
          if (p.y > height + 20) p.y = -10;
        }

        ctx.restore();
      });

      // Purge dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.type === 'weather' || p.life < p.maxLife);

      // 6. Ambient Lighting & Weather Overlays
      if (weather === 'thunderstorm') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(0, 0, width, height);
      } else if (weather === 'rain') {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.22)';
        ctx.fillRect(0, 0, width, height);
      }

      if (isNight) {
        // Deep Indigo Midnight wash
        ctx.fillStyle = 'rgba(10, 15, 30, 0.58)';
        ctx.fillRect(0, 0, width, height);

        // Luminous glowing warm lanterns and glowing windows
        sortedTiles.forEach((tile) => {
          if (
            tile.decor?.type === 'lantern' ||
            tile.structure?.type === 'farmhouse' ||
            tile.structure?.type === 'bahay_kubo' ||
            tile.structure?.type === 'cottage' ||
            tile.structure?.type === 'windmill'
          ) {
            const { sx, sy } = gridToScreen(tile.x, tile.y, width, height);
            const radius = tile.decor?.type === 'lantern' ? 44 * zoom : 68 * zoom;
            const glow = ctx.createRadialGradient(sx, sy - 16 * zoom, 2, sx, sy - 16 * zoom, radius);
            glow.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
            glow.addColorStop(0.45, 'rgba(251, 191, 36, 0.16)');
            glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sx, sy - 16 * zoom, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Fireflies / Alitaptap drifting across the farm at night!
        for (let f = 0; f < 10; f++) {
          const fx = width / 2 + Math.cos(now / 1100 + f * 1.3) * (width * 0.42);
          const fy = height / 2 + Math.sin(now / 850 + f * 1.9) * (height * 0.38);
          const fAlpha = 0.35 + Math.sin(now / 280 + f * 2) * 0.35;
          if (fAlpha > 0.05) {
            ctx.fillStyle = `rgba(217, 249, 157, ${fAlpha})`;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (timeOfDay === 'sunset') {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
        ctx.fillRect(0, 0, width, height);
      } else if (timeOfDay === 'morning') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.06)';
        ctx.fillRect(0, 0, width, height);
      }

      // Lightning screen flash
      if (lightningFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlashRef.current * 0.6})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gridToScreen, screenToGrid]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none bg-[#1e2e22]"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {movingTile && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-sky-950/90 text-sky-200 border border-sky-400/40 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-sm font-medium">
            Tap a tile to relocate {movingTile.structure ? movingTile.structure.type : movingTile.type}
          </span>
          <button
            onClick={onCancelMove}
            className="px-2.5 py-1 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
