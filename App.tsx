import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import Game from './components/Game';
import StartMenu from './components/StartMenu';
import GameOver from './components/GameOver';
import Joystick from './components/Joystick';
import BarkButton from './components/BarkButton';
import HelpModal from './components/HelpModal';
import RotateDeviceOverlay from './components/RotateDeviceOverlay';
import type { GameState, Vector2D } from './types';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [joystickVector, setJoystickVector] = useState<Vector2D>({ x: 0, y: 0 });
  const [barkTrigger, setBarkTrigger] = useState(0);
  const [scale, setScale] = useState(1);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('yardPatrolHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  useLayoutEffect(() => {
    const updateScale = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

      if (isDesktop) {
        setScale(1);
        return;
      }

      const { innerWidth, innerHeight } = window;
      // The game container has 0.75rem (12px) padding on each side (p-3)
      const gameTotalWidth = GAME_WIDTH + 24;
      const gameTotalHeight = GAME_HEIGHT + 24;

      const scaleX = innerWidth / gameTotalWidth;
      const scaleY = innerHeight / gameTotalHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setGameState('playing');
  }, []);
  
  const handleBarkPress = useCallback(() => {
    setBarkTrigger(prev => prev + 1);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('yardPatrolHighScore', finalScore.toString());
    }
    setGameState('gameOver');
  }, [highScore]);
  
  const openHelp = () => setIsHelpVisible(true);
  const closeHelp = () => setIsHelpVisible(false);

  return (
    <main className="bg-slate-800 w-screen h-screen flex items-center justify-center font-sans text-white lg:p-4 overflow-hidden">
      <RotateDeviceOverlay />
      <div id="game-content" className="w-full h-full flex items-center justify-center relative">
        
        {/* Game Container */}
        <div 
            className="bg-amber-800 p-3 rounded-2xl shadow-2xl shadow-black/50"
            style={{ transform: `scale(${scale})`}}
        >
          <div 
            className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-600 to-green-800"
            style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
          >
            <Game 
              onGameOver={handleGameOver} 
              gameState={gameState} 
              joystickVector={joystickVector}
              barkTrigger={barkTrigger}
            />
            {gameState === 'menu' && <StartMenu onStart={startGame} highScore={highScore} onHelp={openHelp} />}
            {gameState === 'gameOver' && <GameOver score={score} onRestart={startGame} highScore={highScore} onHelp={openHelp} />}
            {isHelpVisible && <HelpModal onClose={closeHelp} />}
          </div>
        </div>

        {/* Left Control Area (Mobile Only) */}
        <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center lg:hidden">
            <Joystick onMove={setJoystickVector} />
        </div>

        {/* Right Control Area (Mobile Only) */}
        <div className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-center lg:hidden">
            <BarkButton onBark={handleBarkPress} />
        </div>
        
      </div>
    </main>
  );
}

export default App;