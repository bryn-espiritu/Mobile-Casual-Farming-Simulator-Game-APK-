import React, { useState } from 'react';
import { GameState, PlacedFurniture } from '../../types/game';
import {
  FURNITURE_CATALOG,
  HOUSE_LEVELS,
  HOUSE_PAINTINGS,
  WALL_STYLES,
  FLOOR_STYLES,
  FURNITURE_SWATCHES,
} from '../../constants/gameData';
import { sound } from '../../services/audio';
import { Homestead3DView } from './Homestead3DView';

interface HouseCustomizerModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpgradeHouseLevel: (nextLevel: number, coinCost: number, gemCost: number) => void;
  onUpdateColors: (exteriorColor: string, roofColor: string) => void;
  onPlaceFurniture: (
    furnitureId: string,
    name: string,
    category: string,
    icon: string,
    x: number,
    y: number,
    cost: number,
    rotation?: number,
    color?: string,
    swatchName?: string
  ) => void;
  onMoveFurniture: (placedId: string, newX: number, newY: number) => void;
  onRotateFurniture: (placedId: string) => void;
  onCustomizeFurnitureSwatch: (placedId: string, color: string, swatchName: string) => void;
  onRemoveFurniture: (placedId: string) => void;
  onChangeHousePainting: (paintingId: string, cost: number) => void;
  onUpdateWallAndFloor: (wallStyle: string, flooring: string) => void;
}

export const HouseCustomizerModal: React.FC<HouseCustomizerModalProps> = ({
  gameState,
  onClose,
  onUpgradeHouseLevel,
  onUpdateColors,
  onPlaceFurniture,
  onMoveFurniture,
  onRotateFurniture,
  onCustomizeFurnitureSwatch,
  onRemoveFurniture,
  onChangeHousePainting,
  onUpdateWallAndFloor,
}) => {
  const [activeTab, setActiveTab] = useState<'sims_studio' | 'paintings' | 'wall_flooring' | 'architecture'>('sims_studio');
  const [view3D, setView3D] = useState(true);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<typeof FURNITURE_CATALOG[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'seating' | 'tables' | 'bedroom' | 'hearth' | 'rugs' | 'plants'>('all');
  const [showSwatchPicker, setShowSwatchPicker] = useState(false);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  const house = gameState.house || {
    level: 1,
    exteriorColor: '#b91c1c',
    roofColor: '#450a0a',
    wallStyle: 'cream_plaster',
    wallPainting: 'amorsolo_rice',
    flooring: 'hardwood_oak',
    placedFurniture: [],
  };

  const currentLevelInfo = HOUSE_LEVELS.find((l) => l.level === house.level) || HOUSE_LEVELS[0];
  const nextLevelInfo = HOUSE_LEVELS.find((l) => l.level === house.level + 1);

  // Dynamic Room Grid Size based on House Level
  // Level 1: 6x6, Level 2: 7x7, Level 3: 8x8
  const ROOM_SIZE = Math.min(8, 5 + (house.level || 1));

  // Find currently active painting
  const activePainting =
    HOUSE_PAINTINGS.find((p) => p.id === (house.wallPainting || 'amorsolo_rice')) ||
    HOUSE_PAINTINGS[0];

  // Find currently selected placed piece
  const selectedFurniture = house.placedFurniture.find((f) => f.id === selectedPlacedId) || null;

  // Exterior Paint Swatches
  const exteriorSwatches = [
    { name: 'Heritage Barn Red', hex: '#b91c1c' },
    { name: 'Sage Forest Green', hex: '#15803d' },
    { name: 'Cotswold Warm Honey', hex: '#d97706' },
    { name: 'Coastal Navy', hex: '#1e3a8a' },
    { name: 'Lilac Plum', hex: '#7e22ce' },
    { name: 'Alpine Slate', hex: '#334155' },
  ];

  const roofSwatches = [
    { name: 'Dark Cedar', hex: '#450a0a' },
    { name: 'Charcoal Shingle', hex: '#1e293b' },
    { name: 'Verdigris Copper', hex: '#0f766e' },
    { name: 'Weathered Oak', hex: '#78350f' },
  ];

  // Comfort score calculation
  const totalComfort =
    house.placedFurniture.reduce((acc, f) => {
      const item = FURNITURE_CATALOG.find((cat) => cat.id === f.furnitureId);
      return acc + (item?.comfortBonus || 10);
    }, 0) + (activePainting?.comfortBonus || 25);

  // Filter catalog items
  const filteredCatalog = FURNITURE_CATALOG.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  // Handle floor tile clicks in Sims 4 fashion
  const handleFloorTileClick = (x: number, y: number) => {
    // 1. If in Move Mode: relocate selected furniture piece here
    if (isMoveMode && selectedFurniture) {
      const isOccupied = house.placedFurniture.some((f) => f.id !== selectedFurniture.id && f.x === x && f.y === y);
      if (isOccupied) {
        sound.playTap();
        return;
      }
      onMoveFurniture(selectedFurniture.id, x, y);
      setIsMoveMode(false);
      return;
    }

    // 2. If placing newly selected catalog item
    if (selectedCatalogItem) {
      if (gameState.coins < selectedCatalogItem.cost) {
        sound.playTap();
        return;
      }
      const existing = house.placedFurniture.find((f) => f.x === x && f.y === y);
      if (existing) {
        onRemoveFurniture(existing.id);
      }
      sound.playHammer();
      onPlaceFurniture(
        selectedCatalogItem.id,
        selectedCatalogItem.name,
        selectedCatalogItem.category,
        selectedCatalogItem.icon,
        x,
        y,
        selectedCatalogItem.cost,
        0,
        '#d97706',
        'Golden Teak'
      );
      setSelectedCatalogItem(null);
      return;
    }

    // 3. Normal selection mode: click placed piece to select it
    const targetItem = house.placedFurniture.find((f) => f.x === x && f.y === y);
    if (targetItem) {
      sound.playTap();
      if (selectedPlacedId === targetItem.id) {
        // Already selected - toggle swatch or deselect
        setSelectedPlacedId(targetItem.id);
      } else {
        setSelectedPlacedId(targetItem.id);
        setIsMoveMode(false);
        setShowSwatchPicker(false);
      }
    } else {
      // Clicked empty floor - deselect
      setSelectedPlacedId(null);
      setIsMoveMode(false);
      setShowSwatchPicker(false);
    }
  };

  // Rotation text helper
  const getRotationLabel = (rot?: number) => {
    const r = (rot || 0) % 360;
    if (r === 0) return 'Facing South (0°)';
    if (r === 90) return 'Facing West (90°)';
    if (r === 180) return 'Facing North (180°)';
    return 'Facing East (270°)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">🏡</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">Naga Homestead Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Sims 4 Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentLevelInfo.name} · {ROOM_SIZE}×{ROOM_SIZE} Room · Comfort: <span className="text-amber-300 font-bold">{totalComfort} 💖</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
              <span>🪙</span>
              <span>{gameState.coins}</span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-2 border-b border-slate-800 bg-slate-950/50 overflow-x-auto scrollbar-none">
          {[
            { id: 'sims_studio', label: 'Room Studio (Sims Placer)', icon: '🛋️' },
            { id: 'paintings', label: 'Homestead Paintings', icon: '🖼️' },
            { id: 'wall_flooring', label: 'Wallpapers & Floors', icon: '🎨' },
            { id: 'architecture', label: 'Exterior Renovation', icon: '🏡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/60 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: SIMS 4 STYLE ROOM STUDIO */}
          {activeTab === 'sims_studio' && (
            <div className="flex flex-col items-center space-y-3">
              {/* Context Action Banner / Instructions */}
              <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-base">✨</span>
                  <span>
                    {isMoveMode && selectedFurniture
                      ? `Select a green floor tile to place ${selectedFurniture.name}!`
                      : selectedCatalogItem
                      ? `Click any floor tile to place ${selectedCatalogItem.name} (🪙 ${selectedCatalogItem.cost})`
                      : selectedFurniture
                      ? `Selected: ${selectedFurniture.name} · Use Sims tools below to Rotate, Move, or Recolor`
                      : 'Tap any furniture to Move, Rotate, or Recolor. Choose items below to furnish!'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle: 3D Orbit vs 2D Blueprint */}
                  <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-700">
                    <button
                      onClick={() => {
                        sound.playTap();
                        setView3D(true);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        view3D ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎮 3D View
                    </button>
                    <button
                      onClick={() => {
                        sound.playTap();
                        setView3D(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        !view3D ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📐 2D Grid
                    </button>
                  </div>

                  {isMoveMode && (
                    <button
                      onClick={() => setIsMoveMode(false)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px] hover:bg-rose-500/30 transition-all cursor-pointer"
                    >
                      Cancel Move
                    </button>
                  )}
                </div>
              </div>

              {/* VIEWPORT: 3D THREE.JS CANVAS OR 2D BLUEPRINT */}
              {view3D ? (
                <Homestead3DView
                  roomSize={ROOM_SIZE}
                  wallStyle={house.wallStyle || 'cream_plaster'}
                  wallPaintingId={house.wallPainting || 'amorsolo_rice'}
                  flooring={house.flooring || 'hardwood_oak'}
                  placedFurniture={house.placedFurniture}
                  selectedFurnitureId={selectedPlacedId}
                  isMoveMode={isMoveMode}
                  onSelectFurniture={(id) => {
                    setSelectedPlacedId(id);
                    if (!id) setIsMoveMode(false);
                  }}
                  onTileClick={(x, y) => handleFloorTileClick(x, y)}
                  onRotateFurniture={(id) => onRotateFurniture(id)}
                  onOpenPaintingsTab={() => setActiveTab('paintings')}
                />
              ) : (
                /* SIMS 4 2.5D ROOM VIEWPORT CONTAINER */
                <div className="w-full relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl p-2 sm:p-4 flex flex-col items-center">
                  {/* 1. BACK WALL WITH HUNG PAINTING & WALLPAPER */}
                  <div
                    className="w-full h-32 sm:h-36 rounded-2xl relative border-b-4 border-slate-950/90 shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300"
                    style={{
                      backgroundColor:
                        house.wallStyle === 'cream_plaster'
                          ? '#fef3c7'
                          : house.wallStyle === 'capiz_lattice'
                          ? '#f1f5f9'
                          : house.wallStyle === 'sawali_bamboo'
                          ? '#b45309'
                          : house.wallStyle === 'vintage_rose'
                          ? '#fce7f3'
                          : house.wallStyle === 'emerald_damask'
                          ? '#064e3b'
                          : house.wallStyle === 'terracotta_adobe'
                          ? '#9a3412'
                          : '#0f172a',
                    }}
                  >
                  {/* Subtle Wallpaper pattern overlay */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Left Cottage Window with view */}
                  <div className="absolute left-4 top-4 w-14 sm:w-16 h-20 rounded-t-full border-2 border-amber-950/70 bg-sky-400 shadow-inner overflow-hidden flex flex-col">
                    <div className="w-full h-full bg-gradient-to-b from-sky-300 via-sky-400 to-emerald-400 relative">
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-200/90 blur-[1px]" />
                      <div className="absolute bottom-0 inset-x-0 h-4 bg-emerald-600 rounded-t-md" />
                      {/* Window panes */}
                      <div className="absolute inset-0 border-r border-amber-950/50 left-1/2 -translate-x-1/2" />
                      <div className="absolute inset-0 border-b border-amber-950/50 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* CENTERPIECE: THE HOMESTEAD PAINTING */}
                  <div
                    onClick={() => {
                      sound.playTap();
                      setActiveTab('paintings');
                    }}
                    title="Click to change painting"
                    className="relative group cursor-pointer transform hover:scale-105 transition-all duration-200"
                  >
                    {/* Brass Picture Lamp overhead */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-full shadow-md border border-amber-600 z-10">
                      <div className="w-full h-6 bg-yellow-200/25 blur-sm -mt-0.5 rounded-full pointer-events-none" />
                    </div>

                    {/* Frame container */}
                    <div
                      className={`p-1.5 sm:p-2 rounded-xl shadow-2xl border-4 ${
                        activePainting.frameStyle === 'gold_baroque'
                          ? 'bg-amber-100 border-amber-500 shadow-amber-900/50 ring-2 ring-yellow-300'
                          : activePainting.frameStyle === 'carved_narra'
                          ? 'bg-amber-950 border-amber-900 shadow-black ring-1 ring-amber-700'
                          : activePainting.frameStyle === 'rustic_teak'
                          ? 'bg-amber-800 border-amber-700 shadow-black'
                          : 'bg-slate-300 border-amber-400 shadow-slate-900'
                      }`}
                    >
                      {/* Canvas Artwork */}
                      <div
                        className={`w-32 sm:w-44 h-20 sm:h-24 rounded-lg bg-gradient-to-br ${activePainting.previewGradient} flex flex-col items-center justify-center p-1.5 text-center relative overflow-hidden shadow-inner`}
                      >
                        <span className="text-2xl sm:text-3xl drop-shadow-md select-none">{activePainting.icon}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md line-clamp-1 mt-0.5 font-display">
                          {activePainting.title}
                        </span>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs py-0.5 text-[8px] text-amber-200 font-mono tracking-tight">
                          🖼️ Tap to Change Painting
                        </div>
                      </div>
                    </div>

                    {/* Artist Plaque */}
                    <div className="mt-1 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/40 text-center">
                      <span className="text-[9px] text-amber-300 font-bold block">{activePainting.artist}</span>
                    </div>
                  </div>

                  {/* Right Wall Sconce Lamp */}
                  <div className="absolute right-6 top-6 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-300 shadow-lg shadow-amber-300/80 animate-pulse" />
                    <div className="w-1.5 h-6 bg-amber-800 rounded-sm -mt-0.5" />
                  </div>
                </div>

                {/* 2. ISOMETRIC ROOM FLOOR GRID */}
                <div
                  className="w-full flex items-center justify-center py-4 sm:py-6 overflow-x-auto select-none"
                  style={{
                    perspective: '900px',
                  }}
                >
                  <div
                    className="relative transition-all duration-300 rounded-2xl p-2 shadow-2xl border-2 border-amber-950/50"
                    style={{
                      transform: 'rotateX(26deg)',
                      transformStyle: 'preserve-3d',
                      backgroundColor:
                        house.flooring === 'hardwood_oak'
                          ? '#78350f'
                          : house.flooring === 'bamboo_parquet'
                          ? '#b45309'
                          : house.flooring === 'capiz_terrazzo'
                          ? '#cbd5e1'
                          : house.flooring === 'terracotta_tiles'
                          ? '#c2410c'
                          : house.flooring === 'checkered_bistro'
                          ? '#1e293b'
                          : '#a16207',
                    }}
                  >
                    {/* Floor tile grid */}
                    <div
                      className="grid gap-1 sm:gap-1.5"
                      style={{
                        gridTemplateColumns: `repeat(${ROOM_SIZE}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: ROOM_SIZE * ROOM_SIZE }).map((_, idx) => {
                        const x = idx % ROOM_SIZE;
                        const y = Math.floor(idx / ROOM_SIZE);

                        const placedItem = house.placedFurniture.find((f) => f.x === x && f.y === y);
                        const isSelected = selectedFurniture && selectedFurniture.id === placedItem?.id;
                        const isHovered = hoverTile?.x === x && hoverTile?.y === y;

                        // Validity styling for move & place modes
                        let cellBg = 'bg-black/20 hover:bg-black/35';
                        let borderStyle = 'border-white/10';

                        if (isMoveMode) {
                          if (placedItem) {
                            cellBg = placedItem.id === selectedFurniture?.id ? 'bg-amber-500/30' : 'bg-rose-500/30';
                            borderStyle = placedItem.id === selectedFurniture?.id ? 'border-amber-400' : 'border-rose-400';
                          } else {
                            cellBg = isHovered ? 'bg-emerald-500/50 animate-pulse' : 'bg-emerald-500/20';
                            borderStyle = 'border-emerald-400';
                          }
                        } else if (selectedCatalogItem) {
                          if (placedItem) {
                            cellBg = 'bg-amber-500/30';
                            borderStyle = 'border-amber-400';
                          } else {
                            cellBg = isHovered ? 'bg-teal-500/50 animate-pulse' : 'bg-teal-500/20';
                            borderStyle = 'border-teal-400';
                          }
                        } else if (isSelected) {
                          cellBg = 'bg-amber-400/30 ring-2 ring-amber-300';
                          borderStyle = 'border-amber-300';
                        }

                        return (
                          <div
                            key={`tile_${x}_${y}`}
                            onClick={() => handleFloorTileClick(x, y)}
                            onMouseEnter={() => setHoverTile({ x, y })}
                            onMouseLeave={() => setHoverTile(null)}
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition-all duration-150 ${cellBg} ${borderStyle}`}
                          >
                            {/* Placed Furniture Item */}
                            {placedItem && (
                              <div
                                className="relative flex flex-col items-center justify-center transition-transform duration-200"
                                style={{
                                  transform: `rotate(${placedItem.rotation || 0}deg)`,
                                }}
                              >
                                {/* Sims Plumbob above selected furniture */}
                                {isSelected && (
                                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                    <div className="w-2.5 h-3.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/90 animate-bounce" />
                                  </div>
                                )}

                                {/* Furniture Icon & Swatch Accent */}
                                <span className="text-xl sm:text-2xl drop-shadow-md select-none transform transition-transform group-hover:scale-110">
                                  {placedItem.icon}
                                </span>

                                {/* Direction Pointer Pin */}
                                <div
                                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm"
                                  title={getRotationLabel(placedItem.rotation)}
                                />
                              </div>
                            )}

                            {/* Ghost Preview when placing new item */}
                            {selectedCatalogItem && !placedItem && isHovered && (
                              <div className="opacity-60 scale-90 pointer-events-none animate-pulse">
                                <span className="text-2xl">{selectedCatalogItem.icon}</span>
                              </div>
                            )}

                            {/* Coordinate tag */}
                            <span className="absolute top-0.5 left-1 text-[8px] font-mono text-white/30 pointer-events-none">
                              {x},{y}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* 3. SIMS 4 INTERACTIVE ACTION FLOATER (Visible when an item is selected) */}
                {selectedFurniture && (
                  <div className="w-full mt-2 p-3 bg-slate-950/90 rounded-2xl border border-amber-400/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl border shadow-inner"
                        style={{
                          backgroundColor: selectedFurniture.color || '#d97706',
                          borderColor: '#f59e0b',
                        }}
                      >
                        {selectedFurniture.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs sm:text-sm">{selectedFurniture.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                            {selectedFurniture.rotation || 0}°
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Swatch: <span className="text-amber-200 font-semibold">{selectedFurniture.swatchName || 'Golden Teak'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Sims Control Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {/* Rotate 90 Degrees */}
                      <button
                        onClick={() => onRotateFurniture(selectedFurniture.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer active:scale-95"
                      >
                        <span>🔄</span>
                        <span>Rotate 90°</span>
                      </button>

                      {/* Move to another cell */}
                      <button
                        onClick={() => {
                          sound.playTap();
                          setIsMoveMode(!isMoveMode);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                          isMoveMode
                            ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        <span>✥</span>
                        <span>{isMoveMode ? 'Moving...' : 'Move'}</span>
                      </button>

                      {/* Recolor Swatch Picker Toggle */}
                      <button
                        onClick={() => {
                          sound.playTap();
                          setShowSwatchPicker(!showSwatchPicker);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer active:scale-95"
                      >
                        <span>🎨</span>
                        <span>Swatch</span>
                      </button>

                      {/* Remove to storage */}
                      <button
                        onClick={() => {
                          onRemoveFurniture(selectedFurniture.id);
                          setSelectedPlacedId(null);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <span>🗑️</span>
                        <span>Remove</span>
                      </button>

                      {/* Deselect */}
                      <button
                        onClick={() => {
                          setSelectedPlacedId(null);
                          setIsMoveMode(false);
                          setShowSwatchPicker(false);
                        }}
                        className="px-2 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* SWATCH COLOR PICKER TRAY */}
                {showSwatchPicker && selectedFurniture && (
                  <div className="w-full mt-2 p-3 bg-slate-950/95 rounded-2xl border border-amber-500/30 shadow-2xl animate-in fade-in duration-150">
                    <span className="text-[11px] font-bold text-slate-300 block mb-2">
                      Choose Material & Wood Finish for {selectedFurniture.name}:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FURNITURE_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.id}
                          onClick={() => {
                            onCustomizeFurnitureSwatch(selectedFurniture.id, swatch.hex, swatch.name);
                            setShowSwatchPicker(false);
                          }}
                          className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-800 hover:border-amber-400 bg-slate-900/80 hover:bg-slate-800 transition-all cursor-pointer text-left"
                        >
                          <div
                            className="w-5 h-5 rounded-lg border border-white/20 shadow-inner shrink-0"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="text-xs text-slate-200 font-medium truncate">{swatch.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* 4. BOTTOM SIMS 4 FURNITURE BUILD DOCK */}
              <div className="w-full p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Add Furniture to Room ({house.placedFurniture.length}/{currentLevelInfo.maxFurniture})
                  </span>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {(['all', 'seating', 'tables', 'bedroom', 'hearth', 'rugs', 'plants'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          sound.playTap();
                          setSelectedCategory(cat);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horizontal Scrollable Furniture Catalog Cards */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {filteredCatalog.map((item) => {
                    const isPicked = selectedCatalogItem?.id === item.id;
                    const canAfford = gameState.coins >= item.cost;
                    const atCapacity = house.placedFurniture.length >= currentLevelInfo.maxFurniture;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (atCapacity) return;
                          sound.playTap();
                          if (isPicked) {
                            setSelectedCatalogItem(null);
                          } else {
                            setSelectedCatalogItem(item);
                            setSelectedPlacedId(null);
                            setIsMoveMode(false);
                          }
                        }}
                        className={`min-w-[130px] p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer shrink-0 ${
                          isPicked
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-102'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <span className="text-3xl my-1">{item.icon}</span>
                        <span className="text-xs font-bold text-white line-clamp-1">{item.name}</span>
                        <span className="text-[10px] text-amber-300 font-medium">+{item.comfortBonus} 💖 Comfort</span>
                        <div className="mt-1.5 flex items-center gap-1 font-mono text-xs text-amber-400">
                          <span>🪙</span>
                          <span>{item.cost}</span>
                        </div>
                        <span
                          className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded ${
                            isPicked
                              ? 'bg-amber-400 text-slate-950'
                              : canAfford && !atCapacity
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isPicked ? 'Placing...' : atCapacity ? 'Full' : 'Select'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOMESTEAD PAINTING GALLERY ("change the painting of my Home") */}
          {activeTab === 'paintings' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Homestead Fine Art Collection</h3>
                  <p className="text-xs text-slate-400">
                    Mount agricultural masterpieces and Bicol heritage landscapes in the center of your living room wall.
                  </p>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('sims_studio');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  <span>👁️</span>
                  <span>View in Room</span>
                </button>
              </div>

              {/* Painting Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {HOUSE_PAINTINGS.map((painting) => {
                  const isHung = (house.wallPainting || 'amorsolo_rice') === painting.id;
                  const canAfford = gameState.coins >= painting.cost;

                  return (
                    <div
                      key={painting.id}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                        isHung
                          ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Artwork Preview Canvas */}
                        <div
                          className={`w-full h-32 rounded-xl bg-gradient-to-br ${painting.previewGradient} flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner border-4 ${
                            painting.frameStyle === 'gold_baroque'
                              ? 'border-amber-400 ring-2 ring-yellow-300/40'
                              : painting.frameStyle === 'carved_narra'
                              ? 'border-amber-900 ring-1 ring-amber-700'
                              : painting.frameStyle === 'rustic_teak'
                              ? 'border-amber-700'
                              : 'border-slate-400'
                          }`}
                        >
                          <span className="text-4xl drop-shadow-lg">{painting.icon}</span>
                          <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md text-center mt-1 font-display">
                            {painting.title}
                          </span>
                          <span className="text-[10px] text-amber-200/90 font-mono tracking-tight">
                            {painting.era}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{painting.title}</span>
                            <span className="text-[10px] font-bold text-amber-300 font-mono">
                              +{painting.comfortBonus} 💖 Comfort
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-semibold block">{painting.artist}</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{painting.description}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {isHung ? 'Mounted on Wall' : `🪙 ${painting.cost}`}
                        </span>

                        <button
                          onClick={() => {
                            if (isHung) {
                              setActiveTab('sims_studio');
                              return;
                            }
                            onChangeHousePainting(painting.id, painting.cost);
                          }}
                          disabled={!isHung && !canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isHung
                              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                              : canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <span>{isHung ? '✓ Currently Hung' : 'Hang on Wall'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WALLPAPER & FLOORING FINISHES */}
          {activeTab === 'wall_flooring' && (
            <div className="space-y-4">
              {/* Wallpaper Section */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <h3 className="font-bold text-white text-sm">Interior Wallpapers & Wall Paints</h3>
                  <p className="text-xs text-slate-400">Choose the architectural wall texture for your homestead room.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WALL_STYLES.map((wall) => {
                    const isSelected = house.wallStyle === wall.id;

                    return (
                      <button
                        key={wall.id}
                        onClick={() => onUpdateWallAndFloor(wall.id, house.flooring)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0"
                          style={{ backgroundColor: wall.preview }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{wall.name}</span>
                            {isSelected && <span className="text-[10px] text-emerald-400 font-bold">✓ Active</span>}
                          </div>
                          <p className="text-[10px] text-slate-400">{wall.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flooring Section */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <h3 className="font-bold text-white text-sm">Flooring Materials</h3>
                  <p className="text-xs text-slate-400">Select handcrafted wood planks, bamboo parquet, or terracotta tile floors.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FLOOR_STYLES.map((floor) => {
                    const isSelected = house.flooring === floor.id;

                    return (
                      <button
                        key={floor.id}
                        onClick={() => onUpdateWallAndFloor(house.wallStyle, floor.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border border-white/20 shadow-inner shrink-0"
                          style={{ backgroundColor: floor.preview }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{floor.name}</span>
                            {isSelected && <span className="text-[10px] text-emerald-400 font-bold">✓ Active</span>}
                          </div>
                          <p className="text-[10px] text-slate-400">{floor.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXTERIOR ARCHITECTURE & UPGRADE RENOVATION */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              {/* House Level Upgrade Card */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{currentLevelInfo.name}</h3>
                      <p className="text-xs text-emerald-400 font-medium">Level {house.level} of {HOUSE_LEVELS.length}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Max Furniture: {currentLevelInfo.maxFurniture}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {currentLevelInfo.perk}
                </p>

                {nextLevelInfo ? (() => {
                  const farmLevelOk = gameState.level >= (nextLevelInfo.minFarmLevel || 1);
                  const canAffordCoins = gameState.coins >= nextLevelInfo.upgradeCost;
                  const canAffordGems = gameState.gems >= nextLevelInfo.gemCost;
                  const canUpgrade = farmLevelOk && canAffordCoins && canAffordGems;

                  return (
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300 block">Next: {nextLevelInfo.name}</span>
                          {!farmLevelOk && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                              Requires Farm Lv {nextLevelInfo.minFarmLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{nextLevelInfo.perk}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (canUpgrade) {
                            sound.playHammer();
                            onUpgradeHouseLevel(nextLevelInfo.level, nextLevelInfo.upgradeCost, nextLevelInfo.gemCost);
                          }
                        }}
                        disabled={!canUpgrade}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          canUpgrade
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {!farmLevelOk ? (
                          <span>🔒 Requires Farm Lv {nextLevelInfo.minFarmLevel}</span>
                        ) : (
                          <>
                            <span>Upgrade:</span>
                            <span>🪙 {nextLevelInfo.upgradeCost}</span>
                            {nextLevelInfo.gemCost > 0 && <span>💎 {nextLevelInfo.gemCost}</span>}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })() : (
                  <div className="text-xs text-emerald-300 font-semibold text-center py-1">
                    ✨ Your homestead has reached maximum Grand Estate architectural splendor!
                  </div>
                )}
              </div>

              {/* Exterior Wall Paint Swatches */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Exterior Homestead Wall Paint</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {exteriorSwatches.map((color) => {
                    const isSelected = house.exteriorColor === color.hex;

                    return (
                      <button
                        key={color.hex}
                        onClick={() => {
                          sound.playTap();
                          onUpdateColors(color.hex, house.roofColor);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roof Shingle Color Swatches */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Roof Shingle Finish</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roofSwatches.map((color) => {
                    const isSelected = house.roofColor === color.hex;

                    return (
                      <button
                        key={color.hex}
                        onClick={() => {
                          sound.playTap();
                          onUpdateColors(house.exteriorColor, color.hex);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
