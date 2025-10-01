import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-lg p-6 max-w-lg w-full border border-white/20 text-gray-200 max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-3xl font-black mb-4 text-white text-center">How to Play</h2>
        
        <div className="space-y-4 text-lg">
          <p>🐾 Your goal is to keep the squirrels <strong>(🐿️)</strong> away from your house <strong>(🏠)</strong>!</p>
          
          <div>
            <h3 className="font-bold text-xl text-yellow-300 mb-1">Controls:</h3>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Move:</strong> WASD or Arrow Keys</li>
              <li><strong>Bark:</strong> Spacebar</li>
              <li>On mobile, use the on-screen joystick and bark button.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-xl text-yellow-300 mb-1">Abilities & Power-Ups:</h3>
            <ul className="list-disc list-inside ml-2 space-y-2">
                <li><strong>Bark (🐶):</strong> Scares away all squirrels in a radius. It has a cooldown, so use it wisely!
                    <br/><span className="text-orange-300 font-bold ml-4">⭐ Scare multiple critters with one bark for a huge combo score multiplier!</span>
                </li>
                <li><strong>Treat Power (🦴):</strong> Grab a treat to get a temporary speed boost and unlimited, instant barks!</li>
                <li><strong>Zoomies (🟡):</strong> Grab a yellow ball for a huge 30% speed boost! A visual trail will show you're in zoomies mode.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl text-yellow-300 mb-1">Other Critters:</h3>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Rabbits (🐇):</strong> These speedy critters run across the yard. Catch them for <strong>+5 bonus points!</strong></li>
              <li><strong>Mailman (👮‍♂️):</strong> Appears later in the game. He's fast and tricky! Chase him off-screen or catch him for <strong>+10 bonus points</strong>, but don't let him reach the house!</li>
              <li><strong>Birds (🐦‍⬛):</strong> Lands in trees, then swoops for the house! You can't catch it, you <strong>must bark</strong> to scare it away for <strong>+3 points</strong>.</li>
              <li><strong>Skunk (🦨):</strong> Danger! Don't touch it and don't bark near it, or it's an instant game over!</li>
            </ul>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 font-bold text-xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};

export default HelpModal;