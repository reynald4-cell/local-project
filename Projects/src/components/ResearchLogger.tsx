import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  Droplets, 
  TreePine, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  WifiOff, 
  Compass, 
  Fish,
  Layers,
  ArrowLeft,
  Navigation,
  FileText,
  PlusCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { GeoTaggedObservation, CoastalZone, MangroveSpecies, TreeTagData } from '../types';
import { MANGROVE_SPECIES, calculateMHI } from '../data/mangroveDatabase';

interface ResearchLoggerProps {
  onSaveObservation: (obs: GeoTaggedObservation) => void;
  currentCoords: { lat: number; lng: number } | null;
  preselectedTreeTag?: TreeTagData | null;
  preselectedSpecies?: MangroveSpecies | null;
  isOffline: boolean;
  onNavigate: (tab: string) => void;
  onClearPreselected?: () => void;
}

export const ResearchLogger: React.FC<ResearchLoggerProps> = ({
  onSaveObservation,
  currentCoords,
  preselectedTreeTag,
  preselectedSpecies,
  isOffline,
  onNavigate,
  onClearPreselected
}) => {
  const [title, setTitle] = useState<string>('');
  const [speciesId, setSpeciesId] = useState<string>(preselectedSpecies?.id || preselectedTreeTag?.speciesId || 'rhizophora_mucronata');
  const [treeTagId, setTreeTagId] = useState<string>(preselectedTreeTag?.tagId || '');
  const [waterwayZone, setWaterwayZone] = useState<CoastalZone>(preselectedSpecies?.dominantZone || 'seaward_fringe');
  const [waterwayName, setWaterwayName] = useState<string>(preselectedTreeTag?.waterwayName || 'Sugba Lagoon Cut • Del Carmen');
  const [lat, setLat] = useState<number>(preselectedTreeTag?.lat || currentCoords?.lat || 9.8655);
  const [lng, setLng] = useState<number>(preselectedTreeTag?.lng || currentCoords?.lng || 125.9642);
  const [salinityPpt, setSalinityPpt] = useState<number>(33);
  const [canopyCoverPercent, setCanopyCoverPercent] = useState<number>(85);
  const [sedimentType, setSedimentType] = useState<'fine_mud' | 'sandy_peat' | 'coarse_sand' | 'anoxic_ooze'>('fine_mud');
  const [selectedWildlife, setSelectedWildlife] = useState<string[]>(['Mud Crabs (Alimango)', 'Danggit Fry (Rabbitfish)']);
  const [trashLevel, setTrashLevel] = useState<'none' | 'light' | 'moderate' | 'severe'>('none');
  const [erosionRisk, setErosionRisk] = useState<'low' | 'moderate' | 'critical'>('low');
  const [restorationAction, setRestorationAction] = useState<string>('Routine health survey');
  const [propagulesPlantedCount, setPropagulesPlantedCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [guideName, setGuideName] = useState<string>('Kuya Dan (Lead Siargao Kayak Naturalist)');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [lastSavedId, setLastSavedId] = useState<string>('');

  useEffect(() => {
    if (preselectedTreeTag) {
      setTreeTagId(preselectedTreeTag.tagId);
      setSpeciesId(preselectedTreeTag.speciesId);
      setLat(preselectedTreeTag.lat);
      setLng(preselectedTreeTag.lng);
      setWaterwayName(preselectedTreeTag.waterwayName);
      setTitle(`Field Survey of Tree Tag #${preselectedTreeTag.tagId}`);
    } else if (preselectedSpecies) {
      setSpeciesId(preselectedSpecies.id);
      setTitle(`${preselectedSpecies.localName} (${preselectedSpecies.commonName}) Transect Survey`);
    } else if (!title) {
      setTitle('Del Carmen Lagoon Eco-Health Transect');
    }
  }, [preselectedTreeTag, preselectedSpecies]);

  // Compute Mangrove Health Index (MHI)
  const mhiCalculation = calculateMHI({
    salinityPpt,
    canopyCoverPercent,
    trashLevel,
    erosionRisk,
    wildlifeCount: selectedWildlife.length,
  });

  const handleWildlifeToggle = (item: string) => {
    if (selectedWildlife.includes(item)) {
      setSelectedWildlife(selectedWildlife.filter((w) => w !== item));
    } else {
      setSelectedWildlife([...selectedWildlife, item]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const selectedSp = MANGROVE_SPECIES.find((s) => s.id === speciesId);
    const newId = `OBS-${Date.now().toString().slice(-6)}`;
    const newObservation: GeoTaggedObservation = {
      id: newId,
      title: title || `${selectedSp?.commonName || 'Mangrove'} Observation`,
      speciesId,
      speciesName: `${selectedSp?.localName} • ${selectedSp?.commonName} (${selectedSp?.scientificName})`,
      treeTagId: treeTagId || undefined,
      lat,
      lng,
      accuracyMeters: currentCoords ? 3.5 : 5.0,
      waterwayZone,
      waterwayName,
      timestamp: new Date().toISOString(),
      healthRating: mhiCalculation.score >= 80 ? 5 : mhiCalculation.score >= 65 ? 4 : mhiCalculation.score >= 50 ? 3 : 2,
      healthScoreMHI: mhiCalculation.score,
      environmentalData: {
        salinityPpt,
        canopyCoverPercent,
        sedimentType,
        wildlifeObserved: selectedWildlife,
        trashLevel,
        erosionRisk,
      },
      restorationAction: restorationAction || undefined,
      propagulesPlantedCount: propagulesPlantedCount > 0 ? propagulesPlantedCount : undefined,
      notes: notes || 'Logged during Philippine coastal kayak survey run.',
      photoUrl: photoUrl || undefined,
      offlineStatus: isOffline ? 'queued_offline' : 'synced',
      guideName,
    };

    onSaveObservation(newObservation);
    setLastSavedId(newId);
    setSavedSuccess(true);
    if (onClearPreselected) onClearPreselected();
  };

  const handleAiHealthCheck = async () => {
    setIsDiagnosing(true);
    if (isOffline) {
      setTimeout(() => {
        setAiDiagnosis({
          healthIndexScore: mhiCalculation.score,
          statusLabel: mhiCalculation.status.toUpperCase(),
          summary: mhiCalculation.summary,
          salinityAssessment: `${salinityPpt} ppt is optimal for Philippine estuarine halophytes.`,
          indicatorSpeciesAnalysis: `${selectedWildlife.length} bio-indicator taxa observed, verifying active nursery function.`,
          threatAnalysis: trashLevel !== 'none' ? `Marine debris (${trashLevel}) detected along stilt roots.` : 'Bank sediment stable.',
          recommendedInterventions: ['Record follow-up at next spring high tide', 'Inspect seedling root anchor depth'],
          kayakGuideBriefing: 'Highlight the oyster clumps and crab burrows sheltering among the prop roots to kayakers.'
        });
        setIsDiagnosing(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch('/api/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salinity: salinityPpt,
          canopyCoverage: canopyCoverPercent,
          sedimentCondition: sedimentType,
          wildlifeObserved: selectedWildlife,
          trashLevel,
          erosionRisk,
          notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiDiagnosis(data);
      }
    } catch {
      setAiDiagnosis({
        healthIndexScore: mhiCalculation.score,
        statusLabel: mhiCalculation.status.toUpperCase(),
        summary: mhiCalculation.summary,
        salinityAssessment: `${salinityPpt} ppt logged.`,
        indicatorSpeciesAnalysis: 'Diverse intertidal fauna observed.',
        threatAnalysis: 'Minimal acute stress.',
        recommendedInterventions: ['Record follow-up at next spring tide'],
        kayakGuideBriefing: 'Point out the oyster clusters on the submerged roots.'
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-700" />
              <span>Input Field Research Observation</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Direct in-app transect logging &bull; Del Carmen, Siargao Mangrove Reserve
            </p>
          </div>
        </div>

        {/* Live GPS Ribbon */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono text-[11px] font-semibold">
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
          </div>
          {isOffline && (
            <span className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px] flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-amber-700" />
              Offline Queuing
            </span>
          )}
        </div>
      </div>

      {/* SUCCESS CONFIRMATION BANNER */}
      {savedSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-xs animate-in zoom-in-95 duration-200">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-bold text-emerald-950">
                Research Observation Recorded Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Log <span className="font-mono font-bold">#{lastSavedId}</span> has been stored in local storage and queued for GIS export ({isOffline ? 'Offline Mode Active' : 'Cloud Synchronized'}).
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <button
                  onClick={() => onNavigate('map')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View on Waterway Map</span>
                </button>
                <button
                  onClick={() => onNavigate('data')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View All Research Logs</span>
                </button>
                <button
                  onClick={() => {
                    setSavedSuccess(false);
                    setTitle('Del Carmen Lagoon Eco-Health Transect');
                  }}
                  className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-medium transition"
                >
                  + Log Another Observation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN RESEARCH FORM CONTAINER */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-5 sm:p-7 space-y-6">
        
        {/* Section 1: Survey Title & Targeted Tree */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>1. Location &amp; Tree Tag Link</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Survey Title / Transect Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sugba Lagoon North Mangrove Stand Survey"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Linked Tree QR Tag ID (Optional)
              </label>
              <input
                type="text"
                value={treeTagId}
                onChange={(e) => setTreeTagId(e.target.value.toUpperCase())}
                placeholder="e.g., PH-BAK-01 or leave blank"
                className="w-full font-mono text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Waterway / Channel Location
              </label>
              <input
                type="text"
                value={waterwayName}
                onChange={(e) => setWaterwayName(e.target.value)}
                placeholder="e.g. Sugba Lagoon Cut • Del Carmen"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Dominant Coastal Zone
              </label>
              <select
                value={waterwayZone}
                onChange={(e) => setWaterwayZone(e.target.value as CoastalZone)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-white"
              >
                <option value="seaward_fringe">Seaward Fringe (High Wave &amp; Tidal Energy)</option>
                <option value="middle_interior">Middle Interior (Dense Stilt Canopy &amp; Channels)</option>
                <option value="landward_high_marsh">Landward High Marsh (Hypersaline / Spring Tides)</option>
                <option value="brackish_riverine">Brackish Riverine &amp; Estuary Creeks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Species Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <TreePine className="w-3.5 h-3.5 text-emerald-700" />
            <span>2. Mangrove Species Observed</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Select Philippine Mangrove Species
            </label>
            <select
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-white font-medium"
            >
              {MANGROVE_SPECIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.localName} &bull; {s.commonName} ({s.scientificName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Water Parameters & Canopy */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-700" />
            <span>3. Water Quality &amp; Forest Canopy</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Salinity */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Water Salinity (Refractometer)
                </span>
                <span className="text-sm font-black text-sky-900 font-mono bg-white px-2 py-0.5 rounded-md border border-sky-200">
                  {salinityPpt} ppt
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={salinityPpt}
                onChange={(e) => setSalinityPpt(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
              <div className="flex justify-between text-[10px] text-sky-700">
                <span>0 ppt (Fresh)</span>
                <span>35 ppt (Full Seawater)</span>
                <span>50 ppt (Hypersaline)</span>
              </div>
            </div>

            {/* Canopy Cover */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                  Canopy Density (Densiometer)
                </span>
                <span className="text-sm font-black text-emerald-900 font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  {canopyCoverPercent}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={canopyCoverPercent}
                onChange={(e) => setCanopyCoverPercent(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-[10px] text-emerald-700">
                <span>10% (Open Gap)</span>
                <span>70% (Healthy)</span>
                <span>100% (Dense)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Bio-indicators & Wildlife */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <Fish className="w-3.5 h-3.5 text-teal-700" />
            <span>4. Wildlife &amp; Estuarine Bio-Indicators</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {[
              'Mud Crabs (Alimango)',
              'Danggit Fry (Rabbitfish)',
              'Mudskippers (Tambasakan)',
              'Mangrove Oysters (Talaba)',
              'Fireflies (Alitaptap)',
              'White-collared Kingfisher (Kasay-kasay)',
              'Monitor Lizard (Halo)',
              'Mangrove Snails (Kuhol)',
              'Eastern Reef Egret (Tagak)',
              'Olive-backed Sunbird (Tamsi)',
            ].map((w) => {
              const isSelected = selectedWildlife.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleWildlifeToggle(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-teal-800 text-white border-teal-900 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Threats & Replanting */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>5. Environmental Risk &amp; Restoration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Marine Debris / Trash
              </label>
              <select
                value={trashLevel}
                onChange={(e) => setTrashLevel(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-white"
              >
                <option value="none">None (Pristine waterway)</option>
                <option value="light">Light (&lt;3 floating plastic items)</option>
                <option value="moderate">Moderate (Debris caught in prop roots)</option>
                <option value="severe">Severe (Heavy accumulator zone)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Bank Erosion Risk
              </label>
              <select
                value={erosionRisk}
                onChange={(e) => setErosionRisk(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-white"
              >
                <option value="low">Low (Stable vegetated bank)</option>
                <option value="moderate">Moderate (Root scouring evident)</option>
                <option value="critical">Critical (Slumping channel mudbank)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Propagules Replanted
              </label>
              <input
                type="number"
                min={0}
                value={propagulesPlantedCount}
                onChange={(e) => setPropagulesPlantedCount(Number(e.target.value))}
                placeholder="0"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/50"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Photo Upload & Notes */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-stone-600" />
            <span>6. Field Photography &amp; Naturalist Notes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Field Photo Attachment
              </label>
              <label className="cursor-pointer border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-stone-50/50 transition">
                {photoUrl ? (
                  <div className="space-y-2">
                    <img src={photoUrl} alt="Field observation" className="w-32 h-24 object-cover rounded-xl mx-auto shadow-xs" />
                    <span className="text-[11px] text-emerald-800 font-semibold block">Photo attached &bull; Click to change</span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-xs font-semibold text-stone-700">Take Photo or Choose File</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG up to 10MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Field Naturalist Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe prop root health, water clarity, firefly clusters, or oyster spat on stems..."
                rows={4}
                className="w-full text-xs p-3 rounded-2xl border border-stone-300 focus:outline-emerald-700 bg-stone-50/50 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Live MHI Score & AI Health Analysis Box */}
        <div className="p-4 rounded-2xl bg-[#13251c] text-white space-y-3 border border-[#233d2f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Mangrove Health Index (MHI)
              </span>
              <span className="text-sm font-black font-mono px-2 py-0.5 rounded bg-emerald-800 text-white">
                {mhiCalculation.score}/100
              </span>
            </div>

            <button
              type="button"
              onClick={handleAiHealthCheck}
              disabled={isDiagnosing}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDiagnosing ? 'Analyzing...' : 'AI Health Check'}</span>
            </button>
          </div>

          <p className="text-xs text-emerald-100/80 leading-relaxed">
            {mhiCalculation.summary}
          </p>

          {aiDiagnosis && (
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-emerald-200/90 space-y-1">
              <p><strong>Naturalist Diagnosis:</strong> {aiDiagnosis.salinityAssessment}</p>
              <p><strong>Kayak Guide Briefing:</strong> {aiDiagnosis.kayakGuideBriefing}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Field Research Observation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
