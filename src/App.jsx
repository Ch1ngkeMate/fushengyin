import React, { useEffect } from 'react';
import { useGame } from './state/GameContext.jsx';
import { Cursor } from 'animal-island-ui';
import TitleScreen from './components/TitleScreen.jsx';
import CreateScreen from './components/CreateScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import EndingScreen from './components/EndingScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

export default function App() {
  const { state, initAudio, autoSave } = useGame();

  useEffect(() => {
    const handler = () => initAudio();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [initAudio]);

  useEffect(() => {
    if (state.screen === 'game') {
      const t = setInterval(() => autoSave(), 30000);
      return () => clearInterval(t);
    }
  }, [state.screen, autoSave]);

  return (
    <Cursor>
      <div className="app-root">
        <ErrorBoundary>
          {state.screen === 'title' && <TitleScreen />}
          {state.screen === 'create' && <CreateScreen />}
          {state.screen === 'game' && <GameScreen />}
          {state.screen === 'ending' && <EndingScreen />}
        </ErrorBoundary>
      </div>
    </Cursor>
  );
}
