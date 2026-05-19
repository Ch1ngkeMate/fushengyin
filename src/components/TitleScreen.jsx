import React from 'react';
import { Button, Card } from 'animal-island-ui';
import { useGame } from '../state/GameContext.jsx';

export default function TitleScreen() {
  const { dispatch, playTone, sfx } = useGame();

  const click = () => { if (sfx.sfxEnabled) playTone(800, 0.08, 'square', 0.04); };

  return (
    <div className="title-wrap">
      <Card color="app-teal">
        <h1>浮生引</h1>
        <div className="sub">红尘三千 · 异界一梦</div>
        <div style={{ fontSize: 11, color: '#8a7b66', marginTop: 8 }}>v2.0 · 高自由度叙事养成</div>
      </Card>
      <Button type="primary" block onClick={() => { click(); dispatch({ type: 'SET_SCREEN', screen: 'create' }); }}>
        开 启 命 运
      </Button>
      <Button type="dashed" block onClick={() => { click(); dispatch({ type: 'SET_SCREEN', screen: 'game' });
        const raw = localStorage.getItem('fushengyin_autosave');
        if (raw) { try { const d = JSON.parse(raw); dispatch({ type: 'LOAD_STATE', data: d }); } catch(e) {} }
      }}>
        再 续 前 缘
      </Button>
      <div style={{ fontSize: 11, color: 'rgba(184,168,138,0.4)', marginTop: 20 }}>「一纸浮生引，两界自由行」</div>
    </div>
  );
}
