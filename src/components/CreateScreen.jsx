import React, { useState, useCallback } from 'react';
import { Button, Input, Card } from 'animal-island-ui';
import { useGame } from '../state/GameContext.jsx';
import { ATTR_NAMES, ATTR_ICONS } from '../data/constants.js';

const bgList = [
  '你是江南商贾世家的独子，自小锦衣玉食。父亲希望你读书入仕，光耀门楣。',
  '你出身书香门第，父亲是当地小有名气的教书先生。家中虽不富裕，但藏书颇丰。',
  '你来自没落的武将世家，祖上曾官至将军，如今却只剩一方破旧宅院和一把祖传宝剑。',
  '你是京城一个小官的庶出子女，在家中地位尴尬，处处受到嫡母和嫡兄姐的排挤。',
  '你生在一个平凡的农耕之家，但因天资聪颖被私塾先生看中，破格收为学生。',
  '你是外来商人之后，在这座城市没有根基。但正因如此，你更懂得抓住每一个机会。',
  '你被一个云游道士收养长大，虽然不知亲生父母是谁，但学了一身杂学。',
  '你出身医药世家，从小闻着药香长大。家中在城里开着最大的药铺。',
];

export default function CreateScreen() {
  const { dispatch, playTone, sfx } = useGame();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('女');
  const [attrs, setAttrs] = useState({ physique:1, intelligence:1, charm:1, luck:1, cunning:1 });
  const [bg, setBg] = useState('');
  const click = () => { if (sfx.sfxEnabled) playTone(800, 0.08, 'square', 0.04); };

  const total = Object.values(attrs).reduce((a,b)=>a+b,0);
  const remain = 15 - total;

  const adjust = useCallback((key, d) => {
    click();
    setAttrs(prev => {
      const cur = prev[key];
      if (d > 0 && cur >= 10) return prev;
      if (d < 0 && cur <= 1) return prev;
      const t = Object.values(prev).reduce((a,b)=>a+b,0);
      if (d > 0 && t >= 15) return prev;
      return { ...prev, [key]: cur + d };
    });
  }, []);

  const start = () => {
    if (name.length < 1 || name.length > 4) return;
    if (remain !== 0) return;
    click();
    dispatch({ type: 'SET_STATE', payload: { name, gender, attrs, gold: 20, day: 1, period: 0,
      transmuteProgress: 0, officeUnlocked: false, transmuted: false,
      affections: { qingmei:30, rival:10, mentor:0 }, inventory: [], visitCounts: {},
      flags: {}, actionsToday: 0, lastEventId: null, tempBuffs: {}, messages: [] } });
    dispatch({ type: 'SET_SCREEN', screen: 'game' });
  };

  return (
    <div className="create-wrap">
      <h2>✨ 命由己造</h2>
      <Card color="app-teal">
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#e8c9a0', fontSize: 13, marginBottom: 4 }}>姓名</div>
          <Input placeholder="请输入姓名（1-4字）" size="small" value={name} onChange={e => setName(e.target.value)} maxLength={4} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#e8c9a0', fontSize: 13, marginBottom: 4 }}>性别</div>
          <div style={{ display:'flex', gap: 6 }}>
            {['男','女','不拘'].map(g => (
              <Button key={g} type={gender===g?'primary':'default'} size="small" onClick={()=>{click();setGender(g);}}>{g}</Button>
            ))}
          </div>
        </div>
      </Card>
      <Card color="app-teal" style={{ marginTop: 10 }}>
        <div style={{ color: '#e8c9a0', fontSize: 13, marginBottom: 6 }}>初始属性分配（剩余：<strong>{remain}</strong> 点）</div>
        {Object.entries(ATTR_NAMES).map(([key, label]) => {
          const descs = { physique:'身体', intelligence:'谋略', charm:'社交', luck:'造化', cunning:'心计' };
          return (
            <div className="attr-row" key={key}>
              <span className="attr-name">{ATTR_ICONS[key]} {label}</span>
              <span className="attr-desc">{descs[key]}</span>
              <div className="ctrl">
                <button onClick={()=>adjust(key,-1)}>−</button>
                <span className="val">{attrs[key]}</span>
                <button onClick={()=>adjust(key,1)}>+</button>
              </div>
            </div>
          );
        })}
      </Card>
      <Card color="app-yellow" style={{ marginTop: 10 }}>
        <div style={{ color: '#8a7b66', fontSize: 12, marginBottom: 6 }}>天生命格</div>
        <div style={{ fontSize: 12, color: '#8a7b66', minHeight: 36 }}>{bg || '点击下方按钮随机生成'}</div>
        <Button size="small" onClick={()=>{click();setBg(bgList[Math.floor(Math.random()*bgList.length)]);}} style={{ marginTop: 6 }}>🎲 随机命格</Button>
      </Card>
      <Button type="primary" block disabled={remain !== 0 || !name} onClick={start} style={{ marginTop: 16 }}>
        踏 入 红 尘
      </Button>
    </div>
  );
}
