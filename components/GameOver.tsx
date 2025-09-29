import React, { useEffect } from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  highScore: number;
  onHelp: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, highScore, onHelp }) => {
  const isNewHighScore = score > 0 && score === highScore;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRestart]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-red-900/50 backdrop-blur-md p-4 md:p-8 text-center font-sans select-none">
      <button
        onClick={onHelp}
        className="absolute bottom-4 right-4 w-12 h-12 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/70 border-2 border-white/20 rounded-full text-2xl font-bold text-white transition-all z-10"
        aria-label="How to play"
      >
        ?
      </button>

      <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
        Game Over!
      </h1>
      <p className="mt-2 md:mt-4 text-xl md:text-3xl text-red-200">A squirrel got to your house!</p>
      
      {isNewHighScore && (
        <p className="mt-4 md:mt-6 text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 animate-pulse">
          New High Score!
        </p>
      )}

      <div className="mt-6 md:mt-8 text-center">
        <p className="text-5xl md:text-6xl font-bold text-white">{score}</p>
        <p className="text-base md:text-xl text-yellow-300 font-bold tracking-widest mt-1">SQUIRRELS CHASED</p>
      </div>
      
      <p className="mt-2 text-lg md:text-2xl text-gray-300">
        High Score: {highScore}
      </p>

      <button
        onClick={onRestart}
        className="mt-8 md:mt-12 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 font-bold text-2xl md:text-3xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border-2 border-yellow-200/50"
      >
        Protect Again
      </button>
      <p className="mt-3 text-gray-300">or press Spacebar</p>
    </div>
  );
};

export default GameOver;