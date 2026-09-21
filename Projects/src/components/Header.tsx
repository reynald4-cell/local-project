import React, { useState } from 'react';
import { 
  Compass, 
  Wifi,
  WifiOff,
  Volume2, 
  VolumeX, 
  Navigation, 
  QrCode, 
  TreePine, 
  MapPin, 
  FileText, 
  Sparkles,
  RefreshCw,
  Home,
  Waves
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  pendingSyncCount: number;
  onSync: () => void;
  isSyncing: boolean;
  coords: { lat: number; lng: number } | null;
  onGetLocation: () => void;
  isLocating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOffline,
  setIsOffline,
  pendingSyncCount,
  onSync,
  isSyncing,
  coords,
  onGetLocation,
  isLocating
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playGuideAudioIntro = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const text = "Magandang araw paddlers! Welcome to the Del Carmen Mangrove Reserve in Siargao. As your kayak guide, remember our coastal rule: paddle quiet, leave no wake, and read the roots. Look out for the gigantic arching stilt roots of Bakawan Babae, the wooden cone roots of Pagatpat where synchronous fireflies dance at night, and the thousands of pencil pneumatophores of Api-api. Feel free to identify species, scan tree QR tags on the branches, and record your geo-tagged water salinity even deep in remote offline waterways.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'species', label: 'Identify', icon: TreePine },
    { id: 'scanner', label: 'Scan QR', icon: QrCode },
    { id: 'record', label: 'Record', icon: MapPin },
    { id: 'map', label: 'Map', icon: Navigation },
    { id: 'data', label: 'Data', icon: FileText, badge: pendingSyncCount > 0 ? pendingSyncCount : null },
    { id: 'assistant', label: 'Guide AI', icon: Sparkles },
  ];

  return (
    <header className="bg-[#172820] text-[#fbf8f3] border-b border-[#2d4734] sticky top-0 z-40 shadow-md">
      {/* Top Status & GPS Strip - Compact on mobile, detailed on desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 text-xs border-b border-[#263c2c] bg-[#122019]">
        <div className="flex items-center space-x-2 text-emerald-300 font-medium truncate">
          <Waves className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="font-semibold text-[#fbf8f3] truncate">Philippine Mangrove Field Station</span>
          <span className="text-emerald-700 hidden sm:inline">&bull;</span>
          <span className="text-emerald-200/80 hidden sm:inline">Del Carmen &bull; Siargao</span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* GPS Quick Location Status */}
          <button
            id="quick-gps-btn"
            onClick={onGetLocation}
            disabled={isLocating}
            className="flex items-center space-x-1 px-2 py-1 rounded-md bg-[#1f3627] hover:bg-[#274431] text-emerald-100 border border-[#31563d] transition text-[11px]"
            title="Update GPS coordinates"
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">
              {coords 
                ? `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` 
                : isLocating ? 'Locating...' : 'GPS'}
            </span>
            <span className="sm:hidden text-[10px]">{coords ? 'GPS Fix' : 'GPS'}</span>
          </button>

          {/* Compact Offline / Online Toggle */}
          <button
            id="offline-toggle-compact"
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2 py-1 rounded-md flex items-center space-x-1 text-[11px] font-semibold border transition ${
              isOffline
                ? 'bg-amber-800 text-white border-amber-600'
                : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
            }`}
            title={isOffline ? "Offline mode active (no internet needed)" : "Online mode (cloud connected)"}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-200" />
                <span className="text-[10px]">Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px]">Online</span>
              </>
            )}
          </button>

          {/* Pending Sync */}
          {pendingSyncCount > 0 && (
            <button
              id="pending-sync-btn"
              onClick={onSync}
              disabled={isOffline || isSyncing}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-bold ${
                isOffline
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
              }`}
              title={`${pendingSyncCount} surveys queued offline`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount}</span>
            </button>
          )}

          {/* Audio Naturalist Briefing */}
          <button
            id="audio-briefing-btn"
            onClick={playGuideAudioIntro}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-[11px] transition ${
              isPlayingAudio 
                ? 'bg-amber-900/70 text-amber-200 border-amber-500' 
                : 'bg-[#1f3627] hover:bg-[#274431] text-emerald-200 border-[#31563d]'
            }`}
            title="Listen to Guide audio briefing"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-300" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Mute' : 'Audio Guide'}</span>
          </button>

        </div>
      </div>

      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex items-center justify-between gap-3">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e3a5f] flex items-center justify-center shadow-md border border-emerald-400/20 text-[#fbf8f3]">
            <TreePine className="w-5 h-5 text-emerald-300 group-hover:scale-105 transition" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#fbf8f3] leading-none">
                Mangrove Guide
              </h1>
              <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded bg-[#1b3d2b] text-emerald-300 border border-[#2d6144]">
                Siargao
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/70 hidden sm:block mt-0.5">
              Philippine Kayak Estuarine &bull; QR Tree Tags &bull; Blue Carbon
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile to prevent overflow) */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Field Guide Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative shrink-0 flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#2d6a4f] text-white shadow-xs font-bold border border-[#40916c]'
                    : 'text-emerald-100/80 hover:bg-[#203b2b] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-stone-950 font-bold text-[10px] rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Offline Alert Bar when offline - concise */}
      {isOffline && (
        <div className="bg-[#3e2415] border-b border-[#5e381f] px-3 py-1 text-center text-[11px] text-amber-200 flex items-center justify-center space-x-1.5">
          <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            <strong>Offline Mode:</strong> Diagnostics, QR codes &amp; GPS logs work without internet.
          </span>
        </div>
      )}
    </header>
  );
};
