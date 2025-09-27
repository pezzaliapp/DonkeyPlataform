import {Mario} from "./Classes/Mario.js"
import {DK} from "./Classes/DK.js"
import {Barrel} from "./Classes/Barrel.js"
import {Platform} from "./Classes/Platform.js"
import {Ladder} from "./Classes/Ladder.js"

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false

let gameState = "title"
let character = "Mario"

let sprites = new Image()
sprites.src = './mario_luigi_sprites2.png'

let paused = false

class Game {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.mario = new Mario(200, 608, 35, 52)
    this.dk = new DK(250, -5)
    this.barrels = []
    this.score = 0
    this.highScore = 0
    this.lives = 3

    this.choose = (event) => {
      if (event.key === "a") {
        character = "Mario"
        ctx.clearRect(590, 400, 85, 30)
        ctx.fillStyle = "red"
        ctx.fillText("Mario", 632, 420)
        ctx.fillStyle = "white"
        ctx.fillText("Luigi", 882, 420)
      } else if (event.key === "d") {
        character = "Luigi"
        ctx.clearRect(840, 400, 85, 30)
        ctx.fillStyle = "lime"
        ctx.fillText("Luigi", 882, 420)
        ctx.fillStyle = "white"
        ctx.fillText("Mario", 632, 420)
      }
    }

    this.platforms = [
      new Platform(122, 138, 8), new Platform(245, 138, 8), new Platform(368, 138, 8), new Platform(491, 138, 8),
      new Platform(614, 138, 9), new Platform(120, 660, 42), new Platform(752, 657, 8), new Platform(875, 654, 8),
      new Platform(998, 651, 8), new Platform(1121, 648, 8), new Platform(1244, 645, 8),
      new Platform(1121, 575, 8), new Platform(998, 572, 8), new Platform(875, 569, 8), new Platform(752, 566, 8),
      new Platform(629, 563, 8), new Platform(506, 561, 8), new Platform(383, 558, 8), new Platform(260, 555, 8),
      new Platform(182, 552, 5), new Platform(260, 483, 8), new Platform(383, 478, 8), new Platform(506, 473, 8),
      new Platform(629, 468, 8), new Platform(752, 463, 8), new Platform(875, 458, 8), new Platform(998, 453, 8),
      new Platform(1121, 448, 8), new Platform(1244, 443, 5), new Platform(1121, 375, 8), new Platform(998, 370, 8),
      new Platform(875, 365, 8), new Platform(752, 360, 8), new Platform(629, 355, 8), new Platform(506, 350, 8),
      new Platform(383, 345, 8), new Platform(260, 340, 8), new Platform(182, 335, 5), new Platform(260, 268, 8),
      new Platform(383, 263, 8), new Platform(506, 258, 8), new Platform(629, 253, 8), new Platform(752, 248, 8),
      new Platform(875, 243, 8), new Platform(998, 238, 8), new Platform(1121, 233, 8), new Platform(1244, 228, 5),
      new Platform(1121, 158, 8), new Platform(998, 153, 8), new Platform(875, 148, 8), new Platform(752, 143, 8),
      new Platform(500, 57, 25), new Platform(408, 80, 6),
    ]

    this.ladders = [
      new Ladder(1125, 612, 2), new Ladder(350, 521, 2), new Ladder(1125, 413, 2),
      new Ladder(350, 306, 2), new Ladder(1125, 196, 2), new Ladder(680, 526, 3),
      new Ladder(760, 428, 4), new Ladder(845, 110, 3), new Ladder(410, 100, 7),
      new Ladder(470, 100, 7),
    ]
  }

  draw(ctx) {
    for (const ladder of this.ladders) ladder.drawLadder(ctx)
    for (const platform of this.platforms) platform.drawPlatform(ctx)
  }

  updateMario(elapsed) { this.mario.update(ctx, this.platforms, this.ladders, character, elapsed) }
  updateBarrels(elapsed) {
    if (this.dk.isThrowing) this.barrels.push(new Barrel(350, 90, 27, 42))
    for (const barrel of this.barrels) barrel.update(ctx, this.platforms, this.mario, elapsed)
  }
  updateDK(elapsed) { this.dk.update(ctx, elapsed) }

  getPoints() {
    for (let i = 0; i < this.barrels.length; i++) {
      if (this.barrels[i].scored) {
        this.score += 100
        this.barrels[i].scored = false
      }
    }
  }

  drawPoints() {
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${this.score}`, 90, 20)
  }

  resetGame() { this.mario.x = 200; this.mario.y = 608; this.barrels = [] }
  loseLife() {
    for (let i = 0; i < this.barrels.length; i++) {
      if (this.barrels[i].dead) { this.lives -= 1; this.resetGame() }
    }
    if (this.mario.y > this.height) { this.lives -= 1; this.resetGame() }
  }

  playerLives() {
    ctx.fillStyle = 'white'
    const text = `Lives: ${this.lives}`
    const textWidth = ctx.measureText(text).width
    const x = canvas.width - textWidth - 10
    ctx.fillText(text, x + 60, 20)
  }

  gameOver() {
    if (this.lives < 0) gameState = "title"
    else if (this.mario.y + this.mario.height == 57) {
      gameState = "title"
      if (this.score > this.highScore) this.highScore = this.score
    }
  }

  showTitleScreen() {
    ctx.clearRect(0, 0, this.width, this.height)
    this.lives = 3; this.score = 0; this.resetGame()
    const img = new Image(); img.src = './dk_title.png'
    img.onload = () => { const x = (this.width - 700) / 2; ctx.drawImage(img, x, 10, 700, 400) }
    ctx.fillStyle = 'white'; ctx.font = '16px "Press Start 2P", Arial'; ctx.textAlign = "center"
    ctx.fillText("Press Enter to Start", this.width / 2, 500)
    ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.width / 2, 600)
    document.addEventListener("keydown", this.startSelect)
  }

  startSelect = (event) => {
    if (event.key === "Enter" && gameState === "title") {
      document.removeEventListener("keydown", this.startSelect)
      gameState = "character"; this.characterSelect()
    }
  }

  characterSelect() {
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = 'white'; ctx.textAlign = "center"
    ctx.fillText("Select your character", this.width / 2, 200)
    ctx.drawImage(sprites, 38, 17, 15, 18, 600, 300, 60, 90)
    ctx.drawImage(sprites, 38, 53, 15, 18, 850, 300, 60, 90)
    ctx.fillText("Luigi", 882, 420); ctx.fillStyle = 'red'; ctx.fillText("Mario", 632, 420)
    document.addEventListener("keydown", this.choose)
    document.addEventListener("keydown", (event) => this.startGame(event))
  }

  startGame(event) {
    if (event.key === "Enter" && gameState === "character") {
      document.removeEventListener("keydown", (event) => this.startGame(event))
      document.removeEventListener("keydown", this.choose)
      gameState = "game"
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      update()
    }
  }

  pauseScreen() {
    const w = 550, h = 200
    const x = this.width / 2 - w / 2, y = this.height / 2 - h / 2
    const img = new Image(); img.src = './pausemenu.png'
    ctx.drawImage(img, x, y, w, h)
    ctx.fillStyle = 'yellow'; ctx.textAlign = "center"
    ctx.fillText("— Paused —", this.width / 2, 400)
  }
}

window.addEventListener('keydown', e => { if (e.key === "p") togglePause() })
function togglePause() { paused = !paused }

const game = new Game(canvas.width, canvas.height)
let previous

function update(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (gameState == "game") {
    const elapsed = timestamp - previous || 0; previous = timestamp
    game.draw(ctx); game.drawPoints(); game.playerLives(); game.getPoints(); game.loseLife(); game.gameOver()
    requestAnimationFrame(update)
    if (!paused) { game.updateMario(elapsed); game.updateBarrels(elapsed); game.updateDK(elapsed) }
    else { game.pauseScreen() }
  } else if (gameState == "title") { game.showTitleScreen() }
}
requestAnimationFrame(update)

// ===== Mobile: starter + controlli touch minimi sul canvas =====
(() => {
  const canvas = document.getElementById('myCanvas') || document.querySelector('canvas');
  if (!canvas) return;
  const IS_MOBILE = matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window);
  let started = false;
  function fireKey(key, code) {
    const kd = new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true });
    const ku = new KeyboardEvent('keyup',   { key, code, bubbles: true, cancelable: true });
    document.dispatchEvent(kd); window.dispatchEvent(kd);
    document.dispatchEvent(ku); window.dispatchEvent(ku);
  }
  function startBridgeOnce() {
    if (started) return; started = true;
    try {
      if (typeof gameState !== 'undefined') {
        if (gameState === 'title' && typeof game?.startSelect === 'function') { game.startSelect({ key: 'Enter' }); }
        else if (gameState === 'character' && typeof game?.startGame === 'function') { game.startGame({ key: 'Enter' }); }
      }
    } catch(_) {}
    fireKey('Enter','Enter'); fireKey(' ','Space');
    try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { (window._ac = window._ac || new AC()).resume?.(); } } catch(_) {}
  }
  if (!IS_MOBILE) return;
  const g = (typeof game !== 'undefined') ? game : null; const m = g?.mario; if (!m) return;
  const K = m.keys || {}; let pressT0 = 0; let startX = 0, startY = 0; let moved = false;
  function dirClear(){ if (K.a) K.a.pressed = false; if (K.d) K.d.pressed = false; m.movingLeft = false; m.movingRight = false; }
  function vertClear(){ if (K.w) K.w.pressed = false; if (K.s) K.s.pressed = false; m.climbingUp = false; m.isClimbingDown = false; }
  function jumpPulse(){ if (typeof m.jump === 'function') { m.jump(); return; }
    if (K.space) { K.space.pressed = true; setTimeout(()=>{ K.space.pressed = false; }, 120); }
    else { m.isJumping = true; setTimeout(()=>{ m.isJumping = false; }, 180); } }
  function getXY(e, rect){ const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const cx = (t ? t.clientX : e.clientX) - rect.left; const cy = (t ? t.clientY : e.clientY) - rect.top; return [cx, cy]; }
  function onDown(e){ e.preventDefault(); startBridgeOnce(); const rect = canvas.getBoundingClientRect();
    [startX, startY] = getXY(e, rect); pressT0 = performance.now(); moved = false; const third = rect.width / 3; dirClear();
    if (startX < third) { if (K.a) K.a.pressed = true; m.movingLeft = true; m.facingLeft = true; m.facingRight = false; }
    else if (startX > rect.width - third) { if (K.d) K.d.pressed = true; m.movingRight = true; m.facingRight = true; m.facingLeft = false; } }
  function onMove(e){ e.preventDefault(); const rect = canvas.getBoundingClientRect(); const [x,y] = getXY(e, rect);
    if (Math.hypot(x - startX, y - startY) > 10) moved = true; const dy = y - startY; vertClear();
    if (dy < -14) { if (K.w) K.w.pressed = true; m.climbingUp = true; } else if (dy > 14) { if (K.s) K.s.pressed = true; m.isClimbingDown = true; } }
  function onUp(e){ e.preventDefault(); const rect = canvas.getBoundingClientRect(); const dt = performance.now() - pressT0;
    if (!moved && dt < 180 && startX >= rect.width/3 && startX <= rect.width*2/3) { jumpPulse(); } dirClear(); vertClear(); }
  canvas.addEventListener('pointerdown', onDown, {passive:false});
  canvas.addEventListener('pointermove', onMove, {passive:false});
  canvas.addEventListener('pointerup', onUp, {passive:false});
  canvas.addEventListener('pointercancel', onUp, {passive:false});
  canvas.addEventListener('touchstart', onDown, {passive:false});
  canvas.addEventListener('touchmove', onMove, {passive:false});
  canvas.addEventListener('touchend', onUp, {passive:false});
})();
