// ================= CONFIGURAÇÃO CENTRAL DE SPRITES (CLASSES, MOBS & BOSSES) =================
var SPRITE_SHEETS_CONFIG = {
  classes: {
    fighter: {
      drawHeight: 150,
      flipFacing: false, // Mude para true se o personagem olhar para o lado invertido ao andar
      anims: {
        idle:   { src: 'assets/LUT_IDLE.PNG',   cols: 4, rows: 1, frames: 4, fps: 8,  loop: true },
        run:    { src: 'assets/LUT_RUN.PNG',    cols: 6, rows: 1, frames: 6, fps: 12, loop: true },
        attack: { src: 'assets/LUT_ATTACK.PNG', cols: 6, rows: 1, frames: 6, fps: 16, loop: false },
        hurt:   { src: 'assets/LUT_HIT.PNG',    cols: 4, rows: 1, frames: 4, fps: 10, loop: false }
      }
    }
  },
  mobs: {}
};

// ================= MOTOR LEVE DE PRÉ-CARREGAMENTO E DESENHO DE SPRITES =================
var LOADED_SPRITE_IMAGES = {};

function registerSpriteImage(cacheKey, src, cfg) {
  if (!src || LOADED_SPRITE_IMAGES[cacheKey]) return;
  var img = new Image();
  var entry = { source: img, loaded: false, cfg: cfg, autoCols: 1 };
  img.onload = function() {
    entry.source = img;
    if (img.naturalHeight > 0 && img.naturalWidth >= img.naturalHeight) {
      entry.autoCols = Math.max(1, Math.round(img.naturalWidth / img.naturalHeight));
    }
    entry.loaded = true;
  };
  img.onerror = function() {
    console.warn('Sprite não encontrado:', src);
  };
  img.src = src;
  LOADED_SPRITE_IMAGES[cacheKey] = entry;
}

function preloadAllConfiguredSprites() {
  ['classes', 'mobs'].forEach(function(group) {
    var dict = SPRITE_SHEETS_CONFIG[group] || {};
    Object.keys(dict).forEach(function(key) {
      var cfg = dict[key];
      if (!cfg) return;
      if (cfg.src) registerSpriteImage(group + ':' + key, cfg.src, cfg);
      if (cfg.anims) {
        Object.keys(cfg.anims).forEach(function(animName) {
          var a = cfg.anims[animName];
          if (a && a.src) registerSpriteImage(group + ':' + key + ':' + animName, a.src, cfg);
        });
      }
    });
  });
}

function drawConfiguredSprite(ctx, group, key, animState, frameIndex, x, y, facing, glowColor) {
  var cfg = (SPRITE_SHEETS_CONFIG[group] || {})[key];
  if (!cfg || !cfg.anims) return false;

  // Aceita tanto 'hurt' quanto 'hit' caso alguma parte do jogo chame pelo nome antigo
  var normalizedState = (animState === 'hit' && !cfg.anims.hit) ? 'hurt' : animState;
  var usedState = cfg.anims[normalizedState] ? normalizedState : 'idle';
  var anim = cfg.anims[usedState];
  if (!anim) return false;

  var entry = anim.src
    ? LOADED_SPRITE_IMAGES[group + ':' + key + ':' + usedState]
    : LOADED_SPRITE_IMAGES[group + ':' + key];

  if (!entry || !entry.loaded || !entry.source) return false;

  var srcImg = entry.source;
  var W = srcImg.naturalWidth || srcImg.width;
  var H = srcImg.naturalHeight || srcImg.height;
  if (!W || !H) return false;

  var cols = anim.cols || cfg.cols || entry.autoCols || 1;
  var rows = anim.rows || cfg.rows || 1;
  var totalFrames = anim.frames || cols;

  var cellW = W / cols;
  var cellH = H / rows;

  // Se loop for false (attack/hurt), trava no último frame em vez de reiniciar antes do estado mudar
  var safeFrame = (anim.loop === false)
    ? Math.min(frameIndex, totalFrames - 1)
    : (frameIndex % totalFrames);

  var colIdx = (anim.startCol || 0) + safeFrame;
  var rowIdx = anim.row || 0;

  var sx = colIdx * cellW;
  var sy = rowIdx * cellH;

  var drawH = anim.drawHeight || cfg.drawHeight || 150;
  var drawW = drawH * (cellW / cellH);

  ctx.save();
  ctx.translate(x, y);

  var shouldFlip = cfg.flipFacing ? (facing > 0) : (facing < 0);
  if (shouldFlip) ctx.scale(-1, 1);

  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 13;
  }

  ctx.drawImage(srcImg, sx, sy, cellW, cellH, -drawW * 0.50, -drawH * 0.72, drawW, drawH);
  ctx.restore();
  return true;
}

preloadAllConfiguredSprites();
