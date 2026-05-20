import React from 'react';
import { Button } from 'animal-island-ui';
import { useGame } from '../state/GameContext.jsx';

// Minimal test - verify the game context + UI library work
export default function GameScreen() {
  const { state, dispatch, addMsg, playTone, sfx } = useGame();

  const click = () => { if (sfx.sfxEnabled) playTone(800, 0.06, 'square', 0.04); };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:20, color:'#e0d5c1' }}>
      <h2 style={{color:'#d4a574'}}>测试模式</h2>
      <p>姓名: {state.name}</p>
      <p>天: {state.day} | 时段: {state.period} | 金币: {state.gold}</p>
      <p>上午剩余: {state.midDayActions} | 下午剩余: {state.afternoonActions}</p>
      <p>主线: {state.mainProgress}%</p>
      <Button type="primary" onClick={() => { click(); addMsg('测试消息', 'story'); }}>
        发送测试消息
      </Button>
      <Button onClick={() => dispatch({ type:'SET_SCREEN', screen:'title' })} style={{marginTop:8}}>
        返回标题
      </Button>
      <div style={{ flex:1, overflow:'auto', marginTop:10 }}>
        {state.messages?.map((m,i) => <div key={i} className={`msg ${m.cls}`}>{m.text}</div>)}
      </div>
    </div>
  );
}
