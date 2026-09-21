import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  TreePine, 
  QrCode, 
  Layers, 
  Crosshair, 
  Info, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Waves
} from 'lucide-react';
import { TreeTagData, GeoTaggedObservation, RestorationProject } from '../types';

interface KayakTrailMapProps {
  treeTags: TreeTagData[];
  observations: GeoTaggedObservation[];
  restorationProjects: RestorationProject[];
  userCoords: { lat: number; lng: number } | null;
  onSelectTree?: (tag: TreeTagData) => void;
  onSelectObservation?: (obs: GeoTaggedObservation) => void;
  onMapClickToLog?: (coords: { lat: number; lng: number }) => void;
}

export const KayakTrailMap: React.FC<KayakTrailMapProps> = ({
  treeTags,
  observations,
  restorationProjects,
  userCoords,
  onSelectTree,
  onSelectObservation,
  onMapClickToLog,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showTrees, setShowTrees] = useState(true);
  const [showObservations, setShowObservations] = useState(true);
  const [showRestoration, setShowRestoration] = useState(true);
  const [showTrail, setShowTrail] = useState(true);

  // Map bounding box coordinates for Del Carmen Siargao Mangrove Reserve
  // Center roughly: 9.8660° N, 125.9660° E
  const minLat = 9.8590;
  const maxLat = 9.8730;
  const minLng = 125.9560;
  const maxLng = 125.9760;

  // Convert real lat/lng to SVG percentage (0 - 1000)
  const coordsToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 700;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(670, y)) };
  };

  // Convert SVG click back to approximate lat/lng
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 700;

    const clickedLng = minLng + (clickX / 1000) * (maxLng - minLng);
    const clickedLat = maxLat - (clickY / 700) * (maxLat - minLat);

    if (onMapClickToLog) {
      onMapClickToLog({ lat: Number(clickedLat.toFixed(5)), lng: Number(clickedLng.toFixed(5)) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar in aesthetic earth tones */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-700" />
            Del Carmen Mangrove Waterway &amp; Kayak Trail Chart
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Siargao Island &bull; Navigation channels, tagged Bakawan &amp; Pagatpat trees, and replanting coves.
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowTrail(!showTrail)}
            className={`px-2.5 py-1 rounded-lg border transition font-semibold ${
              showTrail ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            Kayak Trail
          </button>
          <button
            onClick={() => setShowTrees(!showTrees)}
            className={`px-2.5 py-1 rounded-lg border transition font-semibold flex items-center gap-1 ${
              showTrees ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            <QrCode className="w-3 h-3" />
            Trees ({treeTags.length})
          </button>
          <button
            onClick={() => setShowObservations(!showObservations)}
            className={`px-2.5 py-1 rounded-lg border transition font-semibold flex items-center gap-1 ${
              showObservations ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            <MapPin className="w-3 h-3" />
            Logs ({observations.length})
          </button>
          <button
            onClick={() => setShowRestoration(!showRestoration)}
            className={`px-2.5 py-1 rounded-lg border transition font-semibold ${
              showRestoration ? 'bg-teal-100 text-teal-900 border-teal-300' : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
          >
            Restoration
          </button>
        </div>
      </div>

      {/* Main Map Container with Earth Colors (Deep Tidal Blue, Forest Greens, Warm Sand) */}
      <div className="relative bg-[#10232e] rounded-3xl overflow-hidden shadow-lg border border-[#1b3f4f]">
        {/* SVG Coastal Estuary Map */}
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-auto select-none cursor-crosshair block"
          onClick={handleSvgClick}
        >
          {/* Background Ocean / Estuary Water (Deep Marine Blue) */}
          <rect width="1000" height="700" fill="#0f2b38" />

          {/* Shallow Coral Sandbars / Mudflats (Earth warm sand/tan) */}
          <ellipse cx="320" cy="480" rx="160" ry="85" fill="#143e4c" />
          <ellipse cx="680" cy="220" rx="190" ry="115" fill="#143e4c" />

          {/* Mangrove Islands & Dense Vegetated Channels (Lush Forest Green #1b4332 & #2d6a4f) */}
          {/* Island 1: North Sugba Seaward Barrier (Bakawan Babae stilt forest) */}
          <path
            d="M 120 70 Q 250 40 370 80 T 530 130 T 490 250 T 320 230 T 170 210 Z"
            fill="#1b4332"
            stroke="#2d6a4f"
            strokeWidth="3.5"
            opacity="0.95"
          />
          {/* Island 2: Central Cancohoy Firefly Archipelago */}
          <path
            d="M 430 310 Q 570 290 690 330 T 790 420 T 710 510 T 550 500 T 420 410 Z"
            fill="#1b4332"
            stroke="#2d6a4f"
            strokeWidth="3.5"
            opacity="0.95"
          />
          {/* Island 3: South San Jose Riverine Mudflats */}
          <path
            d="M 70 430 Q 180 410 280 450 T 260 620 T 110 640 Z"
            fill="#1e3a27"
            stroke="#2d6a4f"
            strokeWidth="3.5"
            opacity="0.95"
          />
          {/* Island 4: East Numancia Mainland Mangrove Belt */}
          <path
            d="M 760 70 Q 890 60 970 110 T 950 320 T 830 250 Z"
            fill="#23422e"
            stroke="#2d6a4f"
            strokeWidth="3.5"
            opacity="0.95"
          />

          {/* Root fringe details (decorative prop roots along edges) */}
          <g stroke="#52b788" strokeWidth="1.5" opacity="0.35" fill="none">
            <path d="M 170 210 Q 190 230 210 210 T 250 220" />
            <path d="M 430 310 Q 450 330 470 310 T 510 320" />
            <path d="M 690 330 Q 710 360 740 340" />
          </g>

          {/* Waterway Channel Flow Arrows & Labels */}
          <text x="310" y="280" fill="#7dd3fc" fontSize="13" fontStyle="italic" opacity="0.85" fontWeight="600">
            Sugba Lagoon Seaward Cut &rarr;
          </text>
          <text x="560" y="260" fill="#7dd3fc" fontSize="13" fontStyle="italic" opacity="0.85" fontWeight="600">
            Cancohoy Channel (Firefly Trail)
          </text>
          <text x="130" y="370" fill="#7dd3fc" fontSize="13" fontStyle="italic" opacity="0.85" fontWeight="600">
            San Jose Riverine Cut
          </text>
          <text x="710" y="580" fill="#7dd3fc" fontSize="13" fontStyle="italic" opacity="0.85" fontWeight="600">
            Numancia Salt Basin
          </text>

          {/* Kayak Launch Pier (Del Carmen Mangrove Eco-Tourism Center) */}
          <g transform="translate(830, 130)">
            <rect x="-24" y="-12" width="48" height="24" rx="6" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
            <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">LAUNCH</text>
            <text x="0" y="26" fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle">Del Carmen Pier</text>
          </g>

          {/* Recommended Kayak Trail Waypoints Path */}
          {showTrail && (
            <g>
              <path
                d="M 830 130 Q 720 180 610 240 T 430 280 T 260 340 T 360 480 T 580 430 T 730 350"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeDasharray="7 5"
                opacity="0.8"
              />
              <circle cx="830" cy="130" r="4" fill="#38bdf8" />
              <circle cx="610" cy="240" r="4" fill="#38bdf8" />
              <circle cx="430" cy="280" r="4" fill="#38bdf8" />
              <circle cx="260" cy="340" r="4" fill="#38bdf8" />
              <circle cx="360" cy="480" r="4" fill="#38bdf8" />
              <circle cx="580" cy="430" r="4" fill="#38bdf8" />
            </g>
          )}

          {/* Restoration Polygons */}
          {showRestoration && restorationProjects.map((proj) => {
            const { x, y } = coordsToSvg(proj.lat, proj.lng);
            return (
              <g key={proj.id} onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'restoration', data: proj }); }}>
                <circle cx={x} cy={y} r="38" fill="#14b8a6" opacity="0.18" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="5 3" />
                <rect x={x - 14} y={y - 14} width="28" height="28" rx="7" fill="#0d9488" stroke="#5eead4" strokeWidth="1.5" className="cursor-pointer hover:scale-110 transition" />
                <TreePine x={x - 7} y={y - 7} width="14" height="14" className="text-white pointer-events-none" />
                <text x={x} y={y + 26} fill="#5eead4" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Replanting Zone
                </text>
              </g>
            );
          })}

          {/* Tree QR Tags */}
          {showTrees && treeTags.map((tag) => {
            const { x, y } = coordsToSvg(tag.lat, tag.lng);
            return (
              <g key={tag.tagId} onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'tree', data: tag }); }}>
                <circle cx={x} cy={y} r="18" fill="#0284c7" opacity="0.25" className="animate-ping pointer-events-none" />
                <circle cx={x} cy={y} r="13" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2" className="cursor-pointer hover:scale-125 transition" />
                <QrCode x={x - 6} y={y - 6} width="12" height="12" className="text-white pointer-events-none" />
                <text x={x} y={y - 16} fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow-md font-mono">
                  {tag.tagId}
                </text>
              </g>
            );
          })}

          {/* Geo-Tagged Observations */}
          {showObservations && observations.map((obs) => {
            const { x, y } = coordsToSvg(obs.lat, obs.lng);
            return (
              <g key={obs.id} onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'observation', data: obs }); }}>
                <circle cx={x} cy={y} r="11" fill="#f59e0b" stroke="#78350f" strokeWidth="2" className="cursor-pointer hover:scale-125 transition" />
                <MapPin x={x - 5} y={y - 5} width="10" height="10" className="text-white pointer-events-none" />
              </g>
            );
          })}

          {/* Current Live Kayak User Position */}
          {userCoords && (() => {
            const { x, y } = coordsToSvg(userCoords.lat, userCoords.lng);
            return (
              <g>
                <circle cx={x} cy={y} r="24" fill="#10b981" opacity="0.3" className="animate-pulse pointer-events-none" />
                <circle cx={x} cy={y} r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <text x={x} y={y + 20} fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">
                  You (Kayak)
                </text>
              </g>
            );
          })()}

          {/* Compass Rose */}
          <g transform="translate(85, 95)" opacity="0.75">
            <circle cx="0" cy="0" r="28" fill="#133644" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="0,-22 5,-5 0,0 -5,-5" fill="#ef4444" />
            <polygon points="0,22 5,5 0,0 -5,5" fill="#94a3b8" />
            <text x="0" y="-25" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">N</text>
          </g>

          {/* Map Scale */}
          <g transform="translate(80, 650)" opacity="0.7">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#ffffff" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" strokeWidth="2" />
            <line x1="100" y1="-4" x2="100" y2="4" stroke="#ffffff" strokeWidth="2" />
            <text x="50" y="-8" fill="#ffffff" fontSize="9" textAnchor="middle">500 meters</text>
          </g>
        </svg>

        {/* Floating Instruction / Click to Log */}
        <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click anywhere on waterway to log field observation</span>
        </div>
      </div>

      {/* Selected Entity Drawer / Info Panel */}
      {selectedEntity && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-md animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {selectedEntity.type === 'tree' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">
                      Tag #{selectedEntity.data.tagId}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold uppercase">
                      {selectedEntity.data.healthStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{selectedEntity.data.commonName}</h3>
                  <p className="text-xs text-stone-500 italic font-serif">
                    {selectedEntity.data.scientificName} &bull; {selectedEntity.data.waterwayName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-stone-600 pt-1">
                    <span>DBH: <strong>{selectedEntity.data.dbhCm} cm</strong></span>
                    <span>Height: <strong>{selectedEntity.data.heightMeters} m</strong></span>
                    <span>Age: <strong>~{selectedEntity.data.estimatedAgeYears} yrs</strong></span>
                    <span>Carbon: <strong>{selectedEntity.data.carbonSequestrationKgPerYr} kg/yr</strong></span>
                  </div>
                </>
              )}

              {selectedEntity.type === 'observation' && (
                <>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Field Transect Log
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{selectedEntity.data.title}</h3>
                  <p className="text-xs text-stone-500">
                    {selectedEntity.data.speciesName} &bull; {selectedEntity.data.waterwayName}
                  </p>
                  <p className="text-xs text-stone-600 pt-1">
                    Salinity: <strong>{selectedEntity.data.environmentalData?.salinityPpt} ppt</strong> &bull; 
                    Canopy: <strong>{selectedEntity.data.environmentalData?.canopyCoverPercent}%</strong> &bull; 
                    Health Score: <strong>{selectedEntity.data.healthScoreMHI}/100</strong>
                  </p>
                </>
              )}

              {selectedEntity.type === 'restoration' && (
                <>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
                    Restoration Replanting Site
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{selectedEntity.data.siteName}</h3>
                  <p className="text-xs text-stone-600">
                    Planted: <strong>{selectedEntity.data.plantedSeedlings} seedlings</strong> ({selectedEntity.data.survivalRatePercent}% survival)
                  </p>
                  <p className="text-xs text-stone-500 pt-1">{selectedEntity.data.description}</p>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedEntity.type === 'tree' && onSelectTree && (
                <button
                  onClick={() => onSelectTree(selectedEntity.data)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
                >
                  Log Survey for This Tree
                </button>
              )}
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
