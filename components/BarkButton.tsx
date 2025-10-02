import React from 'react';

interface BarkButtonProps {
    onBark: () => void;
}

const BarkButton: React.FC<BarkButtonProps> = ({ onBark }) => {
    const handlePress = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        onBark();
    };

    return (
        <div
            className="w-36 h-36 rounded-full bg-yellow-400/50 backdrop-blur-sm border-4 border-yellow-300/50 flex flex-col items-center justify-center text-white font-black shadow-lg active:scale-95 active:bg-yellow-400/80 transition-all select-none"
            onTouchStart={handlePress}
            onMouseDown={handlePress} // For desktop testing
        >
            <span className="text-4xl" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                BARK
            </span>
            <span className="text-6xl mt-[-10px]">
                🐶
            </span>
        </div>
    );
};

export default BarkButton;