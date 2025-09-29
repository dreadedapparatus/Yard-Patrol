import React, { useEffect } from 'react';

interface StartMenuProps {
  onStart: () => void;
  highScore: number;
  onHelp: () => void;
}

const Key: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <kbd className={`w-10 h-10 flex items-center justify-center font-bold bg-slate-100 text-slate-800 text-lg rounded-md shadow-sm border-b-2 border-slate-400 ${className}`}>
        {children}
    </kbd>
);


const StartMenu: React.FC<StartMenuProps> = ({ onStart, highScore, onHelp }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStart]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-md p-4 md:p-8 text-center font-sans">
       <button
        onClick={onHelp}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/70 border-2 border-white/20 rounded-full text-2xl font-bold text-white transition-all z-10"
        aria-label="How to play"
      >
        ?
      </button>

      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
        Yard Patrol
      </h1>
      <p className="mt-2 md:mt-4 text-lg md:text-2xl text-gray-200">Chase the squirrels away from your house!</p>
      <div className="mt-4 md:mt-8 text-base md:text-lg text-left bg-black/20 p-4 md:p-6 rounded-xl border border-white/20 shadow-lg">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-white">How to Play:</h2>
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                    <Key>W</Key>
                    <Key>A</Key>
                    <Key>S</Key>
                    <Key>D</Key>
                </div>
                <span className="text-gray-200">/ Arrows to Move 🐕</span>
            </div>
            <div className="flex items-center space-x-3">
                <Key className="w-auto px-4">Space</Key>
                <span className="text-gray-200">to Bark!</span>
            </div>
        </div>
        <p className="mt-6">Don't let any squirrels 🐿️ reach your house 🏠!</p>
      </div>
       <p className="mt-4 md:mt-6 text-lg md:text-xl text-yellow-200 font-bold">High Score: {highScore}</p>
      <button
        onClick={onStart}
        className="mt-4 md:mt-6 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 font-bold text-2xl md:text-3xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border-2 border-yellow-200/50"
      >
        Start Barking!
      </button>
      <p className="mt-3 text-gray-300">or press Spacebar</p>
    </div>
  );
};

export default StartMenu;
