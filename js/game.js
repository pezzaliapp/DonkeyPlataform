// Donkey Platform — minimal platformer engine (MIT)
// Canvas-based; supports keyboard + touch; simple levels with increasing difficulty.

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

const hud = {
  score: document.getElementById('score'),
  lives: document.getElementById('lives'),
  level: document.getElementById('level'),
  btnPlay: document.getElementById('btnPlay'),
  btnRestart: document.getElementById('btnRestart'),
  btnHelp: document.getElementById('btnHelp'),
  mobileBtns: [...document.querySelectorAll('.tbtn')],
};

const S = {
  W: cvs.width,
  H: cvs.height,
  G: 0.4,        // gravity
  FRICTION: 0.82,
  LADDER_V: 1.3,
  RUN_V: 1.4,
  JUMP_V: 6.0,
  BARREL_V: 1.0,
  SPAWN_MS: 2400,
};

// Scale canvas to fit container while preserving pixel look
function fitCanvas() {
  const rect = cvs.getBoundingClientRect();
  const scaleX = rect.width / S.W;
  const scaleY = rect.height / S.H;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
}
addEventListener('resize', fitCanvas);
fitCanvas();

// Level definition: platforms & ladders and goal
// y is top of platform; x,w define span. Ladders are vertical climbable zones.
const LEVELS = [
  {
    platforms: [
      {x:0,y:220,w:320,h:8,slope:0},
      {x:8,y:180,w:300,h:6,slope:-0.08},
      {x:0,y:140,w:300,h:6,slope:+0.08},
      {x:20,y:100,w:300,h:6,slope:-0.08},
      {x:0,y:60,w:260,h:6,slope:+0.08},
    ],
    ladders: [
      {x:280,y:180,h:40},
      {x:30,y:140,h:40},
      {x:260,y:100,h:40},
      {x:50,y:60,h:40},
    ],
    start:{x:16,y:210},
    goal:{x:8,y:50,w:18,h:8}
  },
  {
    platforms: [
      {x:0,y:220,w:320,h:8,slope:0},
      {x:0,y:185,w:290,h:6,slope:0.10},
      {x:30,y:150,w:290,h:6,slope:-0.10},
      {x:0,y:115,w:290,h:6,slope:0.12},
      {x:30,y:80,w:290,h:6,slope:-0.12},
      {x:0,y:45,w:220,h:6,slope:0},
    ],
    ladders: [
      {x:260,y:185,h:35},
      {x:40,y:150,h:35},
      {x:250,y:115,h:35},
      {x:40,y:80,h:35},
    ],
    start:{x:12,y:210},
    goal:{x:6,y:40,w:18,h:8}
  },
  {
    platforms: [
      {x:0,y:220,w:320,h:8,slope:0},
      {x:10,y:192,w:300,h:6,slope:-0.15},
      {x:0,y:164,w:300,h:6,slope:0.15},
      {x:20,y:136,w:300,h:6,slope:-0.18},
      {x:0,y:108,w:300,h:6,slope:0.18},
      {x:20,y:80,w:300,h:6,slope:-0.20},
      {x:0,y:52,w:260,h:6,slope:0},
    ],
    ladders: [
      {x:280,y:192,h:28},
      {x:30,y:164,h:28},
      {x:260,y:136,h:28},
      {x:30,y:108,h:28},
      {x:260,y:80,h:28},
    ],
    start:{x:12,y:210},
    goal:{x:6,y:46,w:18,h:8}
  }
];

let levelIndex = 0;
let score = 0;
let lives = 3;
let running = false;
let t0 = performance.now();
let barrelTimer = 0;

const keys = new Set();

class Player {
  constructor(spawn){
    this.w = 10; this.h = 14;
    this.x = spawn.x; this.y = spawn.y - this.h;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.onLadder = false;
    this.facing = 1;
    this.inv = 0; // invulnerability frames
  }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
  update(dt, world){
    // Input
    const left = keys.has('ArrowLeft');
    const right = keys.has('ArrowRight');
    const up = keys.has('ArrowUp');
    const down = keys.has('ArrowDown');
    const jump = keys.has('KeyZ');

    // Ladder detection
    this.onLadder = world.ladders.some(L => intersect(this.rect(), {x:L.x-4,y:L.y-L.h,w:8,h:L.h+14}));

    if(this.onLadder){
      // on ladder: cancel gravity and allow vertical move
      if (up)   this.vy = -S.LADDER_V;
      else if (down) this.vy =  S.LADDER_V;
      else this.vy = 0;
      // horizontal slow drift
      if (left) this.vx = -0.6;
      else if (right) this.vx = 0.6;
      else this.vx *= 0.9;
    } else {
      // ground movement & gravity
      if (left) this.vx = Math.max(this.vx-0.6, -S.RUN_V*1.2);
      if (right) this.vx = Math.min(this.vx+0.6,  S.RUN_V*1.2);
      if (!left && !right) this.vx *= S.FRICTION;
      this.vy += S.G;
      if (jump && this.onGround){ this.vy = -S.JUMP_V; this.onGround = false; }
    }

    this.facing = right ? 1 : (left ? -1 : this.facing);

    // Integrate
    this.x += this.vx;
    this.y += this.vy;

    // World bounds
    this.x = Math.max(-8, Math.min(this.x, S.W - this.w + 8)); // allow slight offscreen

    // Platform collisions (simple AABB with resolve on Y)
    this.onGround = false;
    for (const p of world.platforms){
      const r = {x:p.x, y:p.y, w:p.w, h:p.h};
      if (aabb(this.rect(), r)){
        // Coming from above
        if (this.vy >= 0 && this.y + this.h - this.vy <= p.y){
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          // apply slope drift
          this.x += p.slope * 2.2;
        } else if (this.vy < 0 && this.y - this.vy >= p.y + p.h){
          this.y = p.y + p.h;
          this.vy = 0.2;
        } else {
          // side collide
          if (this.vx > 0) this.x = p.x - this.w;
          else if (this.vx < 0) this.x = p.x + p.w;
          this.vx = 0;
        }
      }
    }

    // Goal reached?
    if (intersect(this.rect(), world.goal)){
      score += 500;
      nextLevel();
    }

    // Bottom fall = lose life
    if (this.y > S.H + 20){
      loseLife();
    }

    if (this.inv>0) this.inv -= dt;
  }
  draw(){
    // Simple sprite: body + hat
    ctx.save();
    ctx.translate(this.x|0, this.y|0);
    // blink when invulnerable
    if (this.inv>0 && Math.floor(performance.now()/100)%2===0){ ctx.restore(); return; }
    // body
    rect(0,0,this.w,this.h,'#ffd39f');
    // overalls
    rect(0,6,this.w,8,'#3e6dd8');
    // hat
    rect(0,-4,this.w,4,'#e33d3d');
    // eyes
    rect(this.facing===1?6:2,2,2,2,'#0b0d14');
    ctx.restore();
  }
}

class Barrel {
  constructor(x,y,dir=1,speed= S.BARREL_V){
    this.w=8; this.h=8;
    this.x=x; this.y=y; this.vx=dir*speed; this.vy=0;
  }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
  update(dt, world){
    // gravity
    this.vy += S.G*0.6;
    // move along slope if on platform
    let onPlat = false;
    for(const p of world.platforms){
      const r = {x:p.x, y:p.y, w:p.w, h:p.h};
      if (aabb(this.rect(), r)){
        if (this.vy >= 0 && this.y + this.h - this.vy <= p.y){
          this.y = p.y - this.h;
          this.vy = 0;
          onPlat = true;
          this.x += p.slope * 2.6;
        }
      }
    }
    // random drop at platform ends (like gaps)
    if (onPlat){
      if (this.x <= 0 || this.x + this.w >= S.W) this.vx *= -1;
    }
    this.x += this.vx;
    this.y += this.vy;

    // fall off bottom -> remove & add score (dodged)
    if (this.y > S.H+10){ this.dead = true; score += 10; }
  }
  draw(){
    // simple rolling square with stripe
    ctx.save();
    ctx.translate(this.x|0,this.y|0);
    rect(0,0,this.w,this.h,'#b96a2c');
    rect(1,2,this.w-2,2,'#f0b35a');
    ctx.restore();
  }
}

const state = {
  player: new Player(LEVELS[0].start),
  barrels: [],
};

function currentWorld(){ return LEVELS[levelIndex]; }

function resetLevel(){
  state.player = new Player(currentWorld().start);
  state.barrels.length = 0;
  barrelTimer = 0;
}

function nextLevel(){
  levelIndex = (levelIndex + 1) % LEVELS.length;
  hud.level.textContent = (levelIndex+1);
  // Increase difficulty
  S.SPAWN_MS = Math.max(900, S.SPAWN_MS * 0.88);
  S.BARREL_V += 0.12;
  resetLevel();
}

function loseLife(){
  lives -= 1;
  hud.lives.textContent = lives;
  state.player.inv = 1200;
  if (lives<=0){
    // Game over -> reset all
    levelIndex = 0; score = 0; lives = 3;
    S.SPAWN_MS = 2400; S.BARREL_V = 1.0;
    hud.level.textContent = 1; hud.score.textContent = "000000"; hud.lives.textContent = 3;
  }
  resetLevel();
}

function spawnBarrel(){
  const w = currentWorld();
  const x = w.platforms[1]?.w ? Math.min(w.platforms[1].x + w.platforms[1].w - 12, 300) : 280;
  const y = w.platforms[1]?.y ? w.platforms[1].y - 8 : 180;
  const dir = Math.random()<0.5 ? -1 : 1;
  state.barrels.push(new Barrel(x,y,dir, S.BARREL_V + Math.random()*0.3));
}

function update(dt){
  if (!running) return;
  barrelTimer += dt;
  if (barrelTimer > S.SPAWN_MS){
    barrelTimer = 0;
    spawnBarrel();
  }
  state.player.update(dt, currentWorld());
  for (const b of state.barrels){ b.update(dt, currentWorld()); }
  // collisions player-barrel
  for (const b of state.barrels){
    if (!b.dead && intersect(b.rect(), state.player.rect()) && state.player.inv<=0){
      // hit
      score = Math.max(0, score-50);
      loseLife();
      break;
    }
  }
  // cleanup
  state.barrels = state.barrels.filter(b=>!b.dead);
}

function draw(){
  // clear
  rect(0,0,S.W,S.H,'#0b0d14');
  // backdrop
  drawBackdrop();
  // platforms & ladders
  drawWorld(currentWorld());
  // goal platform
  const g = currentWorld().goal;
  rect(g.x, g.y, g.w, g.h, '#ffcc00');
  // barrels
  for (const b of state.barrels){ b.draw(); }
  // player
  state.player.draw();
  // HUD overlay (Start/Pause)
  if (!running){
    textCenter("TOCCA ▶️ PER GIOCARE", S.W/2, S.H/2 - 6, '#ffcc00', 12, true);
    textCenter("Freccie/Touch • Z per saltare • ▲▼ scala la scala", S.W/2, S.H/2 + 10, '#9fb3ff', 9, false);
  }
}

function loop(t){
  const dt = Math.min(32, t - t0);
  t0 = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Rendering helpers ----------
function rect(x,y,w,h,fill){
  ctx.fillStyle = fill;
  ctx.fillRect(x|0,y|0,w|0,h|0);
}
function textCenter(s, x, y, color, size=10, bold=false){
  ctx.save();
  ctx.fillStyle=color;
  ctx.font = (bold?'700 ':'') + size+'px monospace';
  ctx.textAlign='center';
  ctx.fillText(s, x, y);
  ctx.restore();
}
function drawBackdrop(){
  // starry grid-like arcade vibe
  for (let i=0;i<32;i++){
    const x = (i*11 + (performance.now()/40|0))%S.W;
    rect(x, 10 + (i*7)%S.H, 1,1, '#1e202b');
  }
}
function drawWorld(w){
  // Ladders
  for (const L of w.ladders){
    for (let y=0;y<L.h;y+=4){
      rect(L.x-2, L.y - y, 4, 2, '#7ec0ff');
    }
  }
  // Platforms
  for (const p of w.platforms){
    rect(p.x, p.y, p.w, p.h, '#f54747');
    // rails
    for (let x=0;x<p.w;x+=10){
      rect(p.x + x, p.y - 3, 6, 2, '#f99a9a');
    }
  }
}

// ---------- Collision helpers ----------
function aabb(A,B){ return !(A.x+A.w<B.x || A.x>B.x+B.w || A.y+A.h<B.y || A.y>B.y+B.h); }
function intersect(A,B){ return aabb(A,B); }

// ---------- Controls ----------
addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyZ'].includes(e.code)){
    keys.add(e.code);
    e.preventDefault();
  }
  if (e.code==='Space' || e.code==='Enter') togglePlay();
});
addEventListener('keyup', e => {
  keys.delete(e.code);
});

hud.btnPlay.addEventListener('click', togglePlay);
hud.btnRestart.addEventListener('click', ()=>{ score=0; lives=3; levelIndex=0; hud.level.textContent=1; hud.lives.textContent=3; hud.score.textContent="000000"; resetLevel(); running=true; });
hud.btnHelp.addEventListener('click', ()=>{
  alert("🎮 Come si gioca:\n— Frecce ◀︎▶︎ per muoverti\n— Z per saltare\n— ▲▼ per salire/scendere la scala\nEvita i barili, raggiungi la piattaforma dorata per passare di livello.\nLa difficoltà cresce a ogni livello: più barili e più veloci.\n\nPWA: installabile, funziona anche offline.");
});

for (const b of hud.mobileBtns){
  const code = b.dataset.k;
  b.addEventListener('touchstart', (e)=>{ keys.add(code); e.preventDefault(); }, {passive:false});
  b.addEventListener('touchend', (e)=>{ keys.delete(code); e.preventDefault(); }, {passive:false});
  b.addEventListener('mousedown', ()=>keys.add(code));
  b.addEventListener('mouseup',   ()=>keys.delete(code));
  b.addEventListener('mouseleave',()=>keys.delete(code));
}

function togglePlay(){
  running = !running;
  if (running){ t0 = performance.now(); }
}

// Update HUD score in a separate timer
setInterval(()=>{
  hud.score.textContent = String(score).padStart(6,'0');
}, 200);
