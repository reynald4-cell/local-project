import express from 'express';
import type { Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

type JsonObject = Record<string, unknown>;
type GeminiContent = { text: string } | { inlineData: { data: string; mimeType: string } };

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRequestBody(value: unknown): JsonObject {
  return isJsonObject(value) ? value : {};
}

function getText(body: JsonObject, key: string, fallback = ''): string {
  const value = body[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getStringArray(body: JsonObject, key: string): string[] {
  const value = body[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function parseGeminiJson<T extends JsonObject>(rawText: string | undefined, fallback: T): T {
  const cleaned = (rawText || '').replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return isJsonObject(parsed) ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function sendServerError(res: Response, route: string, error: unknown, fallback: string) {
  console.error(`Error in ${route}:`, error);
  res.status(500).json({
    error: getErrorMessage(error, fallback),
    offlineFallback: true,
  });
}

app.use(express.json({ limit: '15mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Species Identification & Field Diagnostic
app.post('/api/identify-species', async (req, res) => {
  try {
    const body = getRequestBody(req.body);
    const observationText = getText(body, 'observationText', 'Not specified');
    const rootType = getText(body, 'rootType', 'Unknown');
    const leafType = getText(body, 'leafType', 'Unknown');
    const zone = getText(body, 'zone', 'Intertidal');
    const photoBase64 = getText(body, 'photoBase64');
    const mimeType = getText(body, 'mimeType', 'image/jpeg');

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Using offline botanical key identification.',
        offlineFallback: true,
      });
    }

    const contents: GeminiContent[] = [];

    let prompt = `You are a veteran Philippine coastal mangrove kayak guide and marine botanist in Del Carmen, Siargao.
Analyze the following mangrove observation from a kayak expedition in a Philippine coastal wetland or estuary. Focus on native Philippine species such as Bakawan Babae (Rhizophora mucronata), Bakawan Lalaki (Rhizophora apiculata), Pagatpat (Sonneratia alba), Api-api / Bungalon (Avicennia marina), Pototan (Bruguiera sexangula), Tabigi (Xylocarpus granatum), or Nipa (Nypa fruticans).
Provide a clear scientific and practical field assessment.

Observations:
- Observed Features: ${observationText}
- Root architecture noted: ${rootType}
- Leaf characteristics: ${leafType}
- Coastal Zone / Tidal elevation: ${zone}

Return ONLY a valid JSON object matching this schema (do not wrap with code fences or other text):
{
  "identifiedSpecies": "Local name • Scientific name (English Common name)",
  "confidenceScore": 92,
  "keyDiagnosticFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "salinityTolerance": "Detailed range in ppt (parts per thousand)",
  "rootSystem": "Detailed morphological description and function",
  "ecologicalRole": "Specific role in coastal typhoon protection, crab/fish nursery, or blue carbon",
  "guideTip": "A practical kayak naturalist tip for pointing this out to paddlers",
  "restorationAdvice": "Recommendation for monitoring or planting along Philippine mudbanks"
}`;

    if (photoBase64) {
      contents.push({
        inlineData: {
          data: photoBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType,
        },
      });
      prompt += "\nAn image of the mangrove specimen taken from the kayak is also attached. Focus on identifying root type, leaf morphology, and propagules.";
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
    });

    const fallback = {
      identifiedSpecies: "Bakawan Babae • Rhizophora mucronata (Loop-root Mangrove)",
      confidenceScore: 92,
      keyDiagnosticFeatures: ["Arching stilt prop roots extending into tidal water", "Elongated viviparous propagules with pointed mucronate leaf tips", "Thick leathery dark green leaves"],
      salinityTolerance: "10 - 38 ppt (efficient root ultrafiltration excludes 99% of sea salt)",
      rootSystem: "Looping stilt roots with abundant lenticels providing oxygen exchange in waterlogged coastal mud",
      ecologicalRole: "Critical natural typhoon break, dissipates surge energy and creates nursery habitat for juvenile Danggit and Alimango mud crabs",
      guideTip: "Check the mud beneath the stilt roots for juvenile mudskippers and oyster clusters.",
      restorationAdvice: "Plant ripe propagules vertically 3-5 cm into soft muddy substrate along seaward fringes at mid-tide line.",
      rawAiNotes: response.text || '',
    };

    return res.json(parseGeminiJson(response.text || '', fallback));
  } catch (error: unknown) {
    sendServerError(res, '/api/identify-species', error, 'Failed to analyze observation');
  }
});

// AI Eco-Health Diagnostic
app.post('/api/analyze-health', async (req, res) => {
  try {
    const body = getRequestBody(req.body);
    const salinity = getText(body, 'salinity', '0');
    const canopyCoverage = getText(body, 'canopyCoverage', 'Not recorded');
    const sedimentCondition = getText(body, 'sedimentCondition', 'Not recorded');
    const wildlifeObserved = getStringArray(body, 'wildlifeObserved');
    const trashLevel = getText(body, 'trashLevel', 'Not recorded');
    const erosionRisk = getText(body, 'erosionRisk', 'Not recorded');
    const notes = getText(body, 'notes', 'None');

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API not configured.',
        offlineFallback: true,
      });
    }

    const prompt = `You are a coastal mangrove ecologist and veteran kayak guide monitoring a coastal mangrove ecosystem.
Evaluate the health parameters logged during a kayak transect survey:
- Water Salinity: ${salinity} ppt
- Canopy Cover: ${canopyCoverage}%
- Sediment / Substrate: ${sedimentCondition}
- Wildlife indicators observed: ${wildlifeObserved.join(', ') || 'None noted'}
- Marine debris / Trash level: ${trashLevel}
- Shoreline erosion risk: ${erosionRisk}
- Guide field notes: ${notes}

Return ONLY a valid JSON object matching this schema (do not wrap with code fences or other text):
{
  "healthIndexScore": 84,
  "statusLabel": "Healthy / Vulnerable / Degraded / Recovering",
  "summary": "Concise 2-sentence ecological summary of this mangrove stand",
  "salinityAssessment": "Interpretation of salinity level for species present",
  "indicatorSpeciesAnalysis": "What the observed wildlife indicates about trophic web health",
  "threatAnalysis": "Identified stressors or environmental pressures",
  "recommendedInterventions": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "kayakGuideBriefing": "A 2-sentence script the guide can share with kayak guests paddling through this spot"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ text: prompt }],
    });

    const fallback = {
      healthIndexScore: 80,
      statusLabel: 'Healthy',
      summary: 'Estuarine mangrove stand with balanced salinity and stable root architecture.',
      salinityAssessment: `${salinity} ppt logged for this field transect.`,
      indicatorSpeciesAnalysis: wildlifeObserved.length ? `${wildlifeObserved.length} indicator species observed, suggesting active nursery and trophic function.` : 'No wildlife indicators were logged.',
      threatAnalysis: 'No major acute stressors were identified during this survey.',
      recommendedInterventions: ['Continue regular field follow-up at next spring tide', 'Inspect sediment for erosion hotspots'],
      kayakGuideBriefing: 'Point out crab burrows and prop-root shelter to paddlers as signs of healthy mangrove habitat.'
    };

    res.json(parseGeminiJson(response.text || '', fallback));
  } catch (error: unknown) {
    sendServerError(res, '/api/analyze-health', error, 'Failed to analyze ecosystem health');
  }
});

// Ask Kayak Naturalist Assistant
app.post('/api/guide-assistant', async (req, res) => {
  try {
    const body = getRequestBody(req.body);
    const question = getText(body, 'question');
    const context = getText(body, 'context', 'Philippine coastal mangrove kayak trail in Del Carmen, Siargao');
    if (!question) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `You are "Kuya Dan", a veteran Philippine mangrove kayak guide, naturalist, and coastal conservationist in Del Carmen, Siargao.
You know everything about Philippine mangrove species like Bakawan Babae, Bakawan Lalaki, Pagatpat, Api-api, Pototan, and Tabigi; blue carbon sinks, tidal channels like Sugba Lagoon, prop roots, fiddler crabs and alimango, water salinity, fireflies (alitaptap), and community restoration techniques.
Keep your response engaging, authoritative yet warm, and practical for someone paddling a kayak.

Context: ${context}
Question from kayaker/guide: ${question}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ text: prompt }],
    });

    res.json({ answer: response.text || 'I can help with mangrove ecology, tides, and safe kayaking guidance in this coastal reserve.' });
  } catch (error: unknown) {
    sendServerError(res, '/api/guide-assistant', error, 'Assistant unavailable');
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mangrove Kayak Guide server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
