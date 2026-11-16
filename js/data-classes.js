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

// ================= 6 CLASSES CLÁSSICAS: LIGHT & DARK COM PRÉVIA COMPLETA =================
var ARCHETYPES = {
  fighter: {
    lightName: 'Lutador', furyName: 'Guerreiro', raceLight: 'Humano', raceFury: 'Nordein',
    combatType: 'Corpo a Corpo (Perto)',
    roleTag: 'DPS Físico / Berserker',
    icon: '⚔️', color: '#f87171', armorColor: '#991b1b', trimColor: '#fbbf24',
    atkStyle: 'phys', resourceType: 'sp', range: 95,
    autoStat: 'str', autoStatLabel: '+1 FOR / Nível',
    weaponRuleLabel: 'Espada 2M, Machado de Batalha & Lança Dupla',
    baseStats: { str: 14, dex: 10, rec: 11, int: 6, wis: 6, luc: 9 },
    lightLore: 'Campeão humano da Aliança da Luz. Empunha armas pesadas de duas mãos para romper linhas inimigas.',
    furyLore: 'Colosso Nordein da União da Fúria. Canaliza fúria brutal para dizimar alvos em área com golpes devastadores.',
    skills: [
      { name: 'Corte Mortal',       icon: '⚔️', mult: 1.35, cost: 10, res: 'sp', cd: 1.1, range: 100, color: '#f87171', vfx: 'slash' },
      { name: 'Corte Sangrento',    icon: '🩸', mult: 1.55, cost: 18, res: 'sp', cd: 4.0, range: 100, color: '#dc2626', vfx: 'bleed', dot: 0.45 },
      { name: 'Grito de Batalha',   icon: '📯', mult: 0,    cost: 22, res: 'sp', cd: 7.5, range: 0,   color: '#fbbf24', vfx: 'aura', heal: 0.22, buff: { id: 'atk', label: '⚔️ +25% ATQ', dur: 10 } },
      { name: 'Redemoinho',         icon: '🌪️', mult: 2.05, cost: 28, res: 'sp', cd: 5.5, range: 145, color: '#ef4444', vfx: 'whirl', aoe: true },
      { name: 'Quebra-Armadura',    icon: '🔨', mult: 2.35, cost: 32, res: 'sp', cd: 6.5, range: 105, color: '#f59e0b', vfx: 'smash', stun: 1.8 },
      { name: 'Fúria de Teos',      icon: '💥', mult: 3.45, cost: 45, res: 'sp', cd: 10.0,range: 115, color: '#fbbf24', vfx: 'nova' }
    ]
  },

  defender: {
    lightName: 'Defensor', furyName: 'Guardião', raceLight: 'Humano', raceFury: 'Nordein',
    combatType: 'Corpo a Corpo (Perto)',
    roleTag: 'Tanque / Escudo Torre',
    icon: '🛡️', color: '#fbbf24', armorColor: '#1e3a8a', trimColor: '#fbbf24',
    atkStyle: 'phys', resourceType: 'sp', range: 95,
    autoStat: 'rec', autoStatLabel: '+1 REC / Nível',
    weaponRuleLabel: 'Espada 1M, Martelo de Guerra & Escudo Torre',
    baseStats: { str: 10, dex: 8, rec: 16, int: 6, wis: 8, luc: 8 },
    lightLore: 'Paladino humano inabalável. Única classe capaz de erguer Escudos Torre para proteger aliados.',
    furyLore: 'Muralha viva Nordein. Absorve impactos colossais com seu escudo e atordoa hordas inteiras.',
    skills: [
      { name: 'Golpe de Escudo',    icon: '🛡️', mult: 1.30, cost: 10, res: 'sp', cd: 1.2, range: 95,  color: '#fbbf24', vfx: 'slash' },
      { name: 'Provocação Sísmica', icon: '💢', mult: 1.45, cost: 16, res: 'sp', cd: 4.5, range: 120, color: '#f97316', vfx: 'smash', stun: 2.2 },
      { name: 'Muralha de Aço',     icon: '🏰', mult: 0,    cost: 22, res: 'sp', cd: 8.0, range: 0,   color: '#38bdf8', vfx: 'aura', heal: 0.25, buff: { id: 'def', label: '🛡️ +40% DEF', dur: 12 } },
      { name: 'Terremoto',          icon: '🌋', mult: 1.95, cost: 28, res: 'sp', cd: 5.5, range: 150, color: '#f59e0b', vfx: 'whirl', aoe: true },
      { name: 'Barreira Divina',    icon: '💠', mult: 0,    cost: 30, res: 'sp', cd: 9.0, range: 0,   color: '#60a5fa', vfx: 'aura', heal: 0.42 },
      { name: 'Bastilha de Etain',  icon: '☀️', mult: 2.95, cost: 40, res: 'sp', cd: 10.0,range: 115, color: '#fde047', vfx: 'nova' }
    ]
  },

  ranger: {
    lightName: 'Patrulheiro', furyName: 'Assassino', raceLight: 'Elfo', raceFury: 'Vail',
    combatType: 'Corpo a Corpo (Perto)',
    roleTag: 'Furtividade / Crítico & Esquiva',
    icon: '🗡️', color: '#c084fc', armorColor: '#4c1d95', trimColor: '#e879f9',
    atkStyle: 'phys', resourceType: 'sp', range: 90,
    autoStat: 'dex', autoStatLabel: '+1 DES / Nível',
    weaponRuleLabel: 'Adagas Duplas & Garra Reversa',
    baseStats: { str: 11, dex: 15, rec: 8, int: 6, wis: 6, luc: 12 },
    lightLore: 'Batedor élfico ágil das florestas de Erina. Desvia de golpes fatais e aplica venenos mortais.',
    furyLore: 'Executor Vail das sombras de Iris. Teleporta-se atrás do alvo com garras e adagas duplas.',
    skills: [
      { name: 'Corte Venenoso',     icon: '🗡️', mult: 1.40, cost: 10, res: 'sp', cd: 1.0, range: 95,  color: '#c084fc', vfx: 'slash', dot: 0.35 },
      { name: 'Passo das Sombras',  icon: '👤', mult: 1.85, cost: 18, res: 'sp', cd: 4.0, range: 240, color: '#a855f7', vfx: 'dash', dash: true },
      { name: 'Evasão Sombria',     icon: '💨', mult: 0,    cost: 20, res: 'sp', cd: 8.0, range: 0,   color: '#34d399', vfx: 'aura', buff: { id: 'eva', label: '💨 +25% Esquiva', dur: 10 } },
      { name: 'Chuva de Adagas',    icon: '🌀', mult: 2.15, cost: 26, res: 'sp', cd: 5.5, range: 135, color: '#f43f5e', vfx: 'whirl', aoe: true },
      { name: 'Golpe Fantasma',     icon: '👻', mult: 2.65, cost: 32, res: 'sp', cd: 6.5, range: 105, color: '#e879f9', vfx: 'smash', stun: 1.5 },
      { name: 'Execução Fatal',     icon: '💀', mult: 3.70, cost: 42, res: 'sp', cd: 9.5, range: 100, color: '#fbbf24', vfx: 'nova' }
    ]
  },

  archer: {
    lightName: 'Arqueiro', furyName: 'Caçador', raceLight: 'Elfo', raceFury: 'Nordein',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Atirador / Máximo Crítico',
    icon: '🏹', color: '#34d399', armorColor: '#065f46', trimColor: '#34d399',
    atkStyle: 'phys', resourceType: 'sp', range: 360,
    autoStat: 'luc', autoStatLabel: '+1 SOR / Nível',
    weaponRuleLabel: 'Arco Longo & Besta Pesada',
    baseStats: { str: 10, dex: 12, rec: 8, int: 6, wis: 6, luc: 16 },
    lightLore: 'Atirador de elite élfico. Abate inimigos a longa distância com flechas precisas e letais.',
    furyLore: 'Predador implacável Nordein. Usa bestas pesadas e saraivadas de flechas perfurantes.',
    skills: [
      { name: 'Disparo Preciso',    icon: '🏹', mult: 1.35, cost: 10, res: 'sp', cd: 1.1, range: 365, color: '#34d399', vfx: 'proj', proj: true },
      { name: 'Flecha Tóxica',      icon: '🧪', mult: 1.75, cost: 18, res: 'sp', cd: 4.0, range: 365, color: '#a3e635', vfx: 'proj', proj: true, dot: 0.45 },
      { name: 'Olho de Falcão',     icon: '🦅', mult: 0,    cost: 22, res: 'sp', cd: 8.0, range: 0,   color: '#fbbf24', vfx: 'aura', buff: { id: 'crit', label: '💥 +25% Crítico', dur: 11 } },
      { name: 'Saraivada Mortal',   icon: '🌧️', mult: 2.15, cost: 28, res: 'sp', cd: 5.5, range: 365, color: '#fbbf24', vfx: 'whirl', proj: true, aoe: true },
      { name: 'Tiro Atordoante',    icon: '⚡', mult: 2.45, cost: 32, res: 'sp', cd: 6.5, range: 370, color: '#38bdf8', vfx: 'proj', proj: true, stun: 2.0 },
      { name: 'Flecha do Destino',  icon: '🎯', mult: 3.50, cost: 42, res: 'sp', cd: 9.5, range: 390, color: '#f43f5e', vfx: 'nova', proj: true }
    ]
  },

  mage: {
    lightName: 'Mago', furyName: 'Pagão', raceLight: 'Elfo', raceFury: 'Vail',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Dano Elemental em Área',
    icon: '🔮', color: '#38bdf8', armorColor: '#1e1b4b', trimColor: '#38bdf8',
    atkStyle: 'magic', resourceType: 'mp', range: 320,
    autoStat: 'int', autoStatLabel: '+1 INT / Nível',
    weaponRuleLabel: 'Cajado Arcano & Orbe Elemental',
    baseStats: { str: 6, dex: 8, rec: 8, int: 17, wis: 11, luc: 8 },
    lightLore: 'Erudito élfico das artes arcanas. Invoca meteoros e tempestades elementais sobre seus inimigos.',
    furyLore: 'Feiticeiro Vail das artes proibidas. Domina chamas infernais e magia destrutiva de longo alcance.',
    skills: [
      { name: 'Bola de Fogo',       icon: '🔥', mult: 1.45, cost: 12, res: 'mp', cd: 1.2, range: 325, color: '#fb7185', vfx: 'proj', proj: true },
      { name: 'Lança de Gelo',      icon: '❄️', mult: 1.85, cost: 20, res: 'mp', cd: 4.0, range: 325, color: '#38bdf8', vfx: 'proj', proj: true, stun: 1.8 },
      { name: 'Poder Arcano',       icon: '🔮', mult: 0,    cost: 24, res: 'mp', cd: 8.5, range: 0,   color: '#c084fc', vfx: 'aura', buff: { id: 'atk', label: '🔮 +30% Magia', dur: 10 } },
      { name: 'Tempestade Etérea',  icon: '⚡', mult: 2.35, cost: 34, res: 'mp', cd: 6.0, range: 325, color: '#c084fc', vfx: 'whirl', aoe: true },
      { name: 'Chama Infernal',     icon: '🌋', mult: 2.75, cost: 40, res: 'mp', cd: 7.0, range: 330, color: '#f97316', vfx: 'nova', dot: 0.5 },
      { name: 'Meteoro de Apulune', icon: '☄️', mult: 3.85, cost: 55, res: 'mp', cd: 10.5,range: 345, color: '#fbbf24', vfx: 'nova', proj: true, aoe: true }
    ]
  },

  priest: {
    lightName: 'Sacerdote', furyName: 'Oráculo', raceLight: 'Humano', raceFury: 'Vail',
    combatType: 'Longa Distância (Longe)',
    roleTag: 'Cura Divina / Suporte & Luz',
    icon: '✨', color: '#fde047', armorColor: '#0369a1', trimColor: '#fde047',
    atkStyle: 'magic', resourceType: 'mp', range: 300,
    autoStat: 'wis', autoStatLabel: '+1 SAB / Nível',
    weaponRuleLabel: 'Cetro Sagrado & Cajado Divino',
    baseStats: { str: 6, dex: 8, rec: 9, int: 11, wis: 17, luc: 7 },
    lightLore: 'Clérigo humano devoto da Deusa Etain. Restaura vida, concede bênçãos e purifica as trevas.',
    furyLore: 'Místico Vail canalizador de energia espiritual. Equilibra curas poderosas e julgamentos celestiais.',
    skills: [
      { name: 'Raio Sagrado',       icon: '✨', mult: 1.35, cost: 10, res: 'mp', cd: 1.2, range: 305, color: '#fde047', vfx: 'proj', proj: true },
      { name: 'Cura Maior',         icon: '💚', mult: 0,    cost: 24, res: 'mp', cd: 4.5, range: 0,   color: '#34d399', vfx: 'aura', heal: 0.48 },
      { name: 'Bênção de Etain',    icon: '🌟', mult: 0,    cost: 26, res: 'mp', cd: 9.0, range: 0,   color: '#38bdf8', vfx: 'aura', buff: { id: 'def', label: '🌟 +35% DEF/ATQ', dur: 12 } },
      { name: 'Julgamento Divino',  icon: '☀️', mult: 2.15, cost: 32, res: 'mp', cd: 6.0, range: 305, color: '#fbbf24', vfx: 'whirl', aoe: true },
      { name: 'Prisão de Luz',      icon: '⛓️', mult: 2.40, cost: 36, res: 'mp', cd: 7.0, range: 310, color: '#fef08a', vfx: 'smash', stun: 2.2 },
      { name: 'Ira Celestial',      icon: '👼', mult: 3.35, cost: 48, res: 'mp', cd: 9.5, range: 315, color: '#38bdf8', vfx: 'nova', proj: true }
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
  return faction === 'fury' ? a.furyName : a.lightName;
}

function formatAllowedClassesLabel(reqArch) {
  if (!Array.isArray(reqArch) || reqArch.length === 0) return 'Todas as Classes';
  return reqArch.map(function(ak) {
    return ARCHETYPES[ak].lightName + '/' + ARCHETYPES[ak].furyName;
  }).join(', ');
}
