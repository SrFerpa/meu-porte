// ================= CONFIGURAÇÃO CENTRAL DE SPRITES (CLASSES, MOBS & BOSSES) =================
// Suporta folha única (src no topo) OU arquivos separados por animação (src dentro de idle/run/attack/hurt)!

var SPRITE_SHEETS_CONFIG = {
  // 1. CLASSES JOGÁVEIS (assets/)
 classes: {
  fighter: {
    drawHeight: 118,
    anims: {
      idle:   { src: 'assets/lutador_idle.png',   fps: 8  },
      run:    { src: 'assets/lutador_run.png',    fps: 12 },
      attack: { src: 'assets/lutador_attack.png', fps: 14 },
      hurt:   { src: 'assets/lutador_hit.png',    fps: 10 }
    }
  }
}

  // 2. MONSTROS E BOSSES (assets/) — chave = nome exato do monstro em data-mobs.js
  mobs: {
    // Exemplo:
    // 'Guardião Abissal': {
    //   drawHeight: 140,
    //   anims: {
    //     idle:   { src: 'assets/boss_idle.png',   fps: 8  },
    //     run:    { src: 'assets/boss_run.png',    fps: 10 },
    //     attack: { src: 'assets/boss_attack.png', fps: 13 }
    //   }
    // }
  }
};

// ================= MOTOR LEVE DE PRÉ-CARREGAMENTO E DESENHO DE SPRITES =================
var LOADED_SPRITE_IMAGES = {};

function registerSpriteImage(cacheKey, src, cfg) {
  if (!src || LOADED_SPRITE_IMAGES[cacheKey]) return;
  var img = new Image();
  var entry = { source: img, loaded: false, cfg: cfg, autoCols: 1 };
  img.onload = function() {
    entry.source = img;
    // Em tiras horizontais (1 linha), calcula quantos quadros quadrados cabem na largura automaticamente
    if (img.naturalHeight > 0 && img.naturalWidth >= img.naturalHeight) {
      entry.autoCols = Math.max(1, Math.round(img.naturalWidth / img.naturalHeight));
    }
    entry.loaded = true;
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
      if (cfg.src) {
        registerSpriteImage(group + ':' + key, cfg.src, cfg);
      }
      if (cfg.anims) {
        Object.keys(cfg.anims).forEach(function(animName) {
          var a = cfg.anims[animName];
          if (a && a.src) {
            registerSpriteImage(group + ':' + key + ':' + animName, a.src, cfg);
          }
        });
      }
    });
  });
}

function drawConfiguredSprite(ctx, group, key, animState, frameIndex, x, y, facing, glowColor) {
  var cfg = (SPRITE_SHEETS_CONFIG[group] || {})[key];
  if (!cfg || !cfg.anims) return false;

  var anim = cfg.anims[animState] ? cfg.anims[animState] : cfg.anims.idle;
  var usedState = cfg.anims[animState] ? animState : 'idle';
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
  var colIdx = (anim.startCol || 0) + (frameIndex % totalFrames);
  var rowIdx = anim.row || 0;

  var sx = colIdx * cellW;
  var sy = rowIdx * cellH;
  var sw = cellW;
  var sh = cellH;

  var drawH = cfg.drawHeight || 118;
  var drawW = drawH * (sw / sh);

  ctx.save();
  ctx.translate(x, y);

  var shouldFlip = cfg.flipFacing ? (facing > 0) : (facing < 0);
  if (shouldFlip) ctx.scale(-1, 1);

  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 13;
  }

  ctx.drawImage(srcImg, sx, sy, sw, sh, -drawW * 0.50, -drawH * 0.80, drawW, drawH);
  ctx.restore();
  return true;
}

preloadAllConfiguredSprites();
