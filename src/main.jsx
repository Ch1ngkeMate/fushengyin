import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from './state/GameContext.jsx';
import App from './App.jsx';
import 'animal-island-ui/style';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
