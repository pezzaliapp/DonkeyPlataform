const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
import {Mario} from "./Classes/Mario.js"
import {DK} from "./Classes/DK.js"
import {Barrel} from "./Classes/Barrel.js"
import {Platform} from "./Classes/Platform.js"
import {Ladder} from "./Classes/Ladder.js"

const canvas = document.getElementById("myCanvas")
const ctx = canvas.getContext("2d")
ctx.imageSmoothingEnabled = false
// === iPhone responsive + touch HUD ===
const BASE_W = 1510, BASE_H = 685;
function setupResponsiveCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  function viewportH(){
    const vv = window.visualViewport ? window.visualViewport.height : 0;
    return Math.max(vv||0, window.innerHeight||0, document.documentElement.clientHeight||0, screen.height||0);
  }
  function fit(){
    const w = Math.max(320, Math.floor(window.innerWidth||document.documentElement.clientWidth||screen.width||320));
    const h = Math.max(240, Math.floor(viewportH()));
    const scaleW = w / BASE_W;
    const scaleH = h / BASE_H;
    let scale = Math.min(scaleW, scaleH);
    if (!isFinite(scale) || scale <= 0) scale = 1;
    const cssW = Math.floor(BASE_W * scale);
    const cssH = Math.floor(BASE_H * scale);
    canvas.width  = Math.max(320, Math.floor(cssW * dpr));
    canvas.height = Math.max(240, Math.floor(cssH * dpr));
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const c = canvas.getContext('2d');
    c.setTransform(dpr,0,0,dpr,0,0);
    c.imageSmoothingEnabled = false;
    if (typeof game !== 'undefined' && game && typeof game.resize === 'function'){
      try { game.resize(cssW, cssH); } catch(e){ /* optional */ }
    }
  }
  window.addEventListener('resize', fit, {passive:true});
  window.addEventListener('orientationchange', fit, {passive:true});
  document.addEventListener('visibilitychange', fit, {passive:true});
  // delay to allow iOS UI to settle
  requestAnimationFrame(()=>{ setTimeout(fit, 50); });
  fit();
}
  window.addEventListener('resize', fit, {passive:true});
  fit();
}
function setupMobileControls(game){
  const wrap = document.createElement('div');
  wrap.className = 'hud-touch';
  wrap.innerHTML = `
    <button id="btnLeft">◀︎</button>
    <button id="btnUp">▲</button>
    <button id="btnJump">⤴︎</button>
    <button id="btnDown">▼</button>
    <button id="btnRight">▶︎</button>`;
  document.body.appendChild(wrap);
  const K = game.mario.keys;
  const bind = (id, onDown, onUp)=>{
    const b = document.getElementById(id);
    const d = (e)=>{ e.preventDefault(); onDown(); };
    const u = (e)=>{ e.preventDefault(); onUp(); };
    b.addEventListener('touchstart', d, {passive:false});
    b.addEventListener('touchend', u, {passive:false});
    b.addEventListener('mousedown', (e)=>{ onDown(); });
    b.addEventListener('mouseup',   (e)=>{ onUp(); });
    b.addEventListener('mouseleave',(e)=>{ onUp(); });
  };
  bind('btnLeft', ()=>K.a.pressed=true, ()=>K.a.pressed=false);
  bind('btnRight',()=>K.d.pressed=true, ()=>K.d.pressed=false);
  bind('btnUp',   ()=>K.w.pressed=true, ()=>K.w.pressed=false);
  bind('btnDown', ()=>K.s.pressed=true, ()=>K.s.pressed=false);
  bind('btnJump', ()=>K.space.pressed=true, ()=>K.space.pressed=false);
  canvas.addEventListener('pointerdown', ()=>{
    if (gameState === 'title') game.startSelect({key:'Enter'});
    else if (gameState === 'character') game.startGame({key:'Enter'});
  });
}


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
            } 
            
            else if (event.key === "d") {
                character = "Luigi"
                ctx.clearRect(840, 400, 85, 30)
                ctx.fillStyle = "lime"
                ctx.fillText("Luigi", 882, 420)
                ctx.fillStyle = "white"
                ctx.fillText("Mario", 632, 420)
            }
        }

        this.platforms = [
            new Platform(122, 138, 8),
            new Platform(245, 138, 8),
            new Platform(368, 138, 8),
            new Platform(491, 138, 8),
            new Platform(614, 138, 9), 
            
            new Platform(120, 660, 42),
            new Platform(752, 657, 8),
            new Platform(875, 654, 8),
            new Platform(998, 651, 8),
            new Platform(1121, 648, 8),
            new Platform(1244, 645, 8),

            new Platform(1121, 575, 8),
            new Platform(998, 572, 8),
            new Platform(875, 569, 8),
            new Platform(752, 566, 8),
            new Platform(629, 563, 8),
            new Platform(506, 561, 8),
            new Platform(383, 558, 8),
            new Platform(260, 555, 8),
            new Platform(182, 552, 5),

            new Platform(260, 483, 8),
            new Platform(383, 478, 8),
            new Platform(506, 473, 8),
            new Platform(629, 468, 8),
            new Platform(752, 463, 8),
            new Platform(875, 458, 8),
            new Platform(998, 453, 8),
            new Platform(1121, 448, 8),
            new Platform(1244, 443, 5),    

            new Platform(1121, 375, 8),
            new Platform(998, 370, 8),
            new Platform(875, 365, 8),
            new Platform(752, 360, 8),
            new Platform(629, 355, 8),
            new Platform(506, 350, 8),
            new Platform(383, 345, 8),
            new Platform(260, 340, 8),
            new Platform(182, 335, 5),

            new Platform(260, 268, 8),
            new Platform(383, 263, 8),
            new Platform(506, 258, 8),
            new Platform(629, 253, 8),
            new Platform(752, 248, 8),
            new Platform(875, 243, 8),
            new Platform(998, 238, 8),
            new Platform(1121, 233, 8),
            new Platform(1244, 228, 5),

            new Platform(1121, 158, 8),
            new Platform(998, 153, 8),
            new Platform(875, 148, 8),
            new Platform(752, 143, 8),

            new Platform(500, 57, 25),

            new Platform(408, 80, 6),
        ]

        this.ladders = [
            new Ladder(1125, 612, 2),
            new Ladder(350, 521, 2),
            new Ladder(1125, 413, 2),
            new Ladder(350, 306, 2),
            new Ladder(1125, 196, 2),
            new Ladder(680, 526, 3),
            new Ladder(760, 428, 4),
            new Ladder(845, 110, 3),
            new Ladder(410, 100, 7),
            new Ladder(470, 100, 7),
        ]
    }

    draw(ctx) {
        for(const ladder of this.ladders) {
            ladder.drawLadder(ctx)
        }

        for(const platform of this.platforms) {
            platform.drawPlatform(ctx)
        }
    }

    updateMario(elapsed) {
        this.mario.update(ctx, this.platforms, this.ladders, character, elapsed)
    }

    updateBarrels(elapsed) {

        if (this.dk.isThrowing) {
            this.barrels.push(new Barrel(350, 90, 27, 42))
        }

        for(const barrel of this.barrels) {
            barrel.update(ctx, this.platforms, this.mario, elapsed)
        }
    }

    updateDK(elapsed) {
        this.dk.update(ctx, elapsed)
    }

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

    resetGame() {
        // Reset player's position to the starting position
        this.mario.x = 200
        this.mario.y = 608

        // Reset the barrels
        this.barrels = []
    }

    loseLife() {
        for (let i = 0; i < this.barrels.length; i++) {
            if (this.barrels[i].dead) {
                this.lives -= 1
                this.resetGame()
            }
        }

        if (this.mario.y > this.height) {
            this.lives -= 1
            this.resetGame()
        }
    }

    playerLives() {
        ctx.fillStyle = 'white'
        const text = `Lives: ${this.lives}`
        const textWidth = ctx.measureText(text).width
        const x = canvas.width - textWidth - 10 
        ctx.fillText(text, x + 60, 20)
    }

    gameOver() {
        if (this.lives < 0) {
            gameState = "title"
        }

        else if (this.mario.y + this.mario.height == 57) {
            gameState = "title"
            if (this.score > this.highScore) {
                this.highScore = this.score
            }
        }
    }

    showTitleScreen() {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height)

        this.lives = 3
        this.score = 0
        this.resetGame()

        const img = new Image()
        img.src = './dk_title.png'

        img.onload = () => {
            // Draw the title
            const x = (this.width - 700) / 2
            ctx.drawImage(img, x, 10, 700, 400)            
        }
        
        ctx.fillStyle = 'white'
        ctx.font = '16px "Press Start 2P", Arial'
        ctx.textAlign = "center"
        ctx.fillText("Press Enter to Start", this.width / 2, 500)
        ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.width / 2, 600)
        
        // Add event listener for enter key press to start the game
        document.addEventListener("keydown", this.startSelect)
    }

    startSelect = (event) => {
        if (event.key === "Enter" && gameState === "title") {
            document.removeEventListener("keydown", this.startSelect)
            gameState = "character"
            this.characterSelect()
        }
    }

    characterSelect() {

        ctx.clearRect(0, 0, this.width, this.height)

        ctx.fillStyle = 'white'
        ctx.textAlign = "center"
        ctx.fillText("Select your character", this.width / 2, 200)

        ctx.drawImage(sprites, 38, 17, 15, 18, 600, 300, 60, 90)
        ctx.drawImage(sprites, 38, 53, 15, 18, 850, 300, 60, 90)

        ctx.fillText("Luigi", 882, 420)
        ctx.fillStyle = 'red'
        ctx.fillText("Mario", 632, 420)
        
        document.addEventListener("keydown", this.choose)

        document.addEventListener("keydown", (event) => this.startGame(event))
    }

    startGame(event) {
        if (event.key === "Enter" && gameState === "character") {

            // Remove event listener
            document.removeEventListener("keydown", (event) => this.startGame(event))
            document.removeEventListener("keydown", this.choose)
            
            gameState = "game"

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Call the update function to start the game loop
            update()
        }
    }

    pauseScreen() {
        const w = 550
        const h = 200
        const x = this.width / 2 - w / 2
        const y = this.height / 2 - h / 2

        const img = new Image()
        img.src = './pausemenu.png'

        ctx.drawImage(img, x, y, w, h)

        ctx.beginPath()
        ctx.fillStyle = 'yellow'
        ctx.textAlign = "center"
        ctx.fillText("— Paused —", this.width / 2, 400)
    }
}

window.addEventListener('keydown', function (e) {
    switch (e.key) {
        case "p":
            togglePause()
    }
})
    
function togglePause() {
    if (!paused) {
        paused = true
    } 
    
    else if (paused) {
        paused = false
    }
}
    
const game = new Game(canvas.width, canvas.height);
setupResponsiveCanvas();
setupMobileControls(game);

let previous
    
function update(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (gameState == "game") {

        const elapsed = timestamp - previous || 0
        previous = timestamp
        
        game.draw(ctx)
        game.drawPoints()
        game.playerLives()
        game.getPoints()
        game.loseLife()
        game.gameOver()
        requestAnimationFrame(update)
        
        
        if (!paused) {
            game.updateMario(elapsed)
            game.updateBarrels(elapsed)
            game.updateDK(elapsed)
        }

        else if (paused) {
            game.pauseScreen()
        }
    }

    else if (gameState == "title") {
        game.showTitleScreen()
    }
}

requestAnimationFrame(update)