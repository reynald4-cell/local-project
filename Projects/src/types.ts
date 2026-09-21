export type CoastalZone = 'seaward_fringe' | 'mid_intertidal' | 'inland_basin' | 'riverine_channel' | 'coastal_transition';

export type RootArchitecture = 'stilt_prop' | 'pneumatophores_pencil' | 'knee_elbow' | 'buttress_fluted' | 'no_aerial_roots';

export type LeafType = 'waxy_elliptic' | 'salt_excreting_silvery' | 'petiole_glands' | 'leathery_pointed' | 'broad_obovate';

export type HealthStatus = 'pristine' | 'healthy' | 'vulnerable' | 'degraded';

export interface MangroveSpecies {
  id: string;
  commonName: string;
  localName: string; // e.g. Bakawan Babae, Pagatpat, Api-api
  scientificName: string;
  family: string;
  iucnStatus: 'Least Concern' | 'Near Threatened' | 'Vulnerable' | 'Endangered';
  rootArchitecture: RootArchitecture;
  rootDescription: string;
  leafType: LeafType;
  leafDescription: string;
  propaguleDescription: string;
  salinityTolerancePpt: string;
  salinityMaxPpt: number;
  blueCarbonRateKgPerYear: number; // kg CO2 sequestered per mature tree/year
  dominantZone: CoastalZone;
  zoneDescription: string;
  barkCharacteristics: string;
  ecologicalRoles: string[];
  companionWildlife: string[];
  guideFieldTips: string;
  colorAccent: string;
  badgeBg: string;
  imageUrl?: string;
  svgIcon: string;
}

export interface TreeTagData {
  tagId: string; // e.g. MNG-RED-042
  speciesId: string;
  commonName: string;
  scientificName: string;
  taggedDate: string;
  lat: number;
  lng: number;
  waterwayName: string;
  dbhCm: number; // diameter at breast height
  heightMeters: number;
  canopySpreadMeters: number;
  estimatedAgeYears: number;
  carbonSequestrationKgPerYr: number;
  healthRating: 1 | 2 | 3 | 4 | 5; // 5 is prime health
  healthStatus: HealthStatus;
  waveDampeningEffectPercent: number; // e.g. 66% wave energy reduction
  nurserySignificance: string;
  lastSurveyDate: string;
  surveyor: string;
  restorationOrigin: boolean;
  notes: string;
}

export interface GeoTaggedObservation {
  id: string;
  title: string;
  speciesId: string;
  speciesName: string;
  treeTagId?: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  waterwayZone: CoastalZone;
  waterwayName: string;
  timestamp: string;
  healthRating: number; // 1 to 5
  healthScoreMHI?: number; // 0 to 100
  environmentalData: {
    salinityPpt: number;
    canopyCoverPercent: number;
    sedimentType: 'fine_mud' | 'sandy_peat' | 'coarse_sand' | 'anoxic_ooze';
    wildlifeObserved: string[];
    trashLevel: 'none' | 'light' | 'moderate' | 'severe';
    erosionRisk: 'low' | 'moderate' | 'critical';
  };
  restorationAction?: string;
  propagulesPlantedCount?: number;
  notes: string;
  photoUrl?: string;
  offlineStatus: 'synced' | 'queued_offline';
  guideName: string;
}

export interface RestorationProject {
  id: string;
  siteName: string;
  lat: number;
  lng: number;
  targetSpecies: string[];
  plantedSeedlings: number;
  survivalRatePercent: number;
  initiatedDate: string;
  leadOrganization: string;
  status: 'active_planting' | 'monitoring' | 'established';
  description: string;
}

export interface IdentificationCriteria {
  rootType?: RootArchitecture;
  leafType?: LeafType;
  zone?: CoastalZone;
  flowerFruit?: string;
  salinityObserved?: number;
}

export interface HealthAssessmentResult {
  healthIndexScore: number;
  statusLabel: string;
  summary: string;
  salinityAssessment: string;
  indicatorSpeciesAnalysis: string;
  threatAnalysis: string;
  recommendedInterventions: string[];
  kayakGuideBriefing: string;
}
