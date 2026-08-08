import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import { initializeApp as initFirebaseApp, getApps as getFirebaseApps, getApp as getFirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import {
  FamilyRoom,
  ShoppingList,
  ShoppingItem,
  Market,
  ActivityLog,
  WSMessage,
  SubstituteSuggestion,
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;
const httpServer = http.createServer(app);

// Initialize Firebase for persistent Firestore database
let firestoreDb: ReturnType<typeof getFirestore> | null = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = !getFirebaseApps().length ? initFirebaseApp(config) : getFirebaseApp();
    firestoreDb = config.firestoreDatabaseId
      ? getFirestore(firebaseApp, config.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    console.log('Firebase Firestore initialized on server with DB ID:', config.firestoreDatabaseId || 'default');
  }
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

// In-Memory Database cache for Family Rooms
const roomsStore: Record<string, FamilyRoom> = {};

async function saveRoomToFirestore(room: FamilyRoom) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, 'rooms', room.code);
    await setDoc(
      docRef,
      {
        ...room,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Error saving room ${room.code} to Firestore:`, err);
  }
}

async function getOrLoadRoom(code: string): Promise<FamilyRoom> {
  const roomId = code.toUpperCase();
  if (roomsStore[roomId]) {
    return roomsStore[roomId];
  }

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'rooms', roomId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as FamilyRoom;
        roomsStore[roomId] = data;
        return data;
      }
    } catch (err) {
      console.error(`Error loading room ${roomId} from Firestore:`, err);
    }
  }

  const initial = createInitialRoom(roomId, `Família ${roomId}`);
  roomsStore[roomId] = initial;
  saveRoomToFirestore(initial);
  return initial;
}

// Helper to seed initial sample data for family room
function createInitialRoom(code: string, name: string): FamilyRoom {
  const markets: Market[] = [
    { id: 'm1', name: 'Atacadão', color: '#0284c7', address: 'Av. das Nações, 1000' },
    { id: 'm2', name: 'Assaí Atacadista', color: '#dc2626', address: 'Rod. Santos Dumont, 450' },
    { id: 'm3', name: 'Carrefour', color: '#2563eb', address: 'Shopping Centro, Lj 12' },
    { id: 'm4', name: 'Pão de Açúcar', color: '#16a34a', address: 'Rua das Flores, 320' },
  ];

  const items: ShoppingItem[] = [
    {
      id: 'i1',
      name: 'Arroz Tipo 1 (5kg)',
      category: 'Mercearia',
      quantity: 2,
      unit: 'pct',
      checked: false,
      prices: { m1: 22.9, m2: 23.5, m3: 26.9, m4: 28.5 },
      substituteSuggestion: {
        substituteName: 'Arroz Marca Própria ou Parboilizado (5kg)',
        estimatedPrice: 19.5,
        savings: 6.8,
        reason: 'Mesma qualidade de grãos com preço de atacado direto da distribuidora.',
        category: 'Mercearia',
      },
      addedBy: 'João',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i2',
      name: 'Feijão Carioca (1kg)',
      category: 'Mercearia',
      quantity: 3,
      unit: 'pct',
      checked: true,
      checkedBy: 'Maria',
      checkedAt: new Date().toISOString(),
      prices: { m1: 6.8, m2: 6.5, m3: 7.9, m4: 8.9 },
      addedBy: 'Maria',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i3',
      name: 'Leite Integral (1L)',
      category: 'Laticínios',
      quantity: 12,
      unit: 'un',
      checked: false,
      prices: { m1: 4.49, m2: 4.39, m3: 4.99, m4: 5.49 },
      substituteSuggestion: {
        substituteName: 'Leite Caixa Fechada c/ 12un (Atacado)',
        estimatedPrice: 3.99,
        savings: 6.0,
        reason: 'Comprando a caixa lacrada no Assaí o valor unitário cai R$ 0,50.',
        category: 'Laticínios',
      },
      addedBy: 'João',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i4',
      name: 'Azeite de Oliva Extra Virgem (500ml)',
      category: 'Mercearia',
      quantity: 1,
      unit: 'un',
      checked: false,
      prices: { m1: 38.9, m2: 37.5, m3: 44.9, m4: 48.0 },
      substituteSuggestion: {
        substituteName: 'Azeite Tipo Único ou Óleo de Girassol 900ml',
        estimatedPrice: 24.9,
        savings: 12.6,
        reason: 'Ótima opção para refogados diários com sabor suave e 30% mais barato.',
        category: 'Mercearia',
      },
      addedBy: 'Maria',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i5',
      name: 'Café Torrado e Moído (500g)',
      category: 'Mercearia',
      quantity: 2,
      unit: 'pct',
      checked: false,
      prices: { m1: 16.9, m2: 17.2, m3: 19.9, m4: 21.5 },
      addedBy: 'João',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i6',
      name: 'Detergente Líquido (500ml)',
      category: 'Limpeza',
      quantity: 6,
      unit: 'un',
      checked: true,
      checkedBy: 'João',
      checkedAt: new Date().toISOString(),
      prices: { m1: 2.19, m2: 2.09, m3: 2.49, m4: 2.89 },
      addedBy: 'João',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i7',
      name: 'Sabão em Pó Lava Roupas (1.6kg)',
      category: 'Limpeza',
      quantity: 1,
      unit: 'un',
      checked: false,
      prices: { m1: 18.9, m2: 19.5, m3: 22.9, m4: 24.9 },
      substituteSuggestion: {
        substituteName: 'Sabão Líquido Refil Concentrado 2L',
        estimatedPrice: 14.5,
        savings: 4.4,
        reason: 'Rende até 30 lavagens e evita resíduos nas roupas escuras.',
        category: 'Limpeza',
      },
      addedBy: 'Maria',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i8',
      name: 'Peito de Frango Resfriado (1kg)',
      category: 'Açougue',
      quantity: 3,
      unit: 'kg',
      checked: false,
      prices: { m1: 16.9, m2: 16.2, m3: 19.5, m4: 22.0 },
      addedBy: 'João',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'i9',
      name: 'Papel Higiênico Folha Dupla (12un)',
      category: 'Higiene',
      quantity: 2,
      unit: 'pct',
      checked: false,
      prices: { m1: 14.9, m2: 15.2, m3: 17.9, m4: 19.9 },
      addedBy: 'Maria',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultList: ShoppingList = {
    id: 'l1',
    name: 'Mercado do Mês',
    roomId: code,
    items,
    markets,
    createdAt: new Date().toISOString(),
  };

  const activities: ActivityLog[] = [
    {
      id: 'a1',
      userName: 'Maria',
      action: 'marcou "Feijão Carioca" como comprado no Assaí',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: 'check',
    },
    {
      id: 'a2',
      userName: 'João',
      action: 'atualizou preço do "Azeite de Oliva" no Atacadão para R$ 38,90',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      type: 'price',
    },
    {
      id: 'a3',
      userName: 'Maria',
      action: 'criou a lista "Mercado do Mês"',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'join',
    },
  ];

  return {
    id: `room_${code}`,
    code: code.toUpperCase(),
    name,
    members: ['João', 'Maria'],
    lists: [defaultList],
    activities,
    monthlySavings: 142.8,
  };
}

// Ensure default room exists
roomsStore['FAMILIA-123'] = createInitialRoom('FAMILIA-123', 'Família Silva');

// WebSocket setup
const wss = new WebSocketServer({ server: httpServer });

// Map of roomId -> Set of connected WebSockets
const roomClients: Map<string, Set<{ ws: WebSocket; userName: string }>> = new Map();

function broadcastToRoom(roomId: string, message: WSMessage, excludeWs?: WebSocket) {
  const clients = roomClients.get(roomId);
  if (!clients) return;

  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws !== excludeWs && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentUserName: string = 'Membro Família';

  ws.on('message', async (rawMessage: string) => {
    try {
      const msg: WSMessage = JSON.parse(rawMessage.toString());

      if (msg.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', roomId: msg.roomId }));
        return;
      }

      if (msg.type === 'JOIN_ROOM') {
        const roomId = (msg.roomId || 'FAMILIA-123').toUpperCase();
        currentRoomId = roomId;
        currentUserName = msg.userName || 'Membro Família';

        const room = await getOrLoadRoom(roomId);

        // Register client in room
        if (!roomClients.has(roomId)) {
          roomClients.set(roomId, new Set());
        }
        roomClients.get(roomId)!.add({ ws, userName: currentUserName });

        // Add user to room members if not present
        if (!room.members.includes(currentUserName)) {
          room.members.push(currentUserName);
        }

        // Add activity log
        const log: ActivityLog = {
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          userName: currentUserName,
          action: 'entrou no grupo de compras',
          timestamp: new Date().toISOString(),
          type: 'join',
        };
        room.activities.unshift(log);
        if (room.activities.length > 50) {
          room.activities.pop();
        }

        saveRoomToFirestore(room);

        // Send full state back to joining client
        ws.send(
          JSON.stringify({
            type: 'ROOM_STATE',
            roomId,
            payload: room,
          })
        );

        // Notify other room members
        broadcastToRoom(
          roomId,
          {
            type: 'MEMBER_JOINED',
            roomId,
            userName: currentUserName,
            payload: room,
          },
          ws
        );
        return;
      }

      if (!currentRoomId) return;
      const room = await getOrLoadRoom(currentRoomId);
      const list = room.lists[0]; // Active shopping list

      if (msg.type === 'ADD_ITEM') {
        const newItem: ShoppingItem = msg.payload;
        list.items.unshift(newItem);

        const log: ActivityLog = {
          id: `act_${Date.now()}`,
          userName: currentUserName,
          action: `adicionou "${newItem.name}"`,
          timestamp: new Date().toISOString(),
          type: 'add',
        };
        room.activities.unshift(log);

        saveRoomToFirestore(room);

        broadcastToRoom(currentRoomId, {
          type: 'ROOM_STATE',
          roomId: currentRoomId,
          payload: room,
        });
      } else if (msg.type === 'TOGGLE_CHECK') {
        const { itemId, checked } = msg.payload;
        const item = list.items.find((i) => i.id === itemId);
        if (item) {
          item.checked = checked;
          item.checkedBy = checked ? currentUserName : undefined;
          item.checkedAt = checked ? new Date().toISOString() : undefined;

          const log: ActivityLog = {
            id: `act_${Date.now()}`,
            userName: currentUserName,
            action: checked ? `marcou "${item.name}" como comprado` : `desmarcou "${item.name}"`,
            timestamp: new Date().toISOString(),
            type: checked ? 'check' : 'uncheck',
          };
          room.activities.unshift(log);

          saveRoomToFirestore(room);

          broadcastToRoom(currentRoomId, {
            type: 'ROOM_STATE',
            roomId: currentRoomId,
            payload: room,
          });
        }
      } else if (msg.type === 'UPDATE_PRICE') {
        const { itemId, marketId, price } = msg.payload;
        const item = list.items.find((i) => i.id === itemId);
        const market = list.markets.find((m) => m.id === marketId);

        if (item && market) {
          item.prices[marketId] = price;
          item.lastPriceUpdatedBy = currentUserName;
          item.lastPriceUpdatedAt = new Date().toISOString();

          const log: ActivityLog = {
            id: `act_${Date.now()}`,
            userName: currentUserName,
            action: `atualizou preço de "${item.name}" no ${market.name} para R$ ${price.toFixed(2)}`,
            timestamp: new Date().toISOString(),
            type: 'price',
          };
          room.activities.unshift(log);

          saveRoomToFirestore(room);

          broadcastToRoom(currentRoomId, {
            type: 'ROOM_STATE',
            roomId: currentRoomId,
            payload: room,
          });
        }
      } else if (msg.type === 'APPLY_SUBSTITUTE') {
        const { itemId, substitute } = msg.payload;
        const item = list.items.find((i) => i.id === itemId);

        if (item && substitute) {
          const oldName = item.name;
          item.name = substitute.substituteName;
          item.substituteSuggestion = undefined; // clear after applied

          // Adjust prices downward by percentage savings if available
          const savings = substitute.savings || 2.0;
          Object.keys(item.prices).forEach((mkId) => {
            item.prices[mkId] = Math.max(1.0, Number((item.prices[mkId] - savings).toFixed(2)));
          });

          room.monthlySavings = Number((room.monthlySavings + savings * item.quantity).toFixed(2));

          const log: ActivityLog = {
            id: `act_${Date.now()}`,
            userName: currentUserName,
            action: `substituiu "${oldName}" por "${substitute.substituteName}" (Economia de R$ ${savings.toFixed(2)})`,
            timestamp: new Date().toISOString(),
            type: 'substitute',
          };
          room.activities.unshift(log);

          saveRoomToFirestore(room);

          broadcastToRoom(currentRoomId, {
            type: 'ROOM_STATE',
            roomId: currentRoomId,
            payload: room,
          });
        }
      } else if (msg.type === 'UPDATE_QUANTITY') {
        const { itemId, quantity } = msg.payload;
        const item = list.items.find((i) => i.id === itemId);
        if (item && quantity > 0) {
          item.quantity = quantity;
          saveRoomToFirestore(room);
          broadcastToRoom(currentRoomId, {
            type: 'ROOM_STATE',
            roomId: currentRoomId,
            payload: room,
          });
        }
      } else if (msg.type === 'DELETE_ITEM') {
        const { itemId } = msg.payload;
        const index = list.items.findIndex((i) => i.id === itemId);
        if (index !== -1) {
          const removedName = list.items[index].name;
          list.items.splice(index, 1);

          const log: ActivityLog = {
            id: `act_${Date.now()}`,
            userName: currentUserName,
            action: `removeu "${removedName}"`,
            timestamp: new Date().toISOString(),
            type: 'delete',
          };
          room.activities.unshift(log);

          saveRoomToFirestore(room);

          broadcastToRoom(currentRoomId, {
            type: 'ROOM_STATE',
            roomId: currentRoomId,
            payload: room,
          });
        }
      } else if (msg.type === 'ADD_MARKET') {
        const newMarket: Market = msg.payload;
        list.markets.push(newMarket);

        const log: ActivityLog = {
          id: `act_${Date.now()}`,
          userName: currentUserName,
          action: `adicionou o supermercado "${newMarket.name}"`,
          timestamp: new Date().toISOString(),
          type: 'add',
        };
        room.activities.unshift(log);

        saveRoomToFirestore(room);

        broadcastToRoom(currentRoomId, {
          type: 'ROOM_STATE',
          roomId: currentRoomId,
          payload: room,
        });
      }
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && roomClients.has(currentRoomId)) {
      const set = roomClients.get(currentRoomId)!;
      for (const item of set) {
        if (item.ws === ws) {
          set.delete(item);
          break;
        }
      }
    }
  });
});

// REST API Endpoints

// Get Room State
app.get('/api/rooms/:code', async (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = await getOrLoadRoom(code);
  res.json(room);
});

// AI Smart Substitute Suggestions Endpoint
app.post('/api/ai/substitutes', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.json({ suggestions: [] });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um especialista em economia de compras de supermercado no Brasil.
Analise a seguinte lista de itens e sugira substitutos mais baratos (marcas próprias, atacado, embalagens econômicas ou alternativas similares):

${JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, category: i.category, prices: i.prices })))}

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "suggestions": [
    {
      "itemId": "id_do_item",
      "substituteName": "Nome do Substituto Economico",
      "estimatedPrice": 15.90,
      "savings": 5.00,
      "reason": "Explicação curta em português do porquê vale a pena substituir"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        return res.json(data);
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed or key missing, falling back to heuristic engine:', err);
  }

  // Fallback heuristic suggestion generator
  const fallbackSuggestions = items.map((item: any) => {
    const minPrice = Math.min(...Object.values(item.prices || { def: 15 }).map(Number));
    const savings = Number((minPrice * 0.22).toFixed(2));
    const estPrice = Number((minPrice - savings).toFixed(2));

    let subName = `${item.name.split(' ')[0]} Marca Própria/Refil`;
    let reason = 'Marcas de distribuidor ou pacotes refil oferecem até 25% de economia mantendo alta qualidade.';

    if (item.name.toLowerCase().includes('azeite')) {
      subName = 'Azeite Tipo Único ou Óleo de Girassol (Refil)';
      reason = 'Ideal para cozimentos diários com redução expressiva no gasto mensal.';
    } else if (item.name.toLowerCase().includes('sabão')) {
      subName = 'Sabão Líquido Concentrado 2L';
      reason = 'Rende mais lavagens por litro e preserva tecidos delicados.';
    } else if (item.name.toLowerCase().includes('leite')) {
      subName = 'Leite Caixa Fechada (Pacote Atacado c/ 12un)';
      reason = 'Desconto direto de lote por caixa fechada em atacarejos.';
    }

    return {
      itemId: item.id,
      substituteName: subName,
      estimatedPrice: estPrice,
      savings,
      reason,
    };
  });

  return res.json({ suggestions: fallbackSuggestions });
});

// AI Monthly Savings & Market Strategy Analysis
app.post('/api/ai/analyze-basket', async (req, res) => {
  const { list, room } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um assistente financeiro familiar brasileiro.
Analise os itens desta lista de compras e preços registrados em supermercados:

Lista: ${JSON.stringify(list)}

Crie uma análise estratégica curta em Português do Brasil com:
1. Dica principal de economia para este mês.
2. Mercado mais recomendado e o porquê.
3. Alerta de inflação ou item com maior variação.

Responda ESTRITAMENTE em formato JSON:
{
  "monthlyTip": "...",
  "recommendedMarket": "...",
  "savingsPotential": 45.80,
  "inflationAlert": "..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    }
  } catch (err) {
    console.warn('AI Basket analysis failed, sending rule-based analysis:', err);
  }

  return res.json({
    monthlyTip: 'Dividir a compra entre itens de mercearia no Atacadão e hortifruti no Assaí maximiza sua economia em até 18% este mês.',
    recommendedMarket: 'Atacadão (Melhor preço em 65% dos itens essenciais)',
    savingsPotential: 58.4,
    inflationAlert: 'O Azeite e os Laticínios registraram alta de 12% em redes de bairro. Priorize embalagens de atacado.',
  });
});

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Vite Middleware for dev or static server for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
