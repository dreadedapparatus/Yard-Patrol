export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PLAYER_SIZE = 40;
export const PLAYER_SPEED = 0.25; // pixels per millisecond
export const PLAYER_SPEED_BOOST = 1.05; // 5% faster

export const SQUIRREL_SIZE = 25;
export const SQUIRREL_SPEED = 0.09; // pixels per millisecond
export const SQUIRREL_SPAWN_INTERVAL_INITIAL = 3000; // start spawning every 3 seconds
export const SQUIRREL_SPAWN_INTERVAL_MIN = 450;     // ramp up to spawning every 0.45 seconds
export const DIFFICULTY_RAMP_DURATION = 360000;      // 360 seconds (6 minutes) to reach max difficulty
export const SQUIRREL_DIFFICULTY_SCORE_THRESHOLD = 100;
export const SQUIRREL_DIFFICULTY_TIME_BOOST = 60000; // 60 seconds

export const RABBIT_SIZE = 30;
export const RABBIT_SPEED = 0.20; // pixels per millisecond
export const RABBIT_SPAWN_INTERVAL = 20000; // Try to spawn every 20 seconds
export const RABBIT_SPAWN_CHANCE = 0.3; // 30% chance
export const RABBIT_POINTS = 5;

export const MAILMAN_SIZE = 35;
export const MAILMAN_SPEED = 0.06; // pixels per millisecond (slow)
export const MAILMAN_EVASION_SPEED_BOOST = 4.0; // Multiplier when evading
export const MAILMAN_SPAWN_START_TIME = 60000; // 60 seconds in
export const MAILMAN_SPAWN_INTERVAL = 30000; // Try to spawn every 30 seconds after start time
export const MAILMAN_SPAWN_CHANCE = 0.4; // 40% chance
export const MAILMAN_EVASION_RADIUS = 150;
export const MAILMAN_POINTS = 10;

export const BIRD_SIZE = 30;
export const BIRD_SWOOP_SPEED = 0.22; // pixels per millisecond
export const BIRD_SPAWN_START_TIME = 10000; // 10 seconds in
export const BIRD_SPAWN_INTERVAL_INITIAL = 6000; // Try to spawn every 6 seconds initially
export const BIRD_SPAWN_INTERVAL_MIN = 3000;      // Ramp up to spawning every 3 seconds
export const BIRD_SPAWN_CHANCE = 0.5; // 50% chance
export const BIRD_PERCH_TIME_MIN = 6000; // 6 seconds
export const BIRD_PERCH_TIME_MAX = 9000; // 9 seconds
export const BIRD_POINTS = 3;

export const SKUNK_SIZE = 30;
export const SKUNK_SPEED = 0.04; // Slow wander
export const SKUNK_SPAWN_START_TIME = 30000; // 30 seconds
export const SKUNK_SPAWN_INTERVAL = 22000; // Try to spawn every 22s
export const SKUNK_SPAWN_CHANCE = 0.45; // 45% chance when interval hits
export const SKUNK_SPRAY_RADIUS = 180; // Radius where bark triggers game over
export const SKUNK_WANDER_TIME_MIN = 12000; // 12 seconds
export const SKUNK_WANDER_TIME_MAX = 18000; // 18 seconds

export const HOUSE_SIZE = 135;
export const HOUSE_X = GAME_WIDTH / 2 - HOUSE_SIZE / 2;
export const HOUSE_Y = GAME_HEIGHT / 2 - HOUSE_SIZE / 2;

export const BARK_COOLDOWN = 4500; // 4.5 seconds in ms
export const BARK_RADIUS = 200; // pixels, for the new regular bark

export const DOG_SCARE_RADIUS = 100; // pixels

export const TREAT_SIZE = 30;
export const TREAT_SPAWN_INTERVAL = 20500; // Try to spawn a treat every 20.5 seconds
export const TREAT_HOUSE_MIN_DISTANCE = 150; // pixels from house center
export const POWER_UP_DURATION = 8000; // 8 seconds in ms

export const TENNIS_BALL_SIZE = 21;
export const TENNIS_BALL_SPAWN_INTERVAL = 28250; // Rarer than treats
export const ZOOMIES_DURATION = 6000; // 6 seconds
export const ZOOMIES_SPEED_BOOST = 1.3; // 30% faster

export const NUM_TREES = 5;
export const TREE_SIZE = 60; // For collision
export const MIN_TREE_DISTANCE = 120; // pixels