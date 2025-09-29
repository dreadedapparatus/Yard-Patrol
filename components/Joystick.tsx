import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const isDraggingRef = useRef(false);
  // Ref to store the unique identifier of the touch controlling the joystick
  const touchIdRef = useRef<number | null>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return;

    const baseRect = baseRef.current.getBoundingClientRect();
    let dx = clientX - (baseRect.left + baseRect.width / 2);
    let dy = clientY - (baseRect.top + baseRect.height / 2);
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
  }, [onMove]);

  // When a touch starts on the joystick, capture its unique ID
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // If we're not already dragging, start a new drag with the first touch
    if (!isDraggingRef.current) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        isDraggingRef.current = true;
        touchIdRef.current = touch.identifier;
        handleMove(touch.clientX, touch.clientY);
    }
  };
  
  useEffect(() => {
    const handleGlobalTouchMove = (event: TouchEvent) => {
      // Only proceed if we are in a dragging state with a valid touch ID
      if (isDraggingRef.current && touchIdRef.current !== null) {
        // Find the specific touch that matches our stored ID among all active touches
        const activeTouch = Array.from(event.touches).find(
          t => t.identifier === touchIdRef.current
        );

        if (activeTouch) {
          event.preventDefault();
          handleMove(activeTouch.clientX, activeTouch.clientY);
        }
      }
    };

    const handleGlobalTouchEnd = (event: TouchEvent) => {
        // Check if the touch that was just lifted is the one we are tracking
        const endedTouch = Array.from(event.changedTouches).find(
            t => t.identifier === touchIdRef.current
        );

        if (endedTouch) {
            isDraggingRef.current = false;
            touchIdRef.current = null;
            // Reset knob position and movement vector
            setKnobPosition({ x: 0, y: 0 });
            onMove({ x: 0, y: 0 });
        }
    };
    
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [handleMove, onMove]);

  return (
    <div
      ref={baseRef}
      className="relative rounded-full bg-slate-500/30 backdrop-blur-sm border-2 border-white/20"
      style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
      onTouchStart={handleTouchStart}
    >
      <div
        className="absolute rounded-full bg-slate-300/50 shadow-lg"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          top: `calc(50% - ${KNOB_SIZE / 2}px)`,
          left: `calc(50% - ${KNOB_SIZE / 2}px)`,
          transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default Joystick;