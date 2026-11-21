// Twin Lanterns — screenshot staging. The screenshots are real renders of
// the game in a browser, staged through URL parameters only:
//   ?shot=start            title screen over the first scene
//   ?shot=play&scene=0&found=3   mid-game, 3 differences already ringed
//   ?shot=clear&scene=1    round-clear screen with all 7 found
//   ?shot=complete         game-complete screen after all three scenes
// The timer is frozen in every staged shot so the frame is stable.

import { SCENES } from './scenes.js';
import { ROUND_SECONDS } from './config.js';

export function applyShotParams(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  game.frozen = true;
  const sceneIndex = Math.min(SCENES.length - 1, Math.max(0, Number(params.get('scene') || '0')));
  if (shot === 'start') {
    game.screen = 'title';
    game.sceneIndex = sceneIndex;
    game.timeLeft = 118;
    return true;
  }
  if (shot === 'play') {
    const foundCount = Math.min(7, Math.max(0, Number(params.get('found') || '3')));
    game.screen = 'playing';
    game.sceneIndex = sceneIndex;
    game.found = SCENES[sceneIndex].differences.slice(0, foundCount).map((d) => d.id);
    game.score = 100 * foundCount + 25 * ((foundCount * (foundCount - 1)) / 2);
    game.roundScore = game.score;
    game.combo = foundCount;
    game.timeLeft = 118 - foundCount * 9;
    return true;
  }
  if (shot === 'clear') {
    game.screen = 'roundClear';
    game.sceneIndex = sceneIndex;
    game.found = SCENES[sceneIndex].differences.map((d) => d.id);
    game.score = 1180;
    game.roundScore = 1180;
    game.stars = 3;
    game.timeLeft = 96;
    return true;
  }
  if (shot === 'complete') {
    game.screen = 'complete';
    game.sceneIndex = SCENES.length - 1;
    game.found = SCENES[game.sceneIndex].differences.map((d) => d.id);
    game.score = 3540;
    game.roundScore = 1180;
    game.totalStars = 9;
    game.bestCombo = 7;
    game.timeLeft = ROUND_SECONDS;
    return true;
  }
  return false;
}
