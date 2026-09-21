import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  TreePine, 
  Droplets, 
  Calendar, 
  Trash2,
  Filter,
  Layers
} from 'lucide-react';
import { GeoTaggedObservation, RestorationProject } from '../types';

interface RestorationDataViewProps {
  observations: GeoTaggedObservation[];
  restorationProjects: RestorationProject[];
  isOffline: boolean;
  onSync: () => void;
  isSyncing: boolean;
  onDeleteObservation?: (id: string) => void;
}

export const RestorationDataView: React.FC<RestorationDataViewProps> = ({
  observations,
  restorationProjects,
  isOffline,
  onSync,
  isSyncing,
  onDeleteObservation,
}) => {
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedObs, setSelectedObs] = useState<GeoTaggedObservation | null>(null);

  const pendingOfflineLogs = observations.filter((o) => o.offlineStatus === 'queued_offline');
  const totalPlanted = observations.reduce((acc, curr) => acc + (curr.propagulesPlantedCount || 0), 0) + 
    restorationProjects.reduce((acc, curr) => acc + curr.plantedSeedlings, 0);

  const avgHealthScore = observations.length > 0
    ? Math.round(observations.reduce((acc, curr) => acc + (curr.healthScoreMHI || 75), 0) / observations.length)
    : 85;

  // Filter observations
  const filteredObservations = observations.filter((obs) => {
    if (filterZone !== 'all' && obs.waterwayZone !== filterZone) return false;
    if (filterStatus === 'queued' && obs.offlineStatus !== 'queued_offline') return false;
    if (filterStatus === 'synced' && obs.offlineStatus !== 'synced') return false;
    return true;
  });

  // Export to GeoJSON
  const handleExportGeoJson = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      metadata: {
        title: 'Philippine Mangrove Kayak Field Observations & Restoration Transects',
        exportedAt: new Date().toISOString(),
        totalFeatures: observations.length,
        estuary: 'Del Carmen Siargao Mangrove Reserve'
      },
      features: observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [obs.lng, obs.lat],
        },
        properties: {
          id: obs.id,
          title: obs.title,
          species: obs.speciesName,
          treeTagId: obs.treeTagId || null,
          zone: obs.waterwayZone,
          waterway: obs.waterwayName,
          timestamp: obs.timestamp,
          healthScoreMHI: obs.healthScoreMHI,
          salinityPpt: obs.environmentalData?.salinityPpt,
          canopyCoverPercent: obs.environmentalData?.canopyCoverPercent,
          sediment: obs.environmentalData?.sedimentType,
          wildlife: obs.environmentalData?.wildlifeObserved,
          trashLevel: obs.environmentalData?.trashLevel,
          erosionRisk: obs.environmentalData?.erosionRisk,
          restorationAction: obs.restorationAction,
          propagulesPlantedCount: obs.propagulesPlantedCount || 0,
          guideName: obs.guideName,
          notes: obs.notes,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangrove-observations-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Title',
      'Species',
      'TreeTagID',
      'Latitude',
      'Longitude',
      'Zone',
      'Waterway',
      'Salinity_ppt',
      'CanopyCover_pct',
      'HealthScore_MHI',
      'Sediment',
      'Wildlife',
      'TrashLevel',
      'ErosionRisk',
      'PlantedCount',
      'RestorationAction',
      'Timestamp',
      'Guide'
    ];

    const rows = observations.map((o) => [
      o.id,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.speciesName.replace(/"/g, '""')}"`,
      o.treeTagId || '',
      o.lat,
      o.lng,
      o.waterwayZone,
      `"${o.waterwayName.replace(/"/g, '""')}"`,
      o.environmentalData?.salinityPpt || '',
      o.environmentalData?.canopyCoverPercent || '',
      o.healthScoreMHI || '',
      o.environmentalData?.sedimentType || '',
      `"${(o.environmentalData?.wildlifeObserved || []).join('; ')}"`,
      o.environmentalData?.trashLevel || '',
      o.environmentalData?.erosionRisk || '',
      o.propagulesPlantedCount || 0,
      `"${(o.restorationAction || '').replace(/"/g, '""')}"`,
      o.timestamp,
      `"${o.guideName.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangrove-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Geo-Tagged Environmental Logs &amp; Restoration Data
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Field observations recorded during kayak transects &bull; Exportable for conservation partners in GIS GeoJSON and CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pendingOfflineLogs.length > 0 && (
              <button
                id="sync-all-queue-btn"
                onClick={onSync}
                disabled={isOffline || isSyncing}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isOffline
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {pendingOfflineLogs.length} Offline Logs</span>
              </button>
            )}

            <button
              id="export-geojson-btn"
              onClick={handleExportGeoJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export GeoJSON (GIS)</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Geo-Observations
          </span>
          <span className="text-2xl font-black text-slate-900">{observations.length}</span>
          <span className="block text-[10px] text-slate-500 mt-0.5">Along kayak bio-reserve</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Avg Health Score (MHI)
          </span>
          <span className="text-2xl font-black text-emerald-700">{avgHealthScore}/100</span>
          <span className="block text-[10px] text-emerald-600 mt-0.5">Pristine to robust canopy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Propagules Replanted
          </span>
          <span className="text-2xl font-black text-teal-700">{totalPlanted}</span>
          <span className="block text-[10px] text-teal-600 mt-0.5">Living shoreline seedlings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Offline Queue Status
          </span>
          <span className={`text-2xl font-black ${pendingOfflineLogs.length > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {pendingOfflineLogs.length} queued
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">
            {pendingOfflineLogs.length > 0 ? 'Will sync upon signal restore' : 'All records synchronized'}
          </span>
        </div>
      </div>

      {/* Restoration Projects Overview Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <TreePine className="w-4 h-4 text-emerald-600" />
          Active Coastal Restoration Sites Monitored by Kayak
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restorationProjects.map((proj) => (
            <div key={proj.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                    {proj.status.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{proj.siteName}</h4>
                </div>
                <span className="text-xs font-bold text-emerald-700">{proj.survivalRatePercent}% Survival</span>
              </div>

              <p className="text-xs text-slate-600">{proj.description}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Planted: <strong>{proj.plantedSeedlings} seedlings</strong></span>
                <span>Lead: {proj.leadOrganization}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Observations Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Field Transect Observations ({filteredObservations.length})
          </h3>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="p-1.5 rounded border border-slate-300 bg-white"
            >
              <option value="all">All Coastal Zones</option>
              <option value="seaward_fringe">Seaward Fringe</option>
              <option value="mid_intertidal">Mid-Intertidal Creek</option>
              <option value="inland_basin">Inland Basin</option>
              <option value="coastal_transition">Upland Transition</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-1.5 rounded border border-slate-300 bg-white"
            >
              <option value="all">All Sync Status</option>
              <option value="queued">Queued (Offline)</option>
              <option value="synced">Synced (Cloud)</option>
            </select>
          </div>
        </div>

        {/* Observations List */}
        <div className="space-y-3">
          {filteredObservations.map((obs) => (
            <div
              key={obs.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    obs.offlineStatus === 'queued_offline'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {obs.offlineStatus === 'queued_offline' ? 'Queued (Offline)' : 'Synced'}
                  </span>

                  {obs.treeTagId && (
                    <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                      Tag #{obs.treeTagId}
                    </span>
                  )}

                  <h4 className="text-sm font-bold text-slate-900">{obs.title}</h4>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5 text-emerald-600" />
                    {obs.speciesName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {obs.waterwayName} ({obs.lat.toFixed(4)}°N, {obs.lng.toFixed(4)}°W)
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    {obs.environmentalData?.salinityPpt} ppt
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  "{obs.notes}"
                </p>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-auto shrink-0">
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-800">
                    {obs.healthScoreMHI || 85}/100
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">MHI Score</span>
                </div>

                {onDeleteObservation && (
                  <button
                    onClick={() => onDeleteObservation(obs.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredObservations.length === 0 && (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs">No observation logs match the selected filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
