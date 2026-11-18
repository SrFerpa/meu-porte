// ================= CONFIGURAÇÃO CENTRAL DE SPRITES (CLASSES, MOBS & BOSSES) =================
var SPRITE_SHEETS_CONFIG = {
  classes: {
    fighter: {
      drawHeight: 150,
      flipFacing: false,
      removeCheckerboard: true, // Remove automaticamente o fundo quadriculado cinza/preto
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

// ================= REMOVEDOR AUTOMÁTICO DE FUNDO QUADRICULADO =================
function stripCheckerboardToCanvas(img) {
  var w = img.naturalWidth || img.width;
  var h = img.naturalHeight || img.height;
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  var imgData = ctx.getImageData(0, 0, w, h);
  var data = imgData.data;

  // Coleta amostras dos quadrados claros e escuros do fundo nas bordas superiores
  var bgSamples = [];
  var sampleStep = Math.max(1, Math.floor(w / 80));
  for (var x = 0; x < w; x += sampleStep) {
    for (var y = 0; y < Math.min(20, h); y += 4) {
      var idx = (y * w + x) * 4;
      var r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a === 0) continue;
      // Verifica se é tom neutro (cinza/preto típico de quadriculado)
      var maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      if (maxDiff <= 14 && r < 140) {
        var alreadyAdded = bgSamples.some(function(s) {
          return Math.abs(s.r - r) <= 8 && Math.abs(s.g - g) <= 8 && Math.abs(s.b - b) <= 8;
        });
        if (!alreadyAdded) bgSamples.push({ r: r, g: g, b: b });
      }
    }
  }

  if (bgSamples.length === 0) return img;

  // Usa Flood Fill a partir de toda a borda externa para apagar só o fundo (sem furar o personagem)
  var visited = new Uint8Array(w * h);
  var stack = [];

  for (var bx = 0; bx < w; bx++) {
    stack.push(bx);
    stack.push((h - 1) * w + bx);
  }
  for (var by = 0; by < h; by++) {
    stack.push(by * w);
    stack.push(by * w + (w - 1));
  }

  function isBgColor(idx) {
    var r = data[idx], g = data[idx + 1], b = data[idx + 2];
    var maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff > 16) return false;
    for (var i = 0; i < bgSamples.length; i++) {
      var s = bgSamples[i];
      if (Math.abs(r - s.r) <= 16 && Math.abs(g - s.g) <= 16 && Math.abs(b - s.b) <= 16) {
        return true;
      }
    }
    return false;
  }

  while (stack.length > 0) {
    var pos = stack.pop();
    if (visited[pos]) continue;
    visited[pos] = 1;

    var pIdx = pos * 4;
    if (isBgColor(pIdx)) {
      data[pIdx + 3] = 0; // Aplica transparência real
      var px = pos % w;
      var py = (pos / w) | 0;
      if (px > 0) stack.push(pos - 1);
      if (px < w - 1) stack.push(pos + 1);
      if (py > 0) stack.push(pos - w);
      if (py < h - 1) stack.push(pos + w);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// ================= MOTOR LEVE DE PRÉ-CARREGAMENTO E DESENHO DE SPRITES =================
var LOADED_SPRITE_IMAGES = {};

function registerSpriteImage(cacheKey, src, cfg) {
  if (!src || LOADED_SPRITE_IMAGES[cacheKey]) return;
  var img = new Image();
  var entry = { source: img, loaded: false, cfg: cfg, autoCols: 1 };
  img.onload = function() {
    entry.source = cfg.removeCheckerboard ? stripCheckerboardToCanvas(img) : img;
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
