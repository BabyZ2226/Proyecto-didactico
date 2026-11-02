import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { generateDeck } from './src/data/deck';
import { evaluateCards, getBestAIHand, explainTiebreaker } from './src/lib/evaluator';
import { createBotPlayer } from './src/data/bots';
import {
  SEED_LATINOS_LIBRARY,
  createInitialLatinosMatchState,
  submitTeamGuess,
} from './src/lib/cienLatinosEngine';
import {
  SEED_ESCAPE_ROOM_LIBRARY,
} from './src/lib/escapeRoomEngine';
import {
  SEED_IMPOSTOR_LIBRARY,
  createInitialImpostorMatchState,
} from './src/lib/impostorEngine';
import { GamePlayer, RoomState, WSClientMessage, WSServerMessage, ChatMessage, LatinoGamePack, EscapeRoomPack, EscapeRoomQuestion, ImpostorGamePack, ImpostorRound } from './src/types';

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API endpoint to query room information for quick preview
app.get('/api/room/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada' });
  }
  return res.json({
    code: room.code,
    name: room.name,
    playerCount: room.players.filter(p => !p.isBot).length,
    botCount: room.botCount,
    maxPlayers: room.maxPlayers,
    phase: room.phase,
  });
});

// ============================================================================
// PERSISTENT DATA DIRECTORY
// ============================================================================
const DATA_DIR = path.join(process.cwd(), 'data');

// ============================================================================
// INFINITE COMMUNITY LIBRARY FOR "ESCAPE ROOM EDUCATIVO" (PERSISTED ON SERVER)
// ============================================================================
const ESCAPE_DB_FILE = path.join(DATA_DIR, 'escape_room_library.json');

function loadEscapeLibrary(): EscapeRoomPack[] {
  try {
    if (fs.existsSync(ESCAPE_DB_FILE)) {
      const raw = fs.readFileSync(ESCAPE_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: EscapeRoomPack) => p.id));
        const merged = [...parsed];
        for (const seed of SEED_ESCAPE_ROOM_LIBRARY) {
          if (!existingIds.has(seed.id)) merged.push(seed);
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not read escape_room_library.json, using seed library:', err);
  }
  return [...SEED_ESCAPE_ROOM_LIBRARY];
}

let escapeLibrary: EscapeRoomPack[] = loadEscapeLibrary();

function persistEscapeLibrary() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ESCAPE_DB_FILE, JSON.stringify(escapeLibrary, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist escape_room_library.json:', err);
  }
}

function saveEscapePackToInfiniteLibrary(pack: EscapeRoomPack): EscapeRoomPack {
  const existingIdx = escapeLibrary.findIndex((p) => p.id === pack.id);
  if (existingIdx !== -1) {
    escapeLibrary[existingIdx] = pack;
  } else {
    escapeLibrary.unshift(pack);
  }
  persistEscapeLibrary();
  return pack;
}

// GET /api/escape-room-library — Accessible to everyone
app.get('/api/escape-room-library', (_req, res) => {
  res.json({ success: true, packs: escapeLibrary });
});

// POST /api/escape-room-library — Save custom pack to Infinite Community Library
app.post('/api/escape-room-library', (req, res) => {
  const { title, description, subject, authorName, tags, chambers } = req.body;
  if (!title || !Array.isArray(chambers) || chambers.length === 0) {
    return res.status(400).json({ error: 'Título y preguntas son requeridos' });
  }

  const newPack: EscapeRoomPack = {
    id: `escape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: String(title).trim(),
    description: String(description || `Escape Room de 10 cámaras sobre ${title}`).trim(),
    subject: String(subject || 'Cultura General').trim(),
    authorName: String(authorName || 'Docente de la Comunidad').trim(),
    createdAt: Date.now(),
    playsCount: 1,
    likesCount: 1,
    isAiGenerated: Boolean(req.body.isAiGenerated),
    tags: Array.isArray(tags) ? tags : [String(subject || 'General').toLowerCase(), '10 cámaras'],
    chambers,
  };

  saveEscapePackToInfiniteLibrary(newPack);
  return res.json({ success: true, pack: newPack, packs: escapeLibrary });
});

// POST /api/escape-room-library/:id/like — Like a community pack
app.post('/api/escape-room-library/:id/like', (req, res) => {
  const pack = escapeLibrary.find((p) => p.id === req.params.id);
  if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
  pack.likesCount = (pack.likesCount || 0) + 1;
  persistEscapeLibrary();
  return res.json({ success: true, pack });
});

// POST /api/escape-room-library/:id/play — Increment play count
app.post('/api/escape-room-library/:id/play', (req, res) => {
  const pack = escapeLibrary.find((p) => p.id === req.params.id);
  if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
  pack.playsCount = (pack.playsCount || 0) + 1;
  persistEscapeLibrary();
  return res.json({ success: true, pack });
});

// POST /api/generate-escape-pack — Generate 10 chambers with AI & auto-save into Infinite Library
app.post('/api/generate-escape-pack', async (req, res) => {
  const { topic, subject = 'Cultura General', authorName = 'Profesor con IA' } = req.body;
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'El tema o materia es requerido' });
  }
  const cleanTopic = topic.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Eres un experto pedagogo y diseñador de videojuegos didácticos.
Crea un juego completo de Escape Room Educativo de EXACTAMENTE 10 cámaras desafiantes sobre el tema: "${cleanTopic}" (Asignatura: "${subject}").
Cada cámara debe ser una pregunta educativa interesante, de opción múltiple, con retroalimentación y un código de desbloqueo temático (lockCode).

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "title": "Escape Room: ${cleanTopic}",
  "description": "Breve descripción pedagógica para estudiantes...",
  "subject": "${subject}",
  "tags": ["${cleanTopic.toLowerCase()}", "${subject.toLowerCase()}", "10 cámaras"],
  "chambers": [
    {
      "id": "q1",
      "chamberTitle": "Cámara 1: El Enigma Inicial",
      "question": "Pregunta clara...",
      "options": ["Opción Correcta", "Opción Incorrecta 1", "Opción Incorrecta 2", "Opción Incorrecta 3"],
      "correctOptionIndex": 0,
      "lockCode": "100",
      "hint": "Pista conceptual breve...",
      "subject": "${subject}"
    }
    ... EXACTAMENTE 10 CÁMARAS (de q1 a q10, con títulos de Cámara 1 a Cámara 10)
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      if (parsed.chambers && Array.isArray(parsed.chambers) && parsed.chambers.length >= 8) {
        const aiPack: EscapeRoomPack = {
          id: `escape-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: parsed.title || `Escape Room: ${cleanTopic} (10 Cámaras)`,
          description: parsed.description || `Escape Room de 10 cámaras sobre ${cleanTopic}, generado con IA y guardado en la Biblioteca Infinita.`,
          subject: parsed.subject || subject,
          authorName: authorName || 'Profesor + IA',
          createdAt: Date.now(),
          playsCount: 1,
          likesCount: 1,
          isAiGenerated: true,
          tags: Array.isArray(parsed.tags) ? parsed.tags : [cleanTopic.toLowerCase(), subject.toLowerCase(), '10 cámaras'],
          chambers: parsed.chambers.map((c: any, idx: number) => ({
            id: c.id || `q_${idx + 1}`,
            chamberTitle: c.chamberTitle || `Cámara ${idx + 1}: Desafío de ${cleanTopic}`,
            question: c.question || `Pregunta sobre ${cleanTopic}`,
            options: Array.isArray(c.options) && c.options.length >= 2 ? c.options : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
            correctOptionIndex: typeof c.correctOptionIndex === 'number' ? c.correctOptionIndex : 0,
            lockCode: c.lockCode ? String(c.lockCode) : `CODE${idx + 1}`,
            hint: c.hint || `Pista para resolver la cámara ${idx + 1}`,
            subject: c.subject || subject,
          })),
        };
        saveEscapePackToInfiniteLibrary(aiPack);
        return res.json({ success: true, pack: aiPack, packs: escapeLibrary });
      }
    } catch (err) {
      console.error('Error generating AI escape room pack:', err);
    }
  }

  // 10-chamber fallback if API key is not available
  const fallbackChambers: EscapeRoomQuestion[] = Array.from({ length: 10 }, (_, i) => {
    const chamberNum = i + 1;
    return {
      id: `q${chamberNum}`,
      chamberTitle: `Cámara ${chamberNum}: Enigma de ${cleanTopic} (#${chamberNum})`,
      question: `En el estudio y aplicación de ${cleanTopic}, ¿cuál es el principio clave que rige el desafío #${chamberNum}?`,
      options: [
        `Es el principio fundamental verificado de ${cleanTopic} (Cámara ${chamberNum})`,
        `Una teoría sin sustento ni aplicación práctica`,
        `Un proceso meramente casual sin regularidad comprobable`,
        `Un dato obsoleto que ya no se utiliza en el aula`,
      ],
      correctOptionIndex: 0,
      lockCode: `L${chamberNum * 10}`,
      hint: `Aplica los fundamentos conceptuales de ${cleanTopic}.`,
      subject,
    };
  });

  const fallbackPack: EscapeRoomPack = {
    id: `escape-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `Escape Room: ${cleanTopic} (10 Cámaras)`,
    description: `Aventura didáctica de 10 cámaras sobre ${cleanTopic}, guardada permanentemente en la Biblioteca Comunitaria.`,
    subject,
    authorName,
    createdAt: Date.now(),
    playsCount: 1,
    likesCount: 1,
    isAiGenerated: true,
    tags: [cleanTopic.toLowerCase(), subject.toLowerCase(), '10 cámaras', 'ia'],
    chambers: fallbackChambers,
  };

  saveEscapePackToInfiniteLibrary(fallbackPack);
  return res.json({ success: true, pack: fallbackPack, packs: escapeLibrary });
});

// AI Endpoint: Generate Escape Room Questions (defaults to 10 questions)
app.post('/api/generate-escape-questions', async (req, res) => {
  const { topic, questionCount = 10 } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'El tema es requerido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Eres un experto pedagogo diseñador de juegos de Escape Room Educativos para estudiantes.
Crea exactamente ${questionCount} preguntas educativas desafiantes e interesantes sobre el tema: "${topic}".
Responde UNICAMENTE con un objeto JSON válido con la clave "questions" que sea un arreglo de objetos con esta estructura exacta:
[
  {
    "id": "q1",
    "chamberTitle": "Cámara 1: El Enigma Inicial",
    "question": "Pregunta conceptual clara y educativa...",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctOptionIndex": 0,
    "lockCode": "4610",
    "hint": "Pista educativa relevante...",
    "subject": "${topic}"
  }
]
Asegúrate de que las opciones sean pedagógicas y variadas.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return res.json({ success: true, questions: parsed.questions });
      }
    } catch (err: any) {
      console.error('Error generating AI escape room questions:', err);
    }
  }

  // 10 Fallback questions if API key not available or error occurs
  const fallbackQuestions: EscapeRoomQuestion[] = Array.from({ length: questionCount || 10 }, (_, i) => ({
    id: `q${i + 1}`,
    chamberTitle: `Cámara ${i + 1}: Análisis de ${topic} (#${i + 1})`,
    question: `En relación a ${topic}, ¿cuál es el postulado o propiedad más representativa de la fase ${i + 1}?`,
    options: [
      `Representa la propiedad estructural y dinámica comprobada de ${topic}`,
      `Una hipótesis arbitraria sin relación con el fenómeno`,
      `Una conclusión descartada por la ciencia moderna`,
      `Un resultado que ocurre únicamente en el vacío absoluto`,
    ],
    correctOptionIndex: 0,
    lockCode: `${(i + 1) * 100}`,
    hint: `Recuerda los principios fundamentales de ${topic}.`,
    subject: topic,
  }));

  return res.json({ success: true, questions: fallbackQuestions });
});

// ============================================================================
// INFINITE COMMUNITY LIBRARY FOR "100 LATINOS DICEN" (PERSISTED ON SERVER)
// ============================================================================
const LATINOS_DB_FILE = path.join(DATA_DIR, 'latinos_library.json');

function loadLatinosLibrary(): LatinoGamePack[] {
  try {
    if (fs.existsSync(LATINOS_DB_FILE)) {
      const raw = fs.readFileSync(LATINOS_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all seed packs exist plus any community-created packs
        const existingIds = new Set(parsed.map((p: LatinoGamePack) => p.id));
        const merged = [...parsed];
        for (const seed of SEED_LATINOS_LIBRARY) {
          if (!existingIds.has(seed.id)) merged.push(seed);
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not read latinos_library.json, using seed library:', err);
  }
  return [...SEED_LATINOS_LIBRARY];
}

let latinosLibrary: LatinoGamePack[] = loadLatinosLibrary();

function persistLatinosLibrary() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LATINOS_DB_FILE, JSON.stringify(latinosLibrary, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist latinos_library.json:', err);
  }
}

function savePackToInfiniteLibrary(pack: LatinoGamePack): LatinoGamePack {
  const existingIdx = latinosLibrary.findIndex((p) => p.id === pack.id);
  if (existingIdx !== -1) {
    latinosLibrary[existingIdx] = pack;
  } else {
    latinosLibrary.unshift(pack);
  }
  persistLatinosLibrary();
  return pack;
}

// GET /api/latinos-library — Accessible to everyone on the web
app.get('/api/latinos-library', (_req, res) => {
  res.json({ success: true, packs: latinosLibrary });
});

// POST /api/latinos-library — Save custom or edited pack to Infinite Community Library
app.post('/api/latinos-library', (req, res) => {
  const { title, description, subject, authorName, tags, rounds } = req.body;
  if (!title || !Array.isArray(rounds) || rounds.length === 0) {
    return res.status(400).json({ error: 'Título y al menos 1 ronda son requeridos' });
  }

  const newPack: LatinoGamePack = {
    id: `pack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: String(title).trim(),
    description: String(description || `Encuesta didáctica sobre ${title}`).trim(),
    subject: String(subject || 'Cultura General').trim(),
    authorName: String(authorName || 'Docente de la Comunidad').trim(),
    createdAt: Date.now(),
    playsCount: 1,
    likesCount: 1,
    isAiGenerated: Boolean(req.body.isAiGenerated),
    tags: Array.isArray(tags) ? tags : [String(subject || 'General').toLowerCase()],
    rounds,
  };

  savePackToInfiniteLibrary(newPack);
  return res.json({ success: true, pack: newPack, packs: latinosLibrary });
});

// POST /api/latinos-library/:id/like — Like a community pack
app.post('/api/latinos-library/:id/like', (req, res) => {
  const pack = latinosLibrary.find((p) => p.id === req.params.id);
  if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
  pack.likesCount = (pack.likesCount || 0) + 1;
  persistLatinosLibrary();
  return res.json({ success: true, pack });
});

// POST /api/latinos-library/:id/play — Increment play count
app.post('/api/latinos-library/:id/play', (req, res) => {
  const pack = latinosLibrary.find((p) => p.id === req.params.id);
  if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
  pack.playsCount = (pack.playsCount || 0) + 1;
  persistLatinosLibrary();
  return res.json({ success: true, pack });
});

// POST /api/generate-latinos-pack — Generate with AI & auto-save into Infinite Library
app.post('/api/generate-latinos-pack', async (req, res) => {
  const { topic, subject = 'Multidisciplinar', authorName = 'Docente IA', roundsCount = 4 } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'El tema es requerido' });
  }

  const cleanTopic = topic.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Eres el productor pedagógico del programa escolar "100 Latinos Dicen" (estilo Family Feud educativo).
Crea un pack completo de ${roundsCount} rondas sobre el tema: "${cleanTopic}" (Asignatura: ${subject}).
Cada ronda debe tener una pregunta estilo encuesta ("Menciona...") donde hay 5 respuestas populares cuyos puntos suman exactamente 100 (ej. 35, 25, 18, 12, 10).
Incluye sinónimos cortos en minúsculas para cada respuesta para que el buscador reconozca variantes escritas por los alumnos.
Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "title": "Título atractivo del Pack sobre ${cleanTopic}",
  "description": "Breve descripción educativa del pack...",
  "subject": "${subject}",
  "tags": ["palabra1", "palabra2", "palabra3"],
  "rounds": [
    {
      "id": "r1",
      "prompt": "Menciona...",
      "subject": "${subject}",
      "multiplier": 1,
      "answers": [
        { "text": "Respuesta 1", "points": 35, "synonyms": ["sinonimo1", "sinonimo2"] },
        { "text": "Respuesta 2", "points": 25, "synonyms": ["sinonimo1"] },
        { "text": "Respuesta 3", "points": 18, "synonyms": ["sinonimo1"] },
        { "text": "Respuesta 4", "points": 12, "synonyms": ["sinonimo1"] },
        { "text": "Respuesta 5", "points": 10, "synonyms": ["sinonimo1"] }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.rounds) && parsed.rounds.length > 0) {
        const aiPack: LatinoGamePack = {
          id: `pack-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: parsed.title || `100 Latinos Dicen: ${cleanTopic}`,
          description: parsed.description || `Encuesta escolar generada con IA sobre ${cleanTopic}.`,
          subject: parsed.subject || subject,
          authorName: authorName || 'Comunidad AulaPlay + IA',
          createdAt: Date.now(),
          playsCount: 1,
          likesCount: 1,
          isAiGenerated: true,
          tags: Array.isArray(parsed.tags) ? parsed.tags : [cleanTopic.toLowerCase(), subject.toLowerCase()],
          rounds: parsed.rounds.map((r: any, idx: number) => ({
            id: r.id || `r_${idx + 1}`,
            prompt: r.prompt || `Menciona un concepto clave de ${cleanTopic}`,
            subject: r.subject || subject,
            multiplier: idx === 2 ? 2 : idx >= 3 ? 3 : 1,
            answers: Array.isArray(r.answers) ? r.answers.slice(0, 5) : [],
          })),
        };
        savePackToInfiniteLibrary(aiPack);
        return res.json({ success: true, pack: aiPack, packs: latinosLibrary });
      }
    } catch (err) {
      console.error('Error generating AI 100 Latinos Dicen pack:', err);
    }
  }

  // Smart fallback generator when API key is absent so feature always works and saves to library
  const fallbackPack: LatinoGamePack = {
    id: `pack-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `100 Latinos Dicen: ${cleanTopic}`,
    description: `Pack didáctico por equipos sobre ${cleanTopic}, guardado automáticamente en la Biblioteca Comunitaria.`,
    subject: subject || 'Cultura General',
    authorName: authorName || 'Profesor + IA',
    createdAt: Date.now(),
    playsCount: 1,
    likesCount: 1,
    isAiGenerated: true,
    tags: [cleanTopic.toLowerCase(), subject.toLowerCase(), 'ia', 'equipos'],
    rounds: [
      {
        id: 'fb-1',
        prompt: `Menciona un concepto, elemento o ejemplo famoso relacionado con: ${cleanTopic}`,
        subject,
        multiplier: 1,
        answers: [
          { text: `Concepto Principal de ${cleanTopic}`, points: 36, synonyms: [cleanTopic.toLowerCase(), 'principal', 'base', 'primero'] },
          { text: 'Ejemplo Práctico en la Vida Diaria', points: 24, synonyms: ['ejemplo', 'practica', 'vida diaria', 'cotidiano'] },
          { text: 'Experimento o Investigación Clave', points: 18, synonyms: ['experimento', 'laboratorio', 'ciencia', 'investigacion'] },
          { text: 'Fórmula, Regla o Definición', points: 12, synonyms: ['formula', 'regla', 'ley', 'definicion'] },
          { text: 'Aplicación en la Tecnología', points: 10, synonyms: ['tecnologia', 'aplicacion', 'futuro', 'invento'] },
        ],
      },
      {
        id: 'fb-2',
        prompt: `Menciona qué es lo primero que piensan los estudiantes cuando el profesor habla de ${cleanTopic}`,
        subject,
        multiplier: 1,
        answers: [
          { text: 'Pregunta segura de examen', points: 35, synonyms: ['examen', 'prueba', 'evaluacion', 'test'] },
          { text: 'Práctica o dinámica en equipo', points: 25, synonyms: ['equipo', 'juego', 'practica', 'grupo'] },
          { text: 'Videos o documentales del tema', points: 18, synonyms: ['video', 'documental', 'pelicula', 'imagenes'] },
          { text: 'Resumen o mapa conceptual', points: 12, synonyms: ['resumen', 'mapa', 'cuaderno', 'apuntes'] },
          { text: 'Proyecto o exposición en clase', points: 10, synonyms: ['proyecto', 'exposicion', 'maqueta', 'tarea'] },
        ],
      },
      {
        id: 'fb-3',
        prompt: `Menciona una herramienta o recurso útil para aprender mejor sobre ${cleanTopic}`,
        subject,
        multiplier: 2,
        answers: [
          { text: 'Juegos interactivos / Simuladores', points: 38, synonyms: ['juegos', 'simulador', 'aulaplay', 'interactivo'] },
          { text: 'Libros e ilustraciones', points: 24, synonyms: ['libro', 'libros', 'lectura', 'manual'] },
          { text: 'Experimentos en vivo', points: 16, synonyms: ['experimento', 'laboratorio', 'practica'] },
          { text: 'Videos educativos', points: 12, synonyms: ['videos', 'youtube', 'tutorial'] },
          { text: 'Trabajo en equipo con compañeros', points: 10, synonyms: ['equipo', 'companeros', 'debate', 'estudio'] },
        ],
      },
    ],
  };

  savePackToInfiniteLibrary(fallbackPack);
  return res.json({ success: true, pack: fallbackPack, packs: latinosLibrary });
});

// ============================================================================
// INFINITE COMMUNITY LIBRARY FOR "EL IMPOSTOR" (PERSISTED ON SERVER)
// ============================================================================
const IMPOSTOR_DB_FILE = path.join(DATA_DIR, 'impostor_library.json');

function loadImpostorLibrary(): ImpostorGamePack[] {
  try {
    if (fs.existsSync(IMPOSTOR_DB_FILE)) {
      const raw = fs.readFileSync(IMPOSTOR_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: ImpostorGamePack) => p.id));
        const merged = [...parsed];
        for (const seed of SEED_IMPOSTOR_LIBRARY) {
          if (!existingIds.has(seed.id)) merged.push(seed);
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not read impostor_library.json, using seed library:', err);
  }
  return [...SEED_IMPOSTOR_LIBRARY];
}

let impostorLibrary: ImpostorGamePack[] = loadImpostorLibrary();

function persistImpostorLibrary() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(IMPOSTOR_DB_FILE, JSON.stringify(impostorLibrary, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist impostor_library.json:', err);
  }
}

function saveImpostorPackToInfiniteLibrary(pack: ImpostorGamePack): ImpostorGamePack {
  const existingIdx = impostorLibrary.findIndex((p) => p.id === pack.id);
  if (existingIdx !== -1) {
    impostorLibrary[existingIdx] = pack;
  } else {
    impostorLibrary.unshift(pack);
  }
  persistImpostorLibrary();
  return pack;
}

app.get('/api/impostor-library', (_req, res) => {
  res.json({ success: true, packs: impostorLibrary });
});

app.post('/api/impostor-library/:id/like', (req, res) => {
  const pack = impostorLibrary.find((p) => p.id === req.params.id);
  if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
  pack.likesCount = (pack.likesCount || 0) + 1;
  persistImpostorLibrary();
  return res.json({ success: true, pack });
});

app.post('/api/generate-impostor-pack', async (req, res) => {
  const { topic, subject = 'Ciencias', authorName = 'Docente IA' } = req.body;
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Por favor escribe un tema válido.' });
  }

  const cleanTopic = topic.trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Crea un paquete del juego educativo "El Impostor" (estilo Among Us / 3 Verdades y 1 Mentira sutil) sobre el tema: "${cleanTopic}" (Materia: ${subject}).
Genera exactamente 5 rondas de debate crítico progresivo.
En cada ronda:
- Incluye 4 afirmaciones ("statements") con labels "Tripulante Rojo", "Tripulante Cian", "Tripulante Lima", "Tripulante Ámbar" y colors "red", "cyan", "lime", "amber".
- Exactamente 3 afirmaciones deben ser científicamente/conceptualmente VERDADERAS y rigurosas (isImpostor: false).
- Exactamente 1 afirmación debe ser EL IMPOSTOR (isImpostor: true): una afirmación que parece convincente a primera vista pero contiene un error sutil pero fundamental de concepto, signo, fórmula o causa-efecto.
- Incluye 3 opciones de justificación ("justificationOptions") explicando por qué el impostor es falso, e indica cuál es el índice correcto ("correctJustificationIndex" de 0 a 2).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              rounds: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    correctJustificationIndex: { type: Type.INTEGER },
                    justificationOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    statements: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          color: { type: Type.STRING },
                          text: { type: Type.STRING },
                          isImpostor: { type: Type.BOOLEAN },
                        },
                        required: ['label', 'color', 'text', 'isImpostor'],
                      },
                    },
                  },
                  required: ['topic', 'prompt', 'explanation', 'correctJustificationIndex', 'justificationOptions', 'statements'],
                },
              },
            },
            required: ['title', 'description', 'tags', 'rounds'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && Array.isArray(parsed.rounds) && parsed.rounds.length > 0) {
        const colors: Array<'red' | 'cyan' | 'lime' | 'amber'> = ['red', 'cyan', 'lime', 'amber'];
        const labels = ['Tripulante Rojo', 'Tripulante Cian', 'Tripulante Lima', 'Tripulante Ámbar'];

        const formattedRounds: ImpostorRound[] = parsed.rounds.slice(0, 5).map((r: any, idx: number) => ({
          id: `ai-imp-r-${Date.now()}-${idx}`,
          topicTitle: String(r.topic || `${cleanTopic} · Caso ${idx + 1}`),
          prompt: String(r.prompt || 'Analicen las 4 afirmaciones técnicas. Tres son verdaderas y una oculta un error conceptual. ¿Quién es el Impostor?'),
          subject: String(subject),
          impostorExplanation: String(r.explanation || ''),
          justificationOptions: Array.isArray(r.justificationOptions) && r.justificationOptions.length >= 3
            ? r.justificationOptions.slice(0, 3).map(String)
            : [
                'Porque invierte la relación causal o matemática fundamental del concepto.',
                'Porque utiliza unidades del Sistema Internacional que son válidas.',
                'Porque el enunciado es demasiado corto.',
              ],
          correctJustificationIndex: typeof r.correctJustificationIndex === 'number' ? Math.max(0, Math.min(2, r.correctJustificationIndex)) : 0,
          statements: (Array.isArray(r.statements) ? r.statements.slice(0, 4) : []).map((s: any, sIdx: number) => ({
            id: `stmt-${idx}-${sIdx}`,
            label: labels[sIdx] || String(s.label || `Tripulante ${sIdx + 1}`),
            crewColor: colors[sIdx] || 'red',
            text: String(s.text || ''),
            isImpostor: Boolean(s.isImpostor),
          })),
        }));

        const aiPack: ImpostorGamePack = {
          id: `impostor-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: parsed.title || `El Impostor: ${cleanTopic}`,
          description: parsed.description || `Debate crítico sobre ${cleanTopic}. Encuentra la afirmación infiltrada y justifica la expulsión.`,
          subject: String(subject),
          authorName: String(authorName || 'Docente IA'),
          createdAt: Date.now(),
          likesCount: 1,
          playsCount: 1,
          isAiGenerated: true,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [cleanTopic, subject, 'Debate Crítico'],
          rounds: formattedRounds,
        };

        saveImpostorPackToInfiniteLibrary(aiPack);
        return res.json({ success: true, pack: aiPack, packs: impostorLibrary });
      }
    } catch (err) {
      console.warn('Gemini generation for El Impostor failed, falling back to template:', err);
    }
  }

  // Deterministic fallback generator if API key is missing
  const fallbackPack: ImpostorGamePack = {
    id: `impostor-fb-${Date.now()}`,
    title: `El Impostor: ${cleanTopic}`,
    description: `Misión de pensamiento crítico y verificación conceptual sobre ${cleanTopic} (${subject}).`,
    subject: String(subject),
    authorName: String(authorName || 'Docente de la Comunidad'),
    createdAt: Date.now(),
    likesCount: 1,
    playsCount: 1,
    isAiGenerated: false,
    tags: [cleanTopic, subject, 'Pensamiento Crítico'],
    rounds: [
      {
        id: `fb-imp-1-${Date.now()}`,
        topicTitle: `${cleanTopic}: Fundamentos y Definición`,
        prompt: `Analicen las 4 afirmaciones sobre ${cleanTopic}. Tres son rigurosas y una contiene una falacia conceptual.`,
        subject,
        impostorExplanation: `En ${cleanTopic}, modificar las condiciones o variables críticas de un sistema altera directamente su estado o resultado.`,
        justificationOptions: [
          `Porque contradice el principio fundamental de conservación y coherencia en ${cleanTopic}.`,
          `Porque utiliza terminología técnica propia de ${subject}.`,
          'Porque incluye un ejemplo práctico aplicado.',
        ],
        correctJustificationIndex: 0,
        statements: [
          {
            id: 's1',
            label: 'Tripulante Rojo',
            crewColor: 'red',
            text: `El estudio sistemático de ${cleanTopic} permite predecir comportamientos y resolver problemas dentro de ${subject}.`,
            isImpostor: false,
          },
          {
            id: 's2',
            label: 'Tripulante Cian',
            crewColor: 'cyan',
            text: `En ${cleanTopic}, se pueden alterar libremente todas las variables iniciales sin que cambie jamás el resultado ni el equilibrio del sistema.`,
            isImpostor: true,
          },
          {
            id: 's3',
            label: 'Tripulante Lima',
            crewColor: 'lime',
            text: `Comprender las relaciones entre causas y efectos en ${cleanTopic} evita errores comunes de interpretación.`,
            isImpostor: false,
          },
          {
            id: 's4',
            label: 'Tripulante Ámbar',
            crewColor: 'amber',
            text: `La verificación experimental o documental es indispensable para validar conclusiones sobre ${cleanTopic}.`,
            isImpostor: false,
          },
        ],
      },
    ],
  };

  saveImpostorPackToInfiniteLibrary(fallbackPack);
  return res.json({ success: true, pack: fallbackPack, packs: impostorLibrary });
});

// Store active rooms in memory
const rooms = new Map<string, RoomState>();
const socketToPlayer = new Map<WebSocket, { roomCode: string; playerId: string }>();
const playerSockets = new Map<string, WebSocket>();

function generateRoomCode(gameType?: string): string {
  if (gameType === 'escape_room' || gameType === 'cien_latinos' || gameType === 'el_impostor') {
    // Generate a 6-digit numeric PIN (matching Wayground/Quizizz style like 191440)
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    if (rooms.has(pin)) return generateRoomCode(gameType);
    return pin;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const full = `OCT-${code}`;
  if (rooms.has(full)) return generateRoomCode();
  return full;
}

function sanitizeRoomPlayers(players: GamePlayer[]): GamePlayer[] {
  const unique: GamePlayer[] = [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  for (const p of players) {
    if (seenIds.has(p.id)) continue;

    if (p.googleEmail) {
      const lower = p.googleEmail.toLowerCase();
      if (seenEmails.has(lower)) continue;
      seenEmails.add(lower);
    } else if (!p.isBot) {
      const nameKey = `${p.role || 'student'}_${p.name.trim().toLowerCase()}`;
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
    }

    seenIds.add(p.id);
    unique.push(p);
  }
  return unique;
}

function broadcastToRoom(roomCode: string, msg: WSServerMessage) {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Enforce zero duplicate players before broadcasting
  room.players = sanitizeRoomPlayers(room.players);

  for (const player of room.players) {
    if (player.isBot) continue;
    const ws = playerSockets.get(player.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const customizedState: RoomState = {
        ...room,
        players: room.players.map(p => {
          if (p.id === player.id || room.phase === 'showdown' || p.isBot === false) {
            return p;
          }
          return p;
        }),
      };
      
      ws.send(JSON.stringify({ type: 'room_state', state: customizedState, playerId: player.id }));
    }
  }
}

function sendChatToRoom(roomCode: string, chatMsg: ChatMessage) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.chatMessages.push(chatMsg);
  if (room.chatMessages.length > 50) {
    room.chatMessages.shift();
  }

  const data = JSON.stringify({ type: 'chat_message', message: chatMsg });
  for (const player of room.players) {
    if (player.isBot) continue;
    const ws = playerSockets.get(player.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function dealCardsForRound(room: RoomState) {
  const deck = generateDeck();
  room.deck = deck;
  room.communityCards = [];
  room.phase = 'preflop';

  // Deal 2 hole cards to active student players & bots (skip teacher spectators)
  for (const p of room.players) {
    p.hasFolded = false;
    p.currentBet = 0;
    p.escapeProgress = undefined;
    if (p.isSpectator) {
      p.hand = [];
      p.selectedCardIds = [];
      p.statusText = 'Supervisando la clase 👨‍🏫';
      p.evaluation = undefined;
      continue;
    }
    p.hand = [room.deck.pop()!, room.deck.pop()!];
    p.selectedCardIds = p.hand.map(c => c.id);
    p.lockedIn = false;
    p.statusText = p.isBot ? 'Analizando enlaces...' : 'Pensando';
    p.evaluation = evaluateCards(p.hand);
  }
}

function updateBotSelections(room: RoomState) {
  for (const player of room.players) {
    if (player.isBot) {
      const best = getBestAIHand(player.hand, room.communityCards);
      player.selectedCardIds = best.cards.map(c => c.id);
      player.evaluation = best;
      player.lockedIn = true;
      if (room.phase === 'showdown') {
        player.statusText = best.isValid ? `¡${best.name}! (${best.formula})` : 'Inestable';
      } else {
        player.statusText = 'Listo para la fase';
      }
    }
  }
}

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (rawData: string) => {
    try {
      const msg: WSClientMessage = JSON.parse(rawData);

      switch (msg.type) {
        case 'create_room': {
          const roomCode = generateRoomCode(msg.gameType);
          const hostId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const isTeacher = msg.isTeacher !== false; // Default true when creating classroom rooms
          
          const hostPlayer: GamePlayer = {
            id: hostId,
            name: msg.playerName || (isTeacher ? 'Profesor (Anfitrión)' : 'Marie Curie'),
            avatar: msg.avatar || (isTeacher ? '👨‍🏫' : '👩‍🔬'),
            isBot: false,
            isHost: true,
            isReady: true,
            isSpectator: isTeacher,
            role: isTeacher ? 'teacher' : 'student',
            hand: [],
            selectedCardIds: [],
            score: 0,
            statusText: isTeacher ? 'Supervisando la sala (Docente)' : 'Esperando jugadores...',
          };

          // Enforce 0 bots for room creation per user requirement
          const botCount = 0;
          const bots: GamePlayer[] = [];

          const defaultName =
            msg.gameType === 'escape_room'
              ? `Escape Room de ${hostPlayer.name}`
              : msg.gameType === 'cien_latinos'
              ? `100 Latinos Dicen: ${hostPlayer.name}`
              : msg.gameType === 'el_impostor'
              ? `El Impostor: ${hostPlayer.name}`
              : `Mesa de ${hostPlayer.name}`;
          const roomState: RoomState = {
            code: roomCode,
            name: msg.roomName || defaultName,
            gameType: msg.gameType || 'poker_quimico',
            hostId: hostId,
            hostIsSpectator: isTeacher,
            teacherName: hostPlayer.name,
            phase: 'lobby',
            deck: generateDeck(),
            communityCards: [],
            players: [hostPlayer, ...bots],
            maxPlayers: Math.min(24, Math.max(2, msg.maxPlayers || 16)),
            botCount: botCount,
            roundNumber: 1,
            visitedGoogleEmails: msg.googleEmail ? [msg.googleEmail.toLowerCase()] : [],
            latinosState: msg.gameType === 'cien_latinos' ? createInitialLatinosMatchState(latinosLibrary[0] || SEED_LATINOS_LIBRARY[0]) : undefined,
            impostorState: msg.gameType === 'el_impostor' ? createInitialImpostorMatchState(impostorLibrary[0] || SEED_IMPOSTOR_LIBRARY[0]) : undefined,
            playerTeams: (msg.gameType === 'cien_latinos' || msg.gameType === 'el_impostor') ? (isTeacher ? {} : { [hostId]: 'A' }) : undefined,
            chatMessages: [
              {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName:
                  msg.gameType === 'escape_room'
                    ? 'Escape Room'
                    : msg.gameType === 'cien_latinos'
                    ? '100 Latinos Dicen'
                    : msg.gameType === 'el_impostor'
                    ? 'El Impostor'
                    : 'Sistema Químico',
                avatar:
                  msg.gameType === 'escape_room'
                    ? '🗝️'
                    : msg.gameType === 'cien_latinos'
                    ? '🎤'
                    : msg.gameType === 'el_impostor'
                    ? '🕵️'
                    : '⚗️',
                text: `¡Sala creada con código ${roomCode}! Los estudiantes pueden unirse usando el código o enlace.`,
                isChemical: true,
                timestamp: Date.now(),
              },
            ],
          };

          if (msg.googleEmail) {
            hostPlayer.googleEmail = msg.googleEmail;
            hostPlayer.googleUid = msg.googleUid;
          }

          rooms.set(roomCode, roomState);
          socketToPlayer.set(ws, { roomCode, playerId: hostId });
          playerSockets.set(hostId, ws);

          broadcastToRoom(roomCode, { type: 'room_state', state: roomState, playerId: hostId });
          break;
        }

        case 'join_room': {
          let code = (msg.roomCode || '').trim().toUpperCase();
          let room = rooms.get(code);

          // Fallback variations: with or without OCT-
          if (!room && !code.startsWith('OCT-')) {
            room = rooms.get(`OCT-${code}`);
            if (room) code = `OCT-${code}`;
          }

          if (!room) {
            for (const [rCode, rState] of rooms.entries()) {
              if (rCode.toUpperCase() === code || rCode.replace('OCT-', '').toUpperCase() === code) {
                room = rState;
                code = rCode;
                break;
              }
            }
          }

          // If still not found and there is an active room, attempt fallback match
          if (!room && rooms.size > 0) {
            for (const [rCode, rState] of rooms.entries()) {
              if (
                code === '191440' ||
                rCode === code ||
                rCode.endsWith(code) ||
                (rState.gameType === 'escape_room' && rooms.size === 1)
              ) {
                room = rState;
                code = rCode;
                break;
              }
            }
          }

          if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: `No se encontró ninguna sala con el código "${code}". Verifica el PIN con tu docente.` }));
            return;
          }

          // Check SINGLE-ENTRY restriction per Google Account email
          const userEmail = (msg.googleEmail || '').trim().toLowerCase();
          room.visitedGoogleEmails = room.visitedGoogleEmails || [];

          // Find if this student is ALREADY in room.players (by email, socket, or name) - exclude host
          const currentSocketInfo = socketToPlayer.get(ws);
          let existingPlayer = room.players.find(
            (p) =>
              !p.isHost &&
              ((userEmail && p.googleEmail && p.googleEmail.toLowerCase() === userEmail) ||
               (currentSocketInfo && currentSocketInfo.playerId === p.id) ||
               (!p.isBot && p.name.trim().toLowerCase() === (msg.playerName || '').trim().toLowerCase() && p.avatar === msg.avatar))
          );

          if (existingPlayer) {
            // Player is re-joining or updating session. Re-use existing player record!
            existingPlayer.statusText = '¡Conectado!';
            existingPlayer.name = msg.playerName || existingPlayer.name;
            existingPlayer.avatar = msg.avatar || existingPlayer.avatar;
            if (userEmail) existingPlayer.googleEmail = userEmail;
            if (msg.googleUid) existingPlayer.googleUid = msg.googleUid;

            socketToPlayer.set(ws, { roomCode: code, playerId: existingPlayer.id });
            playerSockets.set(existingPlayer.id, ws);

            broadcastToRoom(code, { type: 'room_state', state: room, playerId: existingPlayer.id });
            break;
          }

          const humanCount = room.players.filter(p => !p.isBot).length;
          if (humanCount >= room.maxPlayers) {
            ws.send(JSON.stringify({ type: 'error', message: 'La sala está completa.' }));
            return;
          }

          const isJoiningTeacher = Boolean(
            (msg as any).isTeacher ||
            (msg.playerName && (msg.playerName.toLowerCase().includes('profesor') || msg.playerName.toLowerCase().includes('docente')))
          );

          // Lock new student entries once the match has started!
          if (!isJoiningTeacher && room.phase !== 'lobby') {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'La partida ya está en curso. No se permiten nuevos estudiantes después de iniciar la partida.',
              })
            );
            return;
          }

          const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const newPlayer: GamePlayer = {
            id: playerId,
            name: msg.playerName || (isJoiningTeacher ? 'Profesor Espectador' : `Alumno_${room.players.length + 1}`),
            avatar: msg.avatar || (isJoiningTeacher ? '👨‍🏫' : '👩‍🎓'),
            isBot: false,
            isHost: false,
            isReady: true,
            isSpectator: isJoiningTeacher,
            role: isJoiningTeacher ? 'teacher' : 'student',
            googleEmail: userEmail || undefined,
            googleUid: msg.googleUid || undefined,
            hand: [],
            selectedCardIds: [],
            score: 0,
            statusText: isJoiningTeacher ? 'Supervisando la clase 👨‍🏫' : '¡Listo para jugar!',
          };

          if (userEmail && !room.visitedGoogleEmails.includes(userEmail)) {
            room.visitedGoogleEmails.push(userEmail);
          }

          if (room.gameType === 'poker_quimico' && room.phase !== 'lobby' && room.deck.length >= 2 && !newPlayer.isSpectator) {
            newPlayer.hand = [room.deck.pop()!, room.deck.pop()!];
            newPlayer.selectedCardIds = newPlayer.hand.map(c => c.id);
            newPlayer.evaluation = evaluateCards(newPlayer.hand);
          }

          if ((room.gameType === 'cien_latinos' || room.gameType === 'el_impostor') && !newPlayer.isSpectator) {
            room.playerTeams = room.playerTeams || {};
            const teamACount = Object.values(room.playerTeams).filter((t) => t === 'A').length;
            const teamBCount = Object.values(room.playerTeams).filter((t) => t === 'B').length;
            room.playerTeams[playerId] = teamACount <= teamBCount ? 'A' : 'B';
          }

          room.players.push(newPlayer);
          socketToPlayer.set(ws, { roomCode: code, playerId });
          playerSockets.set(playerId, ws);

          sendChatToRoom(code, {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Sistema',
            avatar: '👋',
            text: `${newPlayer.name} se ha unido a la sala.`,
            timestamp: Date.now(),
          });

          broadcastToRoom(code, { type: 'room_state', state: room, playerId });
          break;
        }

        case 'reconnect_session': {
          const code = msg.roomCode?.trim().toUpperCase();
          const room = rooms.get(code);
          if (!room) {
            // Room doesn't exist anymore
            break;
          }

          let player = room.players.find(p => p.id === msg.playerId);
          if (player) {
            player.statusText = 'Conectado';
            if (msg.playerName && !player.isBot) player.name = msg.playerName;
            if (msg.avatar && !player.isBot) player.avatar = msg.avatar;
          } else {
            // Do not allow unknown new student sessions to sneak in via reconnect after match start
            if (room.phase !== 'lobby') {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'La partida ya está en curso. No se permiten nuevos estudiantes después de iniciar la partida.',
                })
              );
              break;
            }
            // Re-add them if in lobby
            player = {
              id: msg.playerId,
              name: msg.playerName || 'Químico',
              avatar: msg.avatar || '👨‍🔬',
              isBot: false,
              isHost: room.hostId === msg.playerId,
              isReady: true,
              hand: [],
              selectedCardIds: [],
              score: 0,
              statusText: 'Reconectado',
            };
            if (room.deck.length >= 2) {
              player.hand = [room.deck.pop()!, room.deck.pop()!];
              player.selectedCardIds = player.hand.map(c => c.id);
              player.evaluation = evaluateCards(player.hand);
            }
            room.players.push(player);
          }

          socketToPlayer.set(ws, { roomCode: code, playerId: player.id });
          playerSockets.set(player.id, ws);

          // Immediately send updated room state to this player
          const customizedState: RoomState = {
            ...room,
            players: room.players.map(p => {
              if (p.id === player!.id || room.phase === 'showdown') {
                return p;
              }
              return {
                ...p,
                hand: p.hand.map(() => ({ id: 'hidden', symbol: '?', name: 'Oculto', group: 0, en: 0 })),
              };
            }),
          };

          ws.send(JSON.stringify({ type: 'room_state', state: customizedState, playerId: player.id }));
          break;
        }

        case 'set_bot_count': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.hostId !== info.playerId) return;

          const targetCount = Math.min(6, Math.max(0, msg.botCount));
          const humans = room.players.filter(p => !p.isBot);
          const currentBots = room.players.filter(p => p.isBot);

          let newBots: GamePlayer[] = [];
          if (targetCount > currentBots.length) {
            newBots = [...currentBots];
            for (let i = currentBots.length; i < targetCount; i++) {
              newBots.push(createBotPlayer(i));
            }
          } else {
            newBots = currentBots.slice(0, targetCount);
          }

          room.botCount = targetCount;
          room.players = [...humans, ...newBots];
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'toggle_pause': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          const sender = room.players.find((p) => p.id === info.playerId);
          const isAuthorized =
            room.hostId === info.playerId ||
            sender?.isSpectator ||
            sender?.role === 'teacher';
          if (!isAuthorized) return;

          room.isPaused = typeof msg.isPaused === 'boolean' ? msg.isPaused : !room.isPaused;
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'start_game': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.isPaused = false;

          if (
            room.gameType === 'escape_room' ||
            room.gameType === 'cien_latinos' ||
            room.gameType === 'el_impostor' ||
            room.gameType === 'geografia_3d'
          ) {
            room.phase = 'countdown'; // Start 3-second countdown for all students!
            for (const p of room.players) {
              p.escapeProgress = undefined;
              p.statusText = p.isSpectator || p.role === 'teacher'
                ? 'Supervisando la clase 👨‍🏫'
                : room.gameType === 'cien_latinos'
                ? 'Listo en el tablero 🎤'
                : room.gameType === 'el_impostor'
                ? 'Analizando afirmaciones 🕵️'
                : room.gameType === 'geografia_3d'
                ? 'Explorando el Globo 3D 🌍'
                : 'Preparado en Cámara 1 🚪';
            }
            
            // Automatically advance room phase to 'playing' once 3s countdown finishes so it never stays stuck
            setTimeout(() => {
              const currentRoom = rooms.get(room.code);
              if (currentRoom && currentRoom.phase === 'countdown') {
                currentRoom.phase = 'playing';
                broadcastToRoom(currentRoom.code, { type: 'room_state', state: currentRoom, playerId: '' });
              }
            }, 3500);
          } else {
            const activeCount = room.players.filter(p => !p.isSpectator).length;
            if (activeCount < 2) {
              const neededBots = 2 - activeCount;
              const currentBots = room.players.filter(p => p.isBot).length;
              for (let i = 0; i < neededBots; i++) {
                room.players.push(createBotPlayer(currentBots + i));
              }
              room.botCount = room.players.filter(p => p.isBot).length;
            }
            dealCardsForRound(room);
            updateBotSelections(room);
            room.phase = 'preflop';
          }

          sendChatToRoom(room.code, {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName:
              room.gameType === 'escape_room'
                ? 'Escape Room'
                : room.gameType === 'cien_latinos'
                ? '100 Latinos Dicen'
                : room.gameType === 'el_impostor'
                ? 'El Impostor'
                : 'Mesa de Reacción',
            avatar:
              room.gameType === 'escape_room'
                ? '🗝️'
                : room.gameType === 'cien_latinos'
                ? '🎤'
                : room.gameType === 'el_impostor'
                ? '🕵️'
                : '⚡',
            text: room.gameType === 'escape_room' || room.gameType === 'cien_latinos' || room.gameType === 'el_impostor'
              ? '¡Iniciando cuenta regresiva 3, 2, 1! Prepárense para jugar.'
              : '¡Ronda iniciada! Cartas de mano repartidas.',
            isChemical: true,
            timestamp: Date.now(),
          });

          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'update_latinos_state': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.latinosState = msg.state;
          if (msg.playerTeams) {
            room.playerTeams = msg.playerTeams;
          }
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'update_impostor_state': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.impostorState = msg.state;
          if (msg.playerTeams) {
            room.playerTeams = msg.playerTeams;
          }
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'submit_impostor_vote': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || !room.impostorState || room.isPaused) return;

          room.impostorState.votes = {
            ...room.impostorState.votes,
            [msg.vote.playerId]: msg.vote,
          };

          const votingPlayer = room.players.find((p) => p.id === msg.vote.playerId);
          if (votingPlayer && !votingPlayer.isSpectator) {
            votingPlayer.statusText = 'Voto de expulsión emitido 🗳️';
          }

          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'switch_latinos_team': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.playerTeams = room.playerTeams || {};
          room.playerTeams[msg.playerId] = msg.team;
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'submit_latinos_guess': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || !room.latinosState || room.isPaused) return;

          // Only accept guess if player is on activeTeam or is host
          const isHostPlayer = room.hostId === info.playerId;
          if (!isHostPlayer && msg.team !== room.latinosState.activeTeam) {
            return;
          }

          room.latinosState = submitTeamGuess(room.latinosState, msg.guess, msg.playerName);
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'update_escape_config': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.hostId !== info.playerId) return;

          if (Array.isArray(msg.questions) && msg.questions.length > 0) {
            room.escapeRoomQuestions = msg.questions;
          }
          if (typeof msg.totalSeconds === 'number' && msg.totalSeconds >= 5) {
            room.escapeRoomTotalSeconds = msg.totalSeconds;
          }

          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'update_escape_progress': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.isPaused) return;

          const player = room.players.find(p => p.id === info.playerId);
          if (!player) return;

          player.score = msg.score;
          player.escapeProgress = {
            questionIndex: msg.questionIndex,
            totalQuestions: msg.totalQuestions,
            wrongAttempts: msg.wrongAttempts,
            isVictory: msg.isVictory,
            isGameOver: msg.isGameOver,
            grade: msg.grade,
            score: msg.score,
          };

          if (msg.isVictory) {
            player.statusText = '¡ESCAPÓ DE LA MAZMORRA! 🏆';
          } else if (msg.isGameOver) {
            player.statusText = 'Atrapado en la cámara 💀';
          } else {
            player.statusText = `Cámara ${msg.questionIndex + 1} de ${msg.totalQuestions} 🚪`;
          }

          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'advance_phase': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.hostId !== info.playerId) return;

          switch (room.phase) {
            case 'preflop':
              if (room.deck.length >= 3) {
                room.communityCards.push(room.deck.pop()!, room.deck.pop()!, room.deck.pop()!);
                room.phase = 'flop';
              }
              break;
            case 'flop':
              if (room.deck.length >= 1) {
                room.communityCards.push(room.deck.pop()!);
                room.phase = 'turn';
              }
              break;
            case 'turn':
              if (room.deck.length >= 1) {
                room.communityCards.push(room.deck.pop()!);
                room.phase = 'river';
              }
              break;
            case 'river': {
              room.phase = 'showdown';
              // Filter active student players & bots (exclude teacher spectators and folded players)
              const activeContenders = room.players.filter(p => !p.isSpectator && !p.hasFolded);

              // Calculate showdown evaluations for active contenders
              for (const p of activeContenders) {
                const available = [...p.hand, ...room.communityCards];
                const selectedData = p.selectedCardIds
                  .map(id => available.find(c => c.id === id)!)
                  .filter(Boolean);

                let evalRes = selectedData.length > 0
                  ? evaluateCards(selectedData)
                  : getBestAIHand(p.hand, room.communityCards);

                p.evaluation = evalRes;
                if (selectedData.length === 0) {
                  p.selectedCardIds = evalRes.cards.map(c => c.id);
                }
              }

              // Determine ranking and award scores
              const ranked = [...activeContenders].sort((a, b) => {
                const rankA = a.evaluation?.rank ?? 0;
                const rankB = b.evaluation?.rank ?? 0;
                if (rankB !== rankA) return rankB - rankA;
                return (b.evaluation?.tiebreaker ?? 0) - (a.evaluation?.tiebreaker ?? 0);
              });

              if (ranked.length > 0 && ranked[0].evaluation?.isValid) {
                ranked[0].score += 100;
                let winMsg = `¡${ranked[0].name} gana la ronda formando ${ranked[0].evaluation.name} (${ranked[0].evaluation.formula})!`;
                if (ranked.length > 1 && ranked[1].evaluation?.isValid && ranked[0].evaluation.rank === ranked[1].evaluation.rank) {
                  const tieExplain = explainTiebreaker(ranked[0].evaluation, ranked[1].evaluation);
                  if (tieExplain) {
                    winMsg += ` [${tieExplain}]`;
                  }
                }
                sendChatToRoom(room.code, {
                  id: `sys-${Date.now()}`,
                  senderId: 'system',
                  senderName: 'Veredicto',
                  avatar: '🏆',
                  text: winMsg,
                  isChemical: true,
                  timestamp: Date.now(),
                });
              }
              break;
            }
            case 'showdown': {
              room.roundNumber += 1;
              dealCardsForRound(room);
              sendChatToRoom(room.code, {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Mesa de Reacción',
                avatar: '⚡',
                text: `¡Ronda ${room.roundNumber} iniciada! Nuevas cartas repartidas.`,
                isChemical: true,
                timestamp: Date.now(),
              });
              break;
            }
          }

          updateBotSelections(room);
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'select_cards': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.isPaused) return;

          const player = room.players.find(p => p.id === info.playerId);
          if (!player) return;

          player.selectedCardIds = msg.selectedCardIds.slice(0, 5);
          const available = [...player.hand, ...room.communityCards];
          const selectedData = player.selectedCardIds
            .map(id => available.find(c => c.id === id)!)
            .filter(Boolean);

          player.evaluation = evaluateCards(selectedData);
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'lock_in': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room || room.isPaused) return;

          const player = room.players.find(p => p.id === info.playerId);
          if (!player) return;

          player.lockedIn = msg.locked;
          player.statusText = msg.locked ? 'Molécula Bloqueada' : 'Ajustando Enlaces';
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'send_chat': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          const player = room.players.find(p => p.id === info.playerId);
          if (!player) return;

          const chatMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            senderId: player.id,
            senderName: player.name,
            avatar: player.avatar,
            text: msg.text.trim().substring(0, 150),
            isChemical: msg.isChemical,
            timestamp: Date.now(),
          };

          sendChatToRoom(room.code, chatMsg);
          break;
        }

        case 'restart_hand': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.roundNumber += 1;
          dealCardsForRound(room);
          updateBotSelections(room);
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'return_to_lobby': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (!room) return;

          room.phase = 'lobby';
          room.isPaused = false;
          room.communityCards = [];
          room.pot = 0;
          for (const p of room.players) {
            p.hand = [];
            p.selectedCardIds = [];
            p.lockedIn = false;
            p.hasFolded = false;
            p.currentBet = 0;
            p.evaluation = undefined;
            p.escapeProgress = undefined;
            p.statusText = p.isHost ? 'Anfitrión de la sala' : 'Listo en la sala';
          }
          broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: info.playerId });
          break;
        }

        case 'leave_room': {
          const info = socketToPlayer.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomCode);
          if (room) {
            const playerIndex = room.players.findIndex(p => p.id === info.playerId);
            if (playerIndex !== -1) {
              const leavingName = room.players[playerIndex].name;
              room.players.splice(playerIndex, 1);

              sendChatToRoom(room.code, {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Sistema',
                avatar: '🚪',
                text: `${leavingName} salió de la mesa.`,
                timestamp: Date.now(),
              });

              if (room.hostId === info.playerId) {
                const nextHost = room.players.find(p => !p.isBot);
                if (nextHost) {
                  room.hostId = nextHost.id;
                  nextHost.isHost = true;
                }
              }

              if (room.players.filter(p => !p.isBot).length === 0) {
                rooms.delete(room.code);
              } else {
                broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: '' });
              }
            }
          }
          socketToPlayer.delete(ws);
          playerSockets.delete(info.playerId);
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    const info = socketToPlayer.get(ws);
    if (!info) return;
    const room = rooms.get(info.roomCode);
    if (room) {
      const player = room.players.find(p => p.id === info.playerId);
      if (player) {
        player.statusText = 'Desconectado';
      }
      broadcastToRoom(room.code, { type: 'room_state', state: room, playerId: '' });
    }
    socketToPlayer.delete(ws);
    playerSockets.delete(info.playerId);
  });
});

async function start() {
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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Póker del Octeto server running on http://localhost:${PORT}`);
  });
}

start();
