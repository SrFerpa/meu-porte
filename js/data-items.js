// ================= RARIDADES & ELEMENTOS DO SHAIYA =================
var RARITIES = {
  comum:     { label: 'Normal',    color: '#94a3b8', mult: 1.0,  slots: 0 },
  nobre:     { label: 'Nobre',     color: '#38bdf8', mult: 1.25, slots: 2 },
  veneravel: { label: 'Venerável', color: '#34d399', mult: 1.45, slots: 3 },
  heroico:   { label: 'Heroico',   color: '#c084fc', mult: 1.75, slots: 4 },
  lendario:  { label: 'Lendário',  color: '#f59e0b', mult: 2.15, slots: 5 },
  deusa:     { label: 'Deusa',     color: '#fbbf24', mult: 2.65, slots: 6 }
};

var ELEMENTS = {
  none:  { label: 'Neutro', short: 'Neutro', icon: '⚪', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.14)' },
  fire:  { label: 'Fogo',   short: 'Fogo',   icon: '🔥', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.18)' },
  water: { label: 'Água',   short: 'Água',   icon: '💧', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)' },
  earth: { label: 'Terra',  short: 'Terra',  icon: '🌿', color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
  wind:  { label: 'Vento',  short: 'Vento',  icon: '🌪️', color: '#fde047', bg: 'rgba(250, 204, 21, 0.18)' }
};

// Ciclo elemental clássico do Shaiya: Fogo > Vento > Terra > Água > Fogo
function getElementMultiplier(atkElem, defElem) {
  if (!atkElem || atkElem === 'none' || !defElem || defElem === 'none') return 1.0;
  if (atkElem === defElem) return 0.85;
  if (
    (atkElem === 'fire'  && defElem === 'wind')  ||
    (atkElem === 'wind'  && defElem === 'earth') ||
    (atkElem === 'earth' && defElem === 'water') ||
    (atkElem === 'water' && defElem === 'fire')
  ) {
    return 1.35;
  }
  if (
    (defElem === 'fire'  && atkElem === 'wind')  ||
    (defElem === 'wind'  && atkElem === 'earth') ||
    (defElem === 'earth' && atkElem === 'water') ||
    (defElem === 'water' && atkElem === 'fire')
  ) {
    return 0.72;
  }
  return 1.0;
}

// ================= SLOTS DO PAPERDOLL =================
var SLOT_META = {
  weapon: { label: 'Arma',     icon: '⚔️' },
  shield: { label: 'Escudo',   icon: '🛡️' },
  helm:   { label: 'Elmo',     icon: '🪖' },
  armor:  { label: 'Peitoral', icon: '🦺' },
  pants:  { label: 'Calça',    icon: '👖' },
  gloves: { label: 'Manopla',  icon: '🧤' },
  boots:  { label: 'Botas',    icon: '👢' },
  cape:   { label: 'Capa',     icon: '🧣' },
  amulet: { label: 'Colar',    icon: '📿' },
  ring1:  { label: 'Anel 1',   icon: '💍' },
  ring2:  { label: 'Anel 2',   icon: '💍' },
  loop1:  { label: 'Brac. 1',  icon: '🧿' },
  loop2:  { label: 'Brac. 2',  icon: '🧿' },
  mount:  { label: 'Montaria', icon: '🐎' }
};

// ================= ARMAS EXCLUSIVAS POR CLASSE (PERTO VS LONGE) =================
var SHAIYA_WEAPONS_DB = [
  // Lutador / Guerreiro (Corpo a corpo)
  { name: 'Espada Bastarda de Teos',      slot: 'weapon', icon: '🗡️', wType: 'Espada 2M',        is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 24 },
  { name: 'Machado de Batalha Sangrento', slot: 'weapon', icon: '🪓', wType: 'Machado 2M',       is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 27 },
  { name: 'Lança Dupla de Keolloseu',     slot: 'weapon', icon: '🔱', wType: 'Lança Dupla',      is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 25 },

  // Defensor / Guardião (Corpo a corpo + Escudo Torre)
  { name: 'Espada Longa do Guardião',     slot: 'weapon', icon: '⚔️', wType: 'Espada 1M',        is2H: false, reqArch: ['defender'], style: 'phys', baseAtk: 17 },
  { name: 'Martelo de Guerra de Etain',   slot: 'weapon', icon: '🔨', wType: 'Martelo 1M',       is2H: false, reqArch: ['defender'], style: 'phys', baseAtk: 19 },
  { name: 'Escudo Torre de Aço Rúnico',   slot: 'shield', icon: '🛡️', wType: 'Escudo Torre',     is2H: false, reqArch: ['defender'], style: 'def',  baseDef: 22 },

  // Patrulheiro / Assassino (Corpo a corpo rápido)
  { name: 'Adagas Duplas das Sombras',    slot: 'weapon', icon: '🗡️', wType: 'Adagas Duplas',    is2H: true,  reqArch: ['ranger'],   style: 'phys', baseAtk: 22 },
  { name: 'Garras Reversas de Vail',      slot: 'weapon', icon: '🪝', wType: 'Garra',            is2H: true,  reqArch: ['ranger'],   style: 'phys', baseAtk: 23 },

  // Arqueiro / Caçador (Longa distância)
  { name: 'Arco Longo Élfico',            slot: 'weapon', icon: '🏹', wType: 'Arco Longo',       is2H: true,  reqArch: ['archer'],   style: 'phys', baseAtk: 23 },
  { name: 'Besta Pesada de Caça',         slot: 'weapon', icon: '🏹', wType: 'Besta',            is2H: true,  reqArch: ['archer'],   style: 'phys', baseAtk: 25 },

  // Mago / Pagão (Longa distância mágica)
  { name: 'Cajado Arcano de Apulune',     slot: 'weapon', icon: '🪄', wType: 'Cajado Arcano',    is2H: true,  reqArch: ['mage'],     style: 'magic', baseAtk: 26 },
  { name: 'Orbe Elemental Etéreo',        slot: 'weapon', icon: '🔮', wType: 'Orbe',             is2H: false, reqArch: ['mage'],     style: 'magic', baseAtk: 24 },

  // Sacerdote / Oráculo (Longa distância divina)
  { name: 'Cetro Sagrado da Luz',         slot: 'weapon', icon: '✝️', wType: 'Cetro Sagrado',    is2H: false, reqArch: ['priest'],   style: 'magic', baseAtk: 21 },
  { name: 'Cajado Divino da Profecia',    slot: 'weapon', icon: ' staff', wType: 'Cajado Divino', is2H: true,  reqArch: ['priest'],   style: 'magic', baseAtk: 23 }
];

// ================= SETS EXCLUSIVOS POR CLASSE NA LOJA =================
var GODDESS_SET_NAMES = {
  fighter:  { title: 'Set Deusa da Fúria (Lutador/Guerreiro)',    icon: '⚔️', stats: { str: 34, dex: 18, rec: 22, luc: 16 } },
  defender: { title: 'Set Deusa da Égide (Defensor/Guardião)',    icon: '🛡️', stats: { rec: 38, str: 18, wis: 22, dex: 14 } },
  ranger:   { title: 'Set Deusa das Sombras (Patrulheiro/Assassino)', icon: '🗡️', stats: { dex: 36, str: 20, luc: 24, rec: 12 } },
  archer:   { title: 'Set Deusa dos Ventos (Arqueiro/Caçador)',   icon: '🏹', stats: { luc: 38, dex: 24, str: 18, rec: 12 } },
  mage:     { title: 'Set Deusa Arcana (Mago/Pagão)',             icon: '🔮', stats: { int: 40, wis: 24, rec: 16, luc: 14 } },
  priest:   { title: 'Set Deusa de Etain (Sacerdote/Oráculo)',    icon: '✨', stats: { wis: 40, rec: 24, int: 20, dex: 12 } }
};

var EXCLUSIVE_MOUNTS = [
  { id: 'mnt_light_lion', name: 'Leão Branco de Apulune', faction: 'light', icon: '🦁', color: '#38bdf8', speedBonus: 95,  price: 1800, desc: 'Montaria sagrada da Aliança da Luz (+95 Velocidade).' },
  { id: 'mnt_light_peg',  name: 'Pégaso Celestial',       faction: 'light', icon: '🦄', color: '#fde047', speedBonus: 125, price: 3200, desc: 'Montaria lendária alada (+125 Velocidade).' },
  { id: 'mnt_fury_bas',   name: 'Basilisco de Iris',      faction: 'fury',  icon: '🦎', color: '#f43f5e', speedBonus: 95,  price: 1800, desc: 'Montaria feroz da União da Fúria (+95 Velocidade).' },
  { id: 'mnt_fury_drk',   name: 'Dragão Abissal Negro',   faction: 'fury',  icon: '🐉', color: '#c084fc', speedBonus: 125, price: 3200, desc: 'Montaria suprema das trevas (+125 Velocidade).' }
];

// ================= CATÁLOGO COMPLETO DE LAPIS =================
var LAPIS_CATALOG = {
  str:        { name: 'Lapis de Força',       code: 'FOR',   kind: 'stat',  color: '#f87171', stats: { str: [0, 5, 10, 18, 28, 42, 60] } },
  dex:        { name: 'Lapis de Destreza',    code: 'DES',   kind: 'stat',  color: '#34d399', stats: { dex: [0, 5, 10, 18, 28, 42, 60] } },
  rec:        { name: 'Lapis de Resistência', code: 'REC',   kind: 'stat',  color: '#fbbf24', stats: { rec: [0, 5, 10, 18, 28, 42, 60] } },
  int:        { name: 'Lapis de Inteligência',code: 'INT',   kind: 'stat',  color: '#38bdf8', stats: { int: [0, 5, 10, 18, 28, 42, 60] } },
  wis:        { name: 'Lapis de Sabedoria',   code: 'SAB',   kind: 'stat',  color: '#c084fc', stats: { wis: [0, 5, 10, 18, 28, 42, 60] } },
  luc:        { name: 'Lapis de Sorte',       code: 'SOR',   kind: 'stat',  color: '#f472b6', stats: { luc: [0, 5, 10, 18, 28, 42, 60] } },
  sonic:      { name: 'Lapis Sônico',         code: 'SONIC', kind: 'sonic', color: '#f43f5e', cdr: [0, 8, 16, 24] },
  swift:      { name: 'Lapis Veloz',          code: 'VELOZ', kind: 'swift', color: '#38bdf8', spd: [0, 25, 50, 75] },
  abs:        { name: 'Lapis de Absorção',    code: 'ABS',   kind: 'abs',   color: '#fbbf24', abs: [0, 8, 16, 28, 42, 65, 95] },
  elem_fire:  { name: 'Lapis Elemental Fogo', code: 'FOGO',  kind: 'elem',  color: '#fb7185', element: 'fire' },
  elem_water: { name: 'Lapis Elemental Água', code: 'ÁGUA',  kind: 'elem',  color: '#38bdf8', element: 'water' },
  elem_earth: { name: 'Lapis Elemental Terra',code: 'TERRA', kind: 'elem',  color: '#34d399', element: 'earth' },
  elem_wind:  { name: 'Lapis Elemental Vento',code: 'VENTO', kind: 'elem',  color: '#fde047', element: 'wind' }
};

var LAPIS_BASE_LINK_CHANCE = { 1: 85, 2: 72, 3: 58, 4: 45, 5: 32, 6: 20 };

function formatLapisEffect(sock) {
  if (!sock || !LAPIS_CATALOG[sock.lapisKey]) return '';
  var meta = LAPIS_CATALOG[sock.lapisKey];
  var lvl = sock.level || 1;
  if (meta.kind === 'abs')   return 'Absorção de Dano: -' + (meta.abs[lvl] || 0);
  if (meta.kind === 'sonic') return 'Vel. de Ataque / Recarga: -' + (meta.cdr[lvl] || 0) + '%';
  if (meta.kind === 'swift') return 'Vel. de Movimento: +' + (meta.spd[lvl] || 0);
  if (meta.kind === 'elem')  return 'Imbui Elemento ' + ELEMENTS[meta.element].label;
  var out = [];
  if (meta.stats) {
    Object.keys(meta.stats).forEach(function(k) {
      out.push(k.toUpperCase() + ' +' + (meta.stats[k][lvl] || 0));
    });
  }
  return out.join(', ');
}

// ================= VALIDAÇÃO DE EQUIPAMENTO POR CLASSE E MODO =================
function canEquipItem(item) {
  if (!item || !player) return { ok: false, reason: 'Inválido' };
  if (item.slot === 'consumable' || item.slot === 'lapis') return { ok: false, reason: 'Não equipável' };

  if (Array.isArray(item.reqArch) && item.reqArch.length > 0) {
    if (item.reqArch.indexOf(player.archKey) === -1) {
      return { ok: false, reason: 'Requer: ' + formatAllowedClassesLabel(item.reqArch) };
    }
  }

  if (item.slot === 'shield' && player.archKey !== 'defender') {
    return { ok: false, reason: 'Apenas Defensor/Guardião' };
  }

  if (item.reqMode === 'um' && player.mode !== 'um') {
    return { ok: false, reason: 'Requer Modo Extremo (UM)' };
  }
  if (item.reqMode === 'hm' && player.mode === 'nm') {
    return { ok: false, reason: 'Requer Modo Difícil (HM+)' };
  }

  return { ok: true, reason: '' };
}

// ================= GERADOR DE DROPS POR CLASSE =================
function generateDropItem(lvl, tier) {
  var rarRoll = Math.random();
  var rarity = 'comum';
  if (tier === 'boss') {
    rarity = rarRoll > 0.65 ? 'lendario' : (rarRoll > 0.25 ? 'heroico' : 'veneravel');
  } else if (tier === 'miniboss') {
    rarity = rarRoll > 0.60 ? 'heroico' : (rarRoll > 0.20 ? 'veneravel' : 'nobre');
  } else {
    rarity = rarRoll > 0.88 ? 'heroico' : (rarRoll > 0.68 ? 'veneravel' : (rarRoll > 0.35 ? 'nobre' : 'comum'));
  }

  var rMeta = RARITIES[rarity];
  var scale = (1 + lvl * 0.20) * rMeta.mult;
  var sockets = [];
  for (var s = 0; s < rMeta.slots; s++) sockets.push(null);

  var elemKeys = ['none', 'none', 'fire', 'water', 'earth', 'wind'];
  var elem = elemKeys[Math.floor(Math.random() * elemKeys.length)];

  var rollType = Math.random();
  // 35% chance de dropar Arma ou Escudo específico de uma das 6 classes
  if (rollType < 0.35) {
    var wTemplate = SHAIYA_WEAPONS_DB[Math.floor(Math.random() * SHAIYA_WEAPONS_DB.length)];
    var isShield = wTemplate.slot === 'shield';
    return {
      id: 'drop_' + Math.random().toString(36).slice(2, 10),
      name: wTemplate.name + ' (' + rMeta.label + ')',
      slot: wTemplate.slot,
      icon: wTemplate.icon === ' staff' ? '🪄' : wTemplate.icon,
      wType: wTemplate.wType,
      is2H: wTemplate.is2H,
      reqArch: wTemplate.reqArch.slice(),
      rarity: rarity,
      plus: 0,
      element: isShield ? 'none' : elem,
      sockets: sockets,
      physAtk: (!isShield && wTemplate.style === 'phys')  ? Math.round(wTemplate.baseAtk * scale) : 0,
      magAtk:  (!isShield && wTemplate.style === 'magic') ? Math.round(wTemplate.baseAtk * scale) : 0,
      physDef: isShield ? Math.round(wTemplate.baseDef * scale) : 0,
      magDef:  isShield ? Math.round(wTemplate.baseDef * 0.9 * scale) : 0,
      bonusStr: wTemplate.style === 'phys' ? Math.round(2 * rMeta.mult) : 0,
      bonusInt: wTemplate.style === 'magic' ? Math.round(2 * rMeta.mult) : 0,
      sellPrice: Math.round(28 * scale)
    };
  }

  // 45% chance de dropar Peça de Armadura específica de uma das 6 classes
  var archKeys = Object.keys(ARCHETYPES);
  var chosenArch = archKeys[Math.floor(Math.random() * archKeys.length)];
  var armorSlots = ['helm', 'armor', 'pants', 'gloves', 'boots', 'cape'];
  var aSlot = armorSlots[Math.floor(Math.random() * armorSlots.length)];

  if (rollType < 0.80) {
    return {
      id: 'drop_' + Math.random().toString(36).slice(2, 10),
      name: SLOT_META[aSlot].label + ' de ' + ARCHETYPES[chosenArch].lightName + ' (' + rMeta.label + ')',
      slot: aSlot,
      icon: SLOT_META[aSlot].icon,
      reqArch: [chosenArch],
      rarity: rarity,
      plus: 0,
      element: aSlot === 'armor' ? elem : 'none',
      sockets: sockets,
      physAtk: 0, magAtk: 0,
      physDef: Math.round(9 * scale),
      magDef:  Math.round(8 * scale),
      bonusRec: Math.round(2 * rMeta.mult),
      sellPrice: Math.round(24 * scale)
    };
  }

  // 20% chance de dropar Acessório (Colar, Anel ou Bracelete) para todas as classes
  var accSlots = ['amulet', 'ring1', 'loop1'];
  var accSlot = accSlots[Math.floor(Math.random() * accSlots.length)];
  return {
    id: 'drop_' + Math.random().toString(36).slice(2, 10),
    name: SLOT_META[accSlot].label + ' Rúnico (' + rMeta.label + ')',
    slot: accSlot,
    icon: SLOT_META[accSlot].icon,
    rarity: rarity,
    plus: 0,
    element: 'none',
    sockets: sockets,
    physAtk: Math.round(4 * scale),
    magAtk:  Math.round(4 * scale),
    physDef: Math.round(3 * scale),
    magDef:  Math.round(3 * scale),
    bonusStr: Math.round(2 * rMeta.mult),
    bonusInt: Math.round(2 * rMeta.mult),
    bonusLuc: Math.round(2 * rMeta.mult),
    sellPrice: Math.round(32 * scale)
  };
}

function generateRandomLapisItem(tier) {
  var pool = ['str', 'dex', 'rec', 'int', 'wis', 'luc', 'abs', 'elem_fire', 'elem_water', 'elem_earth', 'elem_wind'];
  var key = pool[Math.floor(Math.random() * pool.length)];
  var meta = LAPIS_CATALOG[key];
  var lvl = 1;
  if (meta.kind !== 'elem') {
    if (tier === 'boss') lvl = Math.random() > 0.45 ? 5 : 4;
    else if (tier === 'miniboss') lvl = Math.random() > 0.5 ? 4 : 3;
    else lvl = Math.random() > 0.65 ? 2 : 1;
  }
  return {
    id: 'lap_' + Math.random().toString(36).slice(2, 10),
    name: meta.kind === 'elem' ? meta.name : (meta.name + ' Nv.' + lvl),
    icon: '💎',
    slot: 'lapis',
    lapisKey: key,
    level: lvl,
    rarity: lvl >= 4 ? 'heroico' : (lvl >= 2 ? 'veneravel' : 'nobre'),
    sellPrice: lvl * 45,
    desc: formatLapisEffect({ lapisKey: key, level: lvl })
  };
}
