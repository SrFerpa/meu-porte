// ================= TABELA EXATA DE KILL RANKS (1 A 50.000 KILLS) =================
var SHAIYA_KILL_RANKS = [
  { kills: 1,     type: 'bar1',     bg: 'blue', pts: 3,  title: 'Recruta (1+ Kill)' },
  { kills: 50,    type: 'bar2',     bg: 'blue', pts: 5,  title: 'Soldado (50+ Kills)' },
  { kills: 300,   type: 'bar3',     bg: 'blue', pts: 8,  title: 'Cabo (300+ Kills)' },
  { kills: 1000,  type: 'chev1',    bg: 'blue', pts: 10, title: 'Sargento (1.000+ Kills)' },
  { kills: 5000,  type: 'chev2',    bg: 'blue', pts: 15, title: 'Tenente (5.000+ Kills)' },
  { kills: 10000, type: 'dia1',     bg: 'blue', pts: 20, title: 'Capitão (10.000+ Kills)' },
  { kills: 20000, type: 'dia2',     bg: 'blue', pts: 25, title: 'Major (20.000+ Kills)' },
  { kills: 30000, type: 'dia3',     bg: 'blue', pts: 30, title: 'Coronel (30.000+ Kills)' },
  { kills: 40000, type: 'starBlue', bg: 'blue', pts: 35, title: 'General (40.000+ Kills)' },
  { kills: 50000, type: 'starRed',  bg: 'red',  pts: 45, title: 'Marechal Supremo (50.000+ Kills)' }
];

function getKillRankInfo(kills) {
  var k = kills || 0;
  if (k < 1) return null;
  var current = null, rankNum = 0;
  for (var i = 0; i < SHAIYA_KILL_RANKS.length; i++) {
    if (k >= SHAIYA_KILL_RANKS[i].kills) {
      current = SHAIYA_KILL_RANKS[i];
      rankNum = i + 1;
    } else break;
  }
  return current ? { rankNum: rankNum, data: current } : null;
}

// Renderiza o medalhão circular no HUD e na Tela de Personagens
function renderKillRankBadgeHTML(kills) {
  var info = getKillRankInfo(kills);
  if (!info) return '';
  var d = info.data;
  var isRed = d.bg === 'red';
  var gradId = 'rkGrad_' + d.type + '_' + Math.floor(Math.random() * 10000);
  var cTop = isRed ? '#f97316' : '#38bdf8';
  var cMid = isRed ? '#dc2626' : '#0284c7';
  var cBot = isRed ? '#7f1d1d' : '#082f49';
  var stroke = isRed ? '#450a0a' : '#0c4a6e';

  var shapeSvg = '';
  if (d.type === 'bar1') {
    shapeSvg = '<rect x="6" y="9.5" width="10" height="3" rx="1" fill="#fef08a"/>';
  } else if (d.type === 'bar2') {
    shapeSvg = '<rect x="6" y="7" width="10" height="2.8" rx="1" fill="#fef08a"/>' +
               '<rect x="6" y="12.2" width="10" height="2.8" rx="1" fill="#fef08a"/>';
  } else if (d.type === 'bar3') {
    shapeSvg = '<rect x="6" y="5.5" width="10" height="2.4" rx="0.8" fill="#fef08a"/>' +
               '<rect x="6" y="9.8" width="10" height="2.4" rx="0.8" fill="#fef08a"/>' +
               '<rect x="6" y="14.1" width="10" height="2.4" rx="0.8" fill="#fef08a"/>';
  } else if (d.type === 'chev1') {
    shapeSvg = '<path d="M6 13.5 L11 8 L16 13.5" fill="none" stroke="#fef08a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (d.type === 'chev2') {
    shapeSvg = '<path d="M6 11 L11 6 L16 11" fill="none" stroke="#fef08a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>' +
               '<path d="M6 15.5 L11 10.5 L16 15.5" fill="none" stroke="#fef08a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>';
  } else if (d.type === 'dia1') {
    shapeSvg = '<polygon points="11,5 15.5,11 11,17 6.5,11" fill="#fef08a"/>';
  } else if (d.type === 'dia2') {
    shapeSvg = '<polygon points="8,4.5 11.2,8.5 8,12.5 4.8,8.5" fill="#fef08a"/>' +
               '<polygon points="14,9.5 17.2,13.5 14,17.5 10.8,13.5" fill="#fef08a"/>';
  } else if (d.type === 'dia3') {
    shapeSvg = '<polygon points="11,4 13.8,7.5 11,11 8.2,7.5" fill="#fef08a"/>' +
               '<polygon points="7,10.5 9.8,14 7,17.5 4.2,14" fill="#fef08a"/>' +
               '<polygon points="15,10.5 17.8,14 15,17.5 12.2,14" fill="#fef08a"/>';
  } else {
    shapeSvg = '<polygon points="11,4 13.1,8.3 17.8,9 14.4,12.3 15.2,17 11,14.8 6.8,17 7.6,12.3 4.2,9 8.9,8.3" fill="#fef08a"/>';
  }

  return '<span class="shaiya-medal-wrap" title="Rank ' + info.rankNum + ': ' + d.title + '">' +
    '<svg width="20" height="20" viewBox="0 0 22 22" style="display:block;">' +
      '<defs><radialGradient id="' + gradId + '" cx="35%" cy="30%" r="70%">' +
        '<stop offset="0%" stop-color="' + cTop + '"/>' +
        '<stop offset="60%" stop-color="' + cMid + '"/>' +
        '<stop offset="100%" stop-color="' + cBot + '"/>' +
      '</radialGradient></defs>' +
      '<circle cx="11" cy="11" r="9.8" fill="url(#' + gradId + ')" stroke="' + stroke + '" stroke-width="1.6"/>' +
      '<circle cx="11" cy="11" r="8.2" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>' +
      shapeSvg +
    '</svg>' +
  '</span>';
}

// Desenha o medalhão circular acima do personagem no Canvas 2.5D
function drawShaiyaRankBadgeOnCanvas(ctx, rankInfo, rightX, centerY) {
  if (!rankInfo) return 0;
  var d = rankInfo.data;
  var r = 8.5;
  var cx = rightX - r;
  var cy = centerY;
  var isRed = d.bg === 'red';

  ctx.save();
  var grad = ctx.createRadialGradient(cx - 2.5, cy - 2.5, 1, cx, cy, r);
  if (isRed) {
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.6, '#dc2626');
    grad.addColorStop(1, '#7f1d1d');
  } else {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#0284c7');
    grad.addColorStop(1, '#082f49');
  }

  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = isRed ? '#450a0a' : '#0c4a6e';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#fef08a';

  if (d.type === 'bar1') {
    ctx.fillRect(cx - 4, cy - 1.2, 8, 2.4);
  } else if (d.type === 'bar2') {
    ctx.fillRect(cx - 4, cy - 3.2, 8, 2.1);
    ctx.fillRect(cx - 4, cy + 1.1, 8, 2.1);
  } else if (d.type === 'bar3') {
    ctx.fillRect(cx - 4, cy - 4.4, 8, 1.8);
    ctx.fillRect(cx - 4, cy - 0.9, 8, 1.8);
    ctx.fillRect(cx - 4, cy + 2.6, 8, 1.8);
  } else if (d.type === 'chev1') {
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 4, cy + 2); ctx.lineTo(cx, cy - 2.5); ctx.lineTo(cx + 4, cy + 2); ctx.stroke();
  } else if (d.type === 'chev2') {
    ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx, cy - 4); ctx.lineTo(cx + 4, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 4, cy + 3.8); ctx.lineTo(cx, cy - 0.2); ctx.lineTo(cx + 4, cy + 3.8); ctx.stroke();
  } else if (d.type === 'dia1') {
    ctx.beginPath(); ctx.moveTo(cx, cy - 4.5); ctx.lineTo(cx + 3.8, cy); ctx.lineTo(cx, cy + 4.5); ctx.lineTo(cx - 3.8, cy); ctx.closePath(); ctx.fill();
  } else if (d.type === 'dia2') {
    [[-2.4, -2], [2.4, 2]].forEach(function(off) {
      ctx.beginPath(); ctx.moveTo(cx + off[0], cy + off[1] - 3); ctx.lineTo(cx + off[0] + 2.5, cy + off[1]); ctx.lineTo(cx + off[0], cy + off[1] + 3); ctx.lineTo(cx + off[0] - 2.5, cy + off[1]); ctx.closePath(); ctx.fill();
    });
  } else if (d.type === 'dia3') {
    [[0, -3], [-3.2, 2.2], [3.2, 2.2]].forEach(function(off) {
      ctx.beginPath(); ctx.moveTo(cx + off[0], cy + off[1] - 2.6); ctx.lineTo(cx + off[0] + 2.2, cy + off[1]); ctx.lineTo(cx + off[0], cy + off[1] + 2.6); ctx.lineTo(cx + off[0] - 2.2, cy + off[1]); ctx.closePath(); ctx.fill();
    });
  } else {
    ctx.beginPath();
    for (var s = 0; s < 5; s++) {
      var a1 = (s * 72 - 90) * Math.PI / 180;
      var a2 = (s * 72 + 36 - 90) * Math.PI / 180;
      if (s === 0) ctx.moveTo(cx + Math.cos(a1) * 5.2, cy + Math.sin(a1) * 5.2);
      else ctx.lineTo(cx + Math.cos(a1) * 5.2, cy + Math.sin(a1) * 5.2);
      ctx.lineTo(cx + Math.cos(a2) * 2.2, cy + Math.sin(a2) * 2.2);
    }
    ctx.closePath(); ctx.fill();
  }

  ctx.restore();
  return r * 2;
}

// ================= 8 NOVAS CLASSES EXCLUSIVAS (SPRITES + DINÂMICA SHAIYA) =================
var ARCHETYPES = {
  // -------------------- FACÇÃO: ALIANÇA DA LUZ (LIGHT) --------------------
  solar_guard: {
    faction: 'light',
    lightName: 'Guardião Solar', furyName: 'Guardião Solar',
    raceLight: 'Solaris', raceFury: 'Solaris',
    combatType: 'Corpo a Corpo (Perto)',
    roleTag: 'Tanque / Vanguarda Solar',
    icon: '🛡️', color: '#f5c84c', armorColor: '#b45309', trimColor: '#fef08a',
    atkStyle: 'phys', resourceType: 'sp', range: 100,
    autoStat: 'rec', autoStatLabel: '+1 REC / Nível',
    weaponRuleLabel: 'Armadura Pesada Dourada & Machados Duplos Flamejantes',
    baseStats: { str: 14, dex: 9, rec: 20, int: 6, wis: 10, luc: 7 },
    lightLore: 'Bastião blindado pela luz sagrada. Absorve impactos massivos na linha de frente e incinera inimigos com seus machados solares.',
    furyLore: 'Bastião blindado pela luz sagrada. Absorve impactos massivos na linha de frente e incinera inimigos com seus machados solares.',
    skills: [
      { name: 'Corte Incandescente',  icon: '🪓', mult: 1.35, cost: 10, res: 'sp', cd: 1.1, range: 105, color: '#fb923c', vfx: 'solar_slash', dot: 0.35 },
      { name: 'Égide do Sol Nascente',icon: '🛡️', mult: 0,    cost: 20, res: 'sp', cd: 7.5, range: 0,   color: '#fde047', vfx: 'solar_shield', heal: 0.25, buff: { id: 'def', label: '☀️ +35% DEF', dur: 10 } },
      { name: 'Brado da Vanguarda',   icon: '📯', mult: 1.25, cost: 18, res: 'sp', cd: 5.5, range: 140, color: '#facc15', vfx: 'solar_roar', aoe: true },
      { name: 'Impacto Sísmico Solar',icon: '🌋', mult: 2.15, cost: 28, res: 'sp', cd: 6.0, range: 135, color: '#f97316', vfx: 'solar_quake', aoe: true, stun: 1.6 },
      { name: 'Aura Inabalável',      icon: '🔥', mult: 0,    cost: 26, res: 'sp', cd: 8.5, range: 0,   color: '#fef08a', vfx: 'solar_aura', heal: 0.32, buff: { id: 'atk', label: '🔥 +20% ATQ/DEF', dur: 10 } },
      { name: 'Julgamento do Zênite', icon: '☀️', mult: 3.30, cost: 42, res: 'sp', cd: 10.0,range: 145, color: '#eab308', vfx: 'solar_zenith', aoe: true, heal: 0.15 }
    ]
  },

  storm_valkyrie: {
    faction: 'light',
    lightName: 'Valquíria Tempestuosa', furyName: 'Valquíria Tempestuosa',
    raceLight: 'Serafita', raceFury: 'Serafita',
    combatType: 'Corpo a Corpo / Médio Alcance',
    roleTag: 'Duelista Alada / Perfuradora',
    icon: '⚡', color: '#38bdf8', armorColor: '#1e293b', trimColor: '#facc15',
    atkStyle: 'phys', resourceType: 'sp', range: 115,
    autoStat: 'dex', autoStatLabel: '+1 DES / Nível',
    weaponRuleLabel: 'Armadura Média Alada & Lança-Espada Relampejante',
    baseStats: { str: 14, dex: 19, rec: 10, int: 8, wis: 8, luc: 13 },
    lightLore: 'Guerreira alada abençoada pelos céus. Atravessa o campo de batalha na velocidade do raio perfurando defesas inimigas.',
    furyLore: 'Guerreira alada abençoada pelos céus. Atravessa o campo de batalha na velocidade do raio perfurando defesas inimigas.',
    skills: [
      { name: 'Estocada Relampejante',    icon: '⚡', mult: 1.40, cost: 10, res: 'sp', cd: 1.0, range: 120, color: '#38bdf8', vfx: 'storm_thrust' },
      { name: 'Voo das Valquírias',       icon: '🪽', mult: 1.90, cost: 18, res: 'sp', cd: 4.0, range: 250, color: '#7dd3fc', vfx: 'storm_dash', dash: true },
      { name: 'Cadeia de Raios',          icon: '🌩️', mult: 2.05, cost: 24, res: 'sp', cd: 5.0, range: 220, color: '#0284c7', vfx: 'storm_chain', aoe: true },
      { name: 'Barreira Estática',        icon: '💠', mult: 0,    cost: 22, res: 'sp', cd: 8.0, range: 0,   color: '#bae6fd', vfx: 'storm_static', buff: { id: 'eva', label: '⚡ +30% Vel/Esq', dur: 10 } },
      { name: 'Chuva de Lanças Celestes', icon: '🔱', mult: 2.45, cost: 32, res: 'sp', cd: 6.5, range: 170, color: '#eab308', vfx: 'storm_lances', aoe: true },
      { name: 'Fúria da Tempestade',      icon: '⛈️', mult: 3.55, cost: 44, res: 'sp', cd: 9.5, range: 150, color: '#00d4ff', vfx: 'storm_meteor', aoe: true, stun: 1.5 }
    ]
  },

  telluric_colossus: {
    faction: 'light',
    lightName: 'Colosso Telúrico', furyName: 'Colosso Telúrico',
    raceLight: 'Titã Ancestral', raceFury: 'Titã Ancestral',
    combatType: 'Médio / Longo Alcance',
    roleTag: 'Suporte Colossal / Tanque Mágico',
    icon: '🏔️', color: '#2dd4bf', armorColor: '#065f46', trimColor: '#fbbf24',
    atkStyle: 'magic', resourceType: 'mp', range: 290,
    autoStat: 'wis', autoStatLabel: '+1 SAB / Nível',
    weaponRuleLabel: 'Carapaça Rúnica & Orbe Solar Flutuante',
    baseStats: { str: 8, dex: 6, rec: 19, int: 14, wis: 18, luc: 7 },
    lightLore: 'Titã ancestral que carrega montanhas e um sol vivo nas costas. Protege aliados com auras telúricas e devasta áreas inteiras.',
    furyLore: 'Titã ancestral que carrega montanhas e um sol vivo nas costas. Protege aliados com auras telúricas e devasta áreas inteiras.',
    skills: [
      { name: 'Raio do Orbe Solar',      icon: '🌞', mult: 1.40, cost: 11, res: 'mp', cd: 1.2, range: 300, color: '#fbbf24', vfx: 'telluric_beam', proj: true },
      { name: 'Pisada Tectônica',        icon: '🏔️', mult: 1.95, cost: 22, res: 'mp', cd: 5.0, range: 165, color: '#2dd4bf', vfx: 'telluric_stomp', aoe: true, stun: 1.4 },
      { name: 'Bastião da Montanha',     icon: '🛡️', mult: 0,    cost: 24, res: 'mp', cd: 8.5, range: 0,   color: '#14b8a6', vfx: 'telluric_bastion', buff: { id: 'def', label: '🏔️ +40% DEF', dur: 12 } },
      { name: 'Ressurgência Cristalina', icon: '💚', mult: 0,    cost: 28, res: 'mp', cd: 5.5, range: 0,   color: '#5eead4', vfx: 'telluric_heal', heal: 0.45 },
      { name: 'Erupção de Cristais',     icon: '💎', mult: 2.40, cost: 34, res: 'mp', cd: 6.5, range: 260, color: '#0d9488', vfx: 'telluric_crystals', aoe: true, stun: 1.8 },
      { name: 'Supernova Telúrica',      icon: '💥', mult: 3.45, cost: 48, res: 'mp', cd: 10.0,range: 240, color: '#fde047', vfx: 'telluric_nova', aoe: true, heal: 0.25 }
    ]
  },

  crystal_seraph: {
    faction: 'light',
    lightName: 'Serafim Dracônico', furyName: 'Serafim Dracônico',
    raceLight: 'Draconato', raceFury: 'Draconato',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Mago Elemental / Artilharia',
    icon: '🐉', color: '#06b6d4', armorColor: '#164e63', trimColor: '#67e8f9',
    atkStyle: 'magic', resourceType: 'mp', range: 340,
    autoStat: 'int', autoStatLabel: '+1 INT / Nível',
    weaponRuleLabel: 'Escamas Dracônicas Leves & Asas de Cristal',
    baseStats: { str: 6, dex: 14, rec: 8, int: 20, wis: 14, luc: 10 },
    lightLore: 'Híbrido dracônico de asas cristalinas. Dispara rajadas arcanas cortantes e sopros glaciais à distância antes que o inimigo se aproxime.',
    furyLore: 'Híbrido dracônico de asas cristalinas. Dispara rajadas arcanas cortantes e sopros glaciais à distância antes que o inimigo se aproxime.',
    skills: [
      { name: 'Rajada de Penas de Cristal', icon: '💎', mult: 1.45, cost: 11, res: 'mp', cd: 1.1, range: 345, color: '#22d3ee', vfx: 'crystal_feathers', proj: true },
      { name: 'Sopro Dracônico Glacial',    icon: '❄️', mult: 2.00, cost: 22, res: 'mp', cd: 4.5, range: 260, color: '#67e8f9', vfx: 'crystal_breath', aoe: true, stun: 1.4 },
      { name: 'Ascensão Alada',             icon: '🪽', mult: 1.65, cost: 20, res: 'mp', cd: 5.5, range: 220, color: '#a5f3fc', vfx: 'crystal_ascend', dash: true },
      { name: 'Escamas Prismáticas',        icon: '💠', mult: 0,    cost: 24, res: 'mp', cd: 8.5, range: 0,   color: '#06b6d4', vfx: 'crystal_scales', buff: { id: 'atk', label: '💎 +30% Magia/Def', dur: 10 } },
      { name: 'Lança de Safira',            icon: '🔷', mult: 2.75, cost: 34, res: 'mp', cd: 6.5, range: 350, color: '#0891b2', vfx: 'crystal_lance', proj: true },
      { name: 'Tempestade do Serafim',      icon: '🌨️', mult: 3.80, cost: 50, res: 'mp', cd: 10.0,range: 340, color: '#00f2fe', vfx: 'crystal_storm', aoe: true, stun: 2.0 }
    ]
  },

  // -------------------- FACÇÃO: UNIÃO DA FÚRIA (DARK) --------------------
  spectral_reaper: {
    faction: 'fury',
    lightName: 'Ceifador Espectral', furyName: 'Ceifador Espectral',
    raceLight: 'Espectro', raceFury: 'Espectro',
    combatType: 'Corpo a Corpo (Perto)',
    roleTag: 'Assassino / DPS Crítico Letal',
    icon: '⚔️', color: '#10b981', armorColor: '#881337', trimColor: '#34d399',
    atkStyle: 'phys', resourceType: 'sp', range: 95,
    autoStat: 'luc', autoStatLabel: '+1 SOR / Nível',
    weaponRuleLabel: 'Armadura Leve Carmesim, Lâminas & Foices Etéreas',
    baseStats: { str: 16, dex: 16, rec: 8, int: 6, wis: 7, luc: 19 },
    lightLore: 'Executor veloz que combina lâminas venenosas e foices espectrais. Especialista em emboscadas letais e golpes críticos sucessivos.',
    furyLore: 'Executor veloz que combina lâminas venenosas e foices espectrais. Especialista em emboscadas letais e golpes críticos sucessivos.',
    skills: [
      { name: 'Laceração Venenosa',    icon: '🗡️', mult: 1.40, cost: 10, res: 'sp', cd: 1.0, range: 95,  color: '#10b981', vfx: 'reaper_slash', dot: 0.45 },
      { name: 'Passo Fantasma',        icon: '👻', mult: 1.85, cost: 18, res: 'sp', cd: 4.0, range: 240, color: '#34d399', vfx: 'reaper_blink', dash: true },
      { name: 'Giro das Foices Etéreas',icon: '🌀', mult: 2.20, cost: 24, res: 'sp', cd: 5.0, range: 140, color: '#059669', vfx: 'reaper_scythes', aoe: true },
      { name: 'Marca da Execução',     icon: '💀', mult: 0,    cost: 20, res: 'sp', cd: 7.5, range: 0,   color: '#6ee7b7', vfx: 'reaper_mark', buff: { id: 'crit', label: '💚 +35% Crítico', dur: 10 } },
      { name: 'Frenesi Carmesim',      icon: '🩸', mult: 2.50, cost: 30, res: 'sp', cd: 6.5, range: 105, color: '#f43f5e', vfx: 'reaper_frenzy', buff: { id: 'eva', label: '⚔️ +25% Esquiva', dur: 8 } },
      { name: 'Colheita de Almas',     icon: '☠️', mult: 3.85, cost: 42, res: 'sp', cd: 9.5, range: 115, color: '#00ffaa', vfx: 'reaper_harvest', aoe: true }
    ]
  },

  abyssal_scourge: {
    faction: 'fury',
    lightName: 'Flagelo Abissal', furyName: 'Flagelo Abissal',
    raceLight: 'Abissal', raceFury: 'Abissal',
    combatType: 'Médio Alcance (Chicote)',
    roleTag: 'Lutador Sombrio / Drenagem',
    icon: '🔥', color: '#f43f5e', armorColor: '#4c0519', trimColor: '#38bdf8',
    atkStyle: 'phys', resourceType: 'sp', range: 155,
    autoStat: 'str', autoStatLabel: '+1 FOR / Nível',
    weaponRuleLabel: 'Armadura Demoníaca & Chicote de Fogo Carmesim',
    baseStats: { str: 18, dex: 11, rec: 15, int: 12, wis: 8, luc: 8 },
    lightLore: 'Soberano das profundezas que domina o combate a média distância. Puxa alvos com seu chicote flamejante e drena sua vitalidade.',
    furyLore: 'Soberano das profundezas que domina o combate a média distância. Puxa alvos com seu chicote flamejante e drena sua vitalidade.',
    skills: [
      { name: 'Açoite Infernal',       icon: '🔥', mult: 1.40, cost: 10, res: 'sp', cd: 1.1, range: 165, color: '#f43f5e', vfx: 'abyss_whip', dot: 0.40 },
      { name: 'Corrente do Abismo',    icon: '⛓️', mult: 1.80, cost: 18, res: 'sp', cd: 4.5, range: 240, color: '#e11d48', vfx: 'abyss_pull', stun: 1.5 },
      { name: 'Sifão de Vitalidade',   icon: '🩸', mult: 1.95, cost: 24, res: 'sp', cd: 5.5, range: 170, color: '#c026d3', vfx: 'abyss_siphon', heal: 0.35, aoe: true },
      { name: 'Chamas da Ruína',       icon: '🌋', mult: 2.25, cost: 28, res: 'sp', cd: 6.0, range: 160, color: '#be123c', vfx: 'abyss_ruin', aoe: true, dot: 0.50 },
      { name: 'Pacto Demoníaco',       icon: '😈', mult: 0,    cost: 24, res: 'sp', cd: 8.5, range: 0,   color: '#9333ea', vfx: 'abyss_pact', buff: { id: 'atk', label: '🔥 +35% ATQ Abissal', dur: 11 } },
      { name: 'Cataclismo do Submundo',icon: '💥', mult: 3.60, cost: 44, res: 'sp', cd: 10.0,range: 185, color: '#ff1e56', vfx: 'abyss_cataclysm', aoe: true }
    ]
  },

  royal_lich: {
    faction: 'fury',
    lightName: 'Arquilich Real', furyName: 'Arquilich Real',
    raceLight: 'Morto-Vivo', raceFury: 'Morto-Vivo',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Mago Sombrio / Necromante',
    icon: '💀', color: '#a855f7', armorColor: '#3b0764', trimColor: '#facc15',
    atkStyle: 'magic', resourceType: 'mp', range: 330,
    autoStat: 'int', autoStatLabel: '+1 INT / Nível',
    weaponRuleLabel: 'Manto Real Sombrio & Cajado de Garra Arcana',
    baseStats: { str: 6, dex: 9, rec: 8, int: 20, wis: 18, luc: 11 },
    lightLore: 'Mestre da magia proibida. Enfia maldições sombrias nos inimigos, drena energia vital e invoca espíritos do submundo.',
    furyLore: 'Mestre da magia proibida. Enfia maldições sombrias nos inimigos, drena energia vital e invoca espíritos do submundo.',
    skills: [
      { name: 'Garra da Ruína Arcana',   icon: '🔮', mult: 1.45, cost: 12, res: 'mp', cd: 1.2, range: 335, color: '#a855f7', vfx: 'lich_claw', proj: true },
      { name: 'Maldição da Decadência',  icon: '☠️', mult: 1.90, cost: 20, res: 'mp', cd: 4.5, range: 320, color: '#7e22ce', vfx: 'lich_curse', aoe: true, dot: 0.55 },
      { name: 'Colheita de Mana',        icon: '💧', mult: 1.65, cost: 15, res: 'mp', cd: 6.0, range: 280, color: '#6366f1', vfx: 'lich_drain', heal: 0.25 },
      { name: 'Legião Espectral',        icon: '👻', mult: 2.45, cost: 32, res: 'mp', cd: 6.5, range: 330, color: '#9333ea', vfx: 'lich_legion', proj: true, aoe: true },
      { name: 'Coroa do Soberano Morto', icon: '👑', mult: 0,    cost: 26, res: 'mp', cd: 8.5, range: 0,   color: '#eab308', vfx: 'lich_crown', buff: { id: 'atk', label: '👑 +35% Magia', dur: 11 } },
      { name: 'Vórtice do Abismo Real',  icon: '🌑', mult: 3.85, cost: 52, res: 'mp', cd: 10.5,range: 340, color: '#c084fc', vfx: 'lich_vortex', aoe: true }
    ]
  },

  glacial_lich: {
    faction: 'fury',
    lightName: 'Soberano Glacial', furyName: 'Soberano Glacial',
    raceLight: 'Espectro Gélido', raceFury: 'Espectro Gélido',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Controlador Arcano / Congelamento',
    icon: '❄️', color: '#93c5fd', armorColor: '#1e3a8a', trimColor: '#e0f2fe',
    atkStyle: 'magic', resourceType: 'mp', range: 330,
    autoStat: 'int', autoStatLabel: '+1 INT / Nível',
    weaponRuleLabel: 'Vestes Espectrais Gélidas & Cetro de Garra Glacial',
    baseStats: { str: 6, dex: 13, rec: 9, int: 19, wis: 16, luc: 9 },
    lightLore: 'Entidade do frio eterno. Congela exércitos inteiros no lugar e estilhaça alvos imobilizados com lanças de gelo.',
    furyLore: 'Entidade do frio eterno. Congela exércitos inteiros no lugar e estilhaça alvos imobilizados com lanças de gelo.',
    skills: [
      { name: 'Estilhaço Glacial',         icon: '❄️', mult: 1.40, cost: 11, res: 'mp', cd: 1.1, range: 335, color: '#93c5fd', vfx: 'glacial_shard', proj: true },
      { name: 'Prisão do Frio Eterno',     icon: '🧊', mult: 1.85, cost: 22, res: 'mp', cd: 5.0, range: 320, color: '#60a5fa', vfx: 'glacial_prison', stun: 2.2 },
      { name: 'Nova Ártica',               icon: '💠', mult: 2.15, cost: 26, res: 'mp', cd: 5.5, range: 170, color: '#bfdbfe', vfx: 'glacial_nova', aoe: true },
      { name: 'Manto do Inverno',          icon: '🛡️', mult: 0,    cost: 24, res: 'mp', cd: 8.5, range: 0,   color: '#dbeafe', vfx: 'glacial_cloak', buff: { id: 'def', label: '❄️ +35% DEF Mágica', dur: 11 } },
      { name: 'Lanças do Zero Absoluto',   icon: '🔱', mult: 2.65, cost: 34, res: 'mp', cd: 6.5, range: 340, color: '#3b82f6', vfx: 'glacial_spikes', proj: true, aoe: true },
      { name: 'Apocalipse Glacial',        icon: '🌨️', mult: 3.75, cost: 50, res: 'mp', cd: 10.0,range: 345, color: '#e0f2fe', vfx: 'glacial_apocalypse', aoe: true, stun: 2.0 }
    ]
  }
};

// MODO ÚNICO ATIVO: EXTREMO (UM)
var EXTREME_MODE = {
  key: 'um',
  label: 'Extremo (UM)',
  short: 'UM',
  ptsPerLvl: 9,
  color: '#fb7185',
  badgeBg: '#881337'
};

function getArchetypeDisplayName(archKey, faction) {
  var a = ARCHETYPES[archKey];
  if (!a) return archKey;
  return faction === 'fury' ? a.furyName : a.lightName;
}

function formatAllowedClassesLabel(reqArch) {
  if (!Array.isArray(reqArch) || reqArch.length === 0) return 'Todas as Classes';
  return reqArch.map(function(ak) {
    var a = ARCHETYPES[ak];
    if (!a) return ak;
    return a.lightName === a.furyName ? a.lightName : (a.lightName + '/' + a.furyName);
  }).join(', ');
}
