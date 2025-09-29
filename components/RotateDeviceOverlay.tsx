import React from 'react';

const RotateDeviceOverlay: React.FC = () => {
  return (
    <div id="rotate-device-overlay" className="absolute inset-0 bg-slate-900 z-[100] flex-col items-center justify-center text-white text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-white animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>
            <path d="m16 4 4 4-4 4"/>
            <path d="M20 8H4"/>
        </svg>
      <h2 className="text-3xl font-bold mt-6">Please Rotate Your Device</h2>
      <p className="text-lg mt-2 text-slate-300">This game is designed for landscape mode.</p>
    </div>
  );
};

export default RotateDeviceOverlay;
