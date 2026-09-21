import { MangroveSpecies, TreeTagData, GeoTaggedObservation, RestorationProject } from '../types';

export const MANGROVE_SPECIES: MangroveSpecies[] = [
  {
    id: 'rhizophora_mucronata',
    commonName: 'Loop-root Mangrove',
    localName: 'Bakawan Babae',
    scientificName: 'Rhizophora mucronata',
    family: 'Rhizophoraceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'stilt_prop',
    rootDescription: 'Gigantic arching stilt prop roots (tukod) looping up to 2.5 meters high into the water, creating dense kayak tunnels and fish sanctuaries.',
    leafType: 'waxy_elliptic',
    leafDescription: 'Opposite, broad elliptic dark green leaves with a distinct sharp stiff needle point (mucronate tip) at the apex. Paler yellowish underneath with black corky dots.',
    propaguleDescription: 'The longest propagule in the world! Viviparous green hypocotyl reaching 50-80 cm long, heavily weighted at the tip for mud anchoring.',
    salinityTolerancePpt: '10 - 50 ppt (Outer seaward pioneer; filters salt at root membranes)',
    salinityMaxPpt: 50,
    blueCarbonRateKgPerYear: 38.5,
    dominantZone: 'seaward_fringe',
    zoneDescription: 'Deepest water along seaward channels, lagoons, and outer fringe facing tidal currents in Siargao, Palawan, and Bohol.',
    barkCharacteristics: 'Dark reddish-brown to blackish rough bark with horizontal fissures.',
    ecologicalRoles: [
      'Dissipates up to 70% of typhoon wave energy along Philippine coastlines',
      'Prime nursery habitat for Giant Mud Crabs (alimango) and Tiger Prawns (sugpo)',
      'Substrate for mangrove oysters (talaba) and tunicates'
    ],
    companionWildlife: [
      'Philippine Mud Crab (Scylla serrata)',
      'Mangrove Blue Flycatcher',
      'Mudskippers (Tambasakan / Periophthalmus)',
      'Juvenile Barramundi (Apahap)'
    ],
    guideFieldTips: 'Have kayakers feel the very tip of the leaf—that little sharp needle point ("mucro") gives Bakawan Babae its name! Its giant stilt roots also form the natural archways in Sugba Lagoon.',
    colorAccent: '#166534',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    svgIcon: 'prop-roots'
  },
  {
    id: 'rhizophora_apiculata',
    commonName: 'Tall-stilt Mangrove',
    localName: 'Bakawan Lalaki',
    scientificName: 'Rhizophora apiculata',
    family: 'Rhizophoraceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'stilt_prop',
    rootDescription: 'Dense vertical and arching stilt roots anchoring into soft intertidal mud. Forms extensive monospecific stands along Philippine tidal rivers.',
    leafType: 'waxy_elliptic',
    leafDescription: 'Opposite, narrow elliptic dark green leaves with tiny reddish-brown spots on the underside. Distinguished by paired flowers born on short stout stalks below the leaves.',
    propaguleDescription: 'Cylindrical green hypocotyl (20-35 cm) with a smooth brown collar at the parent calyx attachment.',
    salinityTolerancePpt: '5 - 40 ppt (Flourishes in brackish to marine estuarine waterways)',
    salinityMaxPpt: 40,
    blueCarbonRateKgPerYear: 32.0,
    dominantZone: 'seaward_fringe',
    zoneDescription: 'Tidal creeks and river mouths with moderate wave action and daily tidal flushing.',
    barkCharacteristics: 'Smooth greyish bark with horizontal ridges and reddish inner layer.',
    ecologicalRoles: [
      'Pioneer stabilization of newly deposited estuarine mud banks',
      'Major biomass and blue carbon sink in Philippine mangrove wetlands',
      'Refuge for juvenile rabbitfish (danggit) and snappers'
    ],
    companionWildlife: [
      'Rabbitfish Fry (Danggit / Siganus)',
      'Mangrove Monitor Lizard (Halo / Varanus)',
      'Striated Heron (Kuwago ng Bakawan)'
    ],
    guideFieldTips: 'Check the flower stems! Bakawan Lalaki produces paired yellowish flowers on very short woody knobs ("apiculum") right beneath the foliage cluster.',
    colorAccent: '#15803d',
    badgeBg: 'bg-green-100 text-green-900 border-green-300',
    svgIcon: 'prop-roots'
  },
  {
    id: 'sonneratia_alba',
    commonName: 'Apple Mangrove',
    localName: 'Pagatpat',
    scientificName: 'Sonneratia alba',
    family: 'Lythraceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'pneumatophores_pencil',
    rootDescription: 'Massive, thick cone-shaped wooden pneumatophores ("surok-surok" or wooden stalagmites) emerging up to 1 meter high and 10 cm thick from mud and sand.',
    leafType: 'broad_obovate',
    leafDescription: 'Opposite, thick, fleshy, leathery rounded leaves with reddish petiole bases and prominent veins.',
    propaguleDescription: 'Non-viviparous: produces large round green berry fruits (like small apples) with a star-shaped woody calyx cup containing dozens of floating seeds.',
    salinityTolerancePpt: '15 - 45 ppt (Tolerates high salinity and rocky/coralline shores)',
    salinityMaxPpt: 45,
    blueCarbonRateKgPerYear: 39.5,
    dominantZone: 'seaward_fringe',
    zoneDescription: 'Exposed outer coastal banks, coral reef flats, and river mouths across Bohol, Palawan, and Mindanao.',
    barkCharacteristics: 'Creamy grey to light brown, deeply fissured and peeling in long strips.',
    ecologicalRoles: [
      'Primary habitat for synchronous fireflies (alitaptap) in Abatan River and Iwahig River kayak night tours',
      'Nocturnal white blossoms pollinated by nectar-feeding fruit bats (kabag)',
      'Edible acidic fruits traditionally used in coastal Philippine cuisine'
    ],
    companionWildlife: [
      'Synchronous Fireflies (Alitaptap / Pteroptyx)',
      'Geoffroy’s Rousette Fruit Bat',
      'Banded Archerfish (Toxotes)',
      'Mudskippers (Periophthalmus)'
    ],
    guideFieldTips: 'Pagatpat is the legendary "firefly tree" of Philippine kayak night tours! Their peg roots look like ancient wooden cones poking through the sand at low tide, and fruit bats love their nocturnal blossoms.',
    colorAccent: '#0f766e',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    svgIcon: 'stalagmite-roots'
  },
  {
    id: 'avicennia_marina',
    commonName: 'Grey / Indian Mangrove',
    localName: 'Api-api / Bungalon',
    scientificName: 'Avicennia marina',
    family: 'Acanthaceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'pneumatophores_pencil',
    rootDescription: 'Dense carpet of thousands of slender, pencil-like pneumatophores ("lapis-lapis" snorkels) sticking up 15-25 cm from the mud around the trunk to inhale air.',
    leafType: 'salt_excreting_silvery',
    leafDescription: 'Opposite, dark olive green above with silvery-white fuzzy underside that visibly excretes sparkling white sea salt crystals.',
    propaguleDescription: 'Small (2-3 cm) heart-shaped or lima-bean shaped propagule with a velvety greyish-green coat that floats buoyant like a tiny raft.',
    salinityTolerancePpt: '0 - 65+ ppt (Highest salinity tolerance among Philippine mangroves)',
    salinityMaxPpt: 65,
    blueCarbonRateKgPerYear: 36.0,
    dominantZone: 'inland_basin',
    zoneDescription: 'Muddy intertidal flats, evaporative coastal basins, and river deltas where water gets salty in dry months.',
    barkCharacteristics: 'Smooth light grey to greenish bark with powdery patches.',
    ecologicalRoles: [
      'Stabilizes deep mud and traps organic silt from coastal runoff',
      'Pneumatophores prevent soil liquefaction during storm surges',
      'Fragrant orange-yellow blossoms provide nectar for wild Philippine mangrove honey'
    ],
    companionWildlife: [
      'Philippine Fiddler Crab (Uca)',
      'Mangrove Periwinkle Snails',
      'Great Egret (Tagak)',
      'Mud Crabs'
    ],
    guideFieldTips: 'Invite kayakers to taste the bottom of an Api-api leaf! It tastes salty because the tree drinks seawater and pumps pure salt crystals out through microscopic leaf glands.',
    colorAccent: '#0369a1',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    svgIcon: 'pneumatophores'
  },
  {
    id: 'bruguiera_gymnorhiza',
    commonName: 'Large-leafed Orange Mangrove',
    localName: 'Pototan / Busain',
    scientificName: 'Bruguiera gymnorhiza',
    family: 'Rhizophoraceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'knee_elbow',
    rootDescription: 'Dramatic "knee roots" (tuhod-tuhod) looping up out of the black peat and bending back down like bent wooden knees, providing anchor and aeration.',
    leafType: 'broad_obovate',
    leafDescription: 'Large leathery leaves clustered at branch tips. Spectacular scarlet-red flower calyxes that look like small sea anemones or stars.',
    propaguleDescription: 'Cigar-shaped, ribbed propagule (12-20 cm) with the persistent bright red or orange calyx cup remaining attached at the crown.',
    salinityTolerancePpt: '5 - 35 ppt (Mid-intertidal zone with regular brackish freshwater influx)',
    salinityMaxPpt: 35,
    blueCarbonRateKgPerYear: 34.0,
    dominantZone: 'mid_intertidal',
    zoneDescription: 'Interior zone behind the seaward fringe where river waters mix with daily tides.',
    barkCharacteristics: 'Rough, dark brown to blackish bark with prominent corky lenticels.',
    ecologicalRoles: [
      'Accumulates thick peat layers storing centuries of blue carbon',
      'Red blossoms are pollinated by Olive-backed Sunbirds (Tamsi) and honeyeaters',
      'Propagules historically used as emergency food (boiled starch) in coastal villages'
    ],
    companionWildlife: [
      'Olive-backed Sunbird (Tamsi)',
      'Mangrove Blue Flycatcher',
      'Tree-climbing Crabs',
      'Mangrove Horseshoe Crab'
    ],
    guideFieldTips: 'Look down into the mud at low tide for the bizarre knobby "bent knees" (tuhod-tuhod) poking out of the mud. Their vivid red flowers also make them easy to spot from your kayak.',
    colorAccent: '#c2410c',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    svgIcon: 'knee-roots'
  },
  {
    id: 'xylocarpus_granatum',
    commonName: 'Cannonball Mangrove / Cedar Mangrove',
    localName: 'Tabigi',
    scientificName: 'Xylocarpus granatum',
    family: 'Meliaceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'buttress_fluted',
    rootDescription: 'Spectacular ribbon-like wavy wooden buttress roots winding like serpentine ribbons across the forest floor and channel banks.',
    leafType: 'leathery_pointed',
    leafDescription: 'Pinnate compound leaves with 2-4 pairs of obovate, leathery green leaflets with rounded tips.',
    propaguleDescription: 'Huge heavy woody cannonball fruits (up to 20 cm wide, weighing up to 2 kg!) that burst open when ripe into 4-6 angular woody puzzle-piece seeds that float.',
    salinityTolerancePpt: '0 - 30 ppt (Prefers upper brackish riverine tidal reaches)',
    salinityMaxPpt: 30,
    blueCarbonRateKgPerYear: 30.5,
    dominantZone: 'inland_basin',
    zoneDescription: 'Inland riverine banks and upper mangrove transition zones in Siargao and Palawan.',
    barkCharacteristics: 'Smooth, mottled reddish-brown and green-grey bark that flakes off in jigsaw-like patches (similar to guava bark).',
    ecologicalRoles: [
      'Ribbon buttresses prevent bank collapse along high-velocity tidal rivers',
      'Traditional medicinal bark used by Philippine coastal herbalists for astringent salves',
      'Puzzle-piece seeds disperse across ocean currents between Philippine islands'
    ],
    companionWildlife: [
      'White-collared Kingfisher (Kasay-kasay)',
      'Philippine Long-tailed Macaque',
      'Mangrove Snails'
    ],
    guideFieldTips: 'Point out the giant green cannonball fruits hanging over the kayak channel! If you find a floating seed pod, kayakers can take apart the woody puzzle pieces and try to fit them back together.',
    colorAccent: '#78350f',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    svgIcon: 'buttress-roots'
  },
  {
    id: 'nypa_fruticans',
    commonName: 'Nipa Palm / Mangrove Palm',
    localName: 'Nipa / Sasa',
    scientificName: 'Nypa fruticans',
    family: 'Arecaceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'no_aerial_roots',
    rootDescription: 'Prostrate underground horizontal rhizome branching through soft tidal mud, with a dense network of fibrous anchoring roots along channel banks.',
    leafType: 'broad_obovate',
    leafDescription: 'Feathery pinnate fronds up to 5-9 meters tall emerging directly from the mud like giant green palm fans.',
    propaguleDescription: 'Globular woody head of compressed fibrous chestnut-brown seeds that detach and float downriver like small wooden coconuts.',
    salinityTolerancePpt: '0 - 25 ppt (Brackish riverine specialist, flooded twice daily)',
    salinityMaxPpt: 25,
    blueCarbonRateKgPerYear: 26.0,
    dominantZone: 'riverine_channel',
    zoneDescription: 'Tidal rivers, estuaries, and riverbanks with continuous brackish freshwater mixing.',
    barkCharacteristics: 'Stemless subterranean rhizome; leaves are harvested sustainably by coastal communities.',
    ecologicalRoles: [
      'Premier cultural and ecological palm in coastal Philippine heritage',
      'Fronds harvested for traditional weather-resistant thatch roofs (pawid)',
      'Sap tapped for palm wine (tuba) and artisanal vinegar (sukang paombong)',
      'Prevents riverbank erosion during monsoon floods'
    ],
    companionWildlife: [
      'Estuarine Mudskippers (Tambasakan)',
      'Banded Archerfish',
      'Philippine Duck (Anas luzonica)',
      'Freshwater prawns (Ulang)'
    ],
    guideFieldTips: 'Paddling through a Nipa palm channel feels like exploring a prehistoric Jurassic waterway! Their massive 8-meter fronds arch overhead, creating cool shade for kayakers even at noon.',
    colorAccent: '#854d0e',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    svgIcon: 'nipa-fronds'
  },
  {
    id: 'ceriops_tagal',
    commonName: 'Yellow Mangrove',
    localName: 'Tangal',
    scientificName: 'Ceriops tagal',
    family: 'Rhizophoraceae',
    iucnStatus: 'Least Concern',
    rootArchitecture: 'buttress_fluted',
    rootDescription: 'Trunk with distinct fluted buttressed base and knobby knee-like roots in compacted mud.',
    leafType: 'waxy_elliptic',
    leafDescription: 'Opposite, yellowish-green obovate leaves clustered at stem tips with wavy margins.',
    propaguleDescription: 'Slender, deeply ribbed, angular green to bronze propagule (15-25 cm) with an upturned star-like calyx collar.',
    salinityTolerancePpt: '10 - 45 ppt (High intertidal flats and rocky coastal fringes)',
    salinityMaxPpt: 45,
    blueCarbonRateKgPerYear: 24.5,
    dominantZone: 'inland_basin',
    zoneDescription: 'High intertidal zone inundated only during spring high tides.',
    barkCharacteristics: 'Smooth light brown bark rich in tannins, historically used in the Visayas as "tungog" to preserve and color tuba wine.',
    ecologicalRoles: [
      'Dense wood resists marine woodborers (teredo worms)',
      'Stabilizes compacted upper mud flats',
      'Provides high canopy roosting for coastal birds'
    ],
    companionWildlife: [
      'Fiddler Crabs',
      'Mangrove Pitta',
      'Reef Egret'
    ],
    guideFieldTips: 'In Visayan culture, the bark of Tangal (known as tungog) is famous for giving local coconut tuba wine its distinct reddish tint and preservative tannins!',
    colorAccent: '#9a3412',
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-300',
    svgIcon: 'fluted-base'
  }
];

// Philippine Research Tree Tags along the Del Carmen Siargao / Palawan kayak trail
export const INITIAL_TREE_TAGS: TreeTagData[] = [
  {
    tagId: 'PH-BKW-042',
    speciesId: 'rhizophora_mucronata',
    commonName: 'Bakawan Babae (Mother Stilt Stand)',
    scientificName: 'Rhizophora mucronata',
    taggedDate: '2023-05-18',
    lat: 9.8655,
    lng: 125.9642,
    waterwayName: 'Sugba Lagoon Seaward Cut &bull; Del Carmen',
    dbhCm: 42.5,
    heightMeters: 12.2,
    canopySpreadMeters: 8.5,
    estimatedAgeYears: 65,
    carbonSequestrationKgPerYr: 41.2,
    healthRating: 5,
    healthStatus: 'pristine',
    waveDampeningEffectPercent: 78,
    nurserySignificance: 'Over 80 juvenile rabbitfish (danggit) and alimango mud crabs sheltered in prop roots',
    lastSurveyDate: '2026-08-20',
    surveyor: 'Kuya Dan (Lead Siargao Kayak Guide)',
    restorationOrigin: false,
    notes: 'Archetypal Bakawan Babae with over 150 stilt roots forming a pristine kayak tunnel into Sugba Lagoon.'
  },
  {
    tagId: 'PH-PGP-108',
    speciesId: 'sonneratia_alba',
    commonName: 'Pagatpat (Ancient Firefly Mother Tree)',
    scientificName: 'Sonneratia alba',
    taggedDate: '2022-09-14',
    lat: 9.8682,
    lng: 125.9685,
    waterwayName: 'Cancohoy Channel &bull; Del Carmen Reserve',
    dbhCm: 56.0,
    heightMeters: 14.5,
    canopySpreadMeters: 11.2,
    estimatedAgeYears: 88,
    carbonSequestrationKgPerYr: 48.0,
    healthRating: 5,
    healthStatus: 'pristine',
    waveDampeningEffectPercent: 82,
    nurserySignificance: 'Hosts synchronous firefly colonies (alitaptap) and fruit bats on night kayak tours',
    lastSurveyDate: '2026-07-30',
    surveyor: 'Del Carmen Mangrove Protection Council',
    restorationOrigin: false,
    notes: 'Massive cone-shaped peg roots protruding 80 cm from mud. Spectacular night firefly displays.'
  },
  {
    tagId: 'PH-API-019',
    speciesId: 'avicennia_marina',
    commonName: 'Api-api / Bungalon (Salt Excretion Stand)',
    scientificName: 'Avicennia marina',
    taggedDate: '2024-03-10',
    lat: 9.8710,
    lng: 125.9720,
    waterwayName: 'Numancia Mudflat Basin',
    dbhCm: 34.2,
    heightMeters: 8.8,
    canopySpreadMeters: 6.8,
    estimatedAgeYears: 38,
    carbonSequestrationKgPerYr: 37.5,
    healthRating: 4,
    healthStatus: 'healthy',
    waveDampeningEffectPercent: 64,
    nurserySignificance: 'Extensive fiddler crab burrows aerating muddy substrate',
    lastSurveyDate: '2026-09-02',
    surveyor: 'Kuya Dan & Kayak Naturalist Team',
    restorationOrigin: false,
    notes: 'Dense pencil pneumatophores visible at low tide. Sparkling salt crystals abundant on leaf undersides.'
  },
  {
    tagId: 'PH-TBG-033',
    speciesId: 'xylocarpus_granatum',
    commonName: 'Tabigi (Cannonball Ribbon Buttress)',
    scientificName: 'Xylocarpus granatum',
    taggedDate: '2023-11-22',
    lat: 9.8630,
    lng: 125.9605,
    waterwayName: 'San Jose Riverine Cut',
    dbhCm: 48.0,
    heightMeters: 10.5,
    canopySpreadMeters: 9.0,
    estimatedAgeYears: 55,
    carbonSequestrationKgPerYr: 32.0,
    healthRating: 4,
    healthStatus: 'healthy',
    waveDampeningEffectPercent: 58,
    nurserySignificance: 'High water bank stabilization against river tidal surges',
    lastSurveyDate: '2026-08-12',
    surveyor: 'Kuya Dan',
    restorationOrigin: false,
    notes: 'Beautiful serpentine ribbon buttress roots. 8 large cannonball fruits hanging over water.'
  },
  {
    tagId: 'PH-RESTORE-07',
    speciesId: 'rhizophora_mucronata',
    commonName: 'Bakawan Seedling Cohort 2025',
    scientificName: 'Rhizophora mucronata',
    taggedDate: '2025-07-15',
    lat: 9.8640,
    lng: 125.9625,
    waterwayName: 'Del Carmen Community Restoration Cove',
    dbhCm: 6.8,
    heightMeters: 2.1,
    canopySpreadMeters: 1.6,
    estimatedAgeYears: 2,
    carbonSequestrationKgPerYr: 10.5,
    healthRating: 5,
    healthStatus: 'pristine',
    waveDampeningEffectPercent: 35,
    nurserySignificance: 'Young prop roots anchoring into soft sediment, attracting fry',
    lastSurveyDate: '2026-09-09',
    surveyor: 'Kuya Dan & Siargao Eco-Paddlers',
    restorationOrigin: true,
    notes: '94% survival rate! Replanted by kayak eco-tourists using wild-harvested floating propagules.'
  }
];

export const INITIAL_OBSERVATIONS: GeoTaggedObservation[] = [
  {
    id: 'OBS-PH-001',
    title: 'Sugba Lagoon Bakawan Babae Health Transect',
    speciesId: 'rhizophora_mucronata',
    speciesName: 'Bakawan Babae (Rhizophora mucronata)',
    treeTagId: 'PH-BKW-042',
    lat: 9.8655,
    lng: 125.9642,
    accuracyMeters: 3.2,
    waterwayZone: 'seaward_fringe',
    waterwayName: 'Sugba Lagoon Seaward Cut',
    timestamp: '2026-09-09T08:30:00Z',
    healthRating: 5,
    healthScoreMHI: 94,
    environmentalData: {
      salinityPpt: 33,
      canopyCoverPercent: 92,
      sedimentType: 'fine_mud',
      wildlifeObserved: ['Mud Crabs (Alimango)', 'Danggit Fry', 'Mangrove Snails', 'Kingfisher'],
      trashLevel: 'none',
      erosionRisk: 'low'
    },
    restorationAction: 'Morning eco-kayak guide monitoring transect',
    propagulesPlantedCount: 0,
    notes: 'Emerald water clarity through stilt roots. Dense juvenile fish refuge observed during mid-tide.',
    offlineStatus: 'synced',
    guideName: 'Kuya Dan'
  },
  {
    id: 'OBS-PH-002',
    title: 'Cancohoy Channel Pagatpat Firefly Habitat Survey',
    speciesId: 'sonneratia_alba',
    speciesName: 'Pagatpat (Sonneratia alba)',
    treeTagId: 'PH-PGP-108',
    lat: 9.8682,
    lng: 125.9685,
    accuracyMeters: 4.0,
    waterwayZone: 'seaward_fringe',
    waterwayName: 'Cancohoy Channel',
    timestamp: '2026-09-10T15:45:00Z',
    healthRating: 5,
    healthScoreMHI: 91,
    environmentalData: {
      salinityPpt: 35,
      canopyCoverPercent: 88,
      sedimentType: 'sandy_peat',
      wildlifeObserved: ['Fireflies (Alitaptap)', 'Mudskippers', 'Fruit Bats'],
      trashLevel: 'none',
      erosionRisk: 'low'
    },
    restorationAction: 'Inspected peg pneumatophores for boat wake damage',
    propagulesPlantedCount: 0,
    notes: 'Peg roots are pristine and free of plastic. Canopy blossoming with white nocturnal flowers.',
    offlineStatus: 'synced',
    guideName: 'Kuya Dan'
  },
  {
    id: 'OBS-PH-003',
    title: 'Del Carmen Replanting & Seedling Check',
    speciesId: 'rhizophora_mucronata',
    speciesName: 'Bakawan Babae (Rhizophora mucronata)',
    treeTagId: 'PH-RESTORE-07',
    lat: 9.8640,
    lng: 125.9625,
    accuracyMeters: 2.5,
    waterwayZone: 'seaward_fringe',
    waterwayName: 'Del Carmen Community Restoration Cove',
    timestamp: '2026-09-11T09:10:00Z',
    healthRating: 5,
    healthScoreMHI: 90,
    environmentalData: {
      salinityPpt: 32,
      canopyCoverPercent: 70,
      sedimentType: 'fine_mud',
      wildlifeObserved: ['Oyster Spat', 'Mudskippers', 'Mangrove Crab'],
      trashLevel: 'none',
      erosionRisk: 'low'
    },
    restorationAction: 'Planted 25 floating Bakawan propagules with kayak tour group',
    propagulesPlantedCount: 25,
    notes: 'Eco-kayakers planted collected propagules 4 cm into mud along designated bamboo stake line.',
    offlineStatus: 'synced',
    guideName: 'Kuya Dan'
  }
];

export const RESTORATION_PROJECTS: RestorationProject[] = [
  {
    id: 'REST-PH-01',
    siteName: 'Del Carmen Mangrove Bio-Reserve Living Shoreline',
    lat: 9.8640,
    lng: 125.9625,
    targetSpecies: ['Rhizophora mucronata (Bakawan Babae)', 'Rhizophora apiculata (Bakawan Lalaki)'],
    plantedSeedlings: 2400,
    survivalRatePercent: 93.8,
    initiatedDate: '2023-08-10',
    leadOrganization: 'Del Carmen LGU & Siargao Kayak Naturalist Guild',
    status: 'active_planting',
    description: 'Community-led mangrove corridor restoration shielding Siargao western lagoon from tropical depressions.'
  },
  {
    id: 'REST-PH-02',
    siteName: 'San Jose Riverine Cut Transition Zone',
    lat: 9.8630,
    lng: 125.9605,
    targetSpecies: ['Xylocarpus granatum (Tabigi)', 'Nypa fruticans (Nipa)'],
    plantedSeedlings: 1150,
    survivalRatePercent: 89.2,
    initiatedDate: '2024-02-15',
    leadOrganization: 'Siargao Environmental Conservation Volunteers',
    status: 'monitoring',
    description: 'Stabilizing inner riverbanks with native Tabigi and Nipa palm to prevent agricultural runoff into coral flats.'
  }
];

// Offline Philippine Species Key Matcher
export function identifySpeciesOffline(criteria: {
  rootType?: string;
  leafType?: string;
  zone?: string;
  salinity?: number;
}): { species: MangroveSpecies; confidence: number; reasons: string[] }[] {
  const results = MANGROVE_SPECIES.map((species) => {
    let score = 0;
    const reasons: string[] = [];

    if (criteria.rootType) {
      if (species.rootArchitecture === criteria.rootType) {
        score += 40;
        reasons.push(`Matches root architecture: ${species.rootArchitecture.replace('_', ' ')}`);
      }
    }

    if (criteria.leafType) {
      if (species.leafType === criteria.leafType) {
        score += 35;
        reasons.push(`Matches leaf diagnostic: ${species.leafType.replace('_', ' ')}`);
      }
    }

    if (criteria.zone) {
      if (species.dominantZone === criteria.zone) {
        score += 20;
        reasons.push(`Dominant coastal zone: ${species.dominantZone.replace('_', ' ')}`);
      }
    }

    if (criteria.salinity !== undefined) {
      if (criteria.salinity <= species.salinityMaxPpt) {
        score += 5;
        reasons.push(`Within salinity tolerance (up to ${species.salinityMaxPpt} ppt)`);
      }
    }

    const confidence = Math.min(100, Math.max(15, Math.round((score / 95) * 100)));
    return { species, confidence, reasons };
  });

  return results.sort((a, b) => b.confidence - a.confidence);
}

// Calculate Mangrove Health Index (MHI)
export function calculateMHI(data: {
  salinityPpt: number;
  canopyCoverPercent: number;
  trashLevel: 'none' | 'light' | 'moderate' | 'severe';
  erosionRisk: 'low' | 'moderate' | 'critical';
  wildlifeCount: number;
}): { score: number; status: 'pristine' | 'healthy' | 'vulnerable' | 'degraded'; summary: string } {
  let score = 50;

  score += (data.canopyCoverPercent / 100) * 25;

  if (data.salinityPpt >= 15 && data.salinityPpt <= 38) {
    score += 15;
  } else if ((data.salinityPpt >= 0 && data.salinityPpt < 15) || (data.salinityPpt > 38 && data.salinityPpt <= 50)) {
    score += 8;
  } else {
    score -= 10;
  }

  if (data.trashLevel === 'none') score += 10;
  else if (data.trashLevel === 'light') score += 5;
  else if (data.trashLevel === 'moderate') score -= 10;
  else if (data.trashLevel === 'severe') score -= 25;

  if (data.erosionRisk === 'low') score += 10;
  else if (data.erosionRisk === 'moderate') score -= 5;
  else if (data.erosionRisk === 'critical') score -= 20;

  score += Math.min(15, data.wildlifeCount * 3);

  const finalScore = Math.max(5, Math.min(99, Math.round(score)));

  let status: 'pristine' | 'healthy' | 'vulnerable' | 'degraded' = 'healthy';
  let summary = '';

  if (finalScore >= 85) {
    status = 'pristine';
    summary = 'Pristine Philippine mangrove stand with robust canopy cover, abundant alimango/fish fry, and optimal tidal flushing.';
  } else if (finalScore >= 70) {
    status = 'healthy';
    summary = 'Healthy estuarine ecosystem with stable root matrices, good water clarity, and thriving companion wildlife.';
  } else if (finalScore >= 50) {
    status = 'vulnerable';
    summary = 'Moderate environmental stress detected (boat wake erosion or debris); recommended for guide monitoring.';
  } else {
    status = 'degraded';
    summary = 'High degradation risk; priority candidate for community Bakawan propagule replanting.';
  }

  return { score: finalScore, status, summary };
}
