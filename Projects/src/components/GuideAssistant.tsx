import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2,
  Volume2, 
  VolumeX, 
  TreePine, 
  Compass, 
  HelpCircle, 
  WifiOff,
  Droplets,
  Waves
} from 'lucide-react';

interface GuideAssistantProps {
  isOffline: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const STORAGE_KEY = 'KUYA_DAN_CHAT_HISTORY_V1';
const MAX_RETAINED_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10_000;
const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  text: "Magandang araw paddler! I'm Kuya Dan, your Philippine kayak guide and mangrove naturalist. Whether you want to know how Bakawan roots withstand typhoons, why fireflies love Pagatpat trees, or how to measure water salinity with a refractometer, ask away!"
};

const isValidMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;

  const message = value as Record<string, unknown>;
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.text === 'string' &&
    message.text.trim().length > 0 &&
    message.text.length <= MAX_MESSAGE_LENGTH
  );
};

const loadMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') return [WELCOME_MESSAGE];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [WELCOME_MESSAGE];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isValidMessage)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [WELCOME_MESSAGE];
    }

    return parsed.slice(-MAX_RETAINED_MESSAGES);
  } catch (error) {
    console.warn('Unable to restore Kuya Dan conversation history.', error);
    return [WELCOME_MESSAGE];
  }
};

const appendMessage = (messages: ChatMessage[], message: ChatMessage) =>
  [...messages, message].slice(-MAX_RETAINED_MESSAGES);

const QUICK_QUESTIONS = [
  'How do Bakawan stilt roots protect Philippine coastlines from typhoons?',
  'Why do fireflies (alitaptap) gather in Pagatpat trees at night?',
  'How do Api-api pencil pneumatophores breathe in deep anoxic mud?',
  'What is special about the Tabigi cannonball fruit puzzle?',
  'How should we plant Bakawan propagules during coastal restoration?',
  'What are safe kayak paddling rules in shallow lagoons at low tide?',
];

const OFFLINE_KNOWLEDGE_BASE: Record<string, string> = {
  'How do Bakawan stilt roots protect Philippine coastlines from typhoons?':
    "Bakawan (Rhizophora mucronata and Rhizophora apiculata) are nature's coastal sea walls. Their arching prop and stilt roots form an interlocking biological cage that reduces incoming typhoon wave energy by up to 66%. The complex root matrix acts like a shock absorber, traps tons of organic sediment that would otherwise smother coral reefs, and anchors the coastline against storm surges in places like Siargao and Palawan.",
  
  'Why do fireflies (alitaptap) gather in Pagatpat trees at night?':
    "Pagatpat (Sonneratia alba) is celebrated as the iconic 'firefly tree' across Philippine river cuts and mangrove estuaries. The trees produce sweet floral nectar and sap that attract nocturnal pteroptyx fireflies. Thousands of male fireflies synchronize their flashing light pulses in the Pagatpat canopy to attract females, creating the world-famous bio-luminescent night kayak tours along rivers like Cancohoy in Siargao and Iwahig in Palawan!",
  
  'How do Api-api pencil pneumatophores breathe in deep anoxic mud?':
    "Api-api (Avicennia marina) grows in dense inland and seaward mudflats where stagnant mud contains zero oxygen. To breathe, Api-api sends up thousands of upright pencil-like snorkel roots called pneumatophores. Each pencil root is covered in microscopic breathing pores (lenticels). When the high tide recedes, these pores suck in oxygen from the air and channel it down through spongy tissue (aerenchyma) to subterranean roots!",
  
  'What is special about the Tabigi cannonball fruit puzzle?':
    "Tabigi or Nyireh Bunga (Xylocarpus granatum) produces heavy woody spherical fruits the size of cannonballs. Inside, tightly fitted pyramidal seeds form a natural wooden 3D puzzle. Local coastal fishers and children challenge one another to take the interlocking seeds apart and put the sphere back together! The astringent bark is also used in traditional herbal medicine and wood carving.",

  'How should we plant Bakawan propagules during coastal restoration?':
    "Never snap unripe green propagules off mother trees. Collect ripe, dark-green hypocotyls with reddish collars that have naturally fallen and are floating in the kayak cuts. When planting along mudbank transects, insert the pointed tip 3 to 5 centimeters vertically into the soft sediment at mid-tide line, ensuring the terminal bud stays clear above the mud. Plant with 1-meter spacing to allow proper root spread.",

  'What are safe kayak paddling rules in shallow lagoons at low tide?':
    "Always check the tide chart before setting out. In shallow Philippine lagoons (like Sugba Lagoon), low tide exposes razor-sharp oyster beds (talaba) and coral limestone heads. Never step barefoot into the mud or onto oyster beds. Paddle quietly without churning bottom silt, avoid scraping fragile prop roots, and yield right-of-way to local wooden paddle bancas."
};

export const GuideAssistant: React.FC<GuideAssistantProps> = ({ isOffline }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const requestIdRef = useRef(0);
  const offlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_RETAINED_MESSAGES))
      );
    } catch (error) {
      console.warn('Unable to save Kuya Dan conversation history.', error);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      if (offlineTimeoutRef.current) clearTimeout(offlineTimeoutRef.current);
      abortControllerRef.current?.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || inputText).trim();
    if (!q) return;

    const requestId = ++requestIdRef.current;
    const normalizedQuestion = q.toLowerCase();
    const offlineKnowledgeMatch = Object.entries(OFFLINE_KNOWLEDGE_BASE).find(
      ([question]) => question.toLowerCase() === normalizedQuestion
    );

    setMessages((prev) => appendMessage(prev, { role: 'user', text: q }));
    setInputText('');
    setIsLoading(true);

    // If offline or matched in offline KB
    if (isOffline || offlineKnowledgeMatch) {
      offlineTimeoutRef.current = setTimeout(() => {
        if (requestId !== requestIdRef.current) return;
        const answer = offlineKnowledgeMatch?.[1] ||
          "As an offline kayak guide in the Philippine mangrove ecosystem, I can verify that native halophytes like Bakawan, Pagatpat, Api-api, and Pototan are crucial for coastal protection and fish nurseries. Paddle with light strokes and observe the distinct root structures: stilt roots for Bakawan, pencil pneumatophores for Api-api, and knee loops for Pototan!";
        setMessages((prev) => appendMessage(prev, { role: 'assistant', text: answer }));
        setIsLoading(false);
        offlineTimeoutRef.current = null;
      }, 450);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch('/api/guide-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          question: q,
          context: 'Kayaking in Del Carmen, Siargao Mangrove Reserve, observing Philippine mangrove species including Bakawan, Pagatpat, Api-api, Pototan, mud crabs, and fireflies.'
        }),
      });

      if (!res.ok) throw new Error('API unavailable');
      const data: unknown = await res.json();
      if (
        !data ||
        typeof data !== 'object' ||
        !('answer' in data) ||
        typeof data.answer !== 'string' ||
        !data.answer.trim() ||
        data.answer.length > MAX_MESSAGE_LENGTH
      ) {
        throw new Error('Invalid API response');
      }
      const answer = data.answer;
      if (requestId !== requestIdRef.current) return;
      setMessages((prev) => appendMessage(prev, { role: 'assistant', text: answer }));
    } catch (error) {
      if (abortController.signal.aborted || requestId !== requestIdRef.current) return;
      console.warn('Unable to reach the Kuya Dan guide service; using offline guidance.', error);
      const fallback = offlineKnowledgeMatch?.[1] ||
        "In Philippine coastal wetlands, Bakawan (Rhizophora) excludes salt at the root membranes, Api-api (Avicennia) excretes salt on leaf undersides, and Pagatpat (Sonneratia) hosts bio-luminescent fireflies. Check our Identify tab for full botanical dossiers!";
      setMessages((prev) => appendMessage(prev, { role: 'assistant', text: fallback }));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const clearConversation = () => {
    if (!window.confirm('Clear your conversation with Kuya Dan? This cannot be undone.')) return;

    requestIdRef.current += 1;
    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current);
      offlineTimeoutRef.current = null;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
    setInputText('');
    setMessages([WELCOME_MESSAGE]);
  };

  const speakLastMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Banner in Earth Colors */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            Kuya Dan &bull; Philippine Kayak Guide &amp; Naturalist
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Ask botanical, tidal, ecological, or restoration questions &bull; Works 100% offline with onboard local ecological knowledge.
          </p>
        </div>

        {isOffline && (
          <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
            <WifiOff className="w-3 h-3 text-amber-700" />
            Offline Onboard KB
          </span>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          Suggested Field Questions for Kayakers:
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-left text-xs bg-white hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-xl border border-stone-300 hover:border-emerald-600 transition shadow-2xs font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 h-[420px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                msg.role === 'user'
                  ? 'bg-emerald-800 text-white rounded-tr-xs shadow-xs'
                  : 'bg-[#f6f4ee] text-stone-800 border border-stone-200/80 rounded-tl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b pb-1 mb-1 border-current/20">
                <span className="font-bold text-[11px]">
                  {msg.role === 'user' ? 'You (Paddler)' : 'Kuya Dan (Kayak Naturalist)'}
                </span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakLastMessage(msg.text)}
                    className="p-1 text-stone-500 hover:text-emerald-700 transition"
                    title="Audio Readout"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f6f4ee] rounded-2xl p-3 border border-stone-200 text-xs flex items-center space-x-2 text-stone-600">
              <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>Consulting field naturalist knowledge base...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearConversation}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          aria-label="Clear conversation history"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear conversation
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Ask Kuya Dan about Philippine mangroves, roots, wildlife, or safe kayaking..."
          className="flex-1 text-xs p-3 rounded-xl border border-stone-300 focus:outline-emerald-700 bg-white shadow-2xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
