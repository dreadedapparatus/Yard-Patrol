import React, { useEffect } from 'react';

interface StartMenuProps {
  onStart: () => void;
  highScore: number;
  onHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isTouchDevice: boolean;
}

const Key: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <kbd className={`w-10 h-10 flex items-center justify-center font-bold bg-slate-100 text-slate-800 text-lg rounded-md shadow-sm border-b-2 border-slate-400 ${className}`}>
        {children}
    </kbd>
);

const MuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
);

const UnmuteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
);


const StartMenu: React.FC<StartMenuProps> = ({ onStart, highScore, onHelp, isMuted, onToggleMute, isTouchDevice }) => {
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
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-md p-4 md:p-8 text-center font-sans select-none">
       <button
        onClick={onHelp}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/70 border-2 border-white/20 rounded-full text-2xl font-bold text-white transition-all z-10"
        aria-label="How to play"
      >
        ?
      </button>

      <button
        onClick={onToggleMute}
        className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/70 border-2 border-white/20 rounded-full text-white transition-all z-10"
        aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? <MuteIcon /> : <UnmuteIcon />}
      </button>

      <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
        Yard Patrol
      </h1>
      <p className="mt-2 md:mt-4 text-lg md:text-2xl text-gray-200">Chase the critters away from your house!</p>
      <div className="mt-4 md:mt-8 text-base md:text-lg text-left bg-black/20 p-4 md:p-6 rounded-xl border border-white/20 shadow-lg">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-white">How to Play:</h2>
        {isTouchDevice ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center text-4xl">🕹️</div>
              <span className="text-gray-200">Use the joystick to Move 🐕</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center text-4xl">🐶</div>
              <span className="text-gray-200">Press the button to Bark!</span>
            </div>
          </div>
        ) : (
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
        )}
        <p className="mt-6">Don't let any critters reach your house 🏠!</p>
      </div>
       <p className="mt-4 md:mt-6 text-lg md:text-xl text-yellow-200 font-bold">High Score: {highScore}</p>
      <button
        onClick={onStart}
        className="mt-4 md:mt-6 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 font-bold text-2xl md:text-3xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out border-2 border-yellow-200/50"
      >
        Start Barking!
      </button>
      {!isTouchDevice && <p className="mt-3 text-gray-300">or press Spacebar</p>}
    </div>
  );
};

export default StartMenu;