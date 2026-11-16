// ================= CONFIGURAÇÃO CENTRAL DE SPRITES (CLASSES, MOBS & BOSSES) =================
// Sempre que adicionar uma imagem nova na pasta assets/, basta preencher a linha dela aqui!

var SPRITE_SHEETS_CONFIG = {
  // 1. CLASSES JOGÁVEIS (assets/)
  classes: {
    fighter: {
      src: 'assets/fighter.png',
      cols: 6,
      rows: 4.62, // Altura exata de cada fileira sem pegar o topo da fileira de baixo
      topOffsetRatio: 0.015, // Pequena margem no topo para não cortar o penacho do elmo
      bottomTrimRatio: 0.08, // Corta os últimos 8% da célula para nunca vazar a linha de baixo
      labelColRatio: 0,
      removeSolidBg: true,
      drawHeight: 112,
      anims: {
        idle:   { row: 0, startCol: 0, frames: 4, fps: 5  },
        run:    { row: 1, startCol: 0, frames: 3, fps: 10 },
        jump:   { row: 1, startCol: 3, frames: 3, fps: 8  },
        attack: { row: 2, startCol: 0, frames: 6, fps: 15 },
        hurt:   { row: 3, startCol: 0, frames: 3, fps: 10 }
      }
    }
    // Quando subir as outras classes em assets/, basta descomentar e ajustar:
    // defender: { src: 'assets/defender.png', cols: 6, rows: 4.62, topOffsetRatio: 0.015, bottomTrimRatio: 0.08, labelColRatio: 0, removeSolidBg: true, drawHeight: 108, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 3, fps: 10 }, attack: { row: 2, startCol: 0, frames: 6, fps: 14 }, hurt: { row: 3, startCol: 0, frames: 3, fps: 10 } } },
    // ranger:   { src: 'assets/ranger.png',   cols: 6, rows: 4.62, topOffsetRatio: 0.015, bottomTrimRatio: 0.08, labelColRatio: 0, removeSolidBg: true, drawHeight: 108, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 3, fps: 12 }, attack: { row: 2, startCol: 0, frames: 6, fps: 16 }, hurt: { row: 3, startCol: 0, frames: 3, fps: 10 } } },
    // archer:   { src: 'assets/archer.png',   cols: 6, rows: 4.62, topOffsetRatio: 0.015, bottomTrimRatio: 0.08, labelColRatio: 0, removeSolidBg: true, drawHeight: 108, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 3, fps: 11 }, attack: { row: 2, startCol: 0, frames: 6, fps: 15 }, hurt: { row: 3, startCol: 0, frames: 3, fps: 10 } } },
    // mage:     { src: 'assets/mage.png',     cols: 6, rows: 4.62, topOffsetRatio: 0.015, bottomTrimRatio: 0.08, labelColRatio: 0, removeSolidBg: true, drawHeight: 108, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 3, fps: 10 }, attack: { row: 2, startCol: 0, frames: 6, fps: 14 }, hurt: { row: 3, startCol: 0, frames: 3, fps: 10 } } },
    // priest:   { src: 'assets/priest.png',   cols: 6, rows: 4.62, topOffsetRatio: 0.015, bottomTrimRatio: 0.08, labelColRatio: 0, removeSolidBg: true, drawHeight: 108, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 3, fps: 10 }, attack: { row: 2, startCol: 0, frames: 6, fps: 14 }, hurt: { row: 3, startCol: 0, frames: 3, fps: 10 } } }
  },

  // 2. MONSTROS E BOSSES (assets/) — chave = nome exato do monstro em data-mobs.js
  mobs: {
    // Exemplo:
    // 'Guardião Abissal': { src: 'assets/boss_abissal.png', cols: 6, rows: 4, labelColRatio: 0, removeSolidBg: true, drawHeight: 140, anims: { idle: { row: 0, startCol: 0, frames: 4, fps: 5 }, run: { row: 1, startCol: 0, frames: 4, fps: 9 }, attack: { row: 2, startCol: 0, frames: 6, fps: 12 } } }
  }
};

// ================= MOTOR LEVE DE PRÉ-CARREGAMENTO, LIMPEZA DE FUNDO E DESENHO =================
var LOADED_SPRITE_IMAGES = {};

function stripBackgroundPixels(img) {
  try {
    var c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);

    var imgData = g.getImageData(0, 0, c.width, c.height);
    var d = imgData.data;

    var sampleIdx = (2 * c.width + 2) * 4;
    var bgR = d[sampleIdx], bgG = d[sampleIdx + 1], bgB = d[sampleIdx + 2];

    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], gr = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a === 0) continue;

      var distBg = Math.abs(r - bgR) + Math.abs(gr - bgG) + Math.abs(b - bgB);
      if (distBg <= 34) {
        d[i + 3] = 0;
        continue;
      }

      var maxC = Math.max(r, gr, b);
      var minC = Math.min(r, gr, b);
      var sat = maxC - minC;
      var lum = (r + gr + b) / 3;
      if (sat <= 8 && lum >= 115 && lum <= 145) {
        d[i + 3] = 0;
      }
    }

    g.putImageData(imgData, 0, 0);
    return c;
  } catch (e) {
    return img;
  }
}

function preloadAllConfiguredSprites() {
  ['classes', 'mobs'].forEach(function(group) {
    var dict = SPRITE_SHEETS_CONFIG[group] || {};
    Object.keys(dict).forEach(function(key) {
      var cfg = dict[key];
      if (!cfg || !cfg.src) return;
      var img = new Image();
      var entry = { source: img, loaded: false, cfg: cfg };
      img.onload = function() {
        entry.source = cfg.removeSolidBg ? stripBackgroundPixels(img) : img;
        entry.loaded = true;
      };
      img.src = cfg.src;
      LOADED_SPRITE_IMAGES[group + ':' + key] = entry;
    });
  });
}

function drawConfiguredSprite(ctx, group, key, animState, frameIndex, x, y, facing, glowColor) {
  var entry = LOADED_SPRITE_IMAGES[group + ':' + key];
  if (!entry || !entry.loaded || !entry.source) return false;

  var srcCanvas = entry.source;
  var W = srcCanvas.width || srcCanvas.naturalWidth;
  var H = srcCanvas.height || srcCanvas.naturalHeight;
  if (!W || !H) return false;

  var cfg = entry.cfg;
  var anim = (cfg.anims && cfg.anims[animState]) ? cfg.anims[animState] : cfg.anims.idle;
  if (!anim) return false;

  var leftMargin = W * (cfg.labelColRatio || 0);
  var topOffset = H * (cfg.topOffsetRatio || 0);
  var gridW = W - leftMargin;
  var cellW = gridW / (cfg.cols || 1);
  var cellH = H / (cfg.rows || 1);

  var startCol = anim.startCol || 0;
  var colIdx = startCol + (frameIndex % (anim.frames || 1));
  var rowIdx = anim.row || 0;

  var padX = Math.max(2, cellW * 0.02);
  var trimBottom = cellH * (cfg.bottomTrimRatio || 0);

  var sx = leftMargin + colIdx * cellW + padX;
  var sy = topOffset + rowIdx * cellH;
  var sw = cellW - padX * 2;
  var sh = Math.max(10, cellH - trimBottom);

  var drawH = cfg.drawHeight || 112;
  var drawW = drawH * (sw / sh);

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);

  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 13;
  }

  ctx.drawImage(srcCanvas, sx, sy, sw, sh, -drawW * 0.45, -drawH * 0.80, drawW, drawH);
  ctx.restore();
  return true;
}

preloadAllConfiguredSprites();
