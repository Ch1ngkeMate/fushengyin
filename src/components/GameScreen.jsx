import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Modal, Divider } from 'animal-island-ui';
import { useGame, events, LOCATIONS, TIME_PERIODS, ITEM_DB, NPC_DB } from '../state/GameContext.jsx';
import storylines from '../data/storylines.js';
import { getBestPrompt, getScenePrompt, SPECIAL_PROMPTS } from '../data/imagePrompts.js';
import { generateImage, preloadScenes } from '../utils/imageGen.js';
import { ATTR_NAMES, ATTR_ICONS } from '../data/constants.js';
import nightEvents from '../data/nightEvents.js';

const SCENE_BG = {
  home:    'radial-gradient(ellipse at 30% 70%, #5a3a1a 0%, #3d2b1a 30%, #2a1a0e 60%, #1a1008 100%)',
  academy: 'radial-gradient(ellipse at 70% 30%, #3a5a3a 0%, #2d3d2d 30%, #1a2a1a 60%, #0e1a0e 100%)',
  market:  'radial-gradient(ellipse at 50% 50%, #5a4a2a 0%, #4d2d1a 30%, #3d2010 60%, #1a0e08 100%)',
  office:  'radial-gradient(ellipse at 60% 40%, #3a3a5a 0%, #2d2d4d 30%, #1a1a3d 60%, #0e0e1a 100%)',
  mystic:  'radial-gradient(ellipse at 50% 50%, #5a2a5a 0%, #3d1a4d 30%, #2d0e3d 60%, #1a0a2a 100%)',
};

const SCENE_OVERLAY = {
  home:    '🏯', academy: '📖', market: '🏪', office: '⚖️', mystic: '🌀'
};
const SCENE_DESC = {
  home:    '朱门大院 · 雕梁画栋', academy: '书声琅琅 · 墨香四溢',
  market:  '车水马龙 · 店铺林立', office: '明镜高悬 · 庄严肃穆',
  mystic:  '灵气氤氲 · 异界之门'
};

const MAX_ACTIONS_PER_DAY = 6;
const MORNING_ACTIONS = 3;
const AFTERNOON_ACTIONS = 3;

export default function GameScreen() {
  const {
    state, dispatch, sfx, addMsg, skillCheck, applyEffects,
    advanceTime, triggerRandomEvent, checkEndings, checkForStorylines, saveGame, loadGame,
    playTone, initAudio,
  } = useGame();

  const msgEnd = useRef(null);
  // v3 time: 上午3 + 下午3, then night settlement
  const periodLabel = state.period === 1 ? '上午' : state.period === 2 ? '下午' : TIME_PERIODS[state.period];
  const actionsLeft = state.period === 1 ? state.midDayActions : state.period === 2 ? state.afternoonActions : 0;
  const isDaytime = state.period === 1 || state.period === 2;
  const isNight = state.period === 4 || state.isNightSettlement;
  const nightBlocked = isNight && !state.activeStoryline;
  const actionBlocked = state.actionsToday >= MAX_ACTIONS_PER_DAY || !!pendingEvent || nightBlocked || state.isNightSettlement;

  const msgAreaRef = useRef(null);
  const [showShop, setShowShop] = useState(false);
  const [showInv, setShowInv] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNPC, setShowNPC] = useState(false);
  const [showAttr, setShowAttr] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [renderedMsgs, setRenderedMsgs] = useState([]);
  const [sceneImgUrl, setSceneImgUrl] = useState('');
  const [sceneImgLoading, setSceneImgLoading] = useState(false);

  const click = useCallback(() => { if (sfx.sfxEnabled) playTone(800, 0.06, 'square', 0.04); }, [sfx, playTone]);
  const successSfx = useCallback(() => { if (sfx.sfxEnabled) { playTone(523,0.1); setTimeout(()=>playTone(659,0.1),100); setTimeout(()=>playTone(784,0.15),200); } }, [sfx, playTone]);
  const failSfx = useCallback(() => { if (sfx.sfxEnabled) playTone(200, 0.2, 'sawtooth', 0.06); }, [sfx, playTone]);
  const magicSfx = useCallback(() => { if (sfx.sfxEnabled) { playTone(330,0.2,'triangle',0.06); setTimeout(()=>playTone(440,0.15,'triangle',0.05),150); } }, [sfx, playTone]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (msgAreaRef.current) {
      msgAreaRef.current.scrollTop = msgAreaRef.current.scrollHeight;
    }
  }, [renderedMsgs]);

  // Start game messages
  useEffect(() => {
    if (state.name && renderedMsgs.length === 0) {
      const msgs = [
        { text: `【浮生引】\n\n你叫${state.name}，${state.gender==='女'?'一位聪慧的姑娘':'一位有志的少年'}。\n\n命运的齿轮开始转动...`, cls: 'story', id: 1 },
        { text: `📍 ${LOCATIONS[state.location]?.name} · 第${state.day}天 · ${TIME_PERIODS[state.period]}`, cls: 'system', id: 2 },
        { text: '选择一个行动开始吧。切换地点探索不同的剧情。', cls: 'system', id: 3 },
      ];
      setRenderedMsgs(msgs);
      dispatch({ type:'SET_STATE', payload:{ period:1, midDayActions:3, afternoonActions:3, isNightSettlement:false } });
    }
  }, [state.name]);

  // Check endings on day transition
  const prevDay = useRef(state.day);
  useEffect(() => {
    if (state.day > prevDay.current && state.day > 1) {
      prevDay.current = state.day;
      const ending = checkEndings();
      if (ending) dispatch({ type: 'SET_SCREEN', screen: 'ending', ending });
    }
  }, [state.day, checkEndings, dispatch]);

  // Generate scene image
  useEffect(() => {
    const prompt = getBestPrompt(state, undefined, undefined);
    setSceneImgLoading(true);
    // Fallback: hide loading spinner after 1.5s regardless
    const fallback = setTimeout(() => setSceneImgLoading(false), 1500);
    generateImage(prompt).then(url => {
      clearTimeout(fallback);
      if (url) setSceneImgUrl(url);
      setSceneImgLoading(false);
    }).catch(() => {
      clearTimeout(fallback);
      setSceneImgLoading(false);
    });
    return () => clearTimeout(fallback);
  }, [state.location, state.period, state.activeStoryline?.id, state.activeStoryline?.step]);

  // Skip preload in dev to avoid blocking
  useEffect(() => { setTimeout(() => preloadScenes(), 3000); }, []);

  // Check transmute trigger
  useEffect(() => {
    if (state.transmuteProgress >= 8 && !state.transmuted) {
      const e = events.find(ev => ev.isTransmuteTrigger);
      if (e && !pendingEvent) {
        setPendingEvent(e);
      }
    }
  }, [state.transmuteProgress, state.transmuted]);

  const pushMsg = useCallback((text, cls = 'story') => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const label = `🕐${ts} ${TIME_PERIODS[state.period]}·第${state.day}天`;
    setRenderedMsgs(prev => [...prev, { text, cls, label, id: Date.now() + Math.random() }]);
  }, [state.period, state.day]);

  // Storyline choice resolution
  const resolveStorylineChoice = useCallback((sl, step, choice) => {
    if (choice.cost && state.gold < choice.cost) { pushMsg('银两不够！', 'failure'); return; }
    if (choice.check) {
      const r = skillCheck(choice.check.attr, choice.check.dc);
      pushMsg(r.text, 'system');
      if (r.success) {
        successSfx();
        if (choice.success) { pushMsg(choice.success.msg, 'success'); applyEffects(choice.success); }
      } else {
        failSfx();
        if (choice.failure) { pushMsg(choice.failure.msg, 'failure'); applyEffects(choice.failure); }
      }
    } else if (choice.msg) {
      pushMsg(choice.msg, 'story');
      applyEffects(choice);
    }
    applyEffects(choice);

    if (choice.endStory) {
      dispatch({ type: 'END_STORYLINE' });
      advanceTime(2);
    } else if (choice.next !== undefined) {
      dispatch({ type: 'ADVANCE_STORYLINE' });
      advanceTime(1);
    }
  }, [state.gold, skillCheck, applyEffects, pushMsg, successSfx, failSfx, dispatch, advanceTime]);

  // Show storyline step
  useEffect(() => {
    if (state.activeStoryline) {
      const sl = storylines.find(s => s.id === state.activeStoryline.id);
      if (sl) {
        const step = sl.steps[state.activeStoryline.step];
        if (step) {
          pushMsg(`📜 ${sl.title} (${state.activeStoryline.step + 1}/${sl.steps.length})`, 'magic');
          pushMsg(step.text, 'story');
          setPendingEvent({ ...step, isStoryline: true, storylineId: sl.id });
        } else {
          dispatch({ type: 'END_STORYLINE' });
        }
      }
    }
  }, [state.activeStoryline?.step]);

  const resolveChoice = useCallback((evt, choice) => {
    if (evt.isStoryline) {
      const sl = storylines.find(s => s.id === evt.storylineId);
      if (sl) {
        resolveStorylineChoice(sl, sl.steps[state.activeStoryline?.step || 0], choice);
        setPendingEvent(null);
        return;
      }
    }
    if (choice.msg === 'TRANSMUTE') {
      magicSfx();
      dispatch({ type: 'TRIGGER_TRANSMUTE' });
      pushMsg('⚡ 你踏入了异界之门！世界的法则在你眼前重组...', 'magic');
      pushMsg(`来到了剑与魔法的世界！智力→魔法(${state.attrs.intelligence}) 体质→剑术(${state.attrs.physique})`, 'magic');
      pushMsg('墨渊已在传送门另一端等候你。', 'magic');
      setPendingEvent(null);
      advanceTime(1);
      return;
    }

    if (choice.cost && state.gold < choice.cost) {
      pushMsg('银两不够！', 'failure');
      setPendingEvent(null);
      return;
    }

    if (choice.check) {
      const r = skillCheck(choice.check.attr, choice.check.dc);
      pushMsg(r.text, 'system');
      if (r.success) {
        successSfx();
        if (choice.success) { pushMsg(choice.success.msg, 'success'); applyEffects(choice.success); }
      } else {
        failSfx();
        if (choice.failure) { pushMsg(choice.failure.msg, 'failure'); applyEffects(choice.failure); }
      }
    } else if (choice.msg) {
      pushMsg(choice.msg, 'story');
      applyEffects(choice);
    } else if (choice.success && !choice.check) {
      pushMsg(choice.success.msg, 'success');
      applyEffects(choice.success);
    }

    setPendingEvent(null);
    advanceTime(1);

    // After advancing, check for new transmute trigger
    const newTP = state.transmuteProgress + (choice.transmuteProgress || 0);
    if (newTP >= 8 && !state.transmuted) {
      dispatch({ type: 'SET_STATE', payload: { transmuteProgress: newTP } });
    }
  }, [state, skillCheck, applyEffects, advanceTime, dispatch, successSfx, failSfx, magicSfx, pushMsg]);

  // Handle event trigger
  const triggerEvent = useCallback((evt) => {
    pushMsg(`✨ ${evt.title}`, 'system');
    pushMsg(evt.text, 'story');
    setPendingEvent(evt);
  }, [pushMsg]);

  // Enter night mode
  const enterNight = useCallback(() => {
    dispatch({ type:'ENTER_NIGHT' });
    pushMsg('🌙 夜幕降临，今日的行动已全部结束。', 'system');
    // Trigger night event
    const pool = nightEvents.filter(() => Math.random() < 0.4);
    const ev = pool.length > 0 ? pool[Math.floor(Math.random()*pool.length)] : nightEvents[Math.floor(Math.random()*nightEvents.length)];
    if (ev) {
      dispatch({ type:'NIGHT_RESULT', result:ev });
      if (ev.isSpecial) pushMsg(`✨ ${ev.title}`, 'magic');
      pushMsg(ev.text, 'story');
    }
  }, [dispatch, pushMsg]);

  const doAction = useCallback((locAction) => {
    click();
    initAudio();

    // Night settlement mode - only "enter new day" allowed
    if (state.isNightSettlement) {
      if (locAction === 'newDay') {
        dispatch({ type:'ADVANCE_DAY' });
        pushMsg('☀️ 新的一天开始了！', 'system');
        pushMsg(`📍 第${state.day+1}天 · 上午 · 剩余3/6行动`, 'system');
        dispatch({ type:'CHECK_MILESTONE' });
        return;
      }
      pushMsg('请先完成夜晚结算，点击"进入新的一天"。', 'failure');
      return;
    }

    // Night blocked
    if (isNight && locAction !== 'rest') {
      pushMsg('🌙 夜深了，只能休息。', 'failure');
      return;
    }

    // Action limit for daytime
    if (!isDaytime && locAction !== 'rest' && locAction !== 'newDay') {
      pushMsg('当前时段不能执行此操作。', 'failure');
      return;
    }

    if (state.actionsToday >= MAX_ACTIONS_PER_DAY && locAction !== 'rest') {
      pushMsg('今日行动已用完，休息进入夜晚结算。', 'failure');
      return;
    }

    dispatch({ type: 'INCREMENT_VISIT', loc: state.location });

    if (locAction === 'shop') { setShowShop(true); return; }

    const actionMessages = {
      rest:       () => {
        if (state.period === 4 || state.isNightSettlement) {
          pushMsg('🌙 夜深人静，你安然入睡。', 'story');
          dispatch({ type:'SET_ENERGY', delta:25 });
          enterNight();
          return;
        }
        pushMsg('你在家中休息，恢复了精力。', 'story');
        dispatch({ type:'SET_ENERGY', delta:25 });
      },
      study_room: () => { pushMsg('你在书阁翻阅古籍，安安静静地读了一会儿书。(智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); },
      garden:     () => {
        const r = Math.random();
        if (r < 0.35 && !pendingEvent) { const e = triggerRandomEvent('home'); if(e) { triggerEvent(e); return; } }
        if (r < 0.6) { pushMsg('苏念雪也在花园中赏花，你们聊了一会儿。(苏念雪好感+5)', 'success'); dispatch({ type:'SET_AFFECTION', npcId:'qingmei', delta:5 }); }
        else { pushMsg('在花园中散步，发现了一株珍稀草药。(+回春丹)', 'success'); dispatch({ type:'ADD_ITEM', itemId:'pill_health' }); }
      },
      family_hall:() => { pushMsg('你来到正厅，陪长辈说了会儿话。', 'story'); },
      attend_class:() => {
        const r = skillCheck('intelligence', 10);
        pushMsg(r.text, 'system');
        if (r.success) { pushMsg('你领悟颇多！(+智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); }
        else pushMsg('一知半解，还需努力。', 'story');
      },
      library:    () => { pushMsg('在藏书阁浏览群书，找到一本好书。', 'story'); },
      debate:     () => { const e = triggerRandomEvent('academy'); if(e) { triggerEvent(e); return; } },
      tea_room:   () => { pushMsg('在茶室小憩。萧景琰也在，聊了几句。(萧景琰好感+3)', 'success'); dispatch({ type:'SET_AFFECTION', npcId:'rival', delta:3 }); },
      tea_house:  () => { pushMsg('在茶馆听说书，悠闲自在。', 'story'); },
      gamble:     () => {
        const r = skillCheck('luck', 12);
        pushMsg(r.text, 'system');
        if (r.success) { pushMsg('小赢一笔！(+15两)', 'success'); dispatch({ type:'SET_GOLD', delta:15 }); }
        else { pushMsg('输了... (-8两)', 'failure'); dispatch({ type:'SET_GOLD', delta:-8 }); }
      },
      street_wander: () => { const e = triggerRandomEvent('market'); if(e) { triggerEvent(e); return; } },
      handle_cases:() => { pushMsg('审阅案卷，处理日常事务。(+5两)', 'success'); dispatch({ type:'SET_GOLD', delta:5 }); },
      court_meeting:() => { const e = triggerRandomEvent('office'); if(e) { triggerEvent(e); return; } },
      bribe:      () => {
        const r = skillCheck('cunning', 12);
        pushMsg(r.text, 'system');
        if (r.success) { pushMsg('关系网扩大了。(+魅力)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{charm:Math.min(10,state.attrs.charm+1)} }); dispatch({ type:'SET_GOLD', delta:-5 }); }
        else { pushMsg('被人发现了！(-10两)', 'failure'); dispatch({ type:'SET_GOLD', delta:-10 }); }
      },
      review:     () => { pushMsg('查阅卷宗，受益匪浅。(+智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); },
      meditate:   () => {
        if (state.transmuted) {
          const r = skillCheck('intelligence', 12);
          pushMsg(r.text, 'system');
          if (r.success) { pushMsg('魔力增长！(+魔法+1)', 'magic'); dispatch({ type:'UPDATE_ATTRS', changes:{magic:Math.min(10,(state.attrs.magic||0)+1)} }); }
        } else pushMsg('盘坐冥想，心境平和。', 'story');
      },
      magic_training:() => { const e = triggerRandomEvent('mystic'); if(e) { triggerEvent(e); return; } },
      dungeon:   () => { const e = triggerRandomEvent('mystic'); if(e) { triggerEvent(e); return; } },
      summon:    () => {
        const r = skillCheck('intelligence', 13);
        pushMsg(r.text, 'system');
        if (r.success) { pushMsg('召唤成功！获得元素水晶。', 'success'); dispatch({ type:'ADD_ITEM', itemId:'gift_crystal' }); }
        else pushMsg('召唤失败，还需练习。', 'failure');
      },
    };

    if (actionMessages[locAction]) {
      actionMessages[locAction]();
    }

    // Use action & advance time
    dispatch({ type:'USE_ACTION' });
    // Track action type for titles
    dispatch({ type:'SET_STATE', payload:{ actionCounts:{...state.actionCounts, [locAction]:(state.actionCounts[locAction]||0)+1} } });

    if (!pendingEvent) {
      // Check if night should trigger (actions exhausted)
      const newActionsLeft = state.period === 1 ? state.midDayActions - 1 : state.period === 2 ? state.afternoonActions - 1 : 0;
      if (newActionsLeft <= 0 && (state.period === 1 || state.period === 2)) {
        if (state.period === 1) {
          pushMsg('🌤️ 上午的3次行动已用完，进入下午。', 'system');
        } else if (state.afternoonActions <= 1) {
          // Last afternoon action → trigger night
          setTimeout(() => enterNight(), 500);
          return;
        }
      }
      // Advance period based on actions left
      advanceTime(1);
      // Check for storylines
      const sl = checkForStorylines();
      if (sl) {
        dispatch({ type: 'START_STORYLINE', id: sl.id });
      } else if (Math.random() < 0.2) {
        const e = triggerRandomEvent(state.location);
        if (e) triggerEvent(e);
      }
      // Main progress: each action +1
      dispatch({ type:'ADD_MAIN_PROGRESS', amount:1 });
    }
  }, [state, click, initAudio, pendingEvent, skillCheck, applyEffects, advanceTime, triggerRandomEvent, dispatch, checkEndings, pushMsg, triggerEvent]);

  const moveTo = useCallback((locId) => {
    if (state.location === locId) return;
    if (state.isNightSettlement) { pushMsg('请先完成夜晚结算。', 'failure'); return; }
    if (isNight && !state.activeStoryline) { pushMsg('🌙 夜深不宜外出。', 'failure'); return; }
    if (!isDaytime) { pushMsg('当前时段不能移动。', 'failure'); return; }
    if (state.actionsToday >= MAX_ACTIONS_PER_DAY) { pushMsg('今日行动已用完。', 'failure'); return; }
    click();
    dispatch({ type: 'SET_LOCATION', loc: locId });
    pushMsg(`来到了【${LOCATIONS[locId].name}】。${LOCATIONS[locId].desc}`, 'system');
    dispatch({ type: 'INCREMENT_VISIT', loc: locId });
    advanceTime(1);
    if (Math.random() < 0.35) {
      const e = triggerRandomEvent(locId);
      if (e) triggerEvent(e);
    }
  }, [state.location, state.actionsToday, click, dispatch, pushMsg, advanceTime, triggerRandomEvent, triggerEvent]);

  const visibleLocs = Object.entries(LOCATIONS).filter(([, loc]) => {
    if (loc.unlock) {
      const u = loc.unlock;
      if (u.transmuted && !state.transmuted) return false;
      if (u.intelligence && state.attrs.intelligence < u.intelligence) return false;
      if (u.day && state.day < u.day) return false;
    }
    if (loc.name === '官府' && !state.officeUnlocked) {
      if (state.attrs.intelligence >= 7 && state.day >= 30) {
        dispatch({ type: 'SET_STATE', payload: { officeUnlocked: true } });
        return true;
      }
      return false;
    }
    return true;
  });

  const attrs = state.attrs;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Scene Image */}
      <div className="scene-img-container" style={{ background: SCENE_BG[state.location] || SCENE_BG.home }}>
        {sceneImgUrl && <img src={sceneImgUrl} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:1 }} />}
        {sceneImgLoading && <div style={{ position:'absolute',inset:0,zIndex:2,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'rgba(255,255,255,0.5)' }}>🎨 生成场景图...</div>}
        <div style={{ zIndex: 0, fontSize: 72, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))', opacity: sceneImgUrl ? 0 : 0.65 }}>
          {SCENE_OVERLAY[state.location] || LOCATIONS[state.location]?.icon}
        </div>
        <div className="scene-label" style={{ zIndex: 3 }}>
          {LOCATIONS[state.location]?.icon} {LOCATIONS[state.location]?.name} · {TIME_PERIODS[state.period]} · {state.actionsToday}/{MAX_ACTIONS_PER_DAY}动
          {isNight && !state.activeStoryline ? ' 🌙休息' : ''}
        </div>
      </div>

      {/* Message Area */}
      {/* Night settlement panel */}
      {state.isNightSettlement && (
        <div style={{ background:'linear-gradient(180deg, rgba(123,94,167,0.3), rgba(26,26,46,0.9))', padding:'10px 14px', borderBottom:'2px solid rgba(123,94,167,0.3)' }}>
          <div style={{ textAlign:'center', color:'#d4a574', fontWeight:'bold', fontSize:14, marginBottom:6 }}>🌙 第{state.day}天结束 · 夜间结算</div>
          <div style={{ fontSize:12, color:'#b8a88a', lineHeight:1.8 }}>
            {state.nightEventResult && <div>📌 {state.nightEventResult.title}</div>}
            <div>💰 今日金币: {state.prevGold} → {state.gold} ({state.gold-state.prevGold>=0?'+':''}{state.gold-state.prevGold})</div>
            {Object.entries(ATTR_NAMES).map(([k,n])=>{
              const diff = state.attrs[k] - (state.prevAttrs[k]||0);
              if (diff !== 0) return <div key={k}>{ATTR_ICONS[k]} {n}: {state.prevAttrs[k]||0} → {state.attrs[k]} ({diff>0?'+':''}{diff})</div>;
              return null;
            })}
            <div>📜 主线进度: {state.mainProgress}%</div>
            {state.milestones.length > 0 && <div>🏆 里程碑: {state.milestones.length}个</div>}
            <div style={{ color:'#e8c9a0', marginTop:4 }}>💡 明日预告: {state.mainProgress<20?'继续积累声望与实力':state.mainProgress<40?'家族/科举关键节点临近':state.mainProgress<60?'重大转折即将到来':state.mainProgress<80?'最终考验在即':'结局近在眼前'}</div>
          </div>
          <Button block type="primary" size="small" onClick={()=>{click();doAction('newDay');}} style={{ marginTop:8 }}>
            ☀️ 进入新的一天 (第{state.day+1}天)
          </Button>
          <div style={{ display:'flex', gap:4, marginTop:4 }}>
            <Button size="small" onClick={()=>{click();setShowSave(true);}}>💾 存档</Button>
            <Button size="small" onClick={()=>{click();setShowSettings(true);}}>⚙️ 设置</Button>
            <Button size="small" onClick={()=>{
              const tpl = prompt('计划模板: 1=全天学习 2=全天社交 3=全天打工 4=取消');
              if (tpl==='1') dispatch({type:'SET_PLAN',plan:'study'});
              else if (tpl==='2') dispatch({type:'SET_PLAN',plan:'social'});
              else if (tpl==='3') dispatch({type:'SET_PLAN',plan:'work'});
              else dispatch({type:'SET_PLAN',plan:null});
              pushMsg(tpl&&tpl!=='4'?`📋 明日计划已设定`:'📋 计划已取消','system');
            }}>📋 计划</Button>
          </div>
        </div>
      )}

      {/* Night warning for daytime night period */}
      {isNight && !state.isNightSettlement && (
        <div style={{ background:'rgba(123,94,167,0.3)', color:'#b8a0d8', textAlign:'center', padding:'6px', fontSize:12, borderBottom:'1px solid rgba(123,94,167,0.3)' }}>
          🌙 夜晚模式 — 点击「😴休息」进行夜间结算
        </div>
      )}

      <div className="msg-area" ref={msgAreaRef} onClick={initAudio}>
        {renderedMsgs.map(m => (
          <div key={m.id}>
            <div style={{ fontSize:10, color:'rgba(184,168,138,0.5)', marginBottom:1, paddingLeft:4 }}>{m.label}</div>
            <div className={`msg ${m.cls}`}>{m.text}</div>
          </div>
        ))}

        {/* Pending Event Choices */}
        {pendingEvent && (
          <div className="choice-list">
            {pendingEvent.choices.map((ch, idx) => (
              <button key={idx} className="choice-btn" onClick={() => resolveChoice(pendingEvent, ch)}>
                {idx + 1}. {ch.text}
              </button>
            ))}
          </div>
        )}

        <div ref={msgEnd} />
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="quick-stats">
          <span>💰{state.gold}</span>
          <span>⚡{state.energy}</span>
          <span>📅第{state.day}天</span>
          <span>🕐{periodLabel}{isDaytime?` (剩${actionsLeft}次)`:` 结算`}</span>
          <span>💪{attrs.physique}</span>
          <span>📖{attrs.intelligence}</span>
          <span>💐{attrs.charm}</span>
          <span>🍀{attrs.luck}</span>
          <span>🕸️{attrs.cunning}</span>
          {state.transmuted && <span>🔮{attrs.magic||0}</span>}
        </div>
        {/* Main quest progress bar */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'2px 8px', fontSize:10, color:'#d4a574' }}>
          <span>📜主线</span>
          <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${state.mainProgress}%`, background:'linear-gradient(90deg,#c44d4d,#d4a574,#7b5ea7)', borderRadius:3, transition:'width 0.5s' }} />
          </div>
          <span style={{ fontWeight:'bold' }}>{state.mainProgress}%</span>
          {state.milestones.length > 0 && <span>🏆×{state.milestones.length}</span>}
        </div>

        <div className="action-row">
          {state.isNightSettlement ? (
            <Button size="small" type="primary" onClick={()=>{click();doAction('newDay');}}>☀️ 进入第{state.day+1}天</Button>
          ) : (
            <>
              {LOCATIONS[state.location]?.actions.map(a => {
                const labels = { rest:'😴休息', study_room:'📖书阁', garden:'🌸花园', family_hall:'🏠正厅',
                  attend_class:'📚上课', library:'📚藏书阁', debate:'🗣️辩论', tea_room:'🍵茶室',
                  shop:'🛒商店', tea_house:'🍵茶馆', gamble:'🎲赌坊', street_wander:'🚶闲逛',
                  handle_cases:'⚖️审案', court_meeting:'👑上朝', bribe:'🎁打点', review:'📜卷宗',
                  meditate:'🧘冥想', magic_training:'🔮训练', dungeon:'⚔️地下城', summon:'✨召唤' };
                const isRest = a === 'rest';
                const blocked = isRest ? false : (actionBlocked || !isDaytime);
                return <Button key={a} size="small" disabled={blocked} onClick={()=>doAction(a)}>
                  {labels[a]||a}{(isRest && (isNight||state.isNightSettlement)) ? '💤' : ''}
                </Button>;
              })}
              <Button size="small" type="primary" disabled={actionBlocked||!isDaytime} onClick={()=>{click();setShowInv(true);}}>🎒背包</Button>
              <Button size="small" type="dashed" disabled={actionBlocked||!isDaytime} onClick={()=>{click();setShowNPC(true);}}>💕人际</Button>
              <Button size="small" disabled={actionBlocked||!isDaytime} onClick={()=>{click();setShowAttr(true);}}>📊属性</Button>
            </>
          )}
          <Button size="small" onClick={()=>{click();setShowSave(true);}}>💾存档</Button>
          <Button size="small" onClick={()=>{click();setShowSettings(true);}}>⚙️</Button>
        </div>

        <div className="loc-row">
          {visibleLocs.map(([id, loc]) => (
            <button key={id} className={`loc-tab${state.location===id?' active':''}`}
              disabled={nightBlocked || !!pendingEvent || state.isNightSettlement || !isDaytime}
              onClick={()=>moveTo(id)}>
              {loc.icon} {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Modals - same as before */}
      <Modal open={showShop} onClose={()=>setShowShop(false)} title="🏪 集市商店" typewriter={false}>
        {Object.entries(ITEM_DB).filter(([,it])=>!it.requireTransmigration||state.transmuted).filter(([,it])=>it.price>0).map(([id, item]) => {
          const price = Math.floor(item.price * (1 - state.attrs.charm * 0.02));
          return (
            <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ flex:1 }}><strong>{item.name}</strong><br/><small style={{color:'#888'}}>{item.desc} 💰{price}两</small></div>
              <Button size="small" type="primary" disabled={state.gold<price} onClick={()=>{
                if(state.gold>=price){dispatch({type:'SET_GOLD',delta:-price});dispatch({type:'ADD_ITEM',itemId:id});pushMsg(`购买了${item.name}`,'success');}
              }}>购买</Button>
            </div>
          );
        })}
      </Modal>

      <Modal open={showInv} onClose={()=>setShowInv(false)} title="🎒 背包" typewriter={false}>
        {state.inventory.length===0 && <p style={{color:'#888',textAlign:'center'}}>空空如也...</p>}
        {state.inventory.map((item, idx) => (
          <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
            <div><strong>{item.name}</strong>{item.qty>1?` ×${item.qty}`:''}<br/><small style={{color:'#888'}}>{item.desc}</small></div>
            {item.type==='consumable' && <Button size="small" onClick={()=>{
              if(item.heal) dispatch({type:'SET_ENERGY',delta:item.heal});
              dispatch({type:'REMOVE_ITEM',itemId:item.id});
              pushMsg(`使用了${item.name}`,'system');
            }}>使用</Button>}
          </div>
        ))}
      </Modal>

      <Modal open={showNPC} onClose={()=>setShowNPC(false)} title="💕 人际往来" typewriter={false}>
        {Object.entries(NPC_DB).filter(([id])=>id!=='mentor'||state.transmuted).map(([npcId, npc]) => {
          const aff = state.affections[npcId]||0;
          const level = aff>=80?'❤️挚友':aff>=60?'💛好友':aff>=40?'🤝熟识':aff>=20?'👋初识':'😶陌生';
          const dList = aff>=80?npc.dialogues.high:aff>=50?npc.dialogues.mid:npc.dialogues.low;
          const dlg = dList[Math.floor(Math.random()*dList.length)];
          return (
            <div key={npcId} style={{ padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
              <strong>{npc.name}</strong> <small style={{color:'#888'}}>{npc.title}</small>
              <div style={{ fontSize:12, color:'#888', margin:'4px 0', fontStyle:'italic' }}>{dlg}</div>
              <div style={{ height:5, background:'rgba(0,0,0,0.1)', borderRadius:3, margin:'4px 0' }}>
                <div style={{ height:'100%', width:`${aff}%`, background:'linear-gradient(90deg,#c44d4d,#d4a574)', borderRadius:3 }} />
              </div>
              <small>{aff}/100 {level}</small>
              <div style={{ display:'flex', gap:4, marginTop:4 }}>
                <Button size="small" onClick={()=>{
                  setShowNPC(false); pushMsg(`【与${npc.name}交谈】`, 'system'); pushMsg(dlg, 'story');
                  if(Math.random()<0.4){const g=Math.floor(Math.random()*5)+3;dispatch({type:'SET_AFFECTION',npcId,delta:g});pushMsg(`(好感+${g})`,'success');}
                  advanceTime(1);
                }}>💬交谈</Button>
                {/* Gift */}
                {state.inventory.some(i=>i.type==='gift') && <Button size="small" type="dashed" onClick={()=>{
                  const giftIdx = state.inventory.findIndex(i=>i.type==='gift');
                  if(giftIdx>=0){const item=state.inventory[giftIdx];const bonus=item.affection||10;dispatch({type:'SET_AFFECTION',npcId,delta:bonus});dispatch({type:'REMOVE_ITEM',itemId:item.id});pushMsg(`送出${item.name}(+${bonus})`,'success');setShowNPC(false);advanceTime(1);}
                }}>🎁送礼</Button>}
                {npcId==='qingmei'&&aff>=70&&!state.flags.lover&&<Button size="small" type="primary" onClick={()=>{
                  setShowNPC(false); pushMsg('💕 你在月下向苏念雪表明了心意...她泪眼婆娑，轻轻点头。"我等你这句话...等了很久很久。"','success');
                  dispatch({type:'SET_FLAG',key:'lover',value:'qingmei'}); dispatch({type:'SET_AFFECTION',npcId,delta:100-aff});
                }}>告白</Button>}
                {npcId==='rival'&&aff>=60&&!state.flags.brother&&<Button size="small" type="primary" onClick={()=>{
                  setShowNPC(false); pushMsg('🍻 与萧景琰对饮三杯，从此兄弟相称！','success');
                  dispatch({type:'SET_FLAG',key:'brother',value:'rival'}); dispatch({type:'SET_AFFECTION',npcId,delta:100-aff});
                }}>结义</Button>}
              </div>
            </div>
          );
        })}
        {state.transmuted && (
          <div style={{ marginTop:8, padding:8, border:'1px solid #7b5ea7', borderRadius:8 }}>
            <small style={{color:'#7b5ea7'}}>📡 跨时空通信</small>
            <Button size="small" block onClick={()=>{
              setShowNPC(false); pushMsg('📡 通过水晶球联系苏念雪...她看到你眼睛亮了。"你在那边还好吗？"','magic');
              dispatch({type:'SET_AFFECTION',npcId:'qingmei',delta:5}); advanceTime(1);
            }}>与苏念雪通信</Button>
          </div>
        )}
      </Modal>

      <Modal open={showAttr} onClose={()=>setShowAttr(false)} title={`📊 ${state.name}·属性`} typewriter={false}>
        {Object.entries(ATTR_NAMES).map(([key, name]) => (
          <div key={key} style={{ margin:'4px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span>{ATTR_ICONS[key]} {name}</span>
              <span style={{color:'#d4a574',fontWeight:'bold'}}>{state.attrs[key]}/10</span>
            </div>
            <div style={{ height:4, background:'rgba(0,0,0,0.1)', borderRadius:2 }}>
              <div style={{ height:'100%', width:`${state.attrs[key]*10}%`, background:'#d4a574', borderRadius:2 }} />
            </div>
          </div>
        ))}
        {state.transmuted && <div style={{ color:'#7b5ea7', fontSize:13 }}>🔮 魔法：{state.attrs.magic||0} ⚔️ 剑术：{state.attrs.sword||0}</div>}
        <div style={{ marginTop:6, fontSize:12, color:'#888' }}>
          ⏳ 穿越进度：{state.transmuteProgress}/8 {state.transmuteProgress>=8?'✨ 可触发！':''}<br/>
          ❤️ 苏念雪{state.affections.qingmei} | 萧景琰{state.affections.rival} | 墨渊{state.affections.mentor}
        </div>
      </Modal>

      <Modal open={showSave} onClose={()=>setShowSave(false)} title="💾 存档 / 📂 读档" typewriter={false}>
        {[0,1,2].map(i => {
          const d = localStorage.getItem(`fushengyin_save_${i}`);
          let info = '空';
          if (d) { try { const j=JSON.parse(d); info=`${j.name} · 第${j.day}天 · 💰${j.gold}两`; } catch(e){} }
          return (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
              <div><strong>存档 {i+1}</strong><br/><small style={{color:'#888'}}>{info}</small></div>
              <div style={{ display:'flex', gap:4 }}>
                <Button size="small" type="primary" onClick={()=>{saveGame(i);pushMsg(`💾 存档到位置${i+1}`,'success');setShowSave(false);}}>存</Button>
                <Button size="small" type="dashed" onClick={()=>{if(loadGame(i)){pushMsg(`📂 读取存档${i+1}`,'system');setShowSave(false);setRenderedMsgs([]);}else alert('该存档为空');}}>读</Button>
                <Button size="small" danger onClick={()=>{localStorage.removeItem(`fushengyin_save_${i}`);pushMsg(`删除存档${i+1}`,'system');setShowSave(false);}}>删</Button>
              </div>
            </div>
          );
        })}
      </Modal>

      <Modal open={showSettings} onClose={()=>setShowSettings(false)} title="⚙️ 设置" typewriter={false}>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
          <span>🔊 音效</span>
          <Button size="small" type={sfx.sfxEnabled?'primary':'default'} onClick={()=>{sfx.sfxEnabled=!sfx.sfxEnabled;}}>{sfx.sfxEnabled?'开':'关'}</Button>
        </div>
        <Divider type="line-teal" />
        <p style={{ fontSize:11, color:'#888', textAlign:'center', marginTop:8 }}>浮生引 v2.0 · animal-island-ui<br/>高自由度文字叙事养成游戏</p>
      </Modal>
    </div>
  );
}
