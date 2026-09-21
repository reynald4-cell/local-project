import React from 'react';
import { 
  Home, 
  TreePine, 
  Camera, 
  QrCode, 
  ClipboardEdit, 
  Navigation,
  Sparkles
} from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab
}) => {
  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16271e]/98 backdrop-blur-md border-t border-[#2a4533] px-2 py-1 shadow-2xl safe-area-pb"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* 1. Home */}
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* 2. Identify */}
        <button
          id="mobile-nav-identify"
          onClick={() => setActiveTab('species')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'species'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <TreePine className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Identify</span>
        </button>

        {/* 3. HERO FLOATING SCAN / CAMERA BUTTON (CENTER HERO) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            id="mobile-hero-scan-btn"
            onClick={() => setActiveTab('scanner')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] ring-4 ring-emerald-300 scale-105 shadow-emerald-950/80'
                : 'bg-gradient-to-tr from-[#1b4332] via-[#2d6a4f] to-[#3a8562] hover:scale-105 ring-4 ring-[#16271e] shadow-emerald-950/70'
            }`}
            title="Hero Feature: Scan Tree QR Tag / Camera"
          >
            {/* Animated halo glow */}
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none opacity-40" />

            <div className="relative flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1.5 bg-amber-400 text-stone-950 p-0.5 rounded-full shadow-2xs">
                <QrCode className="w-2.5 h-2.5" />
              </div>
            </div>
          </button>
          <span className={`text-[10px] font-extrabold tracking-tight mt-0.5 ${
            activeTab === 'scanner' ? 'text-emerald-300' : 'text-emerald-200/90'
          }`}>
            Scan Tag
          </span>
        </div>

        {/* 4. Record (Direct Research Input) */}
        <button
          id="mobile-nav-record"
          onClick={() => setActiveTab('record')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'record'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ClipboardEdit className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Record</span>
        </button>

        {/* 5. Map */}
        <button
          id="mobile-nav-map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Map</span>
        </button>

      </div>
    </nav>
  );
};
