import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { STAGES, STAGE_ORDER } from '../data/tables';
import { defaultMenu } from '../data/menu';

const AppContext = createContext(null);
const STORAGE_KEY = 'parissy-tickets';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

let idCounter = 0;
function generateId() {
  idCounter++;
  return Date.now().toString(36) + '-' + idCounter.toString(36) + '-' + Math.random().toString(36).substr(2, 4);
}

const initialState = {
  orders: {},
  menu: defaultMenu,
  alarmMinutes: 10,
  alarmEnabled: true,
  checkin: {
    guests: [],
    date: null,
    emergencyContacts: {
      reception: '0',
      supervisor: '',
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const id = generateId();
      const order = {
        id,
        tableId: action.payload.tableId,
        guests: action.payload.guests || 1,
        items: action.payload.items || [],
        notes: action.payload.notes || '',
        currentStage: STAGES.SEATED,
        stageTimestamps: {
          [STAGES.SEATED]: Date.now(),
        },
        createdAt: Date.now(),
      };
      return { ...state, orders: { ...state.orders, [id]: order } };
    }

    case 'ADD_ITEMS': {
      const { orderId, items } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: { ...order, items: [...order.items, ...items] },
        },
      };
    }

    case 'REMOVE_ITEM': {
      const { orderId, itemIndex } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;
      const newItems = order.items.filter((_, i) => i !== itemIndex);
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: { ...order, items: newItems },
        },
      };
    }

    case 'UPDATE_ORDER': {
      const { orderId, ...updates } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        ...state,
        orders: { ...state.orders, [orderId]: { ...order, ...updates } },
      };
    }

    case 'ADVANCE_STAGE': {
      const { orderId, stage } = action.payload;
      const order = state.orders[orderId];
      if (!order) return state;
      return {
        ...state,
        orders: {
          ...state.orders,
          [orderId]: {
            ...order,
            currentStage: stage,
            stageTimestamps: {
              ...order.stageTimestamps,
              [stage]: Date.now(),
            },
          },
        },
      };
    }

    case 'CLOSE_ORDER': {
      const newOrders = { ...state.orders };
      delete newOrders[action.payload.orderId];
      return { ...state, orders: newOrders };
    }

    case 'UPDATE_MENU': {
      return { ...state, menu: action.payload };
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, ...action.payload };
    }

    // Check-in actions
    case 'SET_CHECKIN_GUESTS': {
      return {
        ...state,
        checkin: {
          ...state.checkin,
          guests: action.payload.guests,
          date: action.payload.date,
        },
      };
    }

    case 'CHECKIN_GUEST': {
      const { guestId, count } = action.payload;
      const guests = state.checkin.guests.map((g) =>
        g.id === guestId
          ? {
              ...g,
              checkedInCount: g.checkedInCount + count,
              checkedInEvents: [...g.checkedInEvents, { time: Date.now(), count }],
            }
          : g
      );
      return { ...state, checkin: { ...state.checkin, guests } };
    }

    case 'UNDO_CHECKIN': {
      const guests = state.checkin.guests.map((g) => {
        if (g.id !== action.payload.guestId) return g;
        const events = [...g.checkedInEvents];
        const lastEvent = events.pop();
        return {
          ...g,
          checkedInCount: Math.max(0, g.checkedInCount - (lastEvent?.count || 0)),
          checkedInEvents: events,
        };
      });
      return { ...state, checkin: { ...state.checkin, guests } };
    }

    case 'TOGGLE_VIP': {
      const guests = state.checkin.guests.map((g) =>
        g.id === action.payload.guestId ? { ...g, isVip: !g.isVip } : g
      );
      return { ...state, checkin: { ...state.checkin, guests } };
    }

    case 'UPDATE_EMERGENCY_CONTACTS': {
      return {
        ...state,
        checkin: { ...state.checkin, emergencyContacts: action.payload },
      };
    }

    case 'RESET_CHECKIN': {
      return {
        ...state,
        checkin: { ...initialState.checkin },
      };
    }

    case 'ADD_CHECKIN_GUEST': {
      const newGuest = {
        ...action.payload,
        id: generateId(),
        checkedInCount: 0,
        checkedInEvents: [],
      };
      return {
        ...state,
        checkin: {
          ...state.checkin,
          guests: [...state.checkin.guests, newGuest],
        },
      };
    }

    case 'REMOVE_CHECKIN_GUEST': {
      const guests = state.checkin.guests.filter((g) => g.id !== action.payload.guestId);
      return { ...state, checkin: { ...state.checkin, guests } };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const saved = loadState();
    return saved ? { ...init, ...saved } : init;
  });

  const [overdueOrders, setOverdueOrders] = useState(new Set());

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Play alarm sound
  const playAlarm = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

      // Two-tone beep
      const osc1 = audioCtx.createOscillator();
      osc1.connect(gainNode);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.2);

      const osc2 = audioCtx.createOscillator();
      osc2.connect(gainNode);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.3);
      osc2.start(audioCtx.currentTime + 0.3);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Alarm sound failed:', e);
    }
  }, []);

  // Send browser notification
  const sendNotification = useCallback((title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Alarm check interval
  const lastAlarmRef = useRef({});
  useEffect(() => {
    if (!state.alarmEnabled) return;

    const check = () => {
      const now = Date.now();
      const thresholdMs = state.alarmMinutes * 60 * 1000;
      const newOverdue = new Set();
      let shouldAlarm = false;

      Object.values(state.orders).forEach((order) => {
        if (order.currentStage === STAGES.DONE || order.currentStage === STAGES.AVAILABLE) return;

        const stageTime = order.stageTimestamps[order.currentStage];
        if (stageTime && now - stageTime > thresholdMs) {
          newOverdue.add(order.id);

          // Only alarm once per order per overdue period (re-alarm every alarmMinutes)
          const lastAlarm = lastAlarmRef.current[order.id] || 0;
          if (now - lastAlarm > thresholdMs) {
            shouldAlarm = true;
            lastAlarmRef.current[order.id] = now;
          }
        }
      });

      setOverdueOrders(newOverdue);

      if (shouldAlarm) {
        playAlarm();
        const overdueList = Object.values(state.orders)
          .filter((o) => newOverdue.has(o.id))
          .map((o) => `Table ${o.tableId}`)
          .join(', ');
        sendNotification('Attention!', `${overdueList} - waiting too long!`);
      }
    };

    check();
    const interval = setInterval(check, 15000); // check every 15 seconds
    return () => clearInterval(interval);
  }, [state.orders, state.alarmEnabled, state.alarmMinutes, playAlarm, sendNotification]);

  // Helper: get order for a specific table
  const getOrderForTable = useCallback(
    (tableId) => {
      return Object.values(state.orders).find((o) => o.tableId === tableId && o.currentStage !== STAGES.DONE);
    },
    [state.orders]
  );

  // Helper: get next stage
  const getNextStage = useCallback((currentStage) => {
    const idx = STAGE_ORDER.indexOf(currentStage);
    if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
  }, []);

  const value = {
    state,
    dispatch,
    overdueOrders,
    getOrderForTable,
    getNextStage,
    playAlarm,
    requestNotificationPermission,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
