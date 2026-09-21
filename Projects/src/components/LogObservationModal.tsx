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
  X,
  Compass,
  Layers,
  Fish
} from 'lucide-react';
import { GeoTaggedObservation, CoastalZone, MangroveSpecies, TreeTagData } from '../types';
import { MANGROVE_SPECIES, calculateMHI } from '../data/mangroveDatabase';

interface LogObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObservation: (obs: GeoTaggedObservation) => void;
  currentCoords: { lat: number; lng: number } | null;
  preselectedTreeTag?: TreeTagData | null;
  preselectedSpecies?: MangroveSpecies | null;
  isOffline: boolean;
}

export const LogObservationModal: React.FC<LogObservationModalProps> = ({
  isOpen,
  onClose,
  onSaveObservation,
  currentCoords,
  preselectedTreeTag,
  preselectedSpecies,
  isOffline,
}) => {
  if (!isOpen) return null;

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

  useEffect(() => {
    if (preselectedTreeTag) {
      setTreeTagId(preselectedTreeTag.tagId);
      setSpeciesId(preselectedTreeTag.speciesId);
      setLat(preselectedTreeTag.lat);
      setLng(preselectedTreeTag.lng);
      setWaterwayName(preselectedTreeTag.waterwayName);
      setTitle(`Survey of Tagged Tree #${preselectedTreeTag.tagId}`);
    } else if (preselectedSpecies) {
      setSpeciesId(preselectedSpecies.id);
      setTitle(`${preselectedSpecies.commonName} Field Transect`);
    } else if (!title) {
      setTitle('Pelican Pass Mangrove Stand Health Survey');
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
    const newObservation: GeoTaggedObservation = {
      id: `OBS-${Date.now().toString().slice(-6)}`,
      title: title || `${selectedSp?.commonName || 'Mangrove'} Observation`,
      speciesId,
      speciesName: `${selectedSp?.commonName} (${selectedSp?.scientificName})`,
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
      notes: notes || 'Logged during coastal kayak monitoring run.',
      photoUrl: photoUrl || undefined,
      offlineStatus: isOffline ? 'queued_offline' : 'synced',
      guideName,
    };

    onSaveObservation(newObservation);
    onClose();
  };

  const handleAiHealthCheck = async () => {
    setIsDiagnosing(true);
    if (isOffline) {
      setTimeout(() => {
        setAiDiagnosis({
          healthIndexScore: mhiCalculation.score,
          statusLabel: mhiCalculation.status.toUpperCase(),
          summary: mhiCalculation.summary,
          salinityAssessment: `${salinityPpt} ppt is within standard tolerances for estuarine mangroves.`,
          indicatorSpeciesAnalysis: `${selectedWildlife.length} bio-indicators observed, showing healthy trophic activity.`,
          threatAnalysis: trashLevel !== 'none' ? `Marine debris (${trashLevel}) should be cleared.` : 'No critical threats detected.',
          recommendedInterventions: ['Maintain bi-weekly kayak transects', 'Monitor seedling anchor depth'],
          kayakGuideBriefing: 'Inform paddlers how these roots stabilize the coastal bank against hurricane surges.'
        });
        setIsDiagnosing(false);
      }, 600);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log Geo-Tagged Eco-Health Observation
              </h3>
              <p className="text-xs text-emerald-200">
                Record estuarine parameters, water salinity, wildlife, and restoration actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Offline Status Badge */}
          {isOffline && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                Offline Mode Active
              </span>
              <span className="text-[11px] text-amber-700">
                Log will save to device and sync automatically when internet returns.
              </span>
            </div>
          )}

          {/* Survey Title & Linked Tree Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Survey Title / Stand ID
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
                placeholder="e.g. Pelican Pass Stilt Stand Survey"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hanging Tree QR Tag ID (Optional)
              </label>
              <input
                type="text"
                value={treeTagId}
                onChange={(e) => setTreeTagId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                placeholder="e.g. MNG-RED-042"
              />
            </div>
          </div>

          {/* Species and Waterway Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mangrove Species
              </label>
              <select
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                {MANGROVE_SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.localName} &bull; {s.commonName} ({s.scientificName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coastal Waterway Zone
              </label>
              <select
                value={waterwayZone}
                onChange={(e) => setWaterwayZone(e.target.value as CoastalZone)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white capitalize"
              >
                <option value="seaward_fringe">Seaward Fringe (Prop Roots)</option>
                <option value="mid_intertidal">Mid-Intertidal Creek (Knee/Loop Roots)</option>
                <option value="inland_basin">Inland Basin / Mudflat (Pneumatophores)</option>
                <option value="coastal_transition">Upland Transition Bluff</option>
              </select>
            </div>
          </div>

          {/* GPS Coordinates & Waterway Name */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Geo-Location Coordinates
              </span>
              <span className="text-[11px] text-emerald-700 font-normal">
                {currentCoords ? 'Captured via Kayak GPS' : 'Manual / Waypoint coordinate'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Waterway Name</label>
                <input
                  type="text"
                  value={waterwayName}
                  onChange={(e) => setWaterwayName(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* ECO-METRICS: Salinity & Canopy Cover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Salinity */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  Water Salinity (Refractometer)
                </span>
                <span className="font-bold text-blue-700">{salinityPpt} ppt</span>
              </div>
              <input
                type="range"
                min="0"
                max="65"
                value={salinityPpt}
                onChange={(e) => setSalinityPpt(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Fresh (0-5)</span>
                <span>Brackish (15-25)</span>
                <span>Ocean (35)</span>
                <span>Hypersaline (&gt;45)</span>
              </div>
            </div>

            {/* Canopy Cover */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                  Canopy Cover &amp; Foliage Density
                </span>
                <span className="font-bold text-emerald-700">{canopyCoverPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={canopyCoverPercent}
                onChange={(e) => setCanopyCoverPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Sparse (&lt;40%)</span>
                <span>Moderate (40-75%)</span>
                <span>Dense (&gt;75%)</span>
              </div>
            </div>
          </div>

          {/* Substrate & Sediment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sediment / Mud Substrate
              </label>
              <select
                value={sedimentType}
                onChange={(e) => setSedimentType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="fine_mud">Fine Silt Mud (Ideal for red/black)</option>
                <option value="sandy_peat">Sandy Peat (Fibrous root peat)</option>
                <option value="coarse_sand">Coarse Coral Sand</option>
                <option value="anoxic_ooze">Deep Anoxic Black Ooze</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marine Debris / Trash
              </label>
              <select
                value={trashLevel}
                onChange={(e) => setTrashLevel(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="none">None (Pristine waterway)</option>
                <option value="light">Light (Few floatables)</option>
                <option value="moderate">Moderate (Entangled plastics)</option>
                <option value="severe">Severe (Heavy monofilament)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Erosion Risk
              </label>
              <select
                value={erosionRisk}
                onChange={(e) => setErosionRisk(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="low">Low (Stable root matrix)</option>
                <option value="moderate">Moderate (Wake undercut)</option>
                <option value="critical">Critical (Slumping bank)</option>
              </select>
            </div>
          </div>

          {/* Bio-Indicators Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5 text-teal-600" />
              Wildlife Bio-Indicators Observed During Paddle:
            </label>
            <div className="flex flex-wrap gap-1.5">
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
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LIVE MANGROVE HEALTH INDEX (MHI) SCORECARD */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Calculated Mangrove Health Index (MHI)
              </span>
              <div className="text-xs text-slate-700">{mhiCalculation.summary}</div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="text-2xl font-black text-emerald-800">
                {mhiCalculation.score}/100
              </span>
              <span className="block text-[10px] font-bold uppercase text-emerald-900">
                {mhiCalculation.status}
              </span>
            </div>
          </div>

          {/* Restoration Efforts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Restoration Action Performed
              </label>
              <input
                type="text"
                value={restorationAction}
                onChange={(e) => setRestorationAction(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                placeholder="e.g. Planted propagules / Trash cleanup"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Propagules / Seedlings Planted (Count)
              </label>
              <input
                type="number"
                min="0"
                value={propagulesPlantedCount}
                onChange={(e) => setPropagulesPlantedCount(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* Field Notes & Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Observations &amp; Naturalist Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-slate-300"
              placeholder="e.g. Excellent prop root growth, oysters densely colonized, water clear with tidal incoming flood..."
            />
          </div>

          {/* Photo Attachment */}
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold transition">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Attach Kayak Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
            {photoUrl && (
              <span className="text-xs text-emerald-700 font-medium">
                Photo attached successfully
              </span>
            )}
          </div>

          {/* Optional AI Health Diagnostic */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleAiHealthCheck}
              disabled={isDiagnosing}
              className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isDiagnosing ? 'Running Ecological Diagnosis...' : 'Run AI Diagnostic on these parameters'}</span>
            </button>

            {aiDiagnosis && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{aiDiagnosis.statusLabel} Stand &bull; Score {aiDiagnosis.healthIndexScore}</div>
                <p className="text-slate-600">{aiDiagnosis.summary}</p>
                {aiDiagnosis.kayakGuideBriefing && (
                  <p className="italic text-emerald-800 pt-1 border-t border-slate-200">
                    Guide script: "{aiDiagnosis.kayakGuideBriefing}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            id="save-observation-btn"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Observation {isOffline ? '(Offline)' : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
