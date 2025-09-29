import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Squirrel, Vector2D, GameState, Particle, Tree, Treat, Rabbit } from '../types';
import Joystick from './Joystick';
import BarkButton from './BarkButton';
import { playBarkSound, playPowerUpSound, playSquirrelLaughSound, playSquirrelCatchSound } from './audio';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  PLAYER_SPEED,
  SQUIRREL_SIZE,
  SQUIRREL_SPEED,
  SQUIRREL_SPAWN_INTERVAL_INITIAL,
  SQUIRREL_SPAWN_INTERVAL_MIN,
  DIFFICULTY_RAMP_DURATION,
  HOUSE_X,
  HOUSE_Y,
  HOUSE_SIZE,
  BARK_COOLDOWN,
  DOG_SCARE_RADIUS,
  NUM_TREES,
  MIN_TREE_DISTANCE,
  TREE_SIZE,
  BARK_RADIUS,
  TREAT_SPAWN_INTERVAL,
  TREAT_SIZE,
  POWER_UP_DURATION,
  PLAYER_SPEED_BOOST,
  RABBIT_SIZE,
  RABBIT_SPEED,
  RABBIT_SPAWN_INTERVAL,
  RABBIT_SPAWN_CHANCE,
  RABBIT_POINTS,
  TREAT_HOUSE_MIN_DISTANCE,
} from '../constants';


interface GameProps {
  onGameOver: (score: number) => void;
  gameState: GameState;
}

// Define the more accurate house hitbox shape
const houseBase = {
    x: HOUSE_X,
    y: HOUSE_Y + HOUSE_SIZE * 0.4,
    width: HOUSE_SIZE,
    height: HOUSE_SIZE * 0.6
};

const houseRoof = {
    x: HOUSE_X + HOUSE_SIZE * 0.1,
    y: HOUSE_Y,
    width: HOUSE_SIZE * 0.8,
    height: HOUSE_SIZE * 0.45 // Overlap slightly with base
};


const Game: React.FC<GameProps> = ({ onGameOver, gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(performance.now());
  const lastSpawnTime = useRef<number>(performance.now());
  const animationTime = useRef<number>(performance.now());
  const gameStartTime = useRef<number>(performance.now());
  const lastTreatSpawnAttempt = useRef<number>(performance.now());
  const lastRabbitSpawnAttempt = useRef<number>(performance.now());


  // Game State Refs
  const playerPos = useRef<Vector2D>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE * 2 });
  const playerDirection = useRef<'left' | 'right'>('left');
  const squirrels = useRef<Squirrel[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const barkTriggered = useRef<boolean>(false);
  const joystickVector = useRef<Vector2D>({ x: 0, y: 0 });
  const gameOverHandled = useRef<boolean>(false);
  const score = useRef(0);
  const barkCooldown = useRef(0);
  const scenery = useRef<{ trees: Tree[] }>({ trees: [] });
  const treat = useRef<Treat | null>(null);
  const rabbit = useRef<Rabbit | null>(null);
  const powerUpActive = useRef<boolean>(false);
  const powerUpEndTime = useRef<number>(0);


  // Visual Effects Refs
  const particles = useRef<Particle[]>([]);
  const barkWave = useRef<{ position: Vector2D; creationTime: number; maxRadius: number; } | null>(null);
  const screenShake = useRef({ magnitude: 0, duration: 0, startTime: 0 });
  const gameOverFlashOpacity = useRef(0);
  
  // React State for display
  const [displayScore, setDisplayScore] = useState(0);
  const [displayBarkCooldown, setDisplayBarkCooldown] = useState(0);
  const [displayPowerUpTimeLeft, setDisplayPowerUpTimeLeft] = useState(0);
  const [barkAnimationKey, setBarkAnimationKey] = useState(0);

  const handleJoystickMove = useCallback((vector: Vector2D) => {
    joystickVector.current = vector;
  }, []);

  const handleBarkPress = useCallback(() => {
    barkTriggered.current = true;
  }, []);

  const createPoofEffect = useCallback((position: Vector2D) => {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const life = Math.random() * 400 + 300;
        particles.current.push({
            position: { x: position.x, y: position.y },
            velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            life: life,
            initialLife: life,
            size: Math.random() * 15 + 10,
            color: `rgba(255, 255, 0, ${Math.random() * 0.5 + 0.5})`,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            text: '✨',
        });
    }
  }, []);
  
  const checkCircleRectCollision = useCallback((circlePos: Vector2D, circleRadius: number, rect: {x: number, y: number, width: number, height: number}) => {
      const closestX = Math.max(rect.x, Math.min(circlePos.x, rect.x + rect.width));
      const closestY = Math.max(rect.y, Math.min(circlePos.y, rect.y + rect.height));
      const distanceX = circlePos.x - closestX;
      const distanceY = circlePos.y - closestY;
      return (distanceX * distanceX) + (distanceY * distanceY) < (circleRadius * circleRadius);
  }, []);

  const checkEntityCollision = useCallback((position: Vector2D, radius: number): boolean => {
    // House collision
    if (checkCircleRectCollision(position, radius, houseBase) || checkCircleRectCollision(position, radius, houseRoof)) {
      return true;
    }

    // Tree collision (Circle vs Circle)
    for (const tree of scenery.current.trees) {
        const dx = position.x - tree.position.x;
        const dy = position.y - tree.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius + (TREE_SIZE / 2)) {
            return true;
        }
    }
    return false;
  }, [checkCircleRectCollision]);


  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const now = performance.now();

    // Clear the canvas for a new frame, making it transparent
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Screen Shake Effect
    const shakeDuration = now - screenShake.current.startTime;
    let shakeX = 0, shakeY = 0;
    if (shakeDuration < screenShake.current.duration) {
      const shakeProgress = 1 - (shakeDuration / screenShake.current.duration);
      const currentMagnitude = screenShake.current.magnitude * shakeProgress;
      shakeX = (Math.random() - 0.5) * currentMagnitude;
      shakeY = (Math.random() - 0.5) * currentMagnitude;
    }
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Draw Trees
    ctx.font = '70px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    scenery.current.trees.forEach(tree => {
        ctx.fillText('🌳', tree.position.x, tree.position.y);
    });
    
    // Draw Treat
    if (treat.current) {
        const treatBob = Math.sin(animationTime.current / 250) * 3;
        ctx.font = `${TREAT_SIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦴', treat.current.position.x, treat.current.position.y + treatBob);
    }

    // Draw house
    ctx.font = `${HOUSE_SIZE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏠', HOUSE_X + HOUSE_SIZE / 2, HOUSE_Y + HOUSE_SIZE / 2);

    // Draw player with animation
    const playerBob = Math.sin(animationTime.current / 150) * 2;
    const playerRenderX = playerPos.current.x;
    const playerRenderY = playerPos.current.y + playerBob;
    
    // Add power-up aura effect
    if (powerUpActive.current) {
        ctx.save();
        const auraPulse = Math.sin(animationTime.current / 100) * 5;
        const auraRadius = (PLAYER_SIZE / 2) + 10 + auraPulse;
        const auraOpacity = 0.5 + Math.sin(animationTime.current / 100) * 0.2;
        ctx.fillStyle = `rgba(255, 223, 0, ${auraOpacity})`; // Gold color
        ctx.beginPath();
        ctx.arc(playerRenderX, playerRenderY, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // Draw player sprite with direction
    // The '🐕' emoji faces left by default. So, we flip it horizontally when moving right.
    ctx.save();
    ctx.translate(playerRenderX, playerRenderY);
    if (playerDirection.current === 'right') {
        ctx.scale(-1, 1);
    }
    ctx.font = `${PLAYER_SIZE}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('🐕', 0, 0); // Draw at new origin
    ctx.restore();


    // Draw squirrels with animation
    ctx.font = `${SQUIRREL_SIZE}px sans-serif`;
    squirrels.current.forEach(squirrel => {
      const hopOffset = Math.abs(Math.sin((animationTime.current - squirrel.spawnTime) / 200)) * 10;
      ctx.save();
      ctx.translate(squirrel.position.x, squirrel.position.y - hopOffset);
      if (squirrel.direction === 'right') {
        ctx.scale(-1, 1);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐿️', 0, 0);
      ctx.restore();
    });

    // Draw Rabbit
    if (rabbit.current) {
        const hopOffset = Math.abs(Math.sin((animationTime.current - rabbit.current.spawnTime) / 100)) * 8; // Faster hop
        ctx.save();
        ctx.translate(rabbit.current.position.x, rabbit.current.position.y - hopOffset);
        if (rabbit.current.direction === 'right') {
            ctx.scale(-1, 1);
        }
        ctx.font = `${RABBIT_SIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐇', 0, 0);
        ctx.restore();
    }

    // Draw Particles
    particles.current.forEach(p => {
        ctx.save();
        ctx.translate(p.position.x, p.position.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life / p.initialLife); // Fade out
        ctx.font = `bold ${p.size}px sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
    });

    // Draw Bark Wave
    if (barkWave.current) {
        const age = now - barkWave.current.creationTime;
        const maxAge = 400;
        if (age < maxAge) {
            const progress = age / maxAge;
            const radius = progress * barkWave.current.maxRadius;
            const opacity = 1 - progress * progress;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 8 - progress * 8;
            ctx.beginPath();
            ctx.arc(barkWave.current.position.x, barkWave.current.position.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            barkWave.current = null;
        }
    }
    
    // Draw Game Over flash
    if (gameOverFlashOpacity.current > 0) {
        ctx.fillStyle = `rgba(200, 0, 0, ${gameOverFlashOpacity.current})`;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    
    ctx.restore(); // Restore from screen shake
  }, []);

  const update = useCallback((deltaTime: number) => {
    const now = performance.now();
    
    // Update Power-up state
    if (powerUpActive.current && now > powerUpEndTime.current) {
        powerUpActive.current = false;
    }
    setDisplayPowerUpTimeLeft(powerUpActive.current ? Math.max(0, powerUpEndTime.current - now) : 0);

    const checkPlayerCollision = (position: Vector2D): boolean => {
        return checkEntityCollision(position, PLAYER_SIZE / 2);
    };

    // Update bark cooldown
    if (barkCooldown.current > 0) {
        barkCooldown.current = Math.max(0, barkCooldown.current - deltaTime);
        setDisplayBarkCooldown(barkCooldown.current);
    }

    // Handle Bark
    if (barkTriggered.current && (barkCooldown.current <= 0 || powerUpActive.current)) {
        if (!powerUpActive.current) {
            barkCooldown.current = BARK_COOLDOWN;
            setDisplayBarkCooldown(BARK_COOLDOWN);
            setBarkAnimationKey(k => k + 1);
        }

        playBarkSound();
        const maxRadius = BARK_RADIUS;
        barkWave.current = { position: { ...playerPos.current }, creationTime: now, maxRadius };

        const squirrelsToScare: Squirrel[] = [];
        const remainingSquirrels: Squirrel[] = [];

        squirrels.current.forEach(squirrel => {
            const dx = squirrel.position.x - playerPos.current.x;
            const dy = squirrel.position.y - playerPos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BARK_RADIUS) {
                squirrelsToScare.push(squirrel);
            } else {
                remainingSquirrels.push(squirrel);
            }
        });

        if (squirrelsToScare.length > 0) {
            score.current += squirrelsToScare.length;
            squirrelsToScare.forEach(s => createPoofEffect(s.position));
            squirrels.current = remainingSquirrels;
        }
        setDisplayScore(score.current);
    }
    barkTriggered.current = false; // Consume trigger

    // Player Movement
    const currentSpeed = powerUpActive.current ? PLAYER_SPEED * PLAYER_SPEED_BOOST : PLAYER_SPEED;
    
    let moveX = joystickVector.current.x;
    let moveY = joystickVector.current.y;

    if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) { moveY -= 1; }
    if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) { moveY += 1; }
    if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) { moveX -= 1; }
    if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) { moveX += 1; }

    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);

    if (magnitude > 0) {
        const normalizedDx = moveX / magnitude;
        const normalizedDy = moveY / magnitude;
        const moveDistance = currentSpeed * deltaTime;
        const dx = normalizedDx * moveDistance;
        const dy = normalizedDy * moveDistance;

        // Update player direction based on horizontal movement
        if (dx > 0) {
            playerDirection.current = 'right';
        } else if (dx < 0) {
            playerDirection.current = 'left';
        }

        const oldPos = { ...playerPos.current };
        
        // Move on X axis and check for collision
        playerPos.current.x += dx;
        if (checkPlayerCollision(playerPos.current)) {
            playerPos.current.x = oldPos.x;
        }

        // Move on Y axis and check for collision
        playerPos.current.y += dy;
        if (checkPlayerCollision(playerPos.current)) {
            playerPos.current.y = oldPos.y;
        }
    }

    // Player bounds
    playerPos.current.x = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, playerPos.current.x));
    playerPos.current.y = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, playerPos.current.y));
    
    // Treat Collection
    if (treat.current) {
        const treatDx = playerPos.current.x - treat.current.position.x;
        const treatDy = playerPos.current.y - treat.current.position.y;
        const distance = Math.sqrt(treatDx*treatDx + treatDy*treatDy);
        if (distance < (PLAYER_SIZE / 2) + (TREAT_SIZE / 2)) {
            playPowerUpSound();
            treat.current = null;
            powerUpActive.current = true;
            powerUpEndTime.current = performance.now() + POWER_UP_DURATION;
        }
    }

    // Squirrel Spawning
    const elapsedTime = now - gameStartTime.current;
    const difficultyProgress = Math.min(1, elapsedTime / DIFFICULTY_RAMP_DURATION);
    const currentSpawnInterval = SQUIRREL_SPAWN_INTERVAL_INITIAL - (SQUIRREL_SPAWN_INTERVAL_INITIAL - SQUIRREL_SPAWN_INTERVAL_MIN) * difficultyProgress;

    if (now - lastSpawnTime.current > currentSpawnInterval) {
        lastSpawnTime.current = now;
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (edge === 0) { x = Math.random() * GAME_WIDTH; y = -SQUIRREL_SIZE / 2; } 
        else if (edge === 1) { x = GAME_WIDTH + SQUIRREL_SIZE / 2; y = Math.random() * GAME_HEIGHT; }
        else if (edge === 2) { x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + SQUIRREL_SIZE / 2; }
        else { x = -SQUIRREL_SIZE / 2; y = Math.random() * GAME_HEIGHT; }
        squirrels.current.push({
            id: now,
            position: { x, y },
            spawnTime: now,
            direction: (HOUSE_X + HOUSE_SIZE / 2) > x ? 'right' : 'left'
        });
    }
    
    // Treat Spawning
    if (!treat.current && now - lastTreatSpawnAttempt.current > TREAT_SPAWN_INTERVAL) {
        lastTreatSpawnAttempt.current = now;
        let x, y, validPosition;
        let attempts = 0;
        const houseCenter = { x: HOUSE_X + HOUSE_SIZE / 2, y: HOUSE_Y + HOUSE_SIZE / 2 };
        do {
            x = Math.random() * (GAME_WIDTH - 100) + 50;
            y = Math.random() * (GAME_HEIGHT - 100) + 50;

            const distFromHouseX = x - houseCenter.x;
            const distFromHouseY = y - houseCenter.y;
            const distFromHouse = Math.sqrt(distFromHouseX * distFromHouseX + distFromHouseY * distFromHouseY);
            const tooCloseToHouse = distFromHouse < TREAT_HOUSE_MIN_DISTANCE;
            
            let isCollidingWithTree = false;
            for (const tree of scenery.current.trees) {
                const treeDx = x - tree.position.x;
                const treeDy = y - tree.position.y;
                if (Math.sqrt(treeDx*treeDx + treeDy*treeDy) < (TREAT_SIZE / 2) + (TREE_SIZE / 2) + 20) {
                    isCollidingWithTree = true;
                    break;
                }
            }
            validPosition = !tooCloseToHouse && !isCollidingWithTree;
            attempts++;
            if (attempts > 50) break;
        } while (!validPosition);

        if (validPosition) {
            treat.current = { position: { x, y } };
        }
    }
    
    // Rabbit Spawning
    if (!rabbit.current && now - lastRabbitSpawnAttempt.current > RABBIT_SPAWN_INTERVAL) {
        lastRabbitSpawnAttempt.current = now;
        if (Math.random() < RABBIT_SPAWN_CHANCE) {
            const spawnOnLeft = Math.random() > 0.5;
            const y = Math.random() * (GAME_HEIGHT - 40) + 20; // Avoid very top/bottom
            const x = spawnOnLeft ? -RABBIT_SIZE / 2 : GAME_WIDTH + RABBIT_SIZE / 2;
            const targetX = spawnOnLeft ? GAME_WIDTH + RABBIT_SIZE / 2 : -RABBIT_SIZE / 2;
            rabbit.current = {
                id: now,
                position: { x, y },
                spawnTime: now,
                targetPosition: { x: targetX, y },
                direction: spawnOnLeft ? 'right' : 'left',
            };
        }
    }

    // Squirrel Movement & Collision
    const houseCenter = { x: HOUSE_X + HOUSE_SIZE / 2, y: HOUSE_Y + HOUSE_SIZE / 2 };
    const squirrelsToRemove: number[] = [];

    squirrels.current.forEach(squirrel => {
        // Check distance to player
        const pDistX = squirrel.position.x - playerPos.current.x;
        const pDistY = squirrel.position.y - playerPos.current.y;
        const playerDist = Math.sqrt(pDistX * pDistX + pDistY * pDistY);

        let targetDx: number;
        let targetDy: number;

        if (playerDist < DOG_SCARE_RADIUS) {
            // Squirrel is scared, move away from player. Vector is from player to squirrel.
            targetDx = pDistX;
            targetDy = pDistY;
        } else {
            // Squirrel is not scared, move towards house. Vector is from squirrel to house.
            targetDx = houseCenter.x - squirrel.position.x;
            targetDy = houseCenter.y - squirrel.position.y;
        }
        
        const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

        if (targetDist > 0) { // Avoid division by zero
            const moveX = (targetDx / targetDist) * SQUIRREL_SPEED * deltaTime;
            const moveY = (targetDy / targetDist) * SQUIRREL_SPEED * deltaTime;

            squirrel.position.x += moveX;
            squirrel.position.y += moveY;

            if (moveX > 0) squirrel.direction = 'right';
            else if (moveX < 0) squirrel.direction = 'left';
        }

        // Collision with house
        const { x, y } = squirrel.position;
        const inBase = x > houseBase.x && x < houseBase.x + houseBase.width && y > houseBase.y && y < houseBase.y + houseBase.height;
        const inRoof = x > houseRoof.x && x < houseRoof.x + houseRoof.width && y > houseRoof.y && y < houseRoof.y + houseRoof.height;

        if (inBase || inRoof) {
            if (!gameOverHandled.current) {
                gameOverHandled.current = true;
                playSquirrelLaughSound();
                screenShake.current = { magnitude: 20, duration: 500, startTime: performance.now() };
                gameOverFlashOpacity.current = 0.6;
                onGameOver(score.current);
            }
            return;
        }

        // Collision with player
        const playerDx = playerPos.current.x - squirrel.position.x;
        const playerDy = playerPos.current.y - squirrel.position.y;
        if (Math.sqrt(playerDx*playerDx + playerDy*playerDy) < (PLAYER_SIZE / 2 + SQUIRREL_SIZE / 2)) {
            squirrelsToRemove.push(squirrel.id);
            score.current += 1;
            setDisplayScore(score.current);
            playSquirrelCatchSound();
            createPoofEffect(squirrel.position);
        }
    });

    if (squirrelsToRemove.length > 0) {
        squirrels.current = squirrels.current.filter(s => !squirrelsToRemove.includes(s.id));
    }
    
    // Rabbit Movement, Evasion, and Collection
    if (rabbit.current) {
        const rab = rabbit.current;

        // Check for despawn
        if ((rab.direction === 'left' && rab.position.x < -RABBIT_SIZE) || (rab.direction === 'right' && rab.position.x > GAME_WIDTH + RABBIT_SIZE)) {
            rabbit.current = null;
        } else {
            // --- EVASION LOGIC ---
            const pDistX = rab.position.x - playerPos.current.x;
            const pDistY = rab.position.y - playerPos.current.y;
            const playerDist = Math.sqrt(pDistX * pDistX + pDistY * pDistY);
            
            const evasionRadius = DOG_SCARE_RADIUS * 1.5; // Increased radius for reaction
            const isEvading = playerDist < evasionRadius;

            // --- MOVEMENT VECTOR CALCULATION ---
            
            // 1. Vector towards main target (across the screen)
            const targetDx = rab.targetPosition.x - rab.position.x;
            const targetDy = rab.targetPosition.y - rab.position.y;
            
            // 2. Add erratic wobble for unpredictable movement
            const wobbleFrequency = 300;
            const wobbleMagnitude = 0.8; 
            const wobble = Math.sin(animationTime.current / wobbleFrequency) * wobbleMagnitude;
            const targetDist = Math.sqrt(targetDx*targetDx + targetDy*targetDy) || 1;
            const perpendicularDx = -targetDy / targetDist;
            const perpendicularDy = targetDx / targetDist;
            
            let moveDx = targetDx + perpendicularDx * wobble * 100;
            let moveDy = targetDy + perpendicularDy * wobble * 100;

            // 3. If evading, add a strong vector away from the player
            if (isEvading) {
                // Weight makes the evasion stronger the closer the player is
                const weight = (evasionRadius - playerDist) / evasionRadius;
                const evasionMultiplier = 3.5; // Increased force
                moveDx += pDistX * weight * evasionMultiplier;
                moveDy += pDistY * weight * evasionMultiplier;
            }
            
            const moveDist = Math.sqrt(moveDx * moveDx + moveDy * moveDy);

            if (moveDist > 0) {
                // --- APPLY MOVEMENT ---
                
                // Apply speed boost if evading
                const speedBoost = isEvading ? 1.3 : 1.0; // 30% speed boost
                const currentRabbitSpeed = RABBIT_SPEED * speedBoost;

                const normalizedDx = moveDx / moveDist;
                const normalizedDy = moveDy / moveDist;
                const moveDistance = currentRabbitSpeed * deltaTime;
                
                const dx = normalizedDx * moveDistance;
                const dy = normalizedDy * moveDistance;
                
                if (dx > 0) rab.direction = 'right';
                else if (dx < 0) rab.direction = 'left';

                const oldPos = { ...rab.position };
                rab.position.x += dx;
                if (checkEntityCollision(rab.position, RABBIT_SIZE / 2)) {
                    rab.position.x = oldPos.x;
                }
                rab.position.y += dy;
                if (checkEntityCollision(rab.position, RABBIT_SIZE / 2)) {
                    rab.position.y = oldPos.y;
                }
            }

            // --- COLLISION WITH PLAYER ---
            const playerDx = playerPos.current.x - rab.position.x;
            const playerDy = playerPos.current.y - rab.position.y;
            if (Math.sqrt(playerDx*playerDx + playerDy*playerDy) < (PLAYER_SIZE / 2 + RABBIT_SIZE / 2)) {
                score.current += RABBIT_POINTS;
                setDisplayScore(score.current);
                createPoofEffect(rab.position);
                // Create a "+5" text particle
                const life = 1000;
                particles.current.push({
                    position: { x: rab.position.x, y: rab.position.y },
                    velocity: { x: 0, y: -1 }, // Moves upwards
                    life: life,
                    initialLife: life,
                    size: 25,
                    color: '#FFD700', // Gold color
                    rotation: 0,
                    rotationSpeed: 0,
                    text: '+5'
                });
                rabbit.current = null;
            }
        }
    }
    
    // Update Particles
    particles.current.forEach(p => {
        p.position.x += p.velocity.x;
        p.position.y += p.velocity.y;
        p.life -= deltaTime;
        p.rotation += p.rotationSpeed;
    });
    particles.current = particles.current.filter(p => p.life > 0);

    // Update Game Over flash
    if (gameOverFlashOpacity.current > 0) {
        gameOverFlashOpacity.current -= deltaTime / 1000;
    }

  }, [onGameOver, createPoofEffect, checkEntityCollision, checkCircleRectCollision]);

  const gameLoop = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;
    animationTime.current = now;

    if (gameState === 'playing') {
      update(deltaTime);
    }
    draw();
    
    if (gameState === 'playing') {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
  }, [draw, update, gameState]);
  
  const resetGame = useCallback(() => {
    // Generate scenery to be balanced on both sides of the yard
    const newTrees: Tree[] = [];
    
    const tryPlaceTree = (xRange: {min: number, max: number}) => {
        let x, y, validPosition;
        let attempts = 0;
        do {
            x = Math.random() * (xRange.max - xRange.min) + xRange.min;
            y = Math.random() * GAME_HEIGHT;
            
            const houseBuffer = 100; // Generous buffer to ensure trees don't crowd the house.
            const inHouse = x > HOUSE_X - houseBuffer && x < HOUSE_X + HOUSE_SIZE + houseBuffer &&
                          y > HOUSE_Y - houseBuffer && y < HOUSE_Y + HOUSE_SIZE + houseBuffer;
            
            const playerSpawnBuffer = 100;
            const playerSpawnX = GAME_WIDTH / 2;
            const playerSpawnY = GAME_HEIGHT - PLAYER_SIZE * 2;
            const inPlayerSpawn = Math.sqrt(Math.pow(x - playerSpawnX, 2) + Math.pow(y - playerSpawnY, 2)) < playerSpawnBuffer;

            let tooCloseToAnotherTree = false;
            for (const tree of newTrees) {
                const dx = x - tree.position.x;
                const dy = y - tree.position.y;
                if (Math.sqrt(dx * dx + dy * dy) < MIN_TREE_DISTANCE) {
                    tooCloseToAnotherTree = true;
                    break;
                }
            }
            validPosition = !inHouse && !inPlayerSpawn && !tooCloseToAnotherTree;
            attempts++;
            if (attempts > 100) break; // Failsafe to prevent infinite loops
        } while (!validPosition);
        
        if (validPosition) {
            newTrees.push({ position: { x, y } });
        }
    };

    const midPointX = GAME_WIDTH / 2;
    // Ensure at least one tree per side, and balance them as much as possible
    const treesOnLeft = Math.ceil(NUM_TREES / 2);
    const treesOnRight = Math.floor(NUM_TREES / 2);

    for (let i = 0; i < treesOnLeft; i++) {
        tryPlaceTree({ min: 0, max: midPointX });
    }

    for (let i = 0; i < treesOnRight; i++) {
        tryPlaceTree({ min: midPointX, max: GAME_WIDTH });
    }
    scenery.current.trees = newTrees;

    playerPos.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE * 2 };
    squirrels.current = [];
    particles.current = [];
    barkWave.current = null;
    gameOverFlashOpacity.current = 0;
    screenShake.current = { magnitude: 0, duration: 0, startTime: 0 };
    score.current = 0;
    barkCooldown.current = 0;
    treat.current = null;
    rabbit.current = null;
    powerUpActive.current = false;
    powerUpEndTime.current = 0;
    setDisplayPowerUpTimeLeft(0);
    setDisplayScore(0);
    setDisplayBarkCooldown(0);
    lastSpawnTime.current = performance.now();
    lastUpdateTime.current = performance.now();
    gameStartTime.current = performance.now();
    lastTreatSpawnAttempt.current = performance.now();
    lastRabbitSpawnAttempt.current = performance.now();
    keysPressed.current = {};
    barkTriggered.current = false;
    joystickVector.current = { x: 0, y: 0};
    gameOverHandled.current = false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        keysPressed.current[e.key] = true;
        if (e.key === ' ' && gameState === 'playing') {
            e.preventDefault();
            if (!barkTriggered.current) { // Prevent multiple triggers per press
               barkTriggered.current = true;
            }
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !animationFrameId.current) {
        resetGame();
        animationFrameId.current = requestAnimationFrame(gameLoop);
    } else if (gameState !== 'playing' && animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        requestAnimationFrame(draw);
    } else if (gameState === 'playing' && animationFrameId.current) {
      // Game is already running, do nothing
    } else {
      // Game is not playing and not running, just draw final state
      requestAnimationFrame(draw);
    }
    
    // Cleanup on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [gameState, gameLoop, resetGame, draw]);

  const isBarkOnCooldown = displayBarkCooldown > 0;
  const isPowerUpActive = displayPowerUpTimeLeft > 0;
  const powerUpProgress = isPowerUpActive ? (displayPowerUpTimeLeft / POWER_UP_DURATION) * 100 : 0;

  return (
    <>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="absolute top-0 left-0" />

      {/* On-screen controls, absolutely positioned relative to the game container */}
      {gameState === 'playing' && (
        <>
            {/* Left Control Area */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:hidden">
                <Joystick onMove={handleJoystickMove} />
            </div>

            {/* Right Control Area */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 lg:hidden">
                <BarkButton onBark={handleBarkPress} />
            </div>
        </>
      )}

      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-2xl font-bold pointer-events-none">
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full text-yellow-300 shadow-lg">
            <span className="font-bold text-white tracking-widest mr-2 text-xl">SCORE</span> 
            <span className="text-3xl">{displayScore}</span>
          </div>
          
          <div className="w-64 text-lg">
            {isPowerUpActive ? (
               <div className="relative w-full h-10 bg-black/20 backdrop-blur-sm rounded-full p-1 shadow-lg border border-yellow-300/30">
                <div className="w-full h-full bg-yellow-900/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-300 to-amber-400"
                        style={{ width: `${powerUpProgress}%` }}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold tracking-wider text-sm" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
                    Treat Power! ({(displayPowerUpTimeLeft / 1000).toFixed(1)}s)
                </div>
            </div>
            ) : (
              <div className="relative w-full h-10 bg-black/20 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/10">
                <div className="w-full h-full bg-gray-800/50 rounded-full overflow-hidden">
                   {isBarkOnCooldown ? (
                    <div
                      key={barkAnimationKey}
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-recharge"
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold tracking-wider text-sm" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
                  {isBarkOnCooldown ? 'RECHARGING' : 'BARK READY'}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default Game;