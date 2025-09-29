export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 0.25; // pixels per millisecond
export const PLAYER_SPEED_BOOST = 1.05; // 5% faster

export const SQUIRREL_SIZE = 25;
export const SQUIRREL_SPEED = 0.09; // pixels per millisecond
export const SQUIRREL_SPAWN_INTERVAL_INITIAL = 2000; // start spawning every 2 seconds
export const SQUIRREL_SPAWN_INTERVAL_MIN = 300;     // ramp up to spawning every 0.3 seconds
export const DIFFICULTY_RAMP_DURATION = 60000;      // 60 seconds to reach max difficulty

export const RABBIT_SIZE = 30;
export const RABBIT_SPEED = 0.20; // pixels per millisecond
export const RABBIT_SPAWN_INTERVAL = 20000; // Try to spawn every 20 seconds
export const RABBIT_SPAWN_CHANCE = 0.3; // 30% chance when interval is met
export const RABBIT_POINTS = 5;

export const HOUSE_SIZE = 135;
export const HOUSE_X = GAME_WIDTH / 2 - HOUSE_SIZE / 2;
export const HOUSE_Y = GAME_HEIGHT / 2 - HOUSE_SIZE / 2;

export const BARK_COOLDOWN = 5000; // 5 seconds in ms
export const BARK_RADIUS = 200; // pixels, for the new regular bark

export const DOG_SCARE_RADIUS = 100; // pixels

export const TREAT_SIZE = 30;
export const TREAT_SPAWN_INTERVAL = 17250; // Try to spawn a treat every 17.25 seconds
export const TREAT_HOUSE_MIN_DISTANCE = 150; // pixels from house center
export const POWER_UP_DURATION = 8000; // 8 seconds in ms

export const NUM_TREES = 5;
export const TREE_SIZE = 60; // For collision
export const MIN_TREE_DISTANCE = 120; // pixels