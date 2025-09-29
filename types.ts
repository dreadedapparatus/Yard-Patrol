// FIX: Removed self-import of GameState which caused a name collision.
export type GameState = 'menu' | 'playing' | 'gameOver';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  position: Vector2D;
}

export interface Squirrel {
  id: number;
  position: Vector2D;
  spawnTime: number;
  direction: 'left' | 'right';
}

export interface Rabbit {
  id: number;
  position: Vector2D;
  spawnTime: number;
  targetPosition: Vector2D;
  direction: 'left' | 'right';
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  initialLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  text: string;
}

export interface Tree {
    position: Vector2D;
}

export interface Treat {
    position: Vector2D;
}