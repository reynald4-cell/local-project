import React, { useEffect, useState } from 'react';
import { 
  TreePine, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Upload, 
  Droplets, 
  ShieldCheck, 
  Layers, 
  Info, 
  X, 
  Volume2,
  Star
} from 'lucide-react';
import { MangroveSpecies } from '../types';
import { MANGROVE_SPECIES, identifySpeciesOffline } from '../data/mangroveDatabase';

const FAVORITE_SPECIES_STORAGE_KEY = 'MANGROVE_FAVORITE_SPECIES_V1';
const speciesIds = new Set(MANGROVE_SPECIES.map((species) => species.id));

const loadFavoriteSpeciesIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedValue = window.localStorage.getItem(FAVORITE_SPECIES_STORAGE_KEY);
    if (!storedValue) return [];

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return [];

    return [...new Set(
      parsedValue.filter(
        (speciesId): speciesId is string =>
          typeof speciesId === 'string' && speciesIds.has(speciesId)
      )
    )];
  } catch (error) {
    console.warn('Unable to load favorite species:', error);
    return [];
  }
};

interface SpeciesGuideProps {
  isOffline: boolean;
  onSelectForLog?: (species: MangroveSpecies) => void;
}

export const SpeciesGuide: React.FC<SpeciesGuideProps> = ({ isOffline, onSelectForLog }) => {
  const [activeSubTab, setActiveSubTab] = useState<'key' | 'ai' | 'browse'>('key');
  const [selectedSpecies, setSelectedSpecies] = useState<MangroveSpecies | null>(null);
  const [favoriteSpeciesIds, setFavoriteSpeciesIds] = useState<string[]>(loadFavoriteSpeciesIds);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Key Filter States
  const [rootFilter, setRootFilter] = useState<string>('');
  const [leafFilter, setLeafFilter] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [salinityInput, setSalinityInput] = useState<number>(32);

  // AI & Observation states
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FAVORITE_SPECIES_STORAGE_KEY,
        JSON.stringify(favoriteSpeciesIds)
      );
    } catch (error) {
      console.error('Unable to save favorite species:', error);
    }
  }, [favoriteSpeciesIds]);

  const favoriteSpeciesIdSet = new Set(favoriteSpeciesIds);
  const browsedSpecies = showFavoritesOnly
    ? MANGROVE_SPECIES.filter((species) => favoriteSpeciesIdSet.has(species.id))
    : MANGROVE_SPECIES;

  const toggleFavoriteSpecies = (speciesId: string) => {
    setFavoriteSpeciesIds((currentIds) =>
      currentIds.includes(speciesId)
        ? currentIds.filter((id) => id !== speciesId)
        : [...currentIds, speciesId]
    );
  };

  const renderFavoriteButton = (species: MangroveSpecies, darkBackground = false) => {
    const isFavorite = favoriteSpeciesIdSet.has(species.id);
    const action = isFavorite ? 'Remove from field shortlist' : 'Add to field shortlist';

    return (
      <button
        type="button"
        onClick={() => toggleFavoriteSpecies(species.id)}
        aria-label={`${action}: ${species.commonName}`}
        aria-pressed={isFavorite}
        title={action}
        className={`p-2 rounded-lg border transition ${
          isFavorite
            ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
            : darkBackground
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-300'
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-300'
        }`}
      >
        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
    );
  };

  // Quick offline key matching calculation
  const keyResults = identifySpeciesOffline({
    rootType: rootFilter || undefined,
    leafType: leafFilter || undefined,
    zone: zoneFilter || undefined,
    salinity: salinityInput,
  });

  const resetFilters = () => {
    setRootFilter('');
    setLeafFilter('');
    setZoneFilter('');
    setSalinityInput(32);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiIdentify = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    setAiResult(null);

    if (isOffline) {
      // Offline fallback: Use the botanical key algorithm
      setTimeout(() => {
        const topMatch = keyResults[0];
        setAiResult({
          identifiedSpecies: `${topMatch.species.scientificName} (${topMatch.species.commonName})`,
          confidenceScore: topMatch.confidence,
          keyDiagnosticFeatures: [
            topMatch.species.rootDescription,
            topMatch.species.leafDescription,
            `Salinity tolerance: ${topMatch.species.salinityTolerancePpt}`
          ],
          salinityTolerance: topMatch.species.salinityTolerancePpt,
          rootSystem: topMatch.species.rootDescription,
          ecologicalRole: topMatch.species.ecologicalRoles[0],
          guideTip: topMatch.species.guideFieldTips,
          restorationAdvice: 'Monitored via local offline botanical criteria. Ensure seedlings are securely anchored in appropriate tidal zone.',
          isOfflineSimulated: true
        });
        setIsAnalyzing(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/identify-species', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observationText: fieldNotes,
          rootType: rootFilter,
          leafType: leafFilter,
          zone: zoneFilter,
          photoBase64: photoPreview,
          mimeType: photoPreview ? 'image/jpeg' : undefined
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.warn('AI identification request failed, switching to offline botanical key:', err);
      const topMatch = keyResults[0];
      setAiResult({
        identifiedSpecies: `${topMatch.species.scientificName} (${topMatch.species.commonName})`,
        confidenceScore: 85,
        keyDiagnosticFeatures: [
          topMatch.species.rootDescription,
          topMatch.species.leafDescription,
          `Salinity tolerance: ${topMatch.species.salinityTolerancePpt}`
        ],
        salinityTolerance: topMatch.species.salinityTolerancePpt,
        rootSystem: topMatch.species.rootDescription,
        ecologicalRole: topMatch.species.ecologicalRoles[0],
        guideTip: topMatch.species.guideFieldTips,
        restorationAdvice: 'Identified through offline botanical diagnostics. Verify prop roots and leaf glands.',
        isOfflineSimulated: true
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakGuideTip = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode Switcher */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-emerald-600" />
              Mangrove Species Field Guide &amp; Identification
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Botanical diagnostics, root architecture analysis &amp; blue carbon metrics for coastal kayakers.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              id="subtab-key"
              onClick={() => setActiveSubTab('key')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeSubTab === 'key'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Field Key
            </button>
            <button
              id="subtab-ai"
              onClick={() => setActiveSubTab('ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
                activeSubTab === 'ai'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>AI Photo &amp; Diagnostic</span>
            </button>
            <button
              id="subtab-browse"
              onClick={() => setActiveSubTab('browse')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeSubTab === 'browse'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Species ({MANGROVE_SPECIES.length})
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: INTERACTIVE BOTANICAL FIELD KEY */}
      {activeSubTab === 'key' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-emerald-600" />
                  Kayak Field Diagnostic Key
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reset
                </button>
              </div>

              {/* 1. Root System */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1. Root Architecture (Look into Water / Mud)
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'stilt_prop', label: 'Arching Stilt / Prop Roots', desc: 'Legs walking into water' },
                    { id: 'pneumatophores_pencil', label: 'Pencil / Snorkel Roots', desc: 'Thousands sticking up from mud' },
                    { id: 'knee_elbow', label: 'Knee / Bent Elbow Roots', desc: 'Knobby loops emerging and dipping' },
                    { id: 'no_aerial_roots', label: 'No Aerial Roots / Flat Bark', desc: 'Standard trunk or small peg roots' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRootFilter(rootFilter === r.id ? '' : r.id)}
                      className={`text-left p-2 rounded-lg border text-xs transition flex flex-col ${
                        rootFilter === r.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-[11px] text-slate-500">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Leaf Morphology */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Leaf Characteristics &amp; Underside
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'waxy_elliptic', label: 'Glossy Waxy Dark Green', desc: 'Yellowish underside, opposite pairs' },
                    { id: 'salt_excreting_silvery', label: 'Silvery Bottom with Salt Crystals', desc: 'Tastes visibly salty!' },
                    { id: 'petiole_glands', label: 'Two Raised Glands on Leaf Stem', desc: 'Two little bumps near base' },
                    { id: 'leathery_pointed', label: 'Alternate Pointed with Button Fruit', desc: 'Staggered along branch' },
                    { id: 'broad_obovate', label: 'Large Rounded with Scarlet Flower', desc: 'Deep green, bell/star flowers' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLeafFilter(leafFilter === l.id ? '' : l.id)}
                      className={`text-left p-2 rounded-lg border text-xs transition flex flex-col ${
                        leafFilter === l.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-semibold">{l.label}</span>
                      <span className="text-[11px] text-slate-500">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tidal Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Coastal Waterway Zone (Kayak Position)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'seaward_fringe', label: 'Seaward Fringe' },
                    { id: 'mid_intertidal', label: 'Mid-Intertidal Creek' },
                    { id: 'inland_basin', label: 'Inland Basin / Mudflat' },
                    { id: 'coastal_transition', label: 'Upland Bluff Transition' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setZoneFilter(zoneFilter === z.id ? '' : z.id)}
                      className={`p-2 rounded-lg border text-xs text-center transition ${
                        zoneFilter === z.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Water Salinity Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                  <span>Water Salinity:</span>
                  <span className="text-emerald-700 font-bold">{salinityInput} ppt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="65"
                  value={salinityInput}
                  onChange={(e) => setSalinityInput(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Fresh (0)</span>
                  <span>Brackish (15)</span>
                  <span>Ocean (35)</span>
                  <span>Hypersaline (60+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Matched Species Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Diagnostic Results ({keyResults.length} species evaluated)
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  {rootFilter || leafFilter || zoneFilter ? 'Filters Applied' : 'Showing all in priority order'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyResults.map(({ species, confidence, reasons }) => (
                  <div
                    key={species.id}
                    id={`species-card-${species.id}`}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${species.badgeBg}`}>
                            {species.iucnStatus}
                          </span>
                          <h4 className="text-base font-bold text-stone-900 mt-1 flex items-center gap-1.5">
                            <span>{species.localName}</span>
                            <span className="text-xs font-normal text-stone-500">({species.commonName})</span>
                          </h4>
                          <p className="text-xs italic text-emerald-800 font-serif font-medium">
                            {species.scientificName} &bull; {species.family}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <span className="text-lg font-black text-emerald-700">
                              {confidence}%
                            </span>
                            <span className="block text-[10px] text-slate-500 font-medium">match</span>
                          </div>
                          {renderFavoriteButton(species)}
                        </div>
                      </div>

                      {/* Diagnostic Match Reasons */}
                      <div className="space-y-1 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                        <div className="font-semibold text-emerald-950 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Diagnostic Indicators:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {reasons.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-slate-600 line-clamp-2">
                        <strong>Root:</strong> {species.rootDescription}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          Max: {species.salinityMaxPpt} ppt
                        </span>
                        <span className="flex items-center gap-1 font-medium text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {species.blueCarbonRateKgPerYear} kg CO₂/yr
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedSpecies(species)}
                        className="flex-1 px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition text-center"
                      >
                        Scientific Profile
                      </button>
                      {onSelectForLog && (
                        <button
                          onClick={() => onSelectForLog(species)}
                          className="flex-1 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition text-center"
                        >
                          Log This Specimen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI PHOTO & FIELD OBSERVATION DIAGNOSTIC */}
      {activeSubTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Naturalist Specimen Identifier
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Upload a photo of mangrove roots, leaves, or propagules from your kayak paddle, or describe your observation in detail.
                </p>
              </div>

              {/* Photo Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attach Kayak Field Photo
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold transition">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Take or Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                {photoPreview && (
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 h-44 bg-slate-900 flex items-center justify-center">
                    <img
                      src={photoPreview}
                      alt="Field observation"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Field Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Field Description / Observational Notes
                </label>
                <textarea
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  placeholder="e.g. Tree observed on the outer fringe with arching stilt roots standing in 2 feet of water. Long green pencil-like seed pods hanging down..."
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              {/* Submit Button */}
              <button
                id="run-ai-identify-btn"
                onClick={handleAiIdentify}
                disabled={isAnalyzing}
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Botanical Morphometrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isOffline ? 'Run Offline Diagnostic Key' : 'Analyze Specimen with AI'}
                    </span>
                  </>
                )}
              </button>

              {isOffline && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Remote mode active: Diagnostic analysis will run via onboard botanical key logic.
                </p>
              )}
            </div>
          </div>

          {/* AI Result Card */}
          <div className="lg:col-span-6">
            {aiResult ? (
              <div className="bg-white rounded-xl shadow-xs border border-emerald-300 p-5 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      Identification Result
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-1">
                      {aiResult.identifiedSpecies}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-700">
                      {aiResult.confidenceScore}%
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">confidence</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Diagnostic Features:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {aiResult.keyDiagnosticFeatures?.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500 block">Salinity Tolerance</span>
                      <span className="text-xs font-bold text-slate-800">{aiResult.salinityTolerance}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500 block">Root System</span>
                      <span className="text-xs font-bold text-slate-800">{aiResult.rootSystem}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Ecological Role:</span>
                    <p className="text-slate-600">{aiResult.ecologicalRole}</p>
                  </div>

                  {aiResult.guideTip && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-950">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1 text-xs">
                          <Info className="w-3.5 h-3.5 text-emerald-700" />
                          Kayak Guide Interpretation Script:
                        </span>
                        <button
                          onClick={() => speakGuideTip(aiResult.guideTip)}
                          className="text-emerald-700 hover:text-emerald-800 text-[11px] flex items-center gap-1 font-semibold"
                        >
                          <Volume2 className="w-3 h-3" />
                          Play Audio
                        </button>
                      </div>
                      <p className="text-xs italic text-slate-700">"{aiResult.guideTip}"</p>
                    </div>
                  )}

                  {aiResult.restorationAdvice && (
                    <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-blue-900 text-xs">
                      <strong>Restoration &amp; Planting Note:</strong> {aiResult.restorationAdvice}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <TreePine className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No Analysis Run Yet</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Upload a photo or enter field notes from your kayak paddle to get instant botanical identification and guide interpretation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: ALL SPECIES BROWSE */}
      {activeSubTab === 'browse' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Field shortlist</h3>
              <p className="text-xs text-slate-500">
                {favoriteSpeciesIds.length} species saved on this device
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto" role="group" aria-label="Filter species list">
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(false)}
                aria-pressed={!showFavoritesOnly}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  !showFavoritesOnly
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All species
              </button>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(true)}
                aria-pressed={showFavoritesOnly}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} aria-hidden="true" />
                Shortlist ({favoriteSpeciesIds.length})
              </button>
            </div>
          </div>

          {browsedSpecies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {browsedSpecies.map((species) => (
                <div
                  key={species.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${species.badgeBg}`}>
                          {species.iucnStatus}
                        </span>
                        <h3 className="text-base font-bold text-stone-900 mt-1">
                          {species.localName}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {species.commonName}
                        </p>
                        <p className="text-xs italic text-emerald-800 font-serif font-medium">
                          {species.scientificName}
                        </p>
                      </div>
                      {renderFavoriteButton(species)}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {species.rootDescription}
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tidal Zone:</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {species.dominantZone.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Salinity:</span>
                        <span className="font-semibold text-slate-800">
                          Up to {species.salinityMaxPpt} ppt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Blue Carbon:</span>
                        <span className="font-semibold text-emerald-700">
                          {species.blueCarbonRateKgPerYear} kg CO₂/yr
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Companion Estuarine Wildlife:</span>
                      <div className="flex flex-wrap gap-1">
                        {species.companionWildlife.slice(0, 3).map((w, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSpecies(species)}
                      className="w-full py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
                    >
                      View Full Field Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-12 px-6 text-center">
              <Star className="w-9 h-9 text-slate-300 mx-auto mb-2" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-700">Your field shortlist is empty</h3>
              <p className="text-xs text-slate-500 mt-1">
                Show all species, then select a star to save specimens for quick field reference.
              </p>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(false)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
              >
                Browse all species
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULL SCIENTIFIC SPECIES DOSSIER MODAL */}
      {selectedSpecies && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${selectedSpecies.badgeBg}`}>
                  IUCN: {selectedSpecies.iucnStatus}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  <span>{selectedSpecies.localName}</span>
                  <span className="text-sm font-normal text-emerald-300">({selectedSpecies.commonName})</span>
                </h3>
                <p className="text-xs italic text-emerald-200 font-serif">
                  {selectedSpecies.scientificName} &bull; Family {selectedSpecies.family}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {renderFavoriteButton(selectedSpecies, true)}
                <button
                  onClick={() => setSelectedSpecies(null)}
                  aria-label="Close species dossier"
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Botanical Traits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Root Architecture
                  </span>
                  <p className="text-slate-600">{selectedSpecies.rootDescription}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                    Leaf Morphology &amp; Glands
                  </span>
                  <p className="text-slate-600">{selectedSpecies.leafDescription}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    Propagules &amp; Reproduction
                  </span>
                  <p className="text-slate-600">{selectedSpecies.propaguleDescription}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Salinity &amp; Osmoregulation
                  </span>
                  <p className="text-slate-600">{selectedSpecies.salinityTolerancePpt}</p>
                </div>
              </div>

              {/* Blue Carbon & Storm Protection Stats */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-emerald-950">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Blue Carbon Sequestration Rate
                  </span>
                  <span className="text-lg font-black text-emerald-800">
                    {selectedSpecies.blueCarbonRateKgPerYear} kg CO₂ / tree / year
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Dominant Estuarine Niche
                  </span>
                  <span className="text-xs font-bold text-emerald-900 capitalize">
                    {selectedSpecies.dominantZone.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Naturalist Guide Interpretation Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-700" />
                    Kayak Guide Interpretation Briefing:
                  </span>
                  <button
                    onClick={() => speakGuideTip(selectedSpecies.guideFieldTips)}
                    className="text-amber-800 hover:text-amber-900 text-xs font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Speak aloud
                  </button>
                </div>
                <p className="text-xs italic text-slate-700 leading-relaxed">
                  "{selectedSpecies.guideFieldTips}"
                </p>
              </div>

              {/* Ecological Roles */}
              <div>
                <span className="font-bold text-slate-900 block mb-1.5">
                  Coastal Ecosystem Functions:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {selectedSpecies.ecologicalRoles.map((role, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Companion Wildlife */}
              <div>
                <span className="font-bold text-slate-900 block mb-1.5">
                  Indicator Estuarine Wildlife Observed Near This Species:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpecies.companionWildlife.map((w, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedSpecies(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition"
              >
                Close Dossier
              </button>
              {onSelectForLog && (
                <button
                  onClick={() => {
                    const sp = selectedSpecies;
                    setSelectedSpecies(null);
                    onSelectForLog(sp);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
                >
                  Log Observation for this Specimen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
