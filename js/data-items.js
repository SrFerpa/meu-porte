// ================= ORDEM E CORES OFICIAIS DOS ITENS DO SHAIYA (NOBRE ATÉ DEUSA) =================
var RARITY_ORDER = ['comum', 'nobre', 'veneravel', 'heroico', 'lendario', 'deusa'];

var RARITIES = {
  comum:     { order: 1, label: 'Normal',    color: '#e2e8f0', mult: 1.00, slots: 0 }, // Branco
  nobre:     { order: 2, label: 'Nobre',     color: '#38bdf8', mult: 1.25, slots: 2 }, // Azul
  veneravel: { order: 3, label: 'Venerável', color: '#34d399', mult: 1.48, slots: 3 }, // Verde
  heroico:   { order: 4, label: 'Heroico',   color: '#c084fc', mult: 1.78, slots: 4 }, // Roxo
  lendario:  { order: 5, label: 'Lendário',  color: '#fbbf24', mult: 2.18, slots: 5 }, // Amarelo
  deusa:     { order: 6, label: 'Deusa',     color: '#fb7185', mult: 2.75, slots: 6 }  // Rosa/Carmesim Deusa
};

// ================= LÓGICA ELEMENTAL DO SHAIYA: FOGO > VENTO > TERRA > ÁGUA > FOGO =================
var ELEMENTS = {
  none:  { label: 'Neutro', short: 'Neutro', icon: '⚪', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.14)' },
  fire:  { label: 'Fogo',   short: 'Fogo',   icon: '🔥', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.18)' },
  wind:  { label: 'Vento',  short: 'Vento',  icon: '🌪️', color: '#fde047', bg: 'rgba(250, 204, 21, 0.18)' },
  earth: { label: 'Terra',  short: 'Terra',  icon: '🌿', color: '#34d399', bg: 'rgba(52, 211, 153, 0.18)' },
  water: { label: 'Água',   short: 'Água',   icon: '💧', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)' }
};

function getElementMultiplier(atkElem, defElem) {
  if (!atkElem || atkElem === 'none' || !defElem || defElem === 'none') return 1.0;
  // Mesmo elemento reduz ligeiramente o dano
  if (atkElem === defElem) return 0.85;

  // Vantagem elemental (Fogo > Vento > Terra > Água > Fogo): +40% de dano
  if (
    (atkElem === 'fire'  && defElem === 'wind')  ||
    (atkElem === 'wind'  && defElem === 'earth') ||
    (atkElem === 'earth' && defElem === 'water') ||
    (atkElem === 'water' && defElem === 'fire')
  ) {
    return 1.40;
  }

  // Desvantagem elemental (atacando elemento superior): -30% de dano
  if (
    (defElem === 'fire'  && atkElem === 'wind')  ||
    (defElem === 'wind'  && atkElem === 'earth') ||
    (defElem === 'earth' && atkElem === 'water') ||
    (defElem === 'water' && atkElem === 'fire')
  ) {
    return 0.70;
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

// ================= ARMAS & ESCUDOS EXCLUSIVOS POR CLASSE (SHAIYA FAWKES) =================
var SHAIYA_WEAPONS_DB = [
  // Lutador / Guerreiro (Apenas 2M)
  { name: 'Espada Bastarda de Teos',      slot: 'weapon', icon: '🗡️', wType: 'Espada 2M',     is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 26 },
  { name: 'Machado de Batalha Fawkes',    slot: 'weapon', icon: '🪓', wType: 'Machado 2M',    is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 29 },
  { name: 'Lança Dupla de Keolloseu',     slot: 'weapon', icon: '🔱', wType: 'Lança Dupla',   is2H: true,  reqArch: ['fighter'],  style: 'phys', baseAtk: 27 },

  // Defensor / Guardião (Armas 1M + Único com Escudo)
  { name: 'Espada Longa do Guardião',     slot: 'weapon', icon: '⚔️', wType: 'Espada 1M',     is2H: false, reqArch: ['defender'], style: 'phys', baseAtk: 18 },
  { name: 'Martelo de Guerra de Etain',   slot: 'weapon', icon: '🔨', wType: 'Martelo 1M',    is2H: false, reqArch: ['defender'], style: 'phys', baseAtk: 20 },
  { name: 'Escudo Torre de Aço Rúnico',   slot: 'shield', icon: '🛡️', wType: 'Escudo Torre',  is2H: false, reqArch: ['defender'], style: 'def',  baseDef: 24, blockChance: 18 },
  { name: 'Égide Sagrada de Fawkes',      slot: 'shield', icon: '🛡️', wType: 'Escudo Deusa',  is2H: false, reqArch: ['defender'], style: 'def',  baseDef: 34, blockChance: 25 },

  // Patrulheiro / Assassino
  { name: 'Adagas Duplas das Sombras',    slot: 'weapon', icon: '🗡️', wType: 'Adagas Duplas', is2H: true,  reqArch: ['ranger'],   style: 'phys', baseAtk: 24 },
  { name: 'Garras Reversas de Vail',      slot: 'weapon', icon: '🪝', wType: 'Garra',         is2H: true,  reqArch: ['ranger'],   style: 'phys', baseAtk: 25 },

  // Arqueiro / Caçador
  { name: 'Arco Longo Élfico',            slot: 'weapon', icon: '🏹', wType: 'Arco Longo',    is2H: true,  reqArch: ['archer'],   style: 'phys', baseAtk: 25 },
  { name: 'Besta Pesada de Caça',         slot: 'weapon', icon: '🏹', wType: 'Besta',         is2H: true,  reqArch: ['archer'],   style: 'phys', baseAtk: 27 },

  // Mago / Pagão
  { name: 'Cajado Arcano de Apulune',     slot: 'weapon', icon: '🪄', wType: 'Cajado Arcano', is2H: true,  reqArch: ['mage'],     style: 'magic', baseAtk: 28 },
  { name: 'Orbe Elemental Etéreo',        slot: 'weapon', icon: '🔮', wType: 'Orbe',          is2H: false, reqArch: ['mage'],     style: 'magic', baseAtk: 25 },

  // Sacerdote / Oráculo
  { name: 'Cetro Sagrado da Luz',         slot: 'weapon', icon: '✝️', wType: 'Cetro Sagrado', is2H: false, reqArch: ['priest'],   style: 'magic', baseAtk: 23 },
  { name: 'Cajado Divino da Profecia',    slot: 'weapon', icon: '🪄', wType: 'Cajado Divino', is2H: true,  reqArch: ['priest'],   style: 'magic', baseAtk: 25 }
];

// ================= PACKS DE SETS DEUSA POR CLASSE (EXCLUSIVOS DA LOJA) =================
var GODDESS_CLASS_PACKS = {
  fighter: {
    title: 'Pack Set Deusa: Fúria de Teos',
    classLabel: 'Lutador / Guerreiro',
    icon: '⚔️',
    price: 2600,
    weaponTemplate: { name: 'Espada Bastarda Deusa de Teos', slot: 'weapon', icon: '🗡️', wType: 'Espada 2M', is2H: true, style: 'phys', baseAtk: 34 },
    stats: { str: 38, dex: 20, rec: 24, luc: 18 },
    desc: 'Set Deusa 6 Slots exclusivo para Lutador/Guerreiro + Espada Bastarda Deusa 2M.'
  },
  defender: {
    title: 'Pack Set Deusa: Égide Imortal',
    classLabel: 'Defensor / Guardião',
    icon: '🛡️',
    price: 2600,
    weaponTemplate: { name: 'Martelo Deusa de Etain', slot: 'weapon', icon: '🔨', wType: 'Martelo 1M', is2H: false, style: 'phys', baseAtk: 24 },
    includeGoddessShield: true,
    stats: { rec: 42, str: 20, wis: 24, dex: 16 },
    desc: 'Set Deusa 6 Slots exclusivo para Defensor/Guardião + Martelo 1M + Escudo Deusa.'
  },
  ranger: {
    title: 'Pack Set Deusa: Lâmina Fantasma',
    classLabel: 'Patrulheiro / Assassino',
    icon: '🗡️',
    price: 2600,
    weaponTemplate: { name: 'Garras Deusa do Abismo', slot: 'weapon', icon: '🪝', wType: 'Garra', is2H: true, style: 'phys', baseAtk: 31 },
    stats: { dex: 40, str: 22, luc: 26, rec: 14 },
    desc: 'Set Deusa 6 Slots exclusivo para Patrulheiro/Assassino + Garras Deusa.'
  },
  archer: {
    title: 'Pack Set Deusa: Vento Cortante',
    classLabel: 'Arqueiro / Caçador',
    icon: '🏹',
    price: 2600,
    weaponTemplate: { name: 'Arco Longo Deusa de Apulune', slot: 'weapon', icon: '🏹', wType: 'Arco Longo', is2H: true, style: 'phys', baseAtk: 32 },
    stats: { luc: 42, dex: 26, str: 20, rec: 14 },
    desc: 'Set Deusa 6 Slots exclusivo para Arqueiro/Caçador + Arco Longo Deusa.'
  },
  mage: {
    title: 'Pack Set Deusa: Chama Arcana',
    classLabel: 'Mago / Pagão',
    icon: '🔮',
    price: 2600,
    weaponTemplate: { name: 'Cajado Arcano Deusa de Fawkes', slot: 'weapon', icon: '🪄', wType: 'Cajado Arcano', is2H: true, style: 'magic', baseAtk: 36 },
    stats: { int: 44, wis: 26, rec: 18, luc: 16 },
    desc: 'Set Deusa 6 Slots exclusivo para Mago/Pagão + Cajado Arcano Deusa.'
  },
  priest: {
    title: 'Pack Set Deusa: Luz de Etain',
    classLabel: 'Sacerdote / Oráculo',
    icon: '✨',
    price: 2600,
    weaponTemplate: { name: 'Cetro Divino Deusa de Etain', slot: 'weapon', icon: '✝️', wType: 'Cetro Sagrado', is2H: false, style: 'magic', baseAtk: 30 },
    stats: { wis: 44, rec: 26, int: 22, dex: 14 },
    desc: 'Set Deusa 6 Slots exclusivo para Sacerdote/Oráculo + Cetro Divino Deusa.'
  }
};

var EXCLUSIVE_MOUNTS = [
  { id: 'mnt_light_lion', name: 'Leão Branco de Apulune', faction: 'light', icon: '🦁', color: '#38bdf8', speedBonus: 95,  price: 1800, desc: 'Montaria exclusiva da Aliança da Luz (+95 Velocidade).' },
  { id: 'mnt_light_peg',  name: 'Pégaso Celestial',       faction: 'light', icon: '🦄', color: '#fde047', speedBonus: 130, price: 3200, desc: 'Montaria lendária alada (+130 Velocidade).' },
  { id: 'mnt_fury_bas',   name: 'Basilisco de Iris',      faction: 'fury',  icon: '🦎', color: '#f43f5e', speedBonus: 95,  price: 1800, desc: 'Montaria exclusiva da União da Fúria (+95 Velocidade).' },
  { id: 'mnt_fury_drk',   name: 'Dragão Abissal Negro',   faction: 'fury',  icon: '🐉', color: '#c084fc', speedBonus: 130, price: 3200, desc: 'Montaria suprema das trevas (+130 Velocidade).' }
];

// ================= CATÁLOGO DE LAPIS DO SHAIYA FAWKES (NV. 1 A 7, DUPLAS, SÔNICO, VELOZ & ELEMENTOS) =================
var LAPIS_CATALOG = {
  // Lapis Clássicas Nv. 1 a Nv. 7
  str:        { name: 'Lapis de Força',          code: 'FOR',     kind: 'stat',  color: '#f87171', targetType: 'any',    stats: { str: [0, 5, 10, 18, 28, 42, 60, 82] } },
  dex:        { name: 'Lapis de Destreza',       code: 'DES',     kind: 'stat',  color: '#34d399', targetType: 'any',    stats: { dex: [0, 5, 10, 18, 28, 42, 60, 82] } },
  rec:        { name: 'Lapis de Resistência',    code: 'REC',     kind: 'stat',  color: '#fbbf24', targetType: 'any',    stats: { rec: [0, 5, 10, 18, 28, 42, 60, 82] } },
  int:        { name: 'Lapis de Inteligência',   code: 'INT',     kind: 'stat',  color: '#38bdf8', targetType: 'any',    stats: { int: [0, 5, 10, 18, 28, 42, 60, 82] } },
  wis:        { name: 'Lapis de Sabedoria',      code: 'SAB',     kind: 'stat',  color: '#c084fc', targetType: 'any',    stats: { wis: [0, 5, 10, 18, 28, 42, 60, 82] } },
  luc:        { name: 'Lapis de Sorte',          code: 'SOR',     kind: 'stat',  color: '#f472b6', targetType: 'any',    stats: { luc: [0, 5, 10, 18, 28, 42, 60, 82] } },

  // Lapis Duplas / Deusa estilo Shaiya Fawkes
  dual_fury:  { name: 'Lapis Dupla Fúria (FOR+SOR)',   code: 'FOR/SOR', kind: 'stat', color: '#fb7185', targetType: 'any', stats: { str: [0, 22, 36, 52], luc: [0, 22, 36, 52] } },
  dual_arc:   { name: 'Lapis Dupla Arcana (INT+SAB)',  code: 'INT/SAB', kind: 'stat', color: '#60a5fa', targetType: 'any', stats: { int: [0, 22, 36, 52], wis: [0, 22, 36, 52] } },
  dual_tank:  { name: 'Lapis Dupla Bastilha (REC+DES)',code: 'REC/DES', kind: 'stat', color: '#facc15', targetType: 'any', stats: { rec: [0, 24, 38, 55], dex: [0, 18, 30, 45] } },

  // Lapis Especiais (Loja & Bosses)
  sonic:      { name: 'Lapis Sônico',            code: 'SONIC',   kind: 'sonic', color: '#f43f5e', targetType: 'weapon', cdr: [0, 10, 18, 26] },
  swift:      { name: 'Lapis Veloz',             code: 'VELOZ',   kind: 'swift', color: '#38bdf8', targetType: 'boots',  spd: [0, 30, 60, 90] },
  abs:        { name: 'Lapis de Absorção',       code: 'ABS',     kind: 'abs',   color: '#fbbf24', targetType: 'armor',  abs: [0, 10, 20, 32, 48, 70, 100, 135] },

  // Lapis Elementais (Armas e Peitoral)
  elem_fire:  { name: 'Lapis Elemental Fogo',    code: 'FOGO',    kind: 'elem',  color: '#fb7185', targetType: 'elem_slot', element: 'fire' },
  elem_wind:  { name: 'Lapis Elemental Vento',   code: 'VENTO',   kind: 'elem',  color: '#fde047', targetType: 'elem_slot', element: 'wind' },
  elem_earth: { name: 'Lapis Elemental Terra',   code: 'TERRA',   kind: 'elem',  color: '#34d399', targetType: 'elem_slot', element: 'earth' },
  elem_water: { name: 'Lapis Elemental Água',    code: 'ÁGUA',    kind: 'elem',  color: '#38bdf8', targetType: 'elem_slot', element: 'water' }
};

var LAPIS_BASE_LINK_CHANCE = { 1: 88, 2: 75, 3: 62, 4: 48, 5: 35, 6: 24, 7: 15 };

function formatLapisEffect(sock) {
  if (!sock || !LAPIS_CATALOG[sock.lapisKey]) return '';
  var meta = LAPIS_CATALOG[sock.lapisKey];
  var lvl = sock.level || 1;
  if (meta.kind === 'abs')   return 'Absorção de Dano: -' + (meta.abs[lvl] || 0);
  if (meta.kind === 'sonic') return 'Vel. Ataque / Recarga: -' + (meta.cdr[lvl] || 0) + '% (Arma)';
  if (meta.kind === 'swift') return 'Vel. Movimento: +' + (meta.spd[lvl] || 0) + ' (Botas)';
  if (meta.kind === 'elem')  return 'Elemento ' + ELEMENTS[meta.element].label + ' (Arma/Peitoral)';
  var out = [];
  if (meta.stats) {
    Object.keys(meta.stats).forEach(function(k) {
      out.push(k.toUpperCase() + ' +' + (meta.stats[k][lvl] || 0));
    });
  }
  return out.join(', ');
}

// Lógica de compatibilidade de Lapis do Shaiya (ex: não permite 2 Lapis iguais no mesmo item e respeita tipo do slot)
function canLinkLapisToItem(item, lapisItem) {
  if (!item || !lapisItem || !LAPIS_CATALOG[lapisItem.lapisKey]) return { ok: false, reason: 'Inválido' };
  if (!Array.isArray(item.sockets) || item.sockets.length === 0) return { ok: false, reason: 'Item sem slots' };

  var meta = LAPIS_CATALOG[lapisItem.lapisKey];

  // Regra de slot específico do Shaiya
  if (meta.targetType === 'weapon' && item.slot !== 'weapon') {
    return { ok: false, reason: 'Lapis Sônico só pode ser linkada em Armas!' };
  }
  if (meta.targetType === 'boots' && item.slot !== 'boots') {
    return { ok: false, reason: 'Lapis Veloz só pode ser linkada em Botas!' };
  }
  if (meta.targetType === 'armor' && ['helm', 'armor', 'pants', 'gloves', 'boots', 'shield'].indexOf(item.slot) === -1) {
    return { ok: false, reason: 'Lapis ABS só pode ser linkada em Armaduras ou Escudo!' };
  }
  if (meta.targetType === 'elem_slot' && item.slot !== 'weapon' && item.slot !== 'armor') {
    return { ok: false, reason: 'Lapis Elemental só pode ser linkada em Arma ou Peitoral!' };
  }

  // Regra clássica do Shaiya: não permite duas Lapis idênticas (mesma chave e mesmo nível) no mesmo equipamento
  for (var i = 0; i < item.sockets.length; i++) {
    var s = item.sockets[i];
    if (s && s.lapisKey === lapisItem.lapisKey && (s.level || 1) === (lapisItem.level || 1)) {
      return { ok: false, reason: 'Já existe uma ' + lapisItem.name + ' neste equipamento!' };
    }
  }

  return { ok: true, reason: '' };
}

// ================= VALIDAÇÃO DE SET POR CLASSE E LÓGICA DO ESCUDO =================
function canEquipItem(item) {
  if (!item || !player) return { ok: false, reason: 'Inválido' };
  if (item.slot === 'consumable' || item.slot === 'lapis') return { ok: false, reason: 'Não equipável' };

  // Bloqueio estrito por classe (outra classe não pode usar)
  if (Array.isArray(item.reqArch) && item.reqArch.length > 0) {
    if (item.reqArch.indexOf(player.archKey) === -1) {
      return { ok: false, reason: 'Exclusivo: ' + formatAllowedClassesLabel(item.reqArch) };
    }
  }

  // Lógica do Escudo: apenas Defensor/Guardião pode equipar
  if (item.slot === 'shield' && player.archKey !== 'defender') {
    return { ok: false, reason: 'Apenas Defensor/Guardião usa Escudo' };
  }

  return { ok: true, reason: '' };
}

// ================= GERADOR DE DROPS DO SHAIYA FAWKES =================
function generateDropItem(lvl, tier) {
  var rarRoll = Math.random();
  var rarity = 'comum';
  if (tier === 'boss') {
    rarity = rarRoll > 0.72 ? 'lendario' : (rarRoll > 0.30 ? 'heroico' : 'veneravel');
  } else if (tier === 'miniboss') {
    rarity = rarRoll > 0.62 ? 'heroico' : (rarRoll > 0.22 ? 'veneravel' : 'nobre');
  } else {
    rarity = rarRoll > 0.89 ? 'heroico' : (rarRoll > 0.68 ? 'veneravel' : (rarRoll > 0.35 ? 'nobre' : 'comum'));
  }

  var rMeta = RARITIES[rarity];
  var scale = (1 + lvl * 0.22) * rMeta.mult;
  var sockets = [];
  for (var s = 0; s < rMeta.slots; s++) sockets.push(null);

  var elemKeys = ['none', 'none', 'fire', 'wind', 'earth', 'water'];
  var elem = elemKeys[Math.floor(Math.random() * elemKeys.length)];

  var rollType = Math.random();
  // 35% chance de dropar Arma ou Escudo exclusivo de classe
  if (rollType < 0.35) {
    var wTemplate = SHAIYA_WEAPONS_DB[Math.floor(Math.random() * SHAIYA_WEAPONS_DB.length)];
    var isShield = wTemplate.slot === 'shield';
    return {
      id: 'drop_' + Math.random().toString(36).slice(2, 10),
      name: wTemplate.name + ' (' + rMeta.label + ')',
      slot: wTemplate.slot,
      icon: wTemplate.icon,
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
      blockChance: isShield ? (wTemplate.blockChance || 15) : 0,
      bonusStr: wTemplate.style === 'phys' ? Math.round(2 * rMeta.mult) : 0,
      bonusInt: wTemplate.style === 'magic' ? Math.round(2 * rMeta.mult) : 0,
      sellPrice: Math.round(30 * scale)
    };
  }

  // 45% chance de dropar Peça de Set exclusiva de uma classe
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
      physDef: Math.round(10 * scale),
      magDef:  Math.round(9 * scale),
      bonusRec: Math.round(2 * rMeta.mult),
      sellPrice: Math.round(26 * scale)
    };
  }

  // 20% chance de dropar Acessório (todas as classes)
  var accSlots = ['amulet', 'ring1', 'loop1'];
  var accSlot = accSlots[Math.floor(Math.random() * accSlots.length)];
  return {
    id: 'drop_' + Math.random().toString(36).slice(2, 10),
    name: SLOT_META[accSlot].label + ' Fawkes (' + rMeta.label + ')',
    slot: accSlot,
    icon: SLOT_META[accSlot].icon,
    rarity: rarity,
    plus: 0,
    element: 'none',
    sockets: sockets,
    physAtk: Math.round(5 * scale),
    magAtk:  Math.round(5 * scale),
    physDef: Math.round(4 * scale),
    magDef:  Math.round(4 * scale),
    bonusStr: Math.round(2 * rMeta.mult),
    bonusInt: Math.round(2 * rMeta.mult),
    bonusLuc: Math.round(2 * rMeta.mult),
    sellPrice: Math.round(35 * scale)
  };
}

function generateRandomLapisItem(tier) {
  var pool = ['str', 'dex', 'rec', 'int', 'wis', 'luc', 'abs', 'elem_fire', 'elem_wind', 'elem_earth', 'elem_water'];
  if (tier === 'boss') pool.push('dual_fury', 'dual_arc', 'dual_tank');
  var key = pool[Math.floor(Math.random() * pool.length)];
  var meta = LAPIS_CATALOG[key];
  var lvl = 1;
  if (meta.kind !== 'elem') {
    if (meta.code.indexOf('/') >= 0) {
      lvl = tier === 'boss' ? 2 : 1;
    } else if (tier === 'boss') {
      lvl = Math.random() > 0.4 ? 6 : 5;
    } else if (tier === 'miniboss') {
      lvl = Math.random() > 0.5 ? 4 : 3;
    } else {
      lvl = Math.random() > 0.65 ? 2 : 1;
    }
  }
  return {
    id: 'lap_' + Math.random().toString(36).slice(2, 10),
    name: meta.kind === 'elem' ? meta.name : (meta.name + ' Nv.' + lvl),
    icon: '💎',
    slot: 'lapis',
    lapisKey: key,
    level: lvl,
    rarity: lvl >= 5 || meta.code.indexOf('/') >= 0 ? 'heroico' : (lvl >= 3 ? 'veneravel' : 'nobre'),
    sellPrice: lvl * 50,
    desc: formatLapisEffect({ lapisKey: key, level: lvl })
  };
}
