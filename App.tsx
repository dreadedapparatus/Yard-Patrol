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
  const [gameOverReason, setGameOverReason] = useState<'squirrel' | 'mailman' | 'bird' | 'skunk'>('squirrel');
  const [scale, setScale] = useState(1);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect now only handles loading data from localStorage on initial mount.
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

  // Prevent scrolling on touch devices ONLY when the game is playing
  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;

    const preventDefault = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (gameState === 'playing' && isTouchDevice) {
      container.addEventListener('touchmove', preventDefault, { passive: false });
    }

    // Cleanup function runs when gameState changes or component unmounts
    return () => {
      container.removeEventListener('touchmove', preventDefault);
    };
  }, [gameState, isTouchDevice]);

  useLayoutEffect(() => {
    // This effect handles both scaling and device type detection, and runs on resize.
    const updateDisplayProperties = () => {
      // --- Device Type Check ---
      function isMobileOrTablet() {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        // Checks for classical mobile user agents and iPad specifically
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            return true;
        }
        // Check for iPad on iPadOS 13+ that presents as a Mac
        if (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
            return true;
        }
        return false;
      }
      
      const isTouchFirstDevice = isMobileOrTablet();
      setIsTouchDevice(isTouchFirstDevice);

      // --- Scaling Logic ---
      if (isTouchFirstDevice) {
        // On mobile/tablet, scale the game to fit the screen
        const { innerWidth, innerHeight } = window;
        
        // Define the dimensions of the on-screen controls
        const JOYSTICK_WIDTH = 140;
        const BARK_BUTTON_WIDTH = 144; // w-36 in tailwind

        // The controls are centered on the edge, so half of their width sticks out from the 800px game area.
        // We calculate the total unscaled width required to show everything without clipping.
        const totalRequiredWidth = GAME_WIDTH + (JOYSTICK_WIDTH / 2) + (BARK_BUTTON_WIDTH / 2);
        
        // The container holding the game has padding (p-3 = 12px top/bottom)
        const totalRequiredHeight = GAME_HEIGHT + 24;
        
        // Calculate the scale factor needed to fit this total required size into the viewport
        const scaleX = innerWidth / totalRequiredWidth;
        const scaleY = innerHeight / totalRequiredHeight;

        // Use the smaller scale factor to maintain aspect ratio and fit both dimensions
        setScale(Math.min(scaleX, scaleY));
      } else {
        // On desktop (including touchscreen laptops), don't scale.
        setScale(1);
      }
    };

    updateDisplayProperties();
    window.addEventListener('resize', updateDisplayProperties);

    return () => {
      window.removeEventListener('resize', updateDisplayProperties);
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

  const handleGameOver = useCallback((finalScore: number, reason: 'squirrel' | 'mailman' | 'bird' | 'skunk' = 'squirrel') => {
    setScore(finalScore);
    setGameOverReason(reason);
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
              isTouchDevice={isTouchDevice}
            />
            {gameState === 'menu' && <StartMenu onStart={startGame} highScore={highScore} onHelp={openHelp} isMuted={isMuted} onToggleMute={toggleMute} isTouchDevice={isTouchDevice} />}
            {gameState === 'gameOver' && <GameOver score={score} onRestart={startGame} highScore={highScore} onHelp={openHelp} isMuted={isMuted} onToggleMute={toggleMute} reason={gameOverReason} isTouchDevice={isTouchDevice} />}
            {isHelpVisible && <HelpModal onClose={closeHelp} />}
          </div>
        </div>
        
      </div>
    </main>
  );
}

export default App;