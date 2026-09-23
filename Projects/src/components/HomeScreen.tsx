import React from 'react';
import { 
  TreePine, 
  QrCode, 
  ClipboardEdit, 
  Navigation, 
  Compass, 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Camera,
  Waves
} from 'lucide-react';
import { TreeTagData, GeoTaggedObservation, GpsStatus } from '../types';

interface HomeScreenProps {
  onNavigate: (action: 'species' | 'scanner' | 'record' | 'map' | 'data' | 'assistant') => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSyncCount: number;
  onSync: () => void;
  isSyncing: boolean;
  coords: { lat: number; lng: number } | null;
  onGetLocation: () => void;
  gpsStatus: GpsStatus;
  treeTags: TreeTagData[];
  observations: GeoTaggedObservation[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  isOffline,
  setIsOffline,
  pendingSyncCount,
  onSync,
  isSyncing,
  coords,
  onGetLocation,
  gpsStatus,
  treeTags,
  observations,
}) => {
  const isLocating = gpsStatus.state === 'acquiring';
  const hasGpsError = gpsStatus.state === 'error';

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Welcome Card with Earth Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b382b] via-[#164e3f] to-[#1a2e40] text-white shadow-md border border-[#2d5a44] p-4 sm:p-6 space-y-3">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/70 border border-emerald-500/30 text-emerald-200 text-[11px] font-medium">
            <Waves className="w-3 h-3 text-teal-300" />
            <span>Del Carmen &bull; Siargao Bio-Reserve</span>
          </div>

          {/* Compact Offline / Online status */}
          <div className="flex items-center space-x-1.5">
            <button
              id="toggle-offline-home-btn"
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                isOffline
                  ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                  : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Online</span>
                </>
              )}
            </button>

            {pendingSyncCount > 0 && (
              <button
                onClick={onSync}
                disabled={isOffline || isSyncing}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount}</span>
              </button>
            )}
          </div>

        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#fbf8f3]">
            Philippine Mangrove Kayak Guide
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/85 mt-1 leading-relaxed">
            Botanical field diagnostics, branch QR tag passports, and direct estuarine research logging from your kayak.
          </p>
        </div>

        {/* Compact GPS status */}
        <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-emerald-200/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5">
              <Compass className={`w-3.5 h-3.5 ${hasGpsError ? 'text-amber-400' : 'text-amber-300'}`} />
              <span className="font-mono">
                {coords ? `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : 'Coordinates unavailable'}
              </span>
            </div>
            <button
              onClick={onGetLocation}
              disabled={isLocating}
              aria-describedby="home-gps-status"
              className="text-amber-200 hover:text-amber-100 underline decoration-amber-400 text-[11px] font-medium disabled:cursor-wait disabled:opacity-70"
            >
              {isLocating ? 'Acquiring...' : hasGpsError ? 'Retry GPS' : 'Update GPS'}
            </button>
          </div>
          <p
            id="home-gps-status"
            role={hasGpsError ? 'alert' : 'status'}
            aria-live={hasGpsError ? 'assertive' : 'polite'}
            className={hasGpsError ? 'text-amber-200' : 'text-emerald-100/75'}
          >
            {gpsStatus.message}
          </p>
        </div>
      </div>

      {/* THE CORE FIELD ACTIONS (Identify, Hero Scan QR, Direct Record, Map) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Core Features
          </h2>
          <span className="text-[11px] text-stone-500">Tap to open</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* 1. IDENTIFY */}
          <button
            id="action-card-identify"
            onClick={() => onNavigate('species')}
            className="group text-left p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-emerald-700/40 shadow-2xs transition flex items-center space-x-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                  Identify Species
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Keys &bull; AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                Bakawan, Pagatpat, Api-api &bull; 8 native halophytes
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          {/* 2. HERO FEATURE: SCAN QR / CAMERA */}
          <button
            id="action-card-scan-qr"
            onClick={() => onNavigate('scanner')}
            className="group text-left p-4 rounded-2xl bg-gradient-to-r from-white via-emerald-50/40 to-teal-50/40 hover:to-emerald-100/60 border-2 border-emerald-600/40 shadow-xs transition flex items-center space-x-3.5 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition relative">
              <Camera className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 p-0.5 rounded-full">
                <QrCode className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5 truncate">
                  <span>Scan QR / Camera</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full">
                    Hero
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-emerald-900/80 mt-0.5 truncate">
                Scan branch research tags for tree passports &amp; DBH
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          {/* 3. DIRECT RECORD / RESEARCH */}
          <button
            id="action-card-record"
            onClick={() => onNavigate('record')}
            className="group text-left p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-700/40 shadow-2xs transition flex items-center space-x-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 group-hover:bg-amber-800 group-hover:text-white transition">
              <ClipboardEdit className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-950 truncate">
                  Record Research
                </h3>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Direct In-App
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                Log salinity (ppt), canopy cover, and wildlife
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          {/* 4. MAP */}
          <button
            id="action-card-map"
            onClick={() => onNavigate('map')}
            className="group text-left p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-teal-700/40 shadow-2xs transition flex items-center space-x-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-800 group-hover:text-white transition">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-teal-950 truncate">
                  Kayak Trail Map
                </h3>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Waterways
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                Del Carmen &bull; Sugba Lagoon channel chart
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

        </div>
      </div>

      {/* Secondary Tools: Data & Naturalist AI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() => onNavigate('data')}
          className="p-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition flex items-center justify-between text-left shadow-2xs"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <FileText className="w-4 h-4 text-stone-600 shrink-0" />
            <div className="truncate">
              <span className="text-xs font-bold text-stone-800 block truncate">
                Restoration Data &amp; GIS Exports
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                {observations.length} logs saved &bull; Export GeoJSON &amp; CSV
              </span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-2" />
        </button>

        <button
          onClick={() => onNavigate('assistant')}
          className="p-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition flex items-center justify-between text-left shadow-2xs"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="truncate">
              <span className="text-xs font-bold text-stone-800 block truncate">
                Kuya Dan &bull; Naturalist Guide
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                Ask questions about roots, fireflies &amp; tides
              </span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
};
