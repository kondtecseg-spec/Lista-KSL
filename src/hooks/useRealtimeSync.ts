import { useState, useEffect, useRef, useCallback } from 'react';
import { FamilyRoom, WSMessage, ShoppingItem, Market, SubstituteSuggestion } from '../types';

export function useRealtimeSync(initialRoomCode: string = 'FAMILIA-123') {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('user_family_name') || 'Maria (Você)';
  });
  const [roomState, setRoomState] = useState<FamilyRoom | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<any>(null);

  // Save username to local storage
  const updateUserName = (name: string) => {
    const clean = name.trim() || 'Membro';
    setUserName(clean);
    localStorage.setItem('user_family_name', clean);
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Join Room
      ws.send(
        JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: roomCode,
          userName,
        })
      );

      // Start Ping keepalive
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING', roomId: roomCode }));
        }
      }, 15000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        if (msg.type === 'ROOM_STATE' || msg.type === 'MEMBER_JOINED') {
          if (msg.payload) {
            setRoomState(msg.payload);
          }
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket error, falling back to REST fetch:', err);
      setStatus('disconnected');
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };
  }, [roomCode, userName]);

  // Initial connect & reconnect when roomCode or userName changes
  useEffect(() => {
    connect();

    // Fallback REST fetch if WS drops or on load
    fetch(`/api/rooms/${roomCode}`)
      .then((res) => res.json())
      .then((data) => setRoomState(data))
      .catch((err) => console.error('REST fetch room failed:', err));

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [connect, roomCode]);

  // Actions
  const addItem = useCallback(
    (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'addedBy' | 'checked'>) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const newItem: ShoppingItem = {
        ...itemData,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        checked: false,
        addedBy: userName,
        createdAt: new Date().toISOString(),
      };

      wsRef.current.send(
        JSON.stringify({
          type: 'ADD_ITEM',
          roomId: roomCode,
          userName,
          payload: newItem,
        })
      );
    },
    [roomCode, userName]
  );

  const toggleCheck = useCallback(
    (itemId: string, checked: boolean) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Optimistic update
        setRoomState((prev) => {
          if (!prev) return prev;
          const updatedLists = prev.lists.map((l) => ({
            ...l,
            items: l.items.map((i) => (i.id === itemId ? { ...i, checked, checkedBy: userName } : i)),
          }));
          return { ...prev, lists: updatedLists };
        });
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: 'TOGGLE_CHECK',
          roomId: roomCode,
          userName,
          payload: { itemId, checked },
        })
      );
    },
    [roomCode, userName]
  );

  const updatePrice = useCallback(
    (itemId: string, marketId: string, price: number) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      wsRef.current.send(
        JSON.stringify({
          type: 'UPDATE_PRICE',
          roomId: roomCode,
          userName,
          payload: { itemId, marketId, price },
        })
      );
    },
    [roomCode, userName]
  );

  const applySubstitute = useCallback(
    (itemId: string, substitute: SubstituteSuggestion) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      wsRef.current.send(
        JSON.stringify({
          type: 'APPLY_SUBSTITUTE',
          roomId: roomCode,
          userName,
          payload: { itemId, substitute },
        })
      );
    },
    [roomCode, userName]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setRoomState((prev) => {
          if (!prev) return prev;
          const updatedLists = prev.lists.map((l) => ({
            ...l,
            items: l.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          }));
          return { ...prev, lists: updatedLists };
        });
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: 'UPDATE_QUANTITY',
          roomId: roomCode,
          userName,
          payload: { itemId, quantity },
        })
      );
    },
    [roomCode, userName]
  );

  const deleteItem = useCallback(
    (itemId: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      wsRef.current.send(
        JSON.stringify({
          type: 'DELETE_ITEM',
          roomId: roomCode,
          userName,
          payload: { itemId },
        })
      );
    },
    [roomCode, userName]
  );

  const addMarket = useCallback(
    (marketName: string, color?: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const colors = ['#0284c7', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0d9488'];
      const chosenColor = color || colors[Math.floor(Math.random() * colors.length)];

      const newMarket: Market = {
        id: `m_${Date.now()}`,
        name: marketName,
        color: chosenColor,
      };

      wsRef.current.send(
        JSON.stringify({
          type: 'ADD_MARKET',
          roomId: roomCode,
          userName,
          payload: newMarket,
        })
      );
    },
    [roomCode, userName]
  );

  return {
    roomCode,
    setRoomCode,
    userName,
    updateUserName,
    roomState,
    status,
    addItem,
    toggleCheck,
    updatePrice,
    applySubstitute,
    updateQuantity,
    deleteItem,
    addMarket,
    reconnect: connect,
  };
}
