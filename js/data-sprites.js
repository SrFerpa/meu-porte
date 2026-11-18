// ================= CONFIGURAÇÃO DE SPRITES DAS 8 CLASSES =================
// Todas as imagens devem estar na pasta: assets/
var CLASS_SPRITE_CONFIG = {
  // 1. Guardião Solar (10 ficheiros)
  solar_guard: {
    prefix: 'f1_bromemk2_',
    hasCast: true,
    scale: 1.0,
    files: {
      idle: 'assets/f1_bromemk2_idle.png',
      breathing: 'assets/f1_bromemk2_breathing.png',
      run: 'assets/f1_bromemk2_run.png',
      attack: 'assets/f1_bromemk2_attack.png',
      hit: 'assets/f1_bromemk2_hit.png',
      death: 'assets/f1_bromemk2_death.png',
      caststart: 'assets/f1_bromemk2_caststart.png',
      castloop: 'assets/f1_bromemk2_castloop.png',
      cast: 'assets/f1_bromemk2_cast.png',
      castend: 'assets/f1_bromemk2_castend.png'
    }
  },

  // 2. Ceifador Espectral (10 ficheiros)
  spectral_reaper: {
    prefix: 'f2_tier2general_',
    hasCast: true,
    scale: 1.0,
    files: {
      idle: 'assets/f2_tier2general_idle.png',
      breathing: 'assets/f2_tier2general_breathing.png',
      run: 'assets/f2_tier2general_run.png',
      attack: 'assets/f2_tier2general_attack.png',
      hit: 'assets/f2_tier2general_hit.png',
      death: 'assets/f2_tier2general_death.png',
      caststart: 'assets/f2_tier2general_caststart.png',
      castloop: 'assets/f2_tier2general_castloop.png',
      cast: 'assets/f2_tier2general_cast.png',
      castend: 'assets/f2_tier2general_castend.png'
    }
  },

  // 3. Valquíria Tempestuosa (6 ficheiros)
  storm_valkyrie: {
    prefix: 'f3_grandmasternoshrak_',
    hasCast: false,
    scale: 1.0,
    files: {
      idle: 'assets/f3_grandmasternoshrak_idle.png',
      breathing: 'assets/f3_grandmasternoshrak_breathing.png',
      run: 'assets/f3_grandmasternoshrak_run.png',
      attack: 'assets/f3_grandmasternoshrak_attack.png',
      hit: 'assets/f3_grandmasternoshrak_hit.png',
      death: 'assets/f3_grandmasternoshrak_death.png'
    }
  },

  // 4. Flagelo Abissal (10 ficheiros)
  abyssal_scourge: {
    prefix: 'f4_maehvmk2_',
    hasCast: true,
    scale: 1.0,
    files: {
      idle: 'assets/f4_maehvmk2_idle.png',
      breathing: 'assets/f4_maehvmk2_breathing.png',
      run: 'assets/f4_maehvmk2_run.png',
      attack: 'assets/f4_maehvmk2_attack.png',
      hit: 'assets/f4_maehvmk2_hit.png',
      death: 'assets/f4_maehvmk2_death.png',
      caststart: 'assets/f4_maehvmk2_caststart.png',
      castloop: 'assets/f4_maehvmk2_castloop.png',
      cast: 'assets/f4_maehvmk2_cast.png',
      castend: 'assets/f4_maehvmk2_castend.png'
    }
  },

  // 5. Colosso Telúrico (6 ficheiros)
  telluric_colossus: {
    prefix: 'f5_megabrontodon_',
    hasCast: false,
    scale: 1.15,
    files: {
      idle: 'assets/f5_megabrontodon_idle.png',
      breathing: 'assets/f5_megabrontodon_breathing.png',
      run: 'assets/f5_megabrontodon_run.png',
      attack: 'assets/f5_megabrontodon_attack.png',
      hit: 'assets/f5_megabrontodon_hit.png',
      death: 'assets/f5_megabrontodon_death.png'
    }
  },

  // 6. Serafim Dracônico (6 ficheiros)
  crystal_seraph: {
    prefix: 'f6_greatwhitenorth_',
    hasCast: false,
    scale: 1.05,
    files: {
      idle: 'assets/f6_greatwhitenorth_idle.png',
      breathing: 'assets/f6_greatwhitenorth_breathing.png',
      run: 'assets/f6_greatwhitenorth_run.png',
      attack: 'assets/f6_greatwhitenorth_attack.png',
      hit: 'assets/f6_greatwhitenorth_hit.png',
      death: 'assets/f6_greatwhitenorth_death.png'
    }
  },

  // 7. Arquilich Real (6 ficheiros)
  royal_lich: {
    prefix: 'neutral_trinitywing_',
    hasCast: false,
    scale: 1.08,
    files: {
      idle: 'assets/neutral_trinitywing_idle.png',
      breathing: 'assets/neutral_trinitywing_breathing.png',
      run: 'assets/neutral_trinitywing_run.png',
      attack: 'assets/neutral_trinitywing_attack.png',
      hit: 'assets/neutral_trinitywing_hit.png',
      death: 'assets/neutral_trinitywing_death.png'
    }
  },

  // 8. Soberano Glacial (6 ficheiros)
  glacial_lich: {
    prefix: 'boss_skyfalltyrant_',
    hasCast: false,
    scale: 1.08,
    files: {
      idle: 'assets/boss_skyfalltyrant_idle.png',
      breathing: 'assets/boss_skyfalltyrant_breathing.png',
      run: 'assets/boss_skyfalltyrant_run.png',
      attack: 'assets/boss_skyfalltyrant_attack.png',
      hit: 'assets/boss_skyfalltyrant_hit.png',
      death: 'assets/boss_skyfalltyrant_death.png'
    }
  }
};

// Cache carregada em memória pelo motor
var SPRITE_SHEETS = {};

function preloadAllClassSprites() {
  Object.keys(CLASS_SPRITE_CONFIG).forEach(function (classId) {
    var cfg = CLASS_SPRITE_CONFIG[classId];
    SPRITE_SHEETS[classId] = {};
    Object.keys(cfg.files).forEach(function (animKey) {
      var img = new Image();
      img.src = cfg.files[animKey];
      SPRITE_SHEETS[classId][animKey] = img;
    });
  });
}

// Dispara o pré-carregamento automaticamente
preloadAllClassSprites();
