import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { SpeciesGuide } from './components/SpeciesGuide';
import { QRTreeScanner } from './components/QRTreeScanner';
import { KayakTrailMap } from './components/KayakTrailMap';
import { ResearchLogger } from './components/ResearchLogger';
import { RestorationDataView } from './components/RestorationDataView';
import { GuideAssistant } from './components/GuideAssistant';
import { MobileNavBar } from './components/MobileNavBar';
import { FloatingHeroScanButton } from './components/FloatingHeroScanButton';
import { 
  TreeTagData, 
  GeoTaggedObservation, 
  MangroveSpecies, 
  RestorationProject,
  GpsStatus,
} from './types';
import { 
  INITIAL_TREE_TAGS, 
  INITIAL_OBSERVATIONS, 
  RESTORATION_PROJECTS, 
} from './data/mangroveDatabase';

const getGeolocationErrorStatus = (error: GeolocationPositionError): GpsStatus => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        state: 'error',
        reason: 'permission-denied',
        message: 'Location permission denied. Allow location access, then retry. Keeping current coordinates.',
      };
    case error.POSITION_UNAVAILABLE:
      return {
        state: 'error',
        reason: 'position-unavailable',
        message: 'GPS position is unavailable. Move to an open area and retry. Keeping current coordinates.',
      };
    case error.TIMEOUT:
      return {
        state: 'error',
        reason: 'timeout',
        message: 'GPS acquisition timed out. Check your signal and retry. Keeping current coordinates.',
      };
    default:
      return {
        state: 'error',
        reason: 'unknown',
        message: 'GPS could not determine your location. Retry when ready. Keeping current coordinates.',
      };
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Persistence for observations and tree tags
  const [observations, setObservations] = useState<GeoTaggedObservation[]>(() => {
    try {
      const saved = localStorage.getItem('MANGROVE_OBSERVATIONS_V2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_OBSERVATIONS;
  });

  const [treeTags, setTreeTags] = useState<TreeTagData[]>(() => {
    try {
      const saved = localStorage.getItem('MANGROVE_TREE_TAGS_V2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TREE_TAGS;
  });

  const [restorationProjects] = useState<RestorationProject[]>(RESTORATION_PROJECTS);

  // Default GPS in Del Carmen, Siargao Mangrove Forest (9.8722° N, 125.9683° E)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 9.8722,
    lng: 125.9683,
  });
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>({
    state: 'fallback',
    message: 'Using fallback coordinates for Del Carmen, Siargao. Update GPS for your live position.',
  });

  // Direct research input selection state
  const [preselectedTreeTag, setPreselectedTreeTag] = useState<TreeTagData | null>(null);
  const [preselectedSpecies, setPreselectedSpecies] = useState<MangroveSpecies | null>(null);

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('MANGROVE_OBSERVATIONS_V2', JSON.stringify(observations));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [observations]);

  useEffect(() => {
    try {
      localStorage.setItem('MANGROVE_TREE_TAGS_V2', JSON.stringify(treeTags));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [treeTags]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Acquire live GPS position
  const handleGetLocation = () => {
    setGpsStatus({
      state: 'acquiring',
      message: 'Acquiring your live GPS position...',
    });

    if (!('geolocation' in navigator)) {
      setGpsStatus({
        state: 'error',
        reason: 'unsupported',
        message: 'This browser does not support GPS location. Keeping the Del Carmen fallback coordinates.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setGpsStatus({
          state: 'success',
          message: 'Live GPS position acquired.',
        });
      },
      (error) => {
        console.warn('Geolocation error, maintaining current coordinates:', error);
        setGpsStatus(getGeolocationErrorStatus(error));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Sync Offline Queue
  const handleSyncQueue = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setObservations((prev) =>
        prev.map((obs) => ({
          ...obs,
          offlineStatus: 'synced',
        }))
      );
      setIsSyncing(false);
    }, 1200);
  };

  // Save new observation
  const handleSaveObservation = (newObs: GeoTaggedObservation) => {
    setObservations((prev) => [newObs, ...prev]);
    setPreselectedTreeTag(null);
    setPreselectedSpecies(null);
  };

  // Delete observation
  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  // Trigger direct in-app research input for a specific tree tag
  const handleSelectTreeForLog = (tag: TreeTagData) => {
    setPreselectedTreeTag(tag);
    setPreselectedSpecies(null);
    setActiveTab('record');
  };

  // Trigger direct in-app research input for a specific species
  const handleSelectSpeciesForLog = (species: MangroveSpecies) => {
    setPreselectedSpecies(species);
    setPreselectedTreeTag(null);
    setActiveTab('record');
  };

  // Click on map to log coordinate directly into application
  const handleMapClickToLog = (clickedCoords: { lat: number; lng: number }) => {
    setCoords(clickedCoords);
    setPreselectedTreeTag(null);
    setPreselectedSpecies(null);
    setActiveTab('record');
  };

  const pendingSyncCount = observations.filter((o) => o.offlineStatus === 'queued_offline').length;

  return (
    <div className="theme-coastal-minimalist min-h-screen bg-[#f4efe8] text-[#1c2820] flex flex-col font-sans selection:bg-emerald-300 selection:text-emerald-950">
      {/* Top Header & Nav (Desktop tabs + mobile minimal status bar) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSyncQueue}
        isSyncing={isSyncing}
        coords={coords}
        onGetLocation={handleGetLocation}
        gpsStatus={gpsStatus}
      />

      {/* Main Content Area - with bottom padding on mobile to accommodate bottom navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={(action) => setActiveTab(action)}
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            pendingSyncCount={pendingSyncCount}
            onSync={handleSyncQueue}
            isSyncing={isSyncing}
            coords={coords}
            onGetLocation={handleGetLocation}
            gpsStatus={gpsStatus}
            treeTags={treeTags}
            observations={observations}
          />
        )}

        {activeTab === 'species' && (
          <SpeciesGuide
            isOffline={isOffline}
            onSelectForLog={handleSelectSpeciesForLog}
          />
        )}

        {activeTab === 'scanner' && (
          <QRTreeScanner
            treeTags={treeTags}
            onSelectTreeForLog={handleSelectTreeForLog}
            isOffline={isOffline}
          />
        )}

        {/* DIRECT IN-APP RESEARCH INPUT VIEW (No cumbersome modal) */}
        {activeTab === 'record' && (
          <ResearchLogger
            onSaveObservation={handleSaveObservation}
            currentCoords={coords}
            preselectedTreeTag={preselectedTreeTag}
            preselectedSpecies={preselectedSpecies}
            isOffline={isOffline}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setPreselectedTreeTag(null);
              setPreselectedSpecies(null);
            }}
            onClearPreselected={() => {
              setPreselectedTreeTag(null);
              setPreselectedSpecies(null);
            }}
          />
        )}

        {activeTab === 'map' && (
          <KayakTrailMap
            treeTags={treeTags}
            observations={observations}
            restorationProjects={restorationProjects}
            userCoords={coords}
            onSelectTree={handleSelectTreeForLog}
            onMapClickToLog={handleMapClickToLog}
          />
        )}

        {activeTab === 'data' && (
          <RestorationDataView
            observations={observations}
            restorationProjects={restorationProjects}
            isOffline={isOffline}
            onSync={handleSyncQueue}
            isSyncing={isSyncing}
            onDeleteObservation={handleDeleteObservation}
          />
        )}

        {activeTab === 'assistant' && (
          <GuideAssistant isOffline={isOffline} />
        )}
      </main>

      {/* Floating Hero Scan QR / Camera Button (Desktop persistent Hero FAB) */}
      <FloatingHeroScanButton
        onClick={() => setActiveTab('scanner')}
        isActive={activeTab === 'scanner'}
      />

      {/* Mobile Bottom Navigation Bar with Floating Center Hero Scan Button */}
      <MobileNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Footer in Earth Colors (Hidden on mobile to save vertical space, visible on desktop) */}
      <footer className="hidden md:block bg-[#172820] border-t border-[#263c2c] py-3.5 px-6 text-center text-xs text-emerald-200/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Philippine Mangrove Kayak Field Station &bull; Del Carmen, Siargao &bull; Palawan Reserves
          </span>
          <span className="text-emerald-300/60 font-medium">
            100% Offline-Ready &bull; Geo-Tagged Observations &bull; Blue Carbon Research
          </span>
        </div>
      </footer>
    </div>
  );
}
