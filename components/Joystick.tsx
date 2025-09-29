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
  // Use a ref for dragging state to avoid stale closures in global event listeners
  const isDraggingRef = useRef(false);

  // Memoize the move handler
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

  // Handle the start of a touch interaction on the joystick element
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent default behavior, like starting a scroll
    e.preventDefault();
    isDraggingRef.current = true;
    // Immediately update position based on the first touch
    handleMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  };
  
  // Use useEffect to manage global event listeners for move and end events
  useEffect(() => {
    const handleGlobalTouchMove = (event: TouchEvent) => {
      if (isDraggingRef.current) {
        // This is the crucial part for iOS Safari.
        // It prevents the default scroll/zoom behavior during the drag.
        event.preventDefault();
        handleMove(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        // Reset knob position and movement vector
        setKnobPosition({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
      }
    };
    
    // Add listeners to the window. `passive: false` is required to allow preventDefault().
    // This ensures that even if the user's finger leaves the joystick, we still track movement.
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [handleMove, onMove]); // Rerun if onMove or handleMove changes

  return (
    <div
      ref={baseRef}
      className="relative rounded-full bg-slate-500/30 backdrop-blur-sm border-2 border-white/20"
      style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
      // Only the start event is directly on the element
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
          // The knob should snap back when not dragging
          transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default Joystick;
