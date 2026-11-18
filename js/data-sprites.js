// ================= CONFIGURAÇÃO DE SPRITES (COMPATÍVEL COM ENGINE.JS) =================
var SPRITE_SHEETS_CONFIG = {
  classes: {
    // 1. Guardião Solar
    solar_guard: {
      scale: 1.35,
      offsetY: -12,
      anims: {
        idle:   { src: 'assets/f1_bromemk2_idle.png',   fps: 10 },
        run:    { src: 'assets/f1_bromemk2_run.png',    fps: 12 },
        attack: { src: 'assets/f1_bromemk2_attack.png', fps: 14 },
        hurt:   { src: 'assets/f1_bromemk2_hit.png',    fps: 12 },
        death:  { src: 'assets/f1_bromemk2_death.png',  fps: 10 },
        cast:   { src: 'assets/f1_bromemk2_cast.png',   fps: 12 }
      }
    },

    // 2. Ceifador Espectral
    spectral_reaper: {
      scale: 1.35,
      offsetY: -12,
      anims: {
        idle:   { src: 'assets/f2_tier2general_idle.png',   fps: 10 },
        run:    { src: 'assets/f2_tier2general_run.png',    fps: 12 },
        attack: { src: 'assets/f2_tier2general_attack.png', fps: 14 },
        hurt:   { src: 'assets/f2_tier2general_hit.png',    fps: 12 },
        death:  { src: 'assets/f2_tier2general_death.png',  fps: 10 },
        cast:   { src: 'assets/f2_tier2general_cast.png',   fps: 12 }
      }
    },

    // 3. Valquíria Tempestuosa
    storm_valkyrie: {
      scale: 1.35,
      offsetY: -12,
      anims: {
        idle:   { src: 'assets/f3_grandmasternoshrak_idle.png',   fps: 10 },
        run:    { src: 'assets/f3_grandmasternoshrak_run.png',    fps: 12 },
        attack: { src: 'assets/f3_grandmasternoshrak_attack.png', fps: 14 },
        hurt:   { src: 'assets/f3_grandmasternoshrak_hit.png',    fps: 12 },
        death:  { src: 'assets/f3_grandmasternoshrak_death.png',  fps: 10 }
      }
    },

    // 4. Flagelo Abissal
    abyssal_scourge: {
      scale: 1.35,
      offsetY: -12,
      anims: {
        idle:   { src: 'assets/f4_maehvmk2_idle.png',   fps: 10 },
        run:    { src: 'assets/f4_maehvmk2_run.png',    fps: 12 },
        attack: { src: 'assets/f4_maehvmk2_attack.png', fps: 14 },
        hurt:   { src: 'assets/f4_maehvmk2_hit.png',    fps: 12 },
        death:  { src: 'assets/f4_maehvmk2_death.png',  fps: 10 },
        cast:   { src: 'assets/f4_maehvmk2_cast.png',   fps: 12 }
      }
    },

    // 5. Colosso Telúrico
    telluric_colossus: {
      scale: 1.45,
      offsetY: -16,
      anims: {
        idle:   { src: 'assets/f5_megabrontodon_idle.png',   fps: 10 },
        run:    { src: 'assets/f5_megabrontodon_run.png',    fps: 12 },
        attack: { src: 'assets/f5_megabrontodon_attack.png', fps: 14 },
        hurt:   { src: 'assets/f5_megabrontodon_hit.png',    fps: 12 },
        death:  { src: 'assets/f5_megabrontodon_death.png',  fps: 10 }
      }
    },

    // 6. Serafim Dracônico
    crystal_seraph: {
      scale: 1.38,
      offsetY: -14,
      anims: {
        idle:   { src: 'assets/f6_greatwhitenorth_idle.png',   fps: 10 },
        run:    { src: 'assets/f6_greatwhitenorth_run.png',    fps: 12 },
        attack: { src: 'assets/f6_greatwhitenorth_attack.png', fps: 14 },
        hurt:   { src: 'assets/f6_greatwhitenorth_hit.png',    fps: 12 },
        death:  { src: 'assets/f6_greatwhitenorth_death.png',  fps: 10 }
      }
    },

    // 7. Arquilich Real
    royal_lich: {
      scale: 1.38,
      offsetY: -14,
      anims: {
        idle:   { src: 'assets/neutral_trinitywing_idle.png',   fps: 10 },
        run:    { src: 'assets/neutral_trinitywing_run.png',    fps: 12 },
        attack: { src: 'assets/neutral_trinitywing_attack.png', fps: 14 },
        hurt:   { src: 'assets/neutral_trinitywing_hit.png',    fps: 12 },
        death:  { src: 'assets/neutral_trinitywing_death.png',  fps: 10 }
      }
    },

    // 8. Soberano Glacial
    glacial_lich: {
      scale: 1.38,
      offsetY: -14,
      anims: {
        idle:   { src: 'assets/boss_skyfalltyrant_idle.png',   fps: 10 },
        run:    { src: 'assets/boss_skyfalltyrant_run.png',    fps: 12 },
        attack: { src: 'assets/boss_skyfalltyrant_attack.png', fps: 14 },
        hurt:   { src: 'assets/boss_skyfalltyrant_hit.png',    fps: 12 },
        death:  { src: 'assets/boss_skyfalltyrant_death.png',  fps: 10 }
      }
    }
  },
  mobs: {}
};

// Cache de imagens carregadas e grade detectada automaticamente
var _LOADED_SPRITE_CACHE = {};

function _getSpriteEntry(src) {
  if (_LOADED_SPRITE_CACHE[src]) return _LOADED_SPRITE_CACHE[src];
  var img = new Image();
  var entry = { img: img, ready: false, cols: 1, rows: 1, fw: 0, fh: 0, totalFrames: 1 };
  img.onload = function () {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    // Detecta automaticamente se é tira horizontal ou grelha (spritesheets Duelyst são quadrados ~80x80 ou ~100x100)
    var frameSize = Math.min(w, h);
    if (w > h * 1.4) {
      // Tira horizontal
      entry.cols = Math.max(1, Math.round(w / h));
      entry.rows = 1;
    } else if (w >= 160 && h >= 160) {
      // Grelha multi-linha (ex: 400x300 com frames 100x100 ou 320x240 com frames 80x80)
      var cell = (w % 100 === 0 && h % 100 === 0) ? 100 : (w % 80 === 0 && h % 80 === 0) ? 80 : 100;
      entry.cols = Math.max(1, Math.floor(w / cell));
      entry.rows = Math.max(1, Math.floor(h / cell));
    } else {
      entry.cols = 1;
      entry.rows = 1;
    }
    entry.fw = Math.floor(w / entry.cols);
    entry.fh = Math.floor(h / entry.rows);
    entry.totalFrames = Math.max(1, entry.cols * entry.rows);
    entry.ready = true;
  };
  img.src = src;
  _LOADED_SPRITE_CACHE[src] = entry;
  return entry;
}

// Pré-carrega todas as animações de todas as classes
(function preloadConfiguredSprites() {
  Object.keys(SPRITE_SHEETS_CONFIG.classes).forEach(function (archKey) {
    var anims = SPRITE_SHEETS_CONFIG.classes[archKey].anims;
    Object.keys(anims).forEach(function (st) {
      _getSpriteEntry(anims[st].src);
    });
  });
})();

// Função chamada pelo engine.js para desenhar o personagem animado
function drawConfiguredSprite(ctx, category, key, state, frame, x, y, facing, glowColor) {
  var group = SPRITE_SHEETS_CONFIG[category];
  if (!group || !group[key] || !group[key].anims) return false;

  var cfg = group[key];
  var anim = cfg.anims[state] || cfg.anims.idle;
  if (!anim || !anim.src) return false;

  var entry = _getSpriteEntry(anim.src);
  if (!entry.ready || !entry.img.complete || entry.fw <= 0) return false;

  var fIdx = (frame || 0) % entry.totalFrames;
  var col = fIdx % entry.cols;
  var row = Math.floor(fIdx / entry.cols);

  var sx = col * entry.fw;
  var sy = row * entry.fh;
  var scale = cfg.scale || 1.35;
  var dw = entry.fw * scale;
  var dh = entry.fh * scale;
  var offsetY = cfg.offsetY || -12;

  ctx.save();
  ctx.translate(x, y + offsetY);
  if (facing === -1 || facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Aura elemental ou +10 da arma
  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;
  }

  ctx.drawImage(
    entry.img,
    sx, sy, entry.fw, entry.fh,
    -dw / 2, -dh / 2, dw, dh
  );

  ctx.restore();
  return true;
}
