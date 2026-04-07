import React from 'react';
import Game from './Game';

export default function App() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '20px', padding: '12px 20px', background: '#333' }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>🎮 Spela</a>
        <a href="/highscore" style={{ color: '#fff', textDecoration: 'none' }}>🏆 Highscore</a>
        <a href="/om" style={{ color: '#fff', textDecoration: 'none' }}>ℹ️ Om</a>
      </nav>
      <Game />
    </div>
  );
}