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
            <h3 className="font-bold text-xl text-yellow-300 mb-1">Abilities:</h3>
            <ul className="list-disc list-inside ml-2 space-y-1">
                <li><strong>Bark (🐶):</strong> Scares away all squirrels in a radius. It has a cooldown, so use it wisely!</li>
                <li><strong>Treat Power (🦴):</strong> Grab a treat to get a temporary speed boost and unlimited, instant barks!</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl text-yellow-300 mb-1">Other Critters:</h3>
            <ul className="list-disc list-inside ml-2">
              <li><strong>Rabbits (🐇):</strong> These speedy critters run across the yard. Catch them for <strong>+5 bonus points!</strong></li>
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
