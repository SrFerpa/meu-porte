// ================= CONFIGURAÇÃO CENTRAL DE SPRITES (CLASSES, MOBS & BOSSES) =================
// Sempre que adicionar uma imagem nova na pasta assets/, basta preencher a linha dela aqui!

var SPRITE_SHEETS_CONFIG = {
  // 1. CLASSES JOGÁVEIS (assets/chars/)
  classes: {
    fighter: {
      src: 'assets/chars/fighter.png',
      cols: 6,
      rows: 5,
      labelColRatio: 0.116, // Pula a coluna escrita IDLE/RUN/ATTACK à esquerda (0 se não tiver texto)
      drawHeight: 104,
      anims: {
        idle:   { row: 0, frames: 3, fps: 5  },
        run:    { row: 1, frames: 6, fps: 11 },
        jump:   { row: 2, frames: 3, fps: 8  },
        attack: { row: 3, frames: 6, fps: 15 },
        hurt:   { row: 4, frames: 4, fps: 10 }
      }
    }
    // Quando subir as outras classes, basta descomentar e ajustar:
    // defender: { src: 'assets/chars/defender.png', cols: 4, rows: 4, labelColRatio: 0, drawHeight: 96, anims: { idle: { row: 0, frames: 4, fps: 5 }, run: { row: 1, frames: 4, fps: 10 }, attack: { row: 2, frames: 4, fps: 14 }, hurt: { row: 3, frames: 4, fps: 10 } } },
    // ranger:   { src: 'assets/chars/ranger.png',   cols: 6, rows: 5, labelColRatio: 0.116, drawHeight: 100, anims: { idle: { row: 0, frames: 3, fps: 5 }, run: { row: 1, frames: 6, fps: 12 }, attack: { row: 3, frames: 6, fps: 16 }, hurt: { row: 4, frames: 4, fps: 10 } } },
    // archer:   { src: 'assets/chars/archer.png',   cols: 6, rows: 5, labelColRatio: 0.116, drawHeight: 100, anims: { idle: { row: 0, frames: 3, fps: 5 }, run: { row: 1, frames: 6, fps: 11 }, attack: { row: 3, frames: 6, fps: 15 }, hurt: { row: 4, frames: 4, fps: 10 } } },
    // mage:     { src: 'assets/chars/mage.png',     cols: 6, rows: 5, labelColRatio: 0.116, drawHeight: 100, anims: { idle: { row: 0, frames: 3, fps: 5 }, run: { row: 1, frames: 6, fps: 10 }, attack: { row: 3, frames: 6, fps: 14 }, hurt: { row: 4, frames: 4, fps: 10 } } },
    // priest:   { src: 'assets/chars/priest.png',   cols: 6, rows: 5, labelColRatio: 0.116, drawHeight: 100, anims: { idle: { row: 0, frames: 3, fps: 5 }, run: { row: 1, frames: 6, fps: 10 }, attack: { row: 3, frames: 6, fps: 14 }, hurt: { row: 4, frames: 4, fps: 10 } } }
  },

  // 2. MONSTROS E BOSSES (assets/mobs/) — chave = nome exato do monstro em data-mobs.js
  mobs: {
    // Exemplo:
    // 'Guardião Abissal': { src: 'assets/mobs/boss_abissal.png', cols: 6, rows: 4, labelColRatio: 0, drawHeight: 135, anims: { idle: { row: 0, frames: 4, fps: 5 }, run: { row: 1, frames: 6, fps: 9 }, attack: { row: 2, frames: 6, fps: 12 } } }
  }
};

// ================= MOTOR LEVE DE PRÉ-CARREGAMENTO E DESENHO DE SPRITES =================
var LOADED_SPRITE_IMAGES = {};

function preloadAllConfiguredSprites() {
  ['classes', 'mobs'].forEach(function(group) {
    var dict = SPRITE_SHEETS_CONFIG[group] || {};
    Object.keys(dict).forEach(function(key) {
      var cfg = dict[key];
      if (!cfg || !cfg.src) return;
      var img = new Image();
      var entry = { img: img, loaded: false, cfg: cfg };
      img.onload = function() { entry.loaded = true; };
      img.src = cfg.src;
      LOADED_SPRITE_IMAGES[group + ':' + key] = entry;
    });
  });
}

function drawConfiguredSprite(ctx, group, key, animState, frameIndex, x, y, facing, glowColor) {
  var entry = LOADED_SPRITE_IMAGES[group + ':' + key];
  if (!entry || !entry.loaded || !entry.img.naturalWidth) return false;

  var cfg = entry.cfg;
  var anim = (cfg.anims && cfg.anims[animState]) ? cfg.anims[animState] : cfg.anims.idle;
  if (!anim) return false;

  var W = entry.img.naturalWidth;
  var H = entry.img.naturalHeight;
  var leftMargin = W * (cfg.labelColRatio || 0);
  var gridW = W - leftMargin;
  var cellW = gridW / (cfg.cols || 1);
  var cellH = H / (cfg.rows || 1);

  var colIdx = frameIndex % (anim.frames || 1);
  var rowIdx = anim.row || 0;

  var padX = cfg.labelColRatio > 0 ? Math.max(3, W * 0.0035) : 1;
  var padY = cfg.labelColRatio > 0 ? Math.max(4, H * 0.006)  : 1;

  var sx = leftMargin + colIdx * cellW + padX;
  var sy = rowIdx * cellH + padY;
  var sw = cellW - padX * 2;
  var sh = cellH - padY * 2;

  var drawH = cfg.drawHeight || 100;
  var drawW = drawH * (sw / sh);

  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);

  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 13;
  }

  ctx.drawImage(entry.img, sx, sy, sw, sh, -drawW * 0.45, -drawH * 0.78, drawW, drawH);
  ctx.restore();
  return true;
}

preloadAllConfiguredSprites();
