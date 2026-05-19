import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Modal, Tabs, Collapse, Input, Select, Checkbox, Divider } from 'animal-island-ui';
import { useGame, events, LOCATIONS, TIME_PERIODS, ITEM_DB, NPC_DB } from '../state/GameContext.jsx';
import { ATTR_NAMES, ATTR_ICONS, SCENE_PROMPTS } from '../data/constants.js';

export default function GameScreen() {
  const {
    state, dispatch, sfx, addMsg, skillCheck, applyEffects,
    advanceTime, triggerRandomEvent, checkEndings, saveGame, loadGame,
    playTone, initAudio,
  } = useGame();

  const msgEnd = useRef(null);
  const [showShop, setShowShop] = useState(false);
  const [showInv, setShowInv] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNPC, setShowNPC] = useState(false);
  const [showAttr, setShowAttr] = useState(false);
  const [giftTarget, setGiftTarget] = useState(null);
  const [settingKey, setSettingKey] = useState('');

  const click = useCallback(() => { if (sfx.sfxEnabled) playTone(800, 0.06, 'square', 0.04); }, [sfx, playTone]);
  const successSfx = useCallback(() => { if (sfx.sfxEnabled) { playTone(523,0.1); setTimeout(()=>playTone(659,0.1),100); setTimeout(()=>playTone(784,0.15),200); } }, [sfx, playTone]);
  const failSfx = useCallback(() => { if (sfx.sfxEnabled) playTone(200, 0.2, 'sawtooth', 0.06); }, [sfx, playTone]);
  const magicSfx = useCallback(() => { if (sfx.sfxEnabled) { playTone(330,0.2,'triangle',0.06); setTimeout(()=>playTone(440,0.15,'triangle',0.05),150); } }, [sfx, playTone]);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [state.messages]);

  // Start game messages
  useEffect(() => {
    if (state.messages.length === 0 && state.name) {
      addMsg(`【浮生引】\n\n你叫${state.name}，${state.gender==='女'?'一位聪慧的姑娘':'一位有志的少年'}。\n\n命运的齿轮开始转动...你的故事从这里开始。`, 'story');
      addMsg(`📍 当前：${LOCATIONS[state.location]?.name} · 第${state.day}天 · ${TIME_PERIODS[state.period]}`, 'system');
      addMsg('选择一个行动开始吧。也可以切换地点探索不同的剧情。', 'system');
    }
  }, []);

  // Check transmute trigger
  useEffect(() => {
    if (state.transmuteProgress >= 8 && !state.transmuted && state.screen === 'game') {
      const e = events.find(ev => ev.isTransmuteTrigger);
      if (e) addMsg(`✨ ${e.title}\n\n${e.text}`, 'magic');
    }
  }, [state.transmuteProgress]);

  const resolveChoice = useCallback((event, choice) => {
    if (choice.msg === 'TRANSMUTE') {
      magicSfx();
      dispatch({ type: 'TRIGGER_TRANSMUTE' });
      addMsg('⚡ 你踏入了异界之门！世界的法则在你眼前重组...', 'magic');
      addMsg(`你来到了剑与魔法的世界！智力(${state.attrs.intelligence})→魔法(${state.attrs.magic}) 体质(${state.attrs.physique})→剑术(${state.attrs.sword})`, 'magic');
      return;
    }
    if (choice.cost && state.gold < choice.cost) { addMsg('银两不够！', 'failure'); return; }
    if (choice.check) {
      const r = skillCheck(choice.check.attr, choice.check.dc);
      addMsg(r.text, 'system');
      if (r.success) {
        successSfx();
        if (choice.success) { addMsg(choice.success.msg, 'success'); applyEffects(choice.success); }
      } else {
        failSfx();
        if (choice.failure) { addMsg(choice.failure.msg, 'failure'); applyEffects(choice.failure); }
      }
    } else if (choice.msg) {
      addMsg(choice.msg, 'story');
      applyEffects(choice);
    } else if (choice.success) {
      addMsg(choice.success.msg, 'success');
      applyEffects(choice.success);
    }
    advanceTime();
    // Check transmute
    if ((state.transmuteProgress + (choice.transmuteProgress || 0)) >= 8) {
      dispatch({ type: 'SET_STATE', payload: { transmuteProgress: state.transmuteProgress + (choice.transmuteProgress || 0) } });
      const e = events.find(ev => ev.isTransmuteTrigger);
      if (e) {
        addMsg(`✨ ${e.title}`, 'magic');
        addMsg(e.text, 'magic');
        // Add choice buttons handled by parent
      }
    }
    // Check endings
    const ending = checkEndings();
    if (ending) {
      dispatch({ type: 'SET_SCREEN', screen: 'ending', ending });
    }
  }, [state, skillCheck, applyEffects, addMsg, advanceTime, checkEndings, dispatch, successSfx, failSfx, magicSfx]);

  const doAction = useCallback((locAction) => {
    click();
    initAudio();
    const loc = LOCATIONS[state.location];
    dispatch({ type: 'INCREMENT_VISIT', loc: state.location });

    const actionMap = {
      rest:       () => { addMsg('你在家中休息，恢复了精力。', 'story'); dispatch({ type:'SET_ENERGY', delta:25 }); },
      study_room: () => { addMsg('你在书阁翻阅古籍，安安静静地读了一会儿书。(智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); },
      garden:     () => {
        const r = Math.random();
        if (r < 0.3) { const e = triggerRandomEvent('home'); if(e)addMsg(`✨ ${e.title}\n${e.text}`, 'story'); }
        else if (r < 0.6) { addMsg('苏念雪也在花园中赏花，你们聊了一会儿。(苏念雪好感+5)', 'success'); dispatch({ type:'SET_AFFECTION', npcId:'qingmei', delta:5 }); }
        else { addMsg('你在花园中发现了一株珍稀草药。(+回春丹)', 'success'); dispatch({ type:'ADD_ITEM', itemId:'pill_health' }); }
      },
      family_hall:() => { addMsg('你来到正厅，陪长辈说了会儿话。', 'story'); if(Math.random()<0.4){const e=triggerRandomEvent('home');if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story');} },
      attend_class:() => {
        const r = skillCheck('intelligence', 10);
        addMsg(r.text, 'system');
        if (r.success) { addMsg('你领悟颇多！(+智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); }
        else addMsg('你听得一知半解，还需努力。');
        if(Math.random()<0.4){const e=triggerRandomEvent('academy');if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story');}
      },
      library:    () => { addMsg('你在藏书阁中浏览群书，找到了一本好书。', 'story'); if(Math.random()<0.4){const e=triggerRandomEvent('academy');if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story');} },
      debate:     () => { const e=triggerRandomEvent('academy'); if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story'); },
      tea_room:   () => { addMsg('在茶室小憩。萧景琰也在，你们聊了几句。(萧景琰好感+3)', 'success'); dispatch({ type:'SET_AFFECTION', npcId:'rival', delta:3 }); },
      shop:       () => setShowShop(true),
      tea_house:  () => { addMsg('在茶馆听说书，悠闲自在。', 'story'); if(Math.random()<0.4){const e=triggerRandomEvent('market');if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story');} },
      gamble:     () => {
        const r = skillCheck('luck', 12);
        addMsg(r.text, 'system');
        if (r.success) { addMsg('小赢了一笔！(+15两)', 'success'); dispatch({ type:'SET_GOLD', delta:15 }); }
        else { addMsg('输了... (-8两)', 'failure'); dispatch({ type:'SET_GOLD', delta:-8 }); }
      },
      street_wander:() => { const e=triggerRandomEvent('market'); if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story'); },
      handle_cases:() => { addMsg('你审阅案卷，处理日常事务。(+5两)', 'success'); dispatch({ type:'SET_GOLD', delta:5 }); if(Math.random()<0.5){const e=triggerRandomEvent('office');if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story');} },
      court_meeting:() => { const e=triggerRandomEvent('office'); if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story'); },
      bribe:      () => {
        const r = skillCheck('cunning', 12);
        addMsg(r.text, 'system');
        if (r.success) { addMsg('关系网扩大了。(+魅力)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{charm:Math.min(10,state.attrs.charm+1)} }); dispatch({ type:'SET_GOLD', delta:-5 }); }
        else { addMsg('被人发现了！(-10两)', 'failure'); dispatch({ type:'SET_GOLD', delta:-10 }); }
      },
      review:     () => { addMsg('查阅卷宗，受益匪浅。(+智力+1)', 'success'); dispatch({ type:'UPDATE_ATTRS', changes:{intelligence:Math.min(10,state.attrs.intelligence+1)} }); },
      meditate:   () => {
        if (state.transmuted) {
          const r = skillCheck('intelligence', 12);
          addMsg(r.text, 'system');
          if (r.success) { addMsg('魔力增长！(+魔法+1)', 'magic'); dispatch({ type:'UPDATE_ATTRS', changes:{magic:Math.min(10,(state.attrs.magic||0)+1)} }); }
        } else addMsg('你盘坐冥想，心境平和。', 'story');
      },
      magic_training:() => { const e=triggerRandomEvent('mystic'); if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story'); },
      dungeon:   () => { const e=triggerRandomEvent('mystic'); if(e)addMsg(`✨ ${e.title}\n${e.text}`,'story'); },
      summon:    () => {
        const r = skillCheck('intelligence', 13);
        addMsg(r.text, 'system');
        if (r.success) { addMsg('召唤成功！获得元素水晶。', 'success'); dispatch({ type:'ADD_ITEM', itemId:'gift_crystal' }); }
        else addMsg('召唤失败，还需更多练习。', 'failure');
      },
    };

    if (actionMap[locAction]) actionMap[locAction]();
    if (locAction !== 'shop') {
      advanceTime();
      if (Math.random() < 0.35) {
        const e = triggerRandomEvent(state.location);
        if (e) { addMsg(`✨ ${e.title}`, 'system'); addMsg(e.text, 'story'); }
      }
    }
  }, [state, click, initAudio, addMsg, skillCheck, applyEffects, advanceTime, triggerRandomEvent, dispatch]);

  const moveTo = useCallback((locId) => {
    if (state.location === locId) return;
    click();
    dispatch({ type: 'SET_LOCATION', loc: locId });
    addMsg(`你来到了【${LOCATIONS[locId].name}】。${LOCATIONS[locId].desc}`, 'system');
    dispatch({ type: 'INCREMENT_VISIT', loc: locId });
    if (Math.random() < 0.4) {
      const e = triggerRandomEvent(locId);
      if (e) { addMsg(`✨ ${e.title}`, 'system'); addMsg(e.text, 'story'); }
    }
  }, [state.location, click, dispatch, addMsg, triggerRandomEvent]);

  const visibleLocs = Object.entries(LOCATIONS).filter(([id, loc]) => {
    if (loc.unlock) {
      const u = loc.unlock;
      if (u.transmuted && !state.transmuted) return false;
      if (u.intelligence && state.attrs.intelligence < u.intelligence) return false;
      if (u.day && state.day < u.day) return false;
    }
    if (id === 'office' && !state.officeUnlocked) {
      if (state.attrs.intelligence >= 7 && state.day >= 30) dispatch({ type: 'SET_STATE', payload: { officeUnlocked: true } });
      else return false;
    }
    return true;
  });

  // Inventory gift
  const doGift = useCallback((itemIdx, npcId) => {
    const item = state.inventory[itemIdx];
    if (!item) return;
    const bonus = item.affection || 10;
    dispatch({ type: 'SET_AFFECTION', npcId, delta: bonus });
    dispatch({ type: 'REMOVE_ITEM', itemId: item.id });
    addMsg(`你将${item.name}送给了${NPC_DB[npcId].name}。(好感+${bonus})`, 'success');
    setGiftTarget(null);
    setShowNPC(false);
  }, [state.inventory, dispatch, addMsg]);

  // Quick stats
  const attrs = state.attrs;
  const statsStr = `💰${state.gold} ⚡${state.energy} 📅${state.day}天 🕐${TIME_PERIODS[state.period]}`;

  return (
    <>
      {/* Scene Image */}
      <div className="scene-img-container">
        <div className="scene-label">{LOCATIONS[state.location]?.icon} {LOCATIONS[state.location]?.name} · {TIME_PERIODS[state.period]}</div>
        <span style={{ fontSize: 48, opacity: 0.3 }}>{LOCATIONS[state.location]?.icon}</span>
      </div>

      {/* Message Area */}
      <div className="msg-area" onClick={initAudio}>
        {state.messages.map(m => <div key={m.id} className={`msg ${m.cls}`}>{m.text}</div>)}
        <div ref={msgEnd} />
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="quick-stats">
          <span>💰{state.gold}</span>
          <span>⚡{state.energy}</span>
          <span>📅第{state.day}天</span>
          <span>🕐{TIME_PERIODS[state.period]}</span>
          <span>💪{attrs.physique}</span>
          <span>📖{attrs.intelligence}</span>
          <span>💐{attrs.charm}</span>
          <span>🍀{attrs.luck}</span>
          <span>🕸️{attrs.cunning}</span>
          {state.transmuted && <span>🔮{attrs.magic||0}</span>}
        </div>
        <div className="action-row">
          {LOCATIONS[state.location]?.actions.map(a => {
            const labels = { rest:'😴休息', study_room:'📖书阁', garden:'🌸花园', family_hall:'🏠正厅',
              attend_class:'📚上课', library:'📚藏书阁', debate:'🗣️辩论', tea_room:'🍵茶室',
              shop:'🛒商店', tea_house:'🍵茶馆', gamble:'🎲赌坊', street_wander:'🚶闲逛',
              handle_cases:'⚖️审案', court_meeting:'👑上朝', bribe:'🎁打点', review:'📜卷宗',
              meditate:'🧘冥想', magic_training:'🔮训练', dungeon:'⚔️地下城', summon:'✨召唤' };
            return <Button key={a} size="small" onClick={()=>doAction(a)}>{labels[a]||a}</Button>;
          })}
          <Button size="small" type="primary" onClick={()=>{click();setShowInv(true);}}>🎒背包</Button>
          <Button size="small" type="dashed" onClick={()=>{click();setShowNPC(true);}}>💕人际</Button>
          <Button size="small" onClick={()=>{click();setShowAttr(true);}}>📊属性</Button>
          <Button size="small" onClick={()=>{click();setShowSave(true);}}>💾存档</Button>
          <Button size="small" onClick={()=>{click();setShowSettings(true);}}>⚙️</Button>
        </div>
        <div className="loc-row">
          {visibleLocs.map(([id, loc]) => (
            <button key={id} className={`loc-tab${state.location===id?' active':''}`} onClick={()=>moveTo(id)}>
              {loc.icon} {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Modal */}
      <Modal open={showShop} onClose={()=>setShowShop(false)} title="🏪 集市商店" typewriter={false}>
        {Object.entries(ITEM_DB).filter(([,it])=>!it.requireTransmigration||state.transmuted).filter(([,it])=>it.price>0).map(([id, item]) => {
          const price = Math.floor(item.price * (1 - state.attrs.charm * 0.02));
          return (
            <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
              <div><strong>{item.name}</strong><br/><small style={{color:'#888'}}>{item.desc} 💰{price}两</small></div>
              <Button size="small" type="primary" disabled={state.gold<price} onClick={()=>{
                if(state.gold>=price){dispatch({type:'SET_GOLD',delta:-price});dispatch({type:'ADD_ITEM',itemId:id});addMsg(`购买了${item.name}`,'success');}
              }}>购买</Button>
            </div>
          );
        })}
      </Modal>

      {/* Inventory Modal */}
      <Modal open={showInv} onClose={()=>setShowInv(false)} title="🎒 背包" typewriter={false}>
        {state.inventory.length===0 && <p style={{color:'#888',textAlign:'center'}}>空空如也...</p>}
        {state.inventory.map((item, idx) => (
          <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
            <div><strong>{item.name}</strong>{item.qty>1?` ×${item.qty}`:''}<br/><small style={{color:'#888'}}>{item.desc}</small></div>
            {item.type==='consumable' && <Button size="small" onClick={()=>{
              if(item.heal) dispatch({type:'SET_ENERGY',delta:item.heal});
              dispatch({type:'REMOVE_ITEM',itemId:item.id});
              addMsg(`使用了${item.name}`,'system');
            }}>使用</Button>}
            {item.type==='gift' && <Button size="small" type="dashed" onClick={()=>{setGiftTarget(idx);setShowInv(false);setShowNPC(true);}}>送礼</Button>}
          </div>
        ))}
      </Modal>

      {/* NPC Panel */}
      <Modal open={showNPC} onClose={()=>{setShowNPC(false);setGiftTarget(null);}} title="💕 人际往来" typewriter={false}>
        {Object.entries(NPC_DB).filter(([id])=>id!=='mentor'||state.transmuted).map(([npcId, npc]) => {
          const aff = state.affections[npcId]||0;
          const level = aff>=80?'❤️':aff>=60?'💛':aff>=40?'🤝':aff>=20?'👋':'😶';
          const dList = aff>=80?npc.dialogues.high:aff>=50?npc.dialogues.mid:npc.dialogues.low;
          const dlg = dList[Math.floor(Math.random()*dList.length)];
          return (
            <div key={npcId} style={{ padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
              <strong>{npc.name}</strong> <small style={{color:'#888'}}>{npc.title}</small>
              <div style={{ fontSize:12, color:'#888', margin:'4px 0', fontStyle:'italic' }}>{dlg}</div>
              <div style={{ height:6, background:'#eee', borderRadius:3, margin:'4px 0' }}><div style={{ height:'100%', width:`${aff}%`, background:'linear-gradient(90deg,#c44d4d,#d4a574)', borderRadius:3 }} /></div>
              <small>{aff}/100 {level}</small>
              <div style={{ display:'flex', gap:4, marginTop:4 }}>
                <Button size="small" onClick={()=>{
                  setShowNPC(false); addMsg(`【与${npc.name}交谈】`, 'system'); addMsg(dlg, 'story');
                  if(Math.random()<0.4){const g=Math.floor(Math.random()*5)+3;dispatch({type:'SET_AFFECTION',npcId,delta:g});addMsg(`(好感+${g})`,'success');}
                  advanceTime();
                }}>💬</Button>
                <Button size="small" onClick={()=>{
                  const gifts=state.inventory.filter(i=>i.type==='gift');
                  if(gifts.length===0)addMsg('没有可送的礼物。','failure');
                  else { const idx=state.inventory.indexOf(gifts[0]); doGift(idx, npcId); }
                }}>🎁</Button>
                {npcId==='qingmei'&&aff>=70&&<Button size="small" type="primary" onClick={()=>{
                  setShowNPC(false); addMsg('💕 你在月下向苏念雪表明了心意...她泪眼婆娑，轻轻点头。"我等你这句话...等了很久很久。"','success');
                  dispatch({type:'SET_FLAG',key:'lover',value:'qingmei'}); dispatch({type:'SET_AFFECTION',npcId,delta:100-aff});
                }}>告白</Button>}
                {npcId==='rival'&&aff>=60&&<Button size="small" type="primary" onClick={()=>{
                  setShowNPC(false); addMsg('🍻 与萧景琰对饮三杯，从此兄弟相称！','success');
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
              setShowNPC(false); addMsg('📡 通过水晶球联系苏念雪...她看到你眼睛亮了。"你在那边还好吗？"','magic');
              dispatch({type:'SET_AFFECTION',npcId:'qingmei',delta:5}); advanceTime();
            }}>与苏念雪通信</Button>
          </div>
        )}
      </Modal>

      {/* Attributes */}
      <Modal open={showAttr} onClose={()=>setShowAttr(false)} title={`📊 ${state.name}·属性`} typewriter={false}>
        {Object.entries(ATTR_NAMES).map(([key, name]) => (
          <div key={key} style={{ margin:'6px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span>{ATTR_ICONS[key]} {name}</span>
              <span style={{color:'#d4a574',fontWeight:'bold'}}>{state.attrs[key]}/10</span>
            </div>
            <div style={{ height:5, background:'#eee', borderRadius:3 }}><div style={{ height:'100%', width:`${state.attrs[key]*10}%`, background:'#d4a574', borderRadius:3 }} /></div>
          </div>
        ))}
        {state.transmuted && <><div style={{color:'#7b5ea7'}}>🔮 魔法：{state.attrs.magic||0}/10</div><div style={{color:'#7b5ea7'}}>⚔️ 剑术：{state.attrs.sword||0}/10</div></>}
        <div style={{ marginTop:8, fontSize:12, color:'#888' }}>💡 穿越进度：{state.transmuteProgress}/8 {state.transmuteProgress>=8?'✨':''}</div>
        <div style={{ fontSize:11, color:'#b8a88a', marginTop:4 }}>苏念雪❤️{state.affections.qingmei} | 萧景琰❤️{state.affections.rival} | 墨渊❤️{state.affections.mentor}</div>
      </Modal>

      {/* Save/Load Modal */}
      <Modal open={showSave} onClose={()=>{setShowSave(false);setSettingKey('');}} title="💾 存档 / 📂 读档" typewriter={false}>
        {[0,1,2].map(i => {
          const d = localStorage.getItem(`fushengyin_save_${i}`);
          let info = '空';
          if (d) { try { const j=JSON.parse(d); info=`${j.name} · 第${j.day}天 · 💰${j.gold}两`; } catch(e){} }
          return (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
              <div><strong>存档位 {i+1}</strong><br/><small style={{color:'#888'}}>{info}</small></div>
              <div style={{ display:'flex', gap:4 }}>
                <Button size="small" type="primary" onClick={()=>{saveGame(i);addMsg(`💾 存档到位置${i+1}`,'success');setShowSave(false);}}>存</Button>
                <Button size="small" type="dashed" onClick={()=>{if(loadGame(i)){addMsg(`📂 读取存档${i+1}`,'system');setShowSave(false);}else alert('该存档为空');}}>读</Button>
                <Button size="small" danger onClick={()=>{localStorage.removeItem(`fushengyin_save_${i}`);addMsg(`删除存档${i+1}`,'system');setShowSave(false);}}>删</Button>
              </div>
            </div>
          );
        })}
        <small style={{color:'#888'}}>每30秒自动保存至临时档</small>
      </Modal>

      {/* Settings Modal */}
      <Modal open={showSettings} onClose={()=>setShowSettings(false)} title="⚙️ 设置" typewriter={false}>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
          <span>🔊 音效</span>
          <Button size="small" type={sfx.sfxEnabled?'primary':'default'} onClick={()=>{sfx.sfxEnabled=!sfx.sfxEnabled;setSettingKey(Math.random().toString());}}>{sfx.sfxEnabled?'开':'关'}</Button>
        </div>
        <Divider type="line-teal" />
        <p style={{ fontSize:11, color:'#888', textAlign:'center', marginTop:8 }}>浮生引 v2.0 · animal-island-ui 重构<br/>高自由度文字叙事养成游戏</p>
      </Modal>
    </>
  );
}
