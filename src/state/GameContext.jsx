import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { ITEM_DB } from '../data/items.js';
import { NPC_DB } from '../data/npcs.js';
import { LOCATIONS, TIME_PERIODS } from '../data/constants.js';
import events from '../data/events.js';
import { ENDINGS } from '../data/endings.js';
import storylines from '../data/storylines.js';

const GameContext = createContext(null);

const initialState = {
  screen: 'title', // title | create | game | ending
  name: '', gender: '女',
  attrs: { physique:1, intelligence:1, charm:1, luck:1, cunning:1, magic:0, sword:0 },
  gold: 20, energy: 100, maxEnergy: 100,
  day: 1, period: 0,
  location: 'home',
  transmuteProgress: 0, officeUnlocked: false, transmuted: false,
  affections: { qingmei:30, rival:10, mentor:0 },
  inventory: [],
  visitCounts: {},
  lastEventId: null,
  flags: {},
  actionsToday: 0,
  tempBuffs: {},
  messages: [],
  eventQueue: [],
  ending: null,
  activeStoryline: null,  // { id, step, data }
  completedStorylines: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, ending: action.ending || null };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.msg] };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_ATTR':
      return { ...state, attrs: { ...state.attrs, [action.key]: action.value } };
    case 'UPDATE_ATTRS':
      return { ...state, attrs: { ...state.attrs, ...action.changes } };
    case 'SET_GOLD':
      return { ...state, gold: Math.max(-999, state.gold + action.delta) };
    case 'SET_ENERGY':
      return { ...state, energy: Math.max(0, Math.min(state.maxEnergy, state.energy + action.delta)) };
    case 'SET_LOCATION':
      return { ...state, location: action.loc };
    case 'ADD_ITEM':
      return (() => {
        const inv = [...state.inventory];
        const item = ITEM_DB[action.itemId];
        if (!item) return state;
        const existing = inv.find(i => i.id === action.itemId);
        if (existing && item.type === 'consumable') {
          existing.qty = (existing.qty || 1) + 1;
        } else if (!existing) {
          inv.push({ ...item, qty: 1 });
        } else {
          existing.qty = (existing.qty || 1) + 1;
        }
        return { ...state, inventory: inv };
      })();
    case 'REMOVE_ITEM':
      return (() => {
        const inv = [...state.inventory];
        const idx = inv.findIndex(i => i.id === action.itemId);
        if (idx >= 0) {
          if (inv[idx].qty > 1) inv[idx].qty--;
          else inv.splice(idx, 1);
        }
        return { ...state, inventory: inv };
      })();
    case 'SET_AFFECTION':
      return {
        ...state,
        affections: {
          ...state.affections,
          [action.npcId]: Math.max(0, Math.min(100, (state.affections[action.npcId] || 0) + action.delta))
        }
      };
    case 'ADVANCE_TIME':
      return (() => {
        const steps = action.steps || 1;
        let newPeriod = state.period + steps;
        let newDay = state.day;
        let newActions = state.actionsToday + steps;
        let newEnergy = state.energy;
        let newBuffs = state.tempBuffs;
        if (newPeriod >= 5) {
          newDay += Math.floor(newPeriod / 5);
          newPeriod %= 5;
          newActions = 0;
          newEnergy = Math.min(state.maxEnergy, state.energy + 15);
          newBuffs = {};
        }
        return { ...state, day: newDay, period: newPeriod, actionsToday: newActions, energy: newEnergy, tempBuffs: newBuffs };
      })();
    case 'INCREMENT_VISIT':
      return {
        ...state,
        visitCounts: { ...state.visitCounts, [action.loc]: (state.visitCounts[action.loc] || 0) + 1 }
      };
    case 'SET_LAST_EVENT':
      return { ...state, lastEventId: action.eventId };
    case 'SET_FLAG':
      return { ...state, flags: { ...state.flags, [action.key]: action.value } };
    case 'TRIGGER_TRANSMUTE':
      return {
        ...state,
        transmuted: true,
        attrs: { ...state.attrs, magic: state.attrs.intelligence, sword: state.attrs.physique },
        affections: { ...state.affections, mentor: 20 },
        location: 'mystic',
      };
    case 'START_STORYLINE':
      return { ...state, activeStoryline: { id: action.id, step: 0 } };
    case 'ADVANCE_STORYLINE':
      return { ...state, activeStoryline: { ...state.activeStoryline, step: state.activeStoryline.step + 1 } };
    case 'END_STORYLINE':
      return { ...state, activeStoryline: null, completedStorylines: [...state.completedStorylines, state.activeStoryline?.id].filter(Boolean) };
    case 'LOAD_STATE':
      return { ...initialState, ...action.data, screen: 'game', messages: [], eventQueue: [] };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(null);

  const isFirstTouch = useRef(true);
  const initAudio = useCallback(() => {
    if (isFirstTouch.current) {
      isFirstTouch.current = false;
      try {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {}
    }
  }, []);

  const playTone = useCallback((freq, dur, type='sine', vol=0.08) => {
    if (!audioRef.current) return;
    try {
      const osc = audioRef.current.createOscillator();
      const gain = audioRef.current.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioRef.current.currentTime + dur);
      osc.connect(gain); gain.connect(audioRef.current.destination);
      osc.start(); osc.stop(audioRef.current.currentTime + dur);
    } catch(e) {}
  }, []);

  const sfx = { sfxEnabled: true, bgmEnabled: true };

  const addMsg = useCallback((text, cls='story') => {
    dispatch({ type: 'ADD_MESSAGE', msg: { text, cls, id: Date.now() + Math.random() } });
  }, []);

  const skillCheck = useCallback((attr, dc) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = state.attrs[attr] || 0;
    const total = roll + bonus;
    const success = total >= dc;
    const attrNames = { physique:'体质', intelligence:'智力', charm:'魅力', luck:'运气', cunning:'心计' };
    return { success, roll, bonus, total, dc, text: `🎲 检定：掷出${roll} + ${attrNames[attr]}(${bonus}) = ${total} (需≥${dc}) → ${success?'✅ 成功':'❌ 失败'}` };
  }, [state.attrs]);

  const applyEffects = useCallback((effects) => {
    if (!effects) return;
    if (effects.attrChange) {
      const changes = {};
      for (const [k, v] of Object.entries(effects.attrChange)) {
        changes[k] = Math.max(0, Math.min(10, (state.attrs[k] || 0) + v));
      }
      dispatch({ type: 'UPDATE_ATTRS', changes });
    }
    if (effects.gold) dispatch({ type: 'SET_GOLD', delta: effects.gold });
    if (effects.item) dispatch({ type: 'ADD_ITEM', itemId: effects.item });
    if (effects.affection) {
      for (const [k, v] of Object.entries(effects.affection)) {
        dispatch({ type: 'SET_AFFECTION', npcId: k, delta: v });
      }
    }
    if (effects.transmuteProgress) {
      // handled via state mutation below
    }
    if (effects.energy) dispatch({ type: 'SET_ENERGY', delta: effects.energy });
  }, [state.attrs]);

  const advanceTime = useCallback((steps = 1) => {
    dispatch({ type: 'ADVANCE_TIME', steps });
  }, []);

  const triggerRandomEvent = useCallback((location) => {
    const candidates = events.filter(e => {
      if (e.isTransmuteTrigger) return false;
      if (e.location !== location && e.location !== 'any') return false;
      if (e.period !== 'any' && e.period !== TIME_PERIODS[state.period]) return false;
      if (e.id === state.lastEventId) return false;
      if (e.requireTransmigration && !state.transmuted) return false;
      return true;
    });
    if (candidates.length === 0) return null;
    const specials = candidates.filter(e => e.isSpecial);
    const pool = specials.length > 0 && Math.random() < 0.3 ? specials : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [state.period, state.lastEventId, state.transmuted]);

  const checkEndings = useCallback(() => {
    const a = state.attrs;
    const af = state.affections;
    const vc = state.visitCounts;
    for (const ending of ENDINGS) {
      const c = ending.cond;
      let met = true;
      if (c.intelligence && a.intelligence < c.intelligence) met = false;
      if (c.cunning && a.cunning < c.cunning) met = false;
      if (c.charm && a.charm < c.charm) met = false;
      if (c.physique && a.physique < c.physique) met = false;
      if (c.luck && a.luck < c.luck) met = false;
      if (c.magic && (a.magic || 0) < c.magic) met = false;
      if (c.day && state.day < c.day) met = false;
      if (c.gold !== undefined) {
        if (c.gold >= 0 && state.gold < c.gold) met = false; // need gold >= c.gold
        if (c.gold < 0 && state.gold >= c.gold) met = false;  // need gold < c.gold (negative threshold)
      }
      if (c.transmuted && !state.transmuted) met = false;
      if (c.affection_qingmei && af.qingmei < c.affection_qingmei) met = false;
      if (c.affection_rival && af.rival < c.affection_rival) met = false;
      if (c.office_visits && (vc['office'] || 0) < c.office_visits) met = false;
      if (c.home_visits && (vc['home'] || 0) < c.home_visits) met = false;
      if (met) return ending;
    }
    return null;
  }, [state]);

  const saveGame = useCallback((slot) => {
    const data = { ...state, messages: [], eventQueue: [] };
    localStorage.setItem(`fushengyin_save_${slot}`, JSON.stringify(data));
  }, [state]);

  const loadGame = useCallback((slot) => {
    const raw = localStorage.getItem(`fushengyin_save_${slot}`);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      dispatch({ type: 'LOAD_STATE', data });
      return true;
    } catch(e) { return false; }
  }, []);

  const checkForStorylines = useCallback(() => {
    if (state.activeStoryline) return null; // already in a storyline
    for (const sl of storylines) {
      if (state.completedStorylines.includes(sl.id)) continue;
      const t = sl.trigger;
      if (t.location !== 'any' && t.location !== state.location) continue;
      if (t.minDay && state.day < t.minDay) continue;
      if (t.minAffection) {
        let ok = true;
        for (const [k, v] of Object.entries(t.minAffection)) {
          if ((state.affections[k] || 0) < v) { ok = false; break; }
        }
        if (!ok) continue;
      }
      if (Math.random() < (t.chance || 0.3)) return sl;
    }
    return null;
  }, [state.activeStoryline, state.completedStorylines, state.location, state.day, state.affections]);

  const autoSave = useCallback(() => {
    const data = { ...state, messages: [], eventQueue: [] };
    localStorage.setItem('fushengyin_autosave', JSON.stringify(data));
  }, [state]);

  const value = {
    state, dispatch, sfx,
    addMsg, skillCheck, applyEffects, advanceTime,
    triggerRandomEvent, checkEndings, checkForStorylines,
    saveGame, loadGame, autoSave,
    playTone, initAudio,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { events, LOCATIONS, TIME_PERIODS, ITEM_DB, NPC_DB, ENDINGS };
