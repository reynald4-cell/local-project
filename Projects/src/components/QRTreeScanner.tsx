import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Camera, 
  Upload, 
  TreePine, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Printer, 
  RefreshCw, 
  ExternalLink,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import { TreeTagData } from '../types';
import { INITIAL_TREE_TAGS, MANGROVE_SPECIES } from '../data/mangroveDatabase';

interface QRTreeScannerProps {
  treeTags: TreeTagData[];
  onSelectTreeForLog?: (tag: TreeTagData) => void;
  isOffline: boolean;
}

export const QRTreeScanner: React.FC<QRTreeScannerProps> = ({
  treeTags = INITIAL_TREE_TAGS,
  onSelectTreeForLog,
  isOffline,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'simulate' | 'generator'>('camera');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedTagData, setScannedTagData] = useState<TreeTagData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // QR Tag Generator States
  const [genSpeciesId, setGenSpeciesId] = useState<string>('rhizophora_mucronata');
  const [genTagId, setGenTagId] = useState<string>('PH-RESTORE-12');
  const [genWaterway, setGenWaterway] = useState<string>('Sugba Lagoon Cut • Del Carmen');
  const [genLat, setGenLat] = useState<string>('9.8660');
  const [genLng, setGenLng] = useState<string>('125.9650');
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser or context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access device camera. Please check camera permissions or use the Test Tags below.');
      setIsScanning(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode]);

  // Continuously scan video frame with jsQR
  const scanVideoFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            handleDecodedQrText(code.data);
            return;
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  // Decode uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            handleDecodedQrText(code.data);
          } else {
            alert('No mangrove tree QR code detected in this photo. Please try a clearer angle or choose a sample tag.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Process decoded QR text (e.g. "MNG-RED-042" or a JSON payload or URL)
  const handleDecodedQrText = (text: string) => {
    stopCamera();

    let tagId = text.trim();
    // Support URL format e.g. https://mangrove.eco/tag/MNG-RED-042
    if (tagId.includes('/tag/')) {
      tagId = tagId.split('/tag/')[1];
    } else if (tagId.startsWith('{')) {
      try {
        const obj = JSON.parse(tagId);
        if (obj.tagId) tagId = obj.tagId;
      } catch {
        // ignore
      }
    }

    // Match with known tree tags or generate synthetic tag
    const found = treeTags.find((t) => t.tagId.toLowerCase() === tagId.toLowerCase());
    if (found) {
      setScannedTagData(found);
    } else {
      // Create record for unidentified tag
      const fallbackTag: TreeTagData = {
        tagId: tagId.toUpperCase(),
        speciesId: 'rhizophora_mangle',
        commonName: 'Red Mangrove (Field Tagged)',
        scientificName: 'Rhizophora mangle',
        taggedDate: new Date().toISOString().split('T')[0],
        lat: 25.1384,
        lng: -80.4421,
        waterwayName: 'Field Transect Channel',
        dbhCm: 26.5,
        heightMeters: 7.2,
        canopySpreadMeters: 5.5,
        estimatedAgeYears: 30,
        carbonSequestrationKgPerYr: 28.5,
        healthRating: 4,
        healthStatus: 'healthy',
        waveDampeningEffectPercent: 65,
        nurserySignificance: 'Prop root bio-refuge for estuarine juvenile fauna',
        lastSurveyDate: new Date().toISOString().split('T')[0],
        surveyor: 'Field Kayak Naturalist',
        restorationOrigin: false,
        notes: `QR Tag #${tagId} scanned from mangrove branch in remote coastal zone.`
      };
      setScannedTagData(fallbackTag);
    }
  };

  // Generate a new printable QR Tag
  const handleGenerateQr = async () => {
    const selectedSpecies = MANGROVE_SPECIES.find((s) => s.id === genSpeciesId);
    const tagPayload = JSON.stringify({
      tagId: genTagId,
      species: selectedSpecies?.scientificName,
      common: selectedSpecies?.commonName,
      waterway: genWaterway,
      coords: `${genLat},${genLng}`,
      created: new Date().toISOString().split('T')[0]
    });

    try {
      const url = await QRCode.toDataURL(tagPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#064e3b',
          light: '#ffffff',
        },
      });
      setGeneratedQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  useEffect(() => {
    handleGenerateQr();
  }, [genSpeciesId, genTagId, genWaterway, genLat, genLng]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              Mangrove Research Tree Tag Scanner
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Scan waterproof QR tags hung on monitored mother trees and restoration seedlings along kayak trails.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="qr-mode-camera"
              onClick={() => setActiveMode('camera')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
                activeMode === 'camera'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>
            <button
              id="qr-mode-upload"
              onClick={() => setActiveMode('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
                activeMode === 'upload'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Photo Upload</span>
            </button>
            <button
              id="qr-mode-generator"
              onClick={() => setActiveMode('generator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1 ${
                activeMode === 'generator'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate New Tag</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK DEMO / SIMULATE SECTION: HANGING TREE TAGS ALONG TRAIL */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
          <div>
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-emerald-700" />
              Simulate Kayak Trail Tags (Click any tag below to test scan instantly):
            </span>
            <p className="text-[11px] text-emerald-800">
              In the field, these laminated weatherproof QR cards hang directly on mangrove branches.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-900 uppercase bg-emerald-200/70 px-2 py-0.5 rounded">
            5 Estuary Tags Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {treeTags.map((tag) => (
            <button
              key={tag.tagId}
              id={`simulate-scan-${tag.tagId}`}
              onClick={() => handleDecodedQrText(tag.tagId)}
              className={`p-2 rounded-lg text-left border transition ${
                scannedTagData?.tagId === tag.tagId
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-semibold'
                  : 'bg-white hover:bg-emerald-100/60 text-slate-800 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold">{tag.tagId}</span>
                <QrCode className="w-3.5 h-3.5 opacity-70" />
              </div>
              <div className="text-[11px] truncate mt-0.5 opacity-90">{tag.commonName}</div>
              <div className="text-[10px] opacity-75">{tag.waterwayName.split('/')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SCANNING WORKSPACES */}
      {activeMode === 'camera' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md aspect-4/3 flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Reticle */}
              {isScanning && !cameraError && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />
                    {/* Scanning animated beam */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                  </div>
                  <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full mt-4 backdrop-blur-xs font-medium">
                    Point camera at tree QR tag
                  </span>
                </div>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div className="p-6 text-center text-slate-300 max-w-sm">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white mb-1">Camera Stream Inactive</p>
                  <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Camera
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span>Status: {isScanning ? 'Actively searching for QR tag...' : 'Camera standby'}</span>
              <span className="text-emerald-700 font-medium">Auto-detects branch QR tags</span>
            </div>
          </div>

          {/* Scanned Tag Result Card */}
          <div className="lg:col-span-5">
            {scannedTagData ? (
              <TreeDossierCard
                tag={scannedTagData}
                onSelectTreeForLog={onSelectTreeForLog}
                onClear={() => setScannedTagData(null)}
              />
            ) : (
              <div className="h-full min-h-[320px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <QrCode className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Tree Tag Scanned Yet</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Aim your camera at a tagged mangrove or click one of the sample research tags above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHOTO UPLOAD MODE */}
      {activeMode === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-emerald-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Mangrove Tag Photo</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Select a photo of a tree tag taken on the water. The scanner will extract the research tag code offline.
            </p>
            <label className="cursor-pointer px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs transition shadow-xs flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Choose Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="lg:col-span-6">
            {scannedTagData ? (
              <TreeDossierCard
                tag={scannedTagData}
                onSelectTreeForLog={onSelectTreeForLog}
                onClear={() => setScannedTagData(null)}
              />
            ) : (
              <div className="h-full min-h-[250px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-center text-slate-400">
                <p className="text-xs text-slate-500">Decoded tree scientific passport will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GENERATE NEW QR TAG MODE */}
      {activeMode === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                Generate Research QR Tag for Mangrove Branch
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Create printable waterproof field cards for newly planted restoration cohorts or monitored mother trees.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specimen Tag ID
              </label>
              <input
                type="text"
                value={genTagId}
                onChange={(e) => setGenTagId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                placeholder="e.g. MNG-RESTORE-12"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mangrove Species
              </label>
              <select
                value={genSpeciesId}
                onChange={(e) => setGenSpeciesId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                {MANGROVE_SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName} ({s.scientificName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waterway / Kayak Trail Location
              </label>
              <input
                type="text"
                value={genWaterway}
                onChange={(e) => setGenWaterway(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
                placeholder="e.g. North Channel Transect Point 4"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GPS Latitude
                </label>
                <input
                  type="text"
                  value={genLat}
                  onChange={(e) => setGenLat(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GPS Longitude
                </label>
                <input
                  type="text"
                  value={genLng}
                  onChange={(e) => setGenLng(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateQr}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Update QR Card
            </button>
          </div>

          {/* Printable Card Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-emerald-600 shadow-md text-center max-w-xs w-full space-y-3">
              <div className="bg-emerald-900 text-white py-1 px-3 rounded-md text-[10px] font-bold tracking-wider uppercase">
                Coastal Estuary Bio-Monitoring Tag
              </div>

              {generatedQrDataUrl ? (
                <div className="p-2 bg-slate-50 rounded-lg inline-block border border-slate-200">
                  <img src={generatedQrDataUrl} alt="Generated QR" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}

              <div>
                <div className="text-base font-mono font-black text-slate-900">{genTagId}</div>
                <div className="text-xs font-bold text-emerald-800">
                  {MANGROVE_SPECIES.find((s) => s.id === genSpeciesId)?.commonName}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  {MANGROVE_SPECIES.find((s) => s.id === genSpeciesId)?.scientificName}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">{genWaterway}</div>
                <div className="text-[9px] font-mono text-slate-400">{genLat}°N, {genLng}°W</div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-400">
                Scan with Kayak Guide App &bull; Do not remove from branch
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Waterproof Tag Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Tree Dossier Card when a tag is scanned
interface TreeDossierCardProps {
  tag: TreeTagData;
  onSelectTreeForLog?: (tag: TreeTagData) => void;
  onClear: () => void;
}

const TreeDossierCard: React.FC<TreeDossierCardProps> = ({ tag, onSelectTreeForLog, onClear }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-emerald-300 overflow-hidden space-y-0 animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black bg-emerald-700 px-2 py-0.5 rounded text-white tracking-wider">
              TAG #{tag.tagId}
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-emerald-200 font-semibold uppercase">
              {tag.healthStatus}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5">{tag.commonName}</h3>
          <p className="text-xs italic text-emerald-200 font-serif">{tag.scientificName}</p>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3 text-xs text-slate-700">
        {/* Geo & Location */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-900">{tag.waterwayName}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {tag.lat.toFixed(4)}°N, {tag.lng.toFixed(4)}°W
          </span>
        </div>

        {/* Morphometrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Trunk DBH</span>
            <span className="text-xs font-bold text-slate-900">{tag.dbhCm} cm</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Height</span>
            <span className="text-xs font-bold text-slate-900">{tag.heightMeters} m</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Estimated Age</span>
            <span className="text-xs font-bold text-slate-900">~{tag.estimatedAgeYears} yrs</span>
          </div>
        </div>

        {/* Blue Carbon & Wave Attenuation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Blue Carbon Rate</span>
            <span className="text-sm font-black text-emerald-800">
              {tag.carbonSequestrationKgPerYr} kg CO₂/yr
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Wave Energy Buffer</span>
            <span className="text-sm font-black text-blue-800">
              -{tag.waveDampeningEffectPercent}% Wave Force
            </span>
          </div>
        </div>

        {/* Nursery Role */}
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 block">Nursery Significance:</span>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
            {tag.nurserySignificance}
          </p>
        </div>

        {/* Guide Field Notes */}
        <div className="text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-[11px]">
          <span className="font-semibold text-amber-950 block mb-0.5">Guide Tag Notes:</span>
          {tag.notes}
        </div>

        {/* Meta Survey Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Last survey: {tag.lastSurveyDate}
          </span>
          <span>Surveyor: {tag.surveyor}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
        <button
          onClick={onClear}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          Scan Another
        </button>
        {onSelectTreeForLog && (
          <button
            id="log-survey-for-tree-btn"
            onClick={() => onSelectTreeForLog(tag)}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Log Survey for This Tree</span>
          </button>
        )}
      </div>
    </div>
  );
};
