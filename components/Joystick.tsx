import React, { useState, useRef, useCallback } from 'react';
import type { Vector2D } from '../types';

interface JoystickProps {
  onMove: (vector: Vector2D) => void;
}

const JOYSTICK_SIZE = 140;
const KNOB_SIZE = 60;
const MAX_OFFSET = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging || !baseRef.current) return;

    const baseRect = baseRef.current.getBoundingClientRect();
    const touch = e.targetTouches[0];
    
    let dx = touch.clientX - (baseRect.left + baseRect.width / 2);
    let dy = touch.clientY - (baseRect.top + baseRect.height / 2);
    
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > MAX_OFFSET) {
      dx = (dx / distance) * MAX_OFFSET;
      dy = (dy / distance) * MAX_OFFSET;
    }

    setKnobPosition({ x: dx, y: dy });
    onMove({
      x: dx / MAX_OFFSET,
      y: dy / MAX_OFFSET,
    });
  }, [isDragging, onMove]);

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      className="relative rounded-full bg-slate-500/30 backdrop-blur-sm border-2 border-white/20"
      style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="absolute rounded-full bg-slate-300/50 shadow-lg"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          top: `calc(50% - ${KNOB_SIZE / 2}px)`,
          left: `calc(50% - ${KNOB_SIZE / 2}px)`,
          transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default Joystick;
