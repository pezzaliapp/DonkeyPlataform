// ===== Mobile: starter + controlli touch minimi sul canvas =====
(() => {
  const canvas = document.getElementById('myCanvas') || document.querySelector('canvas');
  if (!canvas) return;

  const IS_MOBILE = matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window);

  // ---- Avvio con primo tap (supera schermate "Press Enter") ----
  let started = false;
  function fireKey(key, code) {
    const kd = new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true });
    const ku = new KeyboardEvent('keyup',   { key, code, bubbles: true, cancelable: true });
    document.dispatchEvent(kd); window.dispatchEvent(kd);
    document.dispatchEvent(ku); window.dispatchEvent(ku);
  }
  function startBridgeOnce() {
    if (started) return;
    started = true;

    try {
      if (typeof gameState !== 'undefined') {
        if (gameState === 'title' && typeof game?.startSelect === 'function') {
          game.startSelect({ key: 'Enter' });
        } else if (gameState === 'character' && typeof game?.startGame === 'function') {
          game.startGame({ key: 'Enter' });
        }
      }
    } catch (_) {}

    // Fallback universale
    fireKey('Enter','Enter');
    fireKey(' ','Space');

    // Sblocca audio su iOS
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { (window._ac = window._ac || new AC()).resume?.(); }
    } catch(_) {}
  }

  if (!IS_MOBILE) return; // su laptop non cambiamo nulla

  // ---- Controlli touch diretti sugli stati di Mario ----
  const g = (typeof game !== 'undefined') ? game : null;
  const m = g?.mario;
  if (!m) return;

  const K = m.keys || {}; // {w,a,s,d,space}.pressed se esiste
  let pressT0 = 0;
  let startX = 0, startY = 0;
  let moved = false;

  function dirClear() {
    if (K.a) K.a.pressed = false;
    if (K.d) K.d.pressed = false;
    m.movingLeft = false; m.movingRight = false;
  }
  function vertClear() {
    if (K.w) K.w.pressed = false;
    if (K.s) K.s.pressed = false;
    m.climbingUp = false; m.isClimbingDown = false;
  }
  function jumpPulse() {
    if (typeof m.jump === 'function') { m.jump(); return; }
    if (K.space) {
      K.space.pressed = true;
      setTimeout(()=>{ K.space.pressed = false; }, 120);
    } else {
      m.isJumping = true;
      setTimeout(()=>{ m.isJumping = false; }, 180);
    }
  }

  function getXY(e, rect){
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    const cx = (t ? t.clientX : e.clientX) - rect.left;
    const cy = (t ? t.clientY : e.clientY) - rect.top;
    return [cx, cy];
  }

  function onDown(e){
    e.preventDefault();
    startBridgeOnce();

    const rect = canvas.getBoundingClientRect();
    [startX, startY] = getXY(e, rect);
    pressT0 = performance.now();
    moved = false;

    const third = rect.width / 3;
    dirClear();

    if (startX < third) {
      if (K.a) K.a.pressed = true;
      m.movingLeft = true;  m.facingLeft = true;  m.facingRight = false;
    } else if (startX > rect.width - third) {
      if (K.d) K.d.pressed = true;
      m.movingRight = true; m.facingRight = true; m.facingLeft  = false;
    }
  }

  function onMove(e){
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const [x,y] = getXY(e, rect);
    if (Math.hypot(x - startX, y - startY) > 10) moved = true;

    const dy = y - startY;
    vertClear();
    if (dy < -14) { if (K.w) K.w.pressed = true;  m.climbingUp = true; }
    else if (dy > 14) { if (K.s) K.s.pressed = true;  m.isClimbingDown = true; }
  }

  function onUp(e){
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const dt = performance.now() - pressT0;

    // Tap rapido in zona centrale => salto
    if (!moved && dt < 180 && startX >= rect.width/3 && startX <= rect.width*2/3) {
      jumpPulse();
    }
    dirClear();
    vertClear();
  }

  // Pointer + fallback touch (per Safari vecchi)
  canvas.addEventListener('pointerdown',  onDown, {passive:false});
  canvas.addEventListener('pointermove',  onMove, {passive:false});
  canvas.addEventListener('pointerup',    onUp,   {passive:false});
  canvas.addEventListener('pointercancel',onUp,   {passive:false});

  canvas.addEventListener('touchstart', onDown, {passive:false});
  canvas.addEventListener('touchmove',  onMove, {passive:false});
  canvas.addEventListener('touchend',   onUp,   {passive:false});
})();
