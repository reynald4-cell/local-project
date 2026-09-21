import React from 'react';
import { Camera, QrCode, Sparkles } from 'lucide-react';

interface FloatingHeroScanButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const FloatingHeroScanButton: React.FC<FloatingHeroScanButtonProps> = ({
  onClick,
  isActive
}) => {
  return (
    <>
      {/* Desktop Floating Action Button (bottom right) */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          id="hero-floating-camera-desktop"
          onClick={onClick}
          className={`group relative flex items-center space-x-3 px-5 py-3.5 rounded-full font-bold text-sm text-white shadow-2xl transition-all duration-300 ${
            isActive
              ? 'bg-[#1b4332] ring-4 ring-emerald-400/50 scale-105 shadow-emerald-950/50'
              : 'bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5139] hover:from-[#24533e] hover:to-[#2d6a4f] hover:scale-105 hover:shadow-emerald-900/60 ring-4 ring-emerald-500/30'
          }`}
          title="Open Hero QR Tree Tag & Mangrove Camera Scanner"
        >
          {/* Subtle pulse halo */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-pulse pointer-events-none" />

          {/* Camera Icon with QR badge */}
          <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Camera className="w-4.5 h-4.5 text-white" />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 p-0.5 rounded-full shadow-xs">
              <QrCode className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="text-left leading-tight pr-1">
            <span className="block text-xs uppercase tracking-wider text-emerald-200 font-extrabold flex items-center gap-1">
              Hero Feature
              <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-sm font-black text-white">
              Scan Tree QR / Camera
            </span>
          </div>
        </button>
      </div>
    </>
  );
};
