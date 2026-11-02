import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FarmTile, GameState, ToolMode, CropType, AnimalType, Season, TimeOfDay } from '../../types/game';
import { CROPS, GRID_SIZE } from '../../constants/gameData';
import { sound } from '../../services/audio';

const TILE_WIDTH = 76;
const TILE_HEIGHT = 38;

interface FloatingParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'text' | 'heart' | 'sparkle' | 'water' | 'smoke' | 'weather';
  text?: string;
  color?: string;
  size?: number;
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

  // Weather particles initializer
  useEffect(() => {
    // Generate initial floating seasonal ambient particles
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        id: 'weather_' + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0.5 + Math.random() * 0.8,
        vy: 0.3 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.5,
        life: Math.random() * 200,
        maxLife: 300,
        type: 'weather',
        size: 3 + Math.random() * 4,
      });
    }
  }, []);

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

      // Ideal zoom based on viewport
      const isMobile = width < 600;
      const idealZoom = isMobile ? 0.95 : 1.15;
      cameraRef.current.zoom = idealZoom;
      cameraRef.current.targetZoom = idealZoom;

      // Center of farm
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
    if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return;

    // Moving mode active?
    if (movingTileRef.current) {
      onPlaceMovedTile(gx, gy);
      return;
    }

    const tile = state.tiles.find((t) => t.x === gx && t.y === gy);
    if (!tile) return;

    const currentTool = state.selectedTool;

    // Direct animal tap?
    if (tile.animal && (currentTool === 'inspect' || currentTool === 'harvest')) {
      animalSquashRef.current[tile.animal.id] = 1.0;
      sound.playAnimalPet(tile.animal.type);
      onAnimalPet(tile.animal.id, tile);

      // Particle hearts
      if (canvasRef.current) {
        const { sx, sy } = gridToScreen(gx, gy, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        spawnParticle(sx, sy - 24, 'heart', { color: '#ec4899', size: 16 });
        spawnParticle(sx + 10, sy - 34, 'heart', { color: '#f43f5e', size: 12 });
      }
      return;
    }

    // Direct structure tap?
    if (tile.structure && currentTool === 'inspect') {
      sound.playTap();
      onStructureClick(tile.structure.type, tile);
      return;
    }

    // Handle tool action on tile
    if (canvasRef.current) {
      const { sx, sy } = gridToScreen(gx, gy, canvasRef.current.clientWidth, canvasRef.current.clientHeight);

      if (currentTool === 'plow' && tile.type === 'grass') {
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

    // Check tile immediately for tap
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

      // If swipe tool is active and over a new tile, trigger action!
      if (isSwipeTool && !movingTileRef.current) {
        const tileKey = `${gx},${gy}`;
        if (tileKey !== interactionRef.current.lastSwipedTileKey) {
          interactionRef.current.lastSwipedTileKey = tileKey;
          executeActionOnTile(gx, gy);
        }
      } else {
        // Pan the camera
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
        // Clean tap/click
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
      // Pinch to zoom
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

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.65, Math.min(1.85, cameraRef.current.zoom * zoomFactor));
    cameraRef.current.targetZoom = newZoom;
  };

  // --- DRAWING PROCEDURAL HELPERS ---
  const drawIsometricDiamond = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke?: string,
    strokeWidth: number = 1
  ) => {
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  // 60FPS Simulation and Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // clamped dt
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

      // Soft decay for animal squash bounces
      Object.keys(animalSquashRef.current).forEach((id) => {
        if (animalSquashRef.current[id] > 0) {
          animalSquashRef.current[id] -= dt * 3;
          if (animalSquashRef.current[id] < 0) animalSquashRef.current[id] = 0;
        }
      });

      const state = gameStateRef.current;
      const season = state.season;
      const timeOfDay = state.timeOfDay;

      // Background grass horizon / pasture gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (season === 'winter') {
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

      // Sort tiles by gx + gy for correct isometric depth layering
      const sortedTiles = [...state.tiles].sort((a, b) => a.x + a.y - (b.x + b.y));

      // 1. Draw base tiles
      sortedTiles.forEach((tile) => {
        const { sx, sy } = gridToScreen(tile.x, tile.y, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;

        // Tile base colors
        let baseColor = '#5ba857';
        let strokeColor = 'rgba(0,0,0,0.06)';

        if (season === 'spring') {
          baseColor = (tile.x + tile.y) % 2 === 0 ? '#5ea853' : '#67b35c';
        } else if (season === 'summer') {
          baseColor = (tile.x + tile.y) % 2 === 0 ? '#72b842' : '#7cc24a';
        } else if (season === 'autumn') {
          baseColor = (tile.x + tile.y) % 2 === 0 ? '#a38446' : '#ad8f4e';
        } else if (season === 'winter') {
          baseColor = (tile.x + tile.y) % 2 === 0 ? '#d9e7ec' : '#e4eff4';
          strokeColor = 'rgba(255,255,255,0.2)';
        }

        if (tile.type === 'soil') {
          const isWatered = tile.crop?.watered;
          baseColor = isWatered ? '#52341e' : '#855938';
          strokeColor = isWatered ? '#3b2312' : '#6e4527';
        } else if (tile.type === 'stone_path') {
          baseColor = '#94a3b8';
          strokeColor = '#64748b';
        } else if (tile.type === 'wood_path') {
          baseColor = '#b45309';
          strokeColor = '#78350f';
        } else if (tile.type === 'flower_bed') {
          baseColor = '#4d7c0f';
        } else if (tile.type === 'water_pond') {
          baseColor = '#38bdf8';
          strokeColor = '#0284c7';
        }

        // Draw diamond
        drawIsometricDiamond(ctx, sx, sy, tw, th, baseColor, strokeColor, 1);

        // Soil texture furrows
        if (tile.type === 'soil') {
          ctx.strokeStyle = tile.crop?.watered ? 'rgba(40, 20, 10, 0.4)' : 'rgba(90, 50, 20, 0.3)';
          ctx.lineWidth = 1.5 * zoom;
          ctx.beginPath();
          ctx.moveTo(sx - tw * 0.25, sy - th * 0.1);
          ctx.lineTo(sx + tw * 0.1, sy + th * 0.25);
          ctx.moveTo(sx - tw * 0.1, sy - th * 0.25);
          ctx.lineTo(sx + tw * 0.25, sy + th * 0.1);
          ctx.stroke();
        }

        // Water pond ripples
        if (tile.type === 'water_pond') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          const ripplePhase = (now / 1000 + tile.x) % 2;
          ctx.beginPath();
          ctx.ellipse(sx, sy, tw * 0.25 * ripplePhase, th * 0.25 * ripplePhase, 0, 0, Math.PI * 2);
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

      // 2. Draw objects, structures, crops, animals on tiles
      sortedTiles.forEach((tile) => {
        const { sx, sy } = gridToScreen(tile.x, tile.y, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;

        // FENCE
        if (tile.type === 'fence') {
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

          if (prog < 0.35) {
            // Stage 1: Delicate green seedling sprout
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
            // Stage 2: Mid-growth leafy plant
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
            // Stage 3: Full Ripe Harvest Ready
            // Ripe bounce
            const ripeBounce = Math.sin(now / 250 + tile.x) * 3 * zoom;

            // Stalk / Foliage
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(sx + sway, sy - 12 * zoom, 10 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Fruit / Grain Head
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
              // Seeds dots
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
              // Stem
              ctx.fillStyle = '#65a30d';
              ctx.fillRect(sx - 2 * zoom, sy - 26 * zoom + ripeBounce, 4 * zoom, 7 * zoom);
            } else if (tile.crop.type === 'sunflower') {
              // Big yellow petals
              ctx.fillStyle = '#eab308';
              ctx.beginPath();
              ctx.arc(sx + sway, sy - 26 * zoom + ripeBounce, 11 * zoom, 0, Math.PI * 2);
              ctx.fill();
              // Brown seed center
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(sx + sway, sy - 26 * zoom + ripeBounce, 6 * zoom, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Carrot or default
              ctx.beginPath();
              ctx.ellipse(sx, sy - 16 * zoom + ripeBounce, 7 * zoom, 9 * zoom, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Harvest Sickle Prompt badge floating over ripe crop
            if (isReady) {
              const badgeY = sy - 36 * zoom + Math.sin(now / 300) * 3;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.beginPath();
              ctx.arc(sx, badgeY, 11 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 2 * zoom;
              ctx.stroke();

              // Icon inside badge
              ctx.font = `${Math.floor(12 * zoom)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('✨', sx, badgeY);
            }
          }
        }

        // STRUCTURES
        if (tile.structure) {
          const st = tile.structure.type;

          if (st === 'farmhouse') {
            const hColor = tile.structure.colorTheme || state.houseColor || '#b91c1c';
            // House base block
            ctx.fillStyle = hColor;
            ctx.beginPath();
            ctx.moveTo(sx, sy - 50 * zoom);
            ctx.lineTo(sx + 34 * zoom, sy - 32 * zoom);
            ctx.lineTo(sx + 34 * zoom, sy - 6 * zoom);
            ctx.lineTo(sx, sy + 12 * zoom);
            ctx.lineTo(sx - 34 * zoom, sy - 6 * zoom);
            ctx.lineTo(sx - 34 * zoom, sy - 32 * zoom);
            ctx.closePath();
            ctx.fill();

            // Roof
            ctx.fillStyle = '#450a0a';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 68 * zoom);
            ctx.lineTo(sx + 38 * zoom, sy - 46 * zoom);
            ctx.lineTo(sx, sy - 30 * zoom);
            ctx.lineTo(sx - 38 * zoom, sy - 46 * zoom);
            ctx.closePath();
            ctx.fill();

            // Door
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx - 6 * zoom, sy - 12 * zoom, 12 * zoom, 18 * zoom);

            // Windows
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(sx - 24 * zoom, sy - 24 * zoom, 10 * zoom, 10 * zoom);
            ctx.fillRect(sx + 14 * zoom, sy - 24 * zoom, 10 * zoom, 10 * zoom);

            // Chimney with cozy rising smoke
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx + 16 * zoom, sy - 74 * zoom, 8 * zoom, 18 * zoom);

            // Smoke particles puff
            if (Math.random() < 0.1) {
              spawnParticle(sx + 20 * zoom, sy - 76 * zoom, 'smoke', {
                size: 4 + Math.random() * 4,
                color: 'rgba(240, 240, 240, 0.45)',
                maxLife: 60,
              });
            }
          } else if (st === 'barn') {
            // Classic Red Barn
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(sx - 28 * zoom, sy - 44 * zoom, 56 * zoom, 44 * zoom);

            // Gambrel Barn Roof
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.moveTo(sx, sy - 64 * zoom);
            ctx.lineTo(sx + 32 * zoom, sy - 44 * zoom);
            ctx.lineTo(sx - 32 * zoom, sy - 44 * zoom);
            ctx.closePath();
            ctx.fill();

            // Barn Door with X
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

            // Hayloft window
            ctx.fillStyle = '#eab308';
            ctx.fillRect(sx - 7 * zoom, sy - 40 * zoom, 14 * zoom, 12 * zoom);
          } else if (st === 'windmill') {
            // Windmill tower
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

            // Dome cap
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(sx, sy - 54 * zoom, 12 * zoom, Math.PI, 0);
            ctx.fill();

            // Rotating 4 sails
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
            // Stone Well
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.ellipse(sx, sy - 6 * zoom, 16 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(sx, sy - 8 * zoom, 12 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wooden Roof on posts
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
            // Wooden Langstroth hive boxes
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(sx - 12 * zoom, sy - 24 * zoom, 24 * zoom, 10 * zoom);
            ctx.fillStyle = '#d97706';
            ctx.fillRect(sx - 14 * zoom, sy - 14 * zoom, 28 * zoom, 12 * zoom);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(sx - 16 * zoom, sy - 28 * zoom, 32 * zoom, 5 * zoom);

            // Flying tiny bees
            for (let b = 0; b < 3; b++) {
              const bx = sx + Math.cos(now / 300 + b * 2) * 16 * zoom;
              const by = sy - 22 * zoom + Math.sin(now / 200 + b * 2) * 8 * zoom;
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(bx, by, 2.5 * zoom, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(bx - 1, by - 1, 1, 2);
            }
          } else if (st === 'coop') {
            // Chicken Coop
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
          }
        }

        // DECOR & TREES
        if (tile.decor) {
          const dt = tile.decor.type;
          if (dt === 'apple_tree' || dt === 'cherry_tree' || dt === 'pine_tree') {
            // Tree trunk
            ctx.fillStyle = '#78350f';
            ctx.fillRect(sx - 5 * zoom, sy - 18 * zoom, 10 * zoom, 18 * zoom);

            // Foliage
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
              // Red apples
              ctx.fillStyle = '#ef4444';
              [[-8, -32], [6, -38], [-4, -44], [10, -28]].forEach(([ax, ay]) => {
                ctx.beginPath();
                ctx.arc(sx + ax * zoom, sy + ay * zoom, 3.5 * zoom, 0, Math.PI * 2);
                ctx.fill();
              });
            } else {
              // Pine tree
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
            // Hat
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(sx, sy - 26 * zoom, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();
          } else if (dt === 'lantern') {
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx - 2 * zoom, sy - 28 * zoom, 4 * zoom, 28 * zoom);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(sx, sy - 28 * zoom, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();

            // Glow aura
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
          const squash = animalSquashRef.current[an.id] || 0;
          const sxScale = 1 + squash * 0.4;
          const syScale = 1 - squash * 0.3;
          const idleWiggle = Math.sin(now / 350 + tile.x) * 1.5 * zoom;

          ctx.save();
          ctx.translate(sx + an.offsetX * zoom, sy - 4 * zoom + an.offsetY * zoom);
          ctx.scale(sxScale, syScale);

          if (an.type === 'cow') {
            // Jersey Dairy Cow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, -12 * zoom, 16 * zoom, 11 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Black patches
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.ellipse(-4 * zoom, -14 * zoom, 6 * zoom, 5 * zoom, 0.3, 0, Math.PI * 2);
            ctx.ellipse(5 * zoom, -11 * zoom, 7 * zoom, 6 * zoom, -0.2, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-14 * zoom, -18 * zoom + idleWiggle, 8 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pink snout
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.ellipse(-18 * zoom, -16 * zoom + idleWiggle, 5 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cute eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-14 * zoom, -20 * zoom + idleWiggle, 1.5 * zoom, 0, Math.PI * 2);
            ctx.fill();
            // Horns
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-12 * zoom, -26 * zoom + idleWiggle, 2 * zoom, 4 * zoom);
            // Legs
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-10 * zoom, -3 * zoom, 4 * zoom, 8 * zoom);
            ctx.fillRect(6 * zoom, -3 * zoom, 4 * zoom, 8 * zoom);
          } else if (an.type === 'sheep') {
            // Fluffy Merino Sheep
            ctx.fillStyle = '#f8fafc';
            for (let puff = 0; puff < 6; puff++) {
              const px = Math.cos((puff * Math.PI) / 3) * 8 * zoom;
              const py = Math.sin((puff * Math.PI) / 3) * 7 * zoom - 12 * zoom;
              ctx.beginPath();
              ctx.arc(px, py, 7 * zoom, 0, Math.PI * 2);
              ctx.fill();
            }
            // Head
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.ellipse(-11 * zoom, -14 * zoom + idleWiggle, 6 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-12 * zoom, -15 * zoom + idleWiggle, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
            // Legs
            ctx.fillStyle = '#334155';
            ctx.fillRect(-6 * zoom, -2 * zoom, 3 * zoom, 6 * zoom);
            ctx.fillRect(4 * zoom, -2 * zoom, 3 * zoom, 6 * zoom);
          } else if (an.type === 'chicken') {
            // White clucking hen
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(0, -9 * zoom + idleWiggle, 9 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Red comb
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-6 * zoom, -17 * zoom + idleWiggle, 3 * zoom, 0, Math.PI * 2);
            ctx.fill();
            // Yellow beak
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(-11 * zoom, -11 * zoom + idleWiggle);
            ctx.lineTo(-7 * zoom, -13 * zoom + idleWiggle);
            ctx.lineTo(-7 * zoom, -9 * zoom + idleWiggle);
            ctx.closePath();
            ctx.fill();
            // Eye
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-6 * zoom, -13 * zoom + idleWiggle, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
            // Legs
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-2 * zoom, -2 * zoom, 2 * zoom, 4 * zoom);
          } else if (an.type === 'dog') {
            // Golden Retriever
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(0, -10 * zoom, 12 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.ellipse(-10 * zoom, -14 * zoom + idleWiggle, 6 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            // Floppy ear
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.ellipse(-7 * zoom, -12 * zoom + idleWiggle, 3 * zoom, 6 * zoom, 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Wagging tail
            const tailWag = Math.sin(now / 150) * 0.4;
            ctx.save();
            ctx.translate(10 * zoom, -11 * zoom);
            ctx.rotate(tailWag);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, -2 * zoom, 8 * zoom, 4 * zoom);
            ctx.restore();
          }
          ctx.restore();

          // Produce bubble indicator if ready
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
            const icon = an.type === 'cow' ? '🥛' : an.type === 'chicken' ? '🥚' : an.type === 'sheep' ? '🧶' : '💖';
            ctx.fillText(icon, sx, bubbleY);
          }
        }
      });

      // 3. Hover / Touch cursor diamond
      const hx = interactionRef.current.hoveredGridX;
      const hy = interactionRef.current.hoveredGridY;
      if (hx >= 0 && hx < GRID_SIZE && hy >= 0 && hy < GRID_SIZE) {
        const { sx, sy } = gridToScreen(hx, hy, width, height);
        const tw = TILE_WIDTH * zoom;
        const th = TILE_HEIGHT * zoom;

        let cursorColor = 'rgba(255, 255, 255, 0.45)';
        let strokeColor = '#ffffff';

        if (movingTileRef.current) {
          cursorColor = 'rgba(56, 189, 248, 0.45)';
          strokeColor = '#38bdf8';
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

        drawIsometricDiamond(ctx, sx, sy, tw, th, cursorColor, strokeColor, 2 * zoom);
      }

      // 4. Update and draw particles
      particlesRef.current.forEach((p, idx) => {
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
          // Floating seasonal ambient weather
          if (season === 'spring') {
            // Cherry blossom petal
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, (p.size || 4), (p.size || 4) * 0.5, p.life * 0.05, 0, Math.PI * 2);
            ctx.fill();
          } else if (season === 'autumn') {
            // Golden leaf
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, (p.size || 4), (p.size || 4) * 0.6, p.life * 0.08, 0, Math.PI * 2);
            ctx.fill();
          } else if (season === 'winter') {
            // Snow flake
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, (p.size || 2.5), 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Summer golden sun sparkle
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Wrap weather particles around screen
          if (p.x > width) p.x = -10;
          if (p.y > height) p.y = -10;
        }

        ctx.restore();
      });

      // Purge dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.type === 'weather' || p.life < p.maxLife);

      // 5. Ambient lighting overlay (Time of Day & Season)
      if (timeOfDay === 'sunset') {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.12)';
        ctx.fillRect(0, 0, width, height);
      } else if (timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(0, 0, width, height);
      } else if (timeOfDay === 'morning') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.06)';
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

      {/* Moving Mode Banner if active */}
      {movingTile && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-sky-950/90 text-sky-200 border border-sky-400/40 rounded-xl shadow-lg backdrop-blur-md">
          <span className="text-sm font-medium">
            Tap a tile to relocate {movingTile.structure ? movingTile.structure.type : movingTile.type}
          </span>
          <button
            onClick={onCancelMove}
            className="px-2.5 py-1 text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
