import React from 'react';
import { Button, Card } from 'animal-island-ui';
import { useGame } from '../state/GameContext.jsx';

export default function EndingScreen() {
  const { state, dispatch, playTone, sfx } = useGame();
  const click = () => { if (sfx.sfxEnabled) playTone(800, 0.08, 'square', 0.04); };

  return (
    <div className="ending-wrap">
      <Card color="app-teal">
        <h2>{state.ending?.name || '旅程落幕'}</h2>
        <p>{state.ending?.desc || '你的故事暂告一段落。'}</p>
        <div style={{ fontSize: 12, color: '#8a7b66', marginTop: 12, lineHeight: 1.8 }}>
          {state.name} · 第{state.day}天 · 💰{state.gold}两<br />
          体质{state.attrs.physique} 智力{state.attrs.intelligence} 魅力{state.attrs.charm} 运气{state.attrs.luck} 心计{state.attrs.cunning}<br />
          {state.transmuted ? `魔法${state.attrs.magic||0} 剑术${state.attrs.sword||0}` : ''}
        </div>
      </Card>
      <Button type="primary" block onClick={() => { click(); dispatch({ type: 'SET_SCREEN', screen: 'title' }); }}>
        重 新 开 始
      </Button>
    </div>
  );
}
