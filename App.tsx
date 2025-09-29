import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import Game from './components/Game';
import StartMenu from './components/StartMenu';
import GameOver from './components/GameOver';
import HelpModal from './components/HelpModal';
import RotateDeviceOverlay from './components/RotateDeviceOverlay';
import type { GameState } from './types';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { initAudio, setAudioMuted } from './components/audio';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scale, setScale] = useState(1);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('yardPatrolHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
    const storedMutePref = localStorage.getItem('yardPatrolMuted');
    if (storedMutePref) {
        const muted = storedMutePref === 'true';
        setIsMuted(muted);
        setAudioMuted(muted);
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

  const enterFullscreen = useCallback(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && gameContainerRef.current && gameContainerRef.current.requestFullscreen) {
        gameContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    }
  }, []);

  const startGame = useCallback(() => {
    initAudio(); // Initialize audio on the first user interaction
    setScore(0);
    setGameState('playing');
    enterFullscreen();
  }, [enterFullscreen]);

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

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMutedState = !prev;
      setAudioMuted(newMutedState);
      localStorage.setItem('yardPatrolMuted', newMutedState.toString());
      return newMutedState;
    });
  }, []);

  return (
    <main ref={gameContainerRef} className="bg-slate-800 w-screen h-screen flex items-center justify-center font-sans text-white lg:p-4 overflow-hidden">
      <RotateDeviceOverlay />
      <div id="game-content" className="w-full h-full flex items-center justify-center relative">
        
        {/* Game Container */}
        <div 
            className="bg-amber-800 p-3 rounded-2xl shadow-2xl shadow-black/50"
            style={{ transform: `scale(${scale})`}}
        >
          <div 
            className="relative rounded-lg bg-gradient-to-br from-green-600 to-green-800"
            style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
          >
            <Game 
              onGameOver={handleGameOver} 
              gameState={gameState} 
            />
            {gameState === 'menu' && <StartMenu onStart={startGame} highScore={highScore} onHelp={openHelp} isMuted={isMuted} onToggleMute={toggleMute} />}
            {gameState === 'gameOver' && <GameOver score={score} onRestart={startGame} highScore={highScore} onHelp={openHelp} isMuted={isMuted} onToggleMute={toggleMute} />}
            {isHelpVisible && <HelpModal onClose={closeHelp} />}
          </div>
        </div>
        
      </div>
    </main>
  );
}

export default App;