// Twin Lanterns — the game state: screens, rounds, scoring, hints, timer.
// Pure logic, no drawing and no DOM: render.js draws whatever this holds.

import { SCENES } from './scenes.js';
import {
  DIFFS_PER_ROUND,
  ROUND_SECONDS,
  HINTS_PER_ROUND,
  HINT_COOLDOWN_MS,
  HINT_SHOW_MS,
  WRONG_CLICK_PENALTY_SEC,
  POINTS_PER_FIND,
  POINTS_PER_COMBO_STEP,
  POINTS_HINT_COST,
  POINTS_TIME_BONUS_PER_SEC,
  STAR_CUTS,
} from './config.js';
import {
  soundFound,
  soundWrong,
  soundHint,
  soundRoundClear,
  soundGameComplete,
  soundTick,
} from './audio.js';

export function newGame() {
  return {
    screen: 'title', // title | playing | roundClear | complete | timeUp
    sceneIndex: 0,
    found: [], // difference ids found this round, in order
    foundOrder: [],
    score: 0,
    roundScore: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: ROUND_SECONDS,
    hintsLeft: HINTS_PER_ROUND,
    hintAt: null, // { diffId, until } while a hint ring is showing
    hintReadyAt: 0,
    wrongAt: null, // { x, y, panel, until } while a wrong-click mark shows
    wrongCount: 0,
    startedAt: 0,
    paused: false,
    frozen: false, // screenshot staging: the timer never ticks
    roundStartScore: 0,
    stars: 0,
    totalStars: 0,
    roundsCleared: 0,
    lastTickSecond: -1,
  };
}

export function sceneOf(game) {
  return SCENES[game.sceneIndex];
}

export function remaining(game) {
  return DIFFS_PER_ROUND - game.found.length;
}

export function isFound(game, diffId) {
  return game.found.includes(diffId);
}

export function startRound(game, sceneIndex) {
  game.sceneIndex = sceneIndex;
  game.screen = 'playing';
  game.found = [];
  game.foundOrder = [];
  game.roundScore = 0;
  game.combo = 0;
  game.timeLeft = ROUND_SECONDS;
  game.hintsLeft = HINTS_PER_ROUND;
  game.hintAt = null;
  game.hintReadyAt = 0;
  game.wrongAt = null;
  game.wrongCount = 0;
  game.roundStartScore = game.score;
  game.stars = 0;
  game.startedAt = Date.now();
  game.lastTickSecond = -1;
  game.paused = false;
}

export function startGame(game) {
  game.score = 0;
  game.totalStars = 0;
  game.roundsCleared = 0;
  startRound(game, 0);
}

export function nextRound(game) {
  if (game.sceneIndex + 1 < SCENES.length) {
    startRound(game, game.sceneIndex + 1);
  } else {
    game.screen = 'complete';
    soundGameComplete();
  }
}

export function maxRoundScore() {
  // 7 finds with a full combo ladder, plus the full time bonus.
  let points = 0;
  for (let i = 0; i < DIFFS_PER_ROUND; i += 1) {
    points += POINTS_PER_FIND + i * POINTS_PER_COMBO_STEP;
  }
  return points + ROUND_SECONDS * POINTS_TIME_BONUS_PER_SEC;
}

export function starsFor(game) {
  const frac = game.roundScore / maxRoundScore();
  let stars = 0;
  STAR_CUTS.forEach((cut) => { if (frac >= cut) stars += 1; });
  return stars;
}

export function clickAt(game, panel, x, y, now) {
  if (game.screen !== 'playing' || game.paused) return 'ignored';
  const scene = sceneOf(game);
  const hit = scene.differences.find(
    (d) => !isFound(game, d.id) && (x - d.x) ** 2 + (y - d.y) ** 2 <= d.r ** 2,
  );
  if (hit) {
    game.found.push(hit.id);
    game.foundOrder.push(hit.id);
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const gained = POINTS_PER_FIND + (game.combo - 1) * POINTS_PER_COMBO_STEP;
    game.score += gained;
    game.roundScore += gained;
    soundFound();
    if (game.found.length === DIFFS_PER_ROUND) {
      const bonus = Math.ceil(game.timeLeft) * POINTS_TIME_BONUS_PER_SEC;
      game.score += bonus;
      game.roundScore += bonus;
      game.stars = starsFor(game);
      game.totalStars += game.stars;
      game.roundsCleared += 1;
      game.screen = 'roundClear';
      soundRoundClear();
      return 'roundClear';
    }
    return 'found';
  }
  game.combo = 0;
  game.wrongCount += 1;
  game.timeLeft = Math.max(0, game.timeLeft - WRONG_CLICK_PENALTY_SEC);
  game.wrongAt = { x, y, panel, until: now + 700 };
  soundWrong();
  if (game.timeLeft <= 0) {
    game.screen = 'timeUp';
    return 'timeUp';
  }
  return 'wrong';
}

export function useHint(game, now) {
  if (game.screen !== 'playing' || game.paused) return null;
  if (game.hintsLeft <= 0) return null;
  if (now < game.hintReadyAt) return null;
  const scene = sceneOf(game);
  const unfound = scene.differences.filter((d) => !isFound(game, d.id));
  if (unfound.length === 0) return null;
  const diff = unfound[0];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - POINTS_HINT_COST);
  game.roundScore = Math.max(0, game.roundScore - POINTS_HINT_COST);
  game.hintAt = { diffId: diff.id, until: now + HINT_SHOW_MS };
  game.hintReadyAt = now + HINT_COOLDOWN_MS;
  soundHint();
  return diff;
}

export function tick(game, now) {
  if (game.screen !== 'playing' || game.paused || game.frozen) return;
  const whole = Math.ceil(game.timeLeft);
  if (whole !== game.lastTickSecond) {
    game.lastTickSecond = whole;
    if (whole <= 10 && whole > 0) soundTick();
  }
  if (game.hintAt && now > game.hintAt.until) game.hintAt = null;
  if (game.wrongAt && now > game.wrongAt.until) game.wrongAt = null;
}

export function tickTimer(game, dtSeconds) {
  if (game.screen !== 'playing' || game.paused || game.frozen) return;
  game.timeLeft -= dtSeconds;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = 'timeUp';
  }
}
