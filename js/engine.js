// ================= CANVAS & ESTADO GLOBAL =================
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var miniCanvas = document.getElementById('minimapCanvas');
var miniCtx = miniCanvas.getContext('2d');

var SAVE_KEY = 'shaiya_fawkes_v5_8classes';
var WORLD_SIZE = 3200;

var selectedFaction = 'light';
var selectedArch = 'solar_guard';
var creatorVisible = true;
var currentSlotIdx = null;
var player = null;

var monsters = [];
var projectiles = [];
var vfxList = [];
var floatingTexts = [];
var keys = {};
var bagPage = 0;
var selectedBagIndex = -1;
var smithTab = 'link';
var smithSlot = 'weapon';
var shopCategory = 'sets';

// ================= SISTEMA DE ANIMAÇÃO CONECTADO AO data-sprites.js =================
var playerAnim = {
  state: 'idle',
  frame: 0,
  timer: 0,
  attackTimer: 0,
  hurtTimer: 0
};

function triggerPlayerAnim(stateName, duration) {
  if (stateName === 'attack') {
    playerAnim.attackTimer = duration || 0.42;
    playerAnim.state = 'attack';
    playerAnim.frame = 0;
    playerAnim.timer = 0;
  } else if (stateName === 'hurt' && playerAnim.attackTimer <= 0) {
    playerAnim.hurtTimer = duration || 0.28;
    playerAnim.state = 'hurt';
    playerAnim.frame = 0;
    playerAnim.timer = 0;
  }
}

function updatePlayerAnimation(dt, isMoving) {
  if (playerAnim.attackTimer > 0) {
    playerAnim.attackTimer -= dt;
    playerAnim.state = 'attack';
  } else if (playerAnim.hurtTimer > 0) {
    playerAnim.hurtTimer -= dt;
    playerAnim.state = 'hurt';
  } else {
    playerAnim.state = isMoving ? 'run' : 'idle';
  }

  if (typeof SPRITE_SHEETS_CONFIG === 'undefined') return;
  var cfg = SPRITE_SHEETS_CONFIG.classes[player.archKey];
  if (!cfg || !cfg.anims) return;
  var anim = cfg.anims[playerAnim.state] || cfg.anims.idle;
  playerAnim.timer += dt;
  var frameDur = 1 / (anim.fps || 10);
  if (playerAnim.timer >= frameDur) {
    playerAnim.timer -= frameDur;
    playerAnim.frame = (playerAnim.frame + 1) % 60;
  }
}

function drawAnimatedCharacter(ctx, archKey, x, y, facing) {
  if (typeof drawConfiguredSprite !== 'function') return false;
  var glowColor = null;
  var weap = player.equip ? player.equip.weapon : null;
  if (weap && weap.element && weap.element !== 'none' && ELEMENTS[weap.element]) {
    glowColor = ELEMENTS[weap.element].color;
  } else if (weap && weap.plus >= 10) {
    glowColor = '#fbbf24';
  }
  return drawConfiguredSprite(ctx, 'classes', archKey, playerAnim.state, playerAnim.frame, x, y, facing, glowColor);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ================= UTILITÁRIOS DE SAVE & SLOT =================
function loadSlots() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    var parsed = raw ? JSON.parse(raw) : [null, null, null];
    while (parsed.length < 3) parsed.push(null);
    return parsed.slice(0, 3);
  } catch (e) {
    return [null, null, null];
  }
}

function saveSlots(slots) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
}

function saveCurrentHero() {
  if (!player || currentSlotIdx === null) return;
  var slots = loadSlots();
  slots[currentSlotIdx] = player;
  saveSlots(slots);
}

// ================= TELA DINÂMIZA DE SELEÇÃO E CRIAÇÃO (8 CLASSES) =================
function toggleCreatorPanel(forceShow) {
  var slots = loadSlots();
  var hasFreeSlot = slots.some(function(s) { return s === null; });
  if (forceShow && !hasFreeSlot) {
    alert('Todos os 3 slots já estão ocupados! Exclua um personagem ou inicie com um dos criados.');
    return;
  }
  creatorVisible = (typeof forceShow === 'boolean') ? forceShow : !creatorVisible;
  var panel = document.getElementById('creator-panel');
  if (panel) panel.style.display = creatorVisible ? 'block' : 'none';
}

function selectFaction(fac) {
  selectedFaction = fac;
  document.getElementById('fac-light').className = 'faction-btn' + (fac === 'light' ? ' active-light' : '');
  document.getElementById('fac-fury').className  = 'faction-btn' + (fac === 'fury'  ? ' active-fury'  : '');

  var factionKeys = Object.keys(ARCHETYPES).filter(function(k) {
    return !ARCHETYPES[k].faction || ARCHETYPES[k].faction === fac;
  });
  if (factionKeys.length > 0 && factionKeys.indexOf(selectedArch) === -1) {
    selectedArch = factionKeys[0];
  }
  renderClassGrid();
}

function selectArch(archKey) {
  selectedArch = archKey;
  renderClassGrid();
}

function renderClassGrid() {
  var grid = document.getElementById('class-grid');
  if (!grid || typeof ARCHETYPES === 'undefined') return;
  grid.innerHTML = '';

  var availableKeys = Object.keys(ARCHETYPES).filter(function(key) {
    var a = ARCHETYPES[key];
    return !a.faction || a.faction === selectedFaction;
  });

  if (availableKeys.indexOf(selectedArch) === -1 && availableKeys.length > 0) {
    selectedArch = availableKeys[0];
  }

  availableKeys.forEach(function(key) {
    var a = ARCHETYPES[key];
    var displayName = selectedFaction === 'fury' ? a.furyName : a.lightName;
    var raceName = selectedFaction === 'fury' ? a.raceFury : a.raceLight;

    var card = document.createElement('div');
    card.className = 'class-card' + (selectedArch === key ? ' selected' : '');
    card.onclick = function() { selectArch(key); };
    card.innerHTML =
      '<div class="class-icon" style="background:' + a.armorColor + '; border:2px solid ' + a.trimColor + ';">' + a.icon + '</div>' +
      '<h3 style="color:' + a.color + ';">' + displayName + '</h3>' +
      '<div class="sub-race">' + raceName + ' • ' + (a.range > 180 ? 'Longe' : (a.range > 130 ? 'Médio' : 'Perto')) + '</div>' +
      '<div class="auto-stat">' + a.autoStatLabel + '</div>';
    grid.appendChild(card);
  });

  renderClassPreviewCard();
}

function renderClassPreviewCard() {
  var box = document.getElementById('class-preview-card');
  if (!box || typeof ARCHETYPES === 'undefined') return;
  var a = ARCHETYPES[selectedArch] || ARCHETYPES.solar_guard;
  var isFury = selectedFaction === 'fury';
  var displayName = isFury ? a.furyName : a.lightName;
  var raceName = isFury ? a.raceFury : a.raceLight;
  var facBadge = isFury
    ? '<span style="color:#fb7185; font-weight:bold;">🔥 DARK (União da Fúria)</span>'
    : '<span style="color:#38bdf8; font-weight:bold;">☀️ LIGHT (Aliança da Luz)</span>';

  var skillsHtml = a.skills.map(function(sk, idx) {
    return '<span class="prev-sk-chip">' + (idx + 1) + '. ' + sk.icon + ' ' + sk.name + '</span>';
  }).join('');

  box.innerHTML =
    '<div>' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
        '<span style="font-size:1.15rem; font-weight:bold; color:' + a.color + ';">' + a.icon + ' ' + displayName + '</span>' +
        facBadge +
      '</div>' +
      '<div style="font-size:0.75rem; color:#cbd5e1; margin-bottom:6px;">' +
        '<b>Raça:</b> ' + raceName + ' &nbsp;|&nbsp; <b>Função:</b> ' + a.roleTag +
      '</div>' +
      '<p style="font-size:0.76rem; color:#94a3b8; line-height:1.4; margin-bottom:8px;">' +
        (isFury ? a.furyLore : a.lightLore) +
      '</p>' +
      '<div style="background:#131c2e; border:1px solid #263248; border-radius:8px; padding:7px 9px; font-size:0.73rem; line-height:1.5;">' +
        '<div>🎯 <b>Combate:</b> ' + a.combatType + ' (Alcance ' + a.range + ')</div>' +
        '<div>⚔️ <b>Armas Exclusivas:</b> ' + a.weaponRuleLabel + '</div>' +
        '<div>📈 <b>Bônus por Nível:</b> ' + a.autoStatLabel + ' + 9 Pontos Livres (UM)</div>' +
      '</div>' +
    '</div>' +
    '<div>' +
      '<div style="font-size:0.68rem; color:#fbbf24; font-weight:bold; text-transform:uppercase; margin-top:6px;">6 Habilidades Exclusivas da Classe:</div>' +
      '<div class="preview-skills-strip">' + skillsHtml + '</div>' +
    '</div>';
}

function renderSlotsGrid() {
  var slots = loadSlots();
  var grid = document.getElementById('slots-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var occupiedCount = slots.filter(function(s) { return s !== null; }).length;
  var hasFree = occupiedCount < 3;

  var toggleBtn = document.getElementById('btn-toggle-creator');
  if (toggleBtn) {
    toggleBtn.style.display = hasFree ? 'inline-block' : 'none';
  }

  if (occupiedCount > 0 && !hasFree) {
    creatorVisible = false;
  }
  var panel = document.getElementById('creator-panel');
  if (panel) panel.style.display = (creatorVisible && hasFree) ? 'block' : 'none';

  for (var i = 0; i < 3; i++) {
    var hero = slots[i];
    var card = document.createElement('div');

    if (!hero) {
      card.className = 'slot-card empty';
      card.onclick = function() { toggleCreatorPanel(true); document.getElementById('hero-name-input').focus(); };
      card.innerHTML =
        '<div style="font-size:1.8rem; margin-bottom:4px;">➕</div>' +
        '<div style="font-weight:bold; font-size:0.86rem;">Slot ' + (i + 1) + ' — Vazio</div>' +
        '<div style="font-size:0.72rem; margin-top:2px;">Clique para criar um novo personagem</div>';
    } else {
      var arch = ARCHETYPES[hero.archKey] || ARCHETYPES.solar_guard;
      var cName = getArchetypeDisplayName(hero.archKey, hero.faction);
      var facLabel = hero.faction === 'fury' ? '🔥 Dark' : '☀️ Light';
      var power = calculateHeroPower(hero);
      var medalHtml = renderKillRankBadgeHTML(hero.kills || 0);

      card.className = 'slot-card occupied';
      card.innerHTML =
        '<div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span class="slot-tag">Slot ' + (i + 1) + ' • ' + facLabel + ' • UM</span>' +
            '<button type="button" class="btn-del" onclick="deleteSlot(' + i + ')">Excluir</button>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:9px; margin-top:8px;">' +
            '<div style="width:42px; height:42px; border-radius:50%; background:' + arch.armorColor + '; border:2px solid ' + arch.trimColor + '; display:flex; align-items:center; justify-content:center; font-size:1.35rem;">' + arch.icon + '</div>' +
            '<div>' +
              '<div style="font-weight:bold; font-size:0.96rem; color:#fff; display:flex; align-items:center; gap:5px;">' + medalHtml + hero.name + '</div>' +
              '<div style="font-size:0.76rem; color:' + arch.color + '; font-weight:bold;">' + cName + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="slot-summary-pills">' +
            '<div class="sum-pill"><span>Nível</span><b>Nv.' + hero.lvl + '</b></div>' +
            '<div class="sum-pill"><span>Poder</span><b style="color:#fbbf24;">' + power + '</b></div>' +
            '<div class="sum-pill"><span>Kills</span><b style="color:#38bdf8;">' + (hero.kills || 0) + '</b></div>' +
            '<div class="sum-pill"><span>Classe</span><b>' + cName + '</b></div>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-play-slot" onclick="startWithSlot(' + i + ')">▶ Iniciar Jornada</button>';
    }
    grid.appendChild(card);
  }
}

function deleteSlot(idx) {
  if (!confirm('Tem certeza que deseja excluir este personagem permanentemente?')) return;
  var slots = loadSlots();
  slots[idx] = null;
  saveSlots(slots);
  if (slots.every(function(s) { return s === null; })) creatorVisible = true;
  renderSlotsGrid();
}

function createHero() {
  var nameInput = document.getElementById('hero-name-input');
  var name = nameInput.value.trim();
  if (!name) {
    alert('Digite um nome para o seu personagem!');
    nameInput.focus();
    return;
  }

  var slots = loadSlots();
  var emptyIdx = -1;
  for (var i = 0; i < 3; i++) {
    if (!slots[i]) { emptyIdx = i; break; }
  }
  if (emptyIdx === -1) {
    alert('Limite máximo de 3 personagens atingido!');
    return;
  }

  var arch = ARCHETYPES[selectedArch];
  var starterNames = {
    solar_guard:       'Machados Solares Iniciais',
    storm_valkyrie:    'Lança-Espada Inicial',
    telluric_colossus: 'Orbe Solar Telúrico Inicial',
    crystal_seraph:    'Foco de Cristal Inicial',
    spectral_reaper:   'Lâminas Espectrais Iniciais',
    abyssal_scourge:   'Chicote Abissal Inicial',
    royal_lich:        'Cajado de Garra Inicial',
    glacial_lich:      'Cetro Glacial Inicial'
  };

  var startWStats = (typeof buildClassBonusStats === 'function')
    ? buildClassBonusStats(selectedArch, 1, 1.25, 1.0)
    : { bonusStr: 2, bonusDex: 2, bonusRec: 2, bonusInt: 2, bonusWis: 2, bonusLuc: 2 };

  var starterWeapon = {
    id: 'start_w_' + Date.now(),
    name: starterNames[selectedArch] || 'Arma Inicial de Teos',
    slot: 'weapon',
    icon: arch.icon,
    wType: arch.weaponRuleLabel.split('&')[0].trim(),
    is2H: selectedArch !== 'solar_guard',
    reqArch: [selectedArch],
    rarity: 'nobre',
    plus: 0,
    element: 'none',
    sockets: [null, null],
    physAtk: arch.atkStyle === 'phys' ? 15 : 0,
    magAtk:  arch.atkStyle === 'magic' ? 15 : 0,
    bonusStr: startWStats.bonusStr,
    bonusDex: startWStats.bonusDex,
    bonusRec: startWStats.bonusRec,
    bonusInt: startWStats.bonusInt,
    bonusWis: startWStats.bonusWis,
    bonusLuc: startWStats.bonusLuc,
    sellPrice: 15
  };

  var equipObj = {
    weapon: starterWeapon,
    shield: null, helm: null, armor: null, pants: null, gloves: null, boots: null,
    cape: null, amulet: null, ring1: null, ring2: null, loop1: null, loop2: null, mount: null
  };

  if (selectedArch === 'solar_guard') {
    var startShStats = (typeof buildClassBonusStats === 'function')
      ? buildClassBonusStats('solar_guard', 1, 1.25, 0.9)
      : { bonusStr: 2, bonusDex: 0, bonusRec: 3, bonusInt: 0, bonusWis: 1, bonusLuc: 0 };

    equipObj.shield = {
      id: 'start_sh_' + Date.now(),
      name: 'Escudo Solar de Treino',
      slot: 'shield',
      icon: '🛡️',
      wType: 'Escudo Solar',
      reqArch: ['solar_guard'],
      rarity: 'nobre',
      plus: 0,
      element: 'none',
      sockets: [null, null],
      physDef: 14,
      magDef: 11,
      blockChance: 14,
      bonusStr: startShStats.bonusStr,
      bonusDex: startShStats.bonusDex,
      bonusRec: startShStats.bonusRec,
      bonusInt: startShStats.bonusInt,
      bonusWis: startShStats.bonusWis,
      bonusLuc: startShStats.bonusLuc,
      sellPrice: 15
    };
  }

  var spawnPos = (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.getFactionSpawn === 'function')
    ? WorldSceneryModule.getFactionSpawn(selectedFaction)
    : (selectedFaction === 'fury' ? { x: 2400, y: 800 } : { x: 736, y: 2496 });

  var newHero = {
    name: name,
    faction: selectedFaction,
    archKey: selectedArch,
    mode: 'um',
    lvl: 1,
    xp: 0,
    nextXp: 100,
    gold: 600,
    kills: 0,
    deaths: 0,
    freePts: 9,
    allocStats: { str: 0, dex: 0, rec: 0, int: 0, wis: 0, luc: 0 },
    hp: 240, mp: 140, sp: 140,
    x: spawnPos.x, y: spawnPos.y,
    tx: spawnPos.x, ty: spawnPos.y,
    facing: 1,
    isMoving: false,
    autoCombat: false,
    buffs: [],
    debuffs: [],
    equip: equipObj,
    bag: [
      { id: 'pot_hp_init', name: 'Poção de Vida Grande', icon: '🧪', slot: 'consumable', effect: 'hp', amount: 260, qty: 10, rarity: 'nobre', sellPrice: 10, desc: 'Restaura 260 de HP instantaneamente.' },
      { id: 'pot_mp_init', name: 'Poção de Mana/Vigor', icon: '⚗️', slot: 'consumable', effect: 'mp_sp', amount: 180, qty: 10, rarity: 'nobre', sellPrice: 10, desc: 'Restaura 180 de MP e SP.' },
      { id: 'res_rune_1',  name: 'Runa de Ressurreição (UM)', icon: '✝️', slot: 'consumable', effect: 'res_rune', qty: 1, rarity: 'heroico', sellPrice: 120, desc: 'Salva o herói da morte permanente no Modo Extremo (UM).' },
      { id: 'link_stone_1',name: 'Pedra de Linkagem', icon: '🔮', slot: 'consumable', effect: 'link_stone', qty: 2, rarity: 'veneravel', sellPrice: 70, desc: '+25% de sucesso no Ferreiro e impede a Lapis de quebrar.' }
    ]
  };

  slots[emptyIdx] = newHero;
  saveSlots(slots);
  nameInput.value = '';
  startWithSlot(emptyIdx);
}

function startWithSlot(idx) {
  var slots = loadSlots();
  if (!slots[idx]) return;
  if (!ARCHETYPES[slots[idx].archKey]) {
    slots[idx].archKey = slots[idx].faction === 'fury' ? 'spectral_reaper' : 'solar_guard';
  }
  currentSlotIdx = idx;
  player = slots[idx];

  if (!player.allocStats) player.allocStats = { str: 0, dex: 0, rec: 0, int: 0, wis: 0, luc: 0 };
  if (!player.buffs) player.buffs = [];
  if (!player.debuffs) player.debuffs = [];
  if (typeof player.kills !== 'number') player.kills = 0;
  if (typeof player.deaths !== 'number') player.deaths = 0;

  var sp = (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.getFactionSpawn === 'function')
    ? WorldSceneryModule.getFactionSpawn(player.faction)
    : (player.faction === 'fury' ? { x: 2400, y: 800 } : { x: 736, y: 2496 });

  if (typeof player.x !== 'number' || isNaN(player.x) || (player.x === 520 && player.y === 520)) {
    player.x = sp.x;
    player.y = sp.y;
  }
  player.tx = player.x;
  player.ty = player.y;

  var st = getPlayerDerivedStats();
  player.hp = Math.min(st.maxHp, player.hp || st.maxHp);
  player.mp = Math.min(st.maxMp, player.mp || st.maxMp);
  player.sp = Math.min(st.maxSp, player.sp || st.maxSp);

  document.getElementById('char-screen').style.display = 'none';
  document.getElementById('hud-top-left').style.display = 'flex';
  document.getElementById('hud-top-right').style.display = 'flex';
  document.getElementById('hud-bottom').style.display = 'flex';
  document.getElementById('controls-hint').style.display = 'block';

  selectedTargetId = null;
  spawnInitialMonsters();
  buildSkillDock();
  updateAllHUD();
}

function returnToCharSelect() {
  saveCurrentHero();
  closeAllWindows();
  if (player) player.autoCombat = false;
  document.getElementById('char-screen').style.display = 'flex';
  document.getElementById('hud-top-left').style.display = 'none';
  document.getElementById('hud-target-box').style.display = 'none';
  document.getElementById('hud-top-right').style.display = 'none';
  document.getElementById('hud-bottom').style.display = 'none';
  document.getElementById('controls-hint').style.display = 'none';
  creatorVisible = false;
  renderSlotsGrid();
}

// ================= CÁLCULO DE STATUS (ESTILO SHAIYA), PODER E ELEMENTOS =================
function getItemPowerScore(item) {
  if (!item) return 0;
  var rMult = (RARITIES[item.rarity] ? RARITIES[item.rarity].mult : 1);
  var plusBonus = (item.plus || 0) * 14;
  var socketBonus = 0;
  if (Array.isArray(item.sockets)) {
    item.sockets.forEach(function(s) {
      if (s) socketBonus += (s.level || 1) * 18;
    });
  }
  var rawStats = (item.physAtk || 0) * 2.2 + (item.magAtk || 0) * 2.2 +
                 (item.physDef || 0) * 1.8 + (item.magDef || 0) * 1.8 +
                 ((item.bonusStr || 0) + (item.bonusDex || 0) + (item.bonusRec || 0) +
                  (item.bonusInt || 0) + (item.bonusWis || 0) + (item.bonusLuc || 0)) * 2.5 +
                 (item.speedBonus || 0) * 1.5;
  return Math.round(rawStats * (1 + (item.plus || 0) * 0.06) + plusBonus + socketBonus + rMult * 10);
}

function calculateHeroPower(heroObj) {
  if (!heroObj) return 0;
  var eqScore = 0;
  if (heroObj.equip) {
    Object.keys(heroObj.equip).forEach(function(sl) {
      if (heroObj.equip[sl]) eqScore += getItemPowerScore(heroObj.equip[sl]);
    });
  }
  return Math.round(heroObj.lvl * 35 + eqScore + (heroObj.kills || 0) * 0.25);
}

function getPlayerDerivedStats() {
  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;
  var total = {
    str: arch.baseStats.str + (player.allocStats.str || 0),
    dex: arch.baseStats.dex + (player.allocStats.dex || 0),
    rec: arch.baseStats.rec + (player.allocStats.rec || 0),
    int: arch.baseStats.int + (player.allocStats.int || 0),
    wis: arch.baseStats.wis + (player.allocStats.wis || 0),
    luc: arch.baseStats.luc + (player.allocStats.luc || 0)
  };
  total[arch.autoStat] += Math.max(0, player.lvl - 1);

  var eqPhysAtk = 0, eqMagAtk = 0, eqPhysDef = 0, eqMagDef = 0;
  var absDamage = 0, cdrPct = 0, moveBonus = 0, blockChance = 0;
  var atkElem = 'none', defElem = 'none';

  Object.keys(player.equip).forEach(function(slotKey) {
    var it = player.equip[slotKey];
    if (!it) return;
    var pMult = 1 + (it.plus || 0) * 0.07;

    eqPhysAtk += Math.round((it.physAtk || 0) * pMult);
    eqMagAtk  += Math.round((it.magAtk  || 0) * pMult);
    eqPhysDef += Math.round((it.physDef || 0) * pMult);
    eqMagDef  += Math.round((it.magDef  || 0) * pMult);
    blockChance += (it.blockChance || 0);

    total.str += (it.bonusStr || 0);
    total.dex += (it.bonusDex || 0);
    total.rec += (it.bonusRec || 0);
    total.int += (it.bonusInt || 0);
    total.wis += (it.bonusWis || 0);
    total.luc += (it.bonusLuc || 0);
    moveBonus += (it.speedBonus || 0);

    if (slotKey === 'weapon' && it.element && it.element !== 'none') atkElem = it.element;
    if (slotKey === 'armor'  && it.element && it.element !== 'none') defElem = it.element;

    if (Array.isArray(it.sockets)) {
      it.sockets.forEach(function(sock) {
        if (!sock || !LAPIS_CATALOG[sock.lapisKey]) return;
        var lMeta = LAPIS_CATALOG[sock.lapisKey];
        var lLvl = sock.level || 1;
        if (lMeta.kind === 'abs')   absDamage += (lMeta.abs[lLvl] || 0);
        if (lMeta.kind === 'sonic') cdrPct    += (lMeta.cdr[lLvl] || 0);
        if (lMeta.kind === 'swift') moveBonus += (lMeta.spd[lLvl] || 0);
        if (lMeta.kind === 'elem') {
          if (slotKey === 'weapon') atkElem = lMeta.element;
          if (slotKey === 'armor')  defElem = lMeta.element;
        }
        if (lMeta.stats) {
          Object.keys(lMeta.stats).forEach(function(sk) {
            total[sk] = (total[sk] || 0) + (lMeta.stats[sk][lLvl] || 0);
          });
        }
      });
    }
  });

  var rk = getKillRankInfo(player.kills || 0);
  if (rk) {
    var rkBonus = rk.data.pts;
    total.str += rkBonus; total.dex += rkBonus; total.rec += rkBonus;
    total.int += rkBonus; total.wis += rkBonus; total.luc += rkBonus;
  }

  var isTank = (player.archKey === 'solar_guard' || player.archKey === 'telluric_colossus');
  var isCaster = (arch.atkStyle === 'magic');
  var hpPerRec = isTank ? 18 : (isCaster ? 12 : 14);
  var mpPerWis = isCaster ? 15 : 10;

  var maxHp = 150 + player.lvl * (isTank ? 38 : 30) + total.rec * hpPerRec;
  var maxMp = 80  + player.lvl * (isCaster ? 22 : 15) + total.wis * mpPerWis;
  var maxSp = 80  + player.lvl * 18 + total.dex * 9;

  var physAtk = Math.round(total.str * 2.4 + total.dex * 0.75 + eqPhysAtk);
  var magAtk  = Math.round(total.int * 2.6 + total.wis * 0.85 + eqMagAtk);
  var physDef = Math.round(total.rec * 1.9 + total.dex * 0.5 + eqPhysDef);
  var magDef  = Math.round(total.wis * 2.0 + total.rec * 0.6 + eqMagDef);

  player.buffs.forEach(function(b) {
    if (b.id === 'atk') { physAtk = Math.round(physAtk * 1.25); magAtk = Math.round(magAtk * 1.30); }
    if (b.id === 'def') { physDef = Math.round(physDef * 1.40); magDef = Math.round(magDef * 1.40); }
  });

  var critChance = Math.min(75, Math.round(5 + total.luc * 0.48));
  var evaChance  = Math.min(60, Math.round(4 + total.dex * 0.38));
  player.buffs.forEach(function(b) {
    if (b.id === 'crit') critChance = Math.min(85, critChance + 25);
    if (b.id === 'eva')  evaChance  = Math.min(75, evaChance + 25);
  });

  var baseSpeed = (player.archKey === 'storm_valkyrie' || player.archKey === 'spectral_reaper') ? 232 :
                  (player.archKey === 'telluric_colossus' ? 198 : 215);

  return {
    stats: total,
    maxHp: maxHp, maxMp: maxMp, maxSp: maxSp,
    physAtk: physAtk, magAtk: magAtk,
    physDef: physDef, magDef: magDef,
    absDamage: absDamage,
    cdrPct: Math.min(50, cdrPct),
    moveSpeed: baseSpeed + moveBonus,
    critChance: critChance,
    evaChance: evaChance,
    blockChance: Math.min(45, blockChance),
    atkElem: atkElem,
    defElem: defElem,
    power: calculateHeroPower(player)
  };
}

// ================= MUNDO 2.5D & MONSTROS =================
var selectedTargetId = null;
var skillCooldowns = [0, 0, 0, 0, 0, 0];
var autoAttackTimer = 0;

function spawnInitialMonsters() {
  monsters = [];
  for (var i = 0; i < 34; i++) {
    spawnOneMonster(i);
  }
}

function spawnOneMonster(seedIdx) {
  var db = (typeof MOBS_DB !== 'undefined' && MOBS_DB.length) ? MOBS_DB : [
    { name: 'Javali Selvagem', icon: '🐗', tier: 'normal', baseLvl: 1, hp: 95, atk: 12, def: 4, xp: 32, gold: 18, elem: 'earth', color: '#a16207' },
    { name: 'Lobo das Sombras', icon: '🐺', tier: 'normal', baseLvl: 3, hp: 145, atk: 18, def: 6, xp: 48, gold: 26, elem: 'wind', color: '#475569' },
    { name: 'Elemental Ígneo', icon: '🔥', tier: 'miniboss', baseLvl: 6, hp: 360, atk: 34, def: 14, xp: 130, gold: 75, elem: 'fire', color: '#dc2626' },
    { name: 'Guardião Abissal', icon: '👹', tier: 'boss', baseLvl: 10, hp: 920, atk: 58, def: 24, xp: 380, gold: 220, elem: 'water', color: '#1d4ed8' }
  ];

  var tpl = db[seedIdx % db.length];
  var mx = 220 + Math.random() * (WORLD_SIZE - 440);
  var my = 220 + Math.random() * (WORLD_SIZE - 440);

  if (typeof WorldSceneryModule !== 'undefined') {
    var spLight = typeof WorldSceneryModule.getFactionSpawn === 'function' ? WorldSceneryModule.getFactionSpawn('light') : { x: 736, y: 2496 };
    var spFury  = typeof WorldSceneryModule.getFactionSpawn === 'function' ? WorldSceneryModule.getFactionSpawn('fury')  : { x: 2400, y: 800 };
    for (var tries = 0; tries < 15; tries++) {
      mx = 180 + Math.random() * (WORLD_SIZE - 360);
      my = 180 + Math.random() * (WORLD_SIZE - 360);
      var inWater = typeof WorldSceneryModule.isInWater === 'function' ? WorldSceneryModule.isInWater(mx, my, 24) : false;
      var nearBase = Math.hypot(mx - spLight.x, my - spLight.y) < 230 || Math.hypot(mx - spFury.x, my - spFury.y) < 230;
      if (!inWater && !nearBase) break;
    }
  }

  var zoneLvl = (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.getZoneLevelAt === 'function')
    ? WorldSceneryModule.getZoneLevelAt(mx, my)
    : Math.min(15, tpl.baseLvl || 1);
  var mobLvl = Math.min(15, Math.max(1, zoneLvl + (tpl.tier === 'boss' ? 2 : 0)));
  var scale = 1 + (mobLvl - 1) * 0.16;

  var mobObj = {
    id: 'mob_' + Math.random().toString(36).slice(2, 9),
    name: tpl.name,
    icon: tpl.icon,
    tier: tpl.tier || 'normal',
    lvl: mobLvl,
    hp: Math.round(tpl.hp * scale),
    maxHp: Math.round(tpl.hp * scale),
    atk: Math.round(tpl.atk * scale),
    def: Math.round(tpl.def * scale),
    xp: Math.round(tpl.xp * scale),
    gold: Math.round(tpl.gold * scale),
    elem: tpl.elem || 'none',
    color: tpl.color || '#ef4444',
    x: mx, y: my,
    homeX: mx, homeY: my,
    facing: 1,
    animState: 'idle',
    animFrame: 0,
    animTimer: 0,
    atkCd: 0,
    stunTimer: 0,
    dotTimer: 0,
    dotDmg: 0
  };

  if (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.resolveCollision === 'function') {
    WorldSceneryModule.resolveCollision(mobObj, 18);
  }
  monsters.push(mobObj);
}

// ================= COMBATE, SKILLS & EFEITOS VISUAIS DAS 8 CLASSES =================
function buildSkillDock() {
  var dock = document.getElementById('skill-dock');
  dock.innerHTML = '';
  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;

  arch.skills.forEach(function(sk, i) {
    var slot = document.createElement('div');
    slot.className = 'sk-slot';
    slot.title = sk.name + ' (' + sk.cost + ' ' + sk.res.toUpperCase() + ')';
    slot.onclick = function() { useClassSkill(i); };
    slot.innerHTML =
      '<span class="sk-key">' + (i + 1) + '</span>' +
      '<span class="sk-ico">' + sk.icon + '</span>' +
      '<span class="sk-cost-dot" style="color:' + (sk.res === 'mp' ? '#60a5fa' : '#facc15') + ';">' + sk.cost + '</span>' +
      '<div id="sk-cd-' + i + '" class="sk-cd"></div>';
    dock.appendChild(slot);
  });

  var potHp = document.createElement('div');
  potHp.className = 'sk-slot';
  potHp.title = 'Usar Poção de Vida (Tecla 7)';
  potHp.onclick = function() { quickUsePotion('hp'); };
  potHp.innerHTML = '<span class="sk-key">7</span><span class="sk-ico">🧪</span><span id="dock-hp-qty" class="sk-cost-dot" style="color:#f87171;">0</span>';
  dock.appendChild(potHp);

  var potMp = document.createElement('div');
  potMp.className = 'sk-slot';
  potMp.title = 'Usar Poção de Mana/Vigor (Tecla 8)';
  potMp.onclick = function() { quickUsePotion('mp_sp'); };
  potMp.innerHTML = '<span class="sk-key">8</span><span class="sk-ico">⚗️</span><span id="dock-mp-qty" class="sk-cost-dot" style="color:#60a5fa;">0</span>';
  dock.appendChild(potMp);

  var autoBtn = document.createElement('button');
  autoBtn.type = 'button';
  autoBtn.id = 'btn-auto-combat';
  autoBtn.className = 'btn-auto-ep' + (player.autoCombat ? ' active' : '');
  autoBtn.onclick = toggleAutoCombat;
  autoBtn.innerHTML = 'AUTO<br>(A)';
  dock.appendChild(autoBtn);
}

function toggleAutoCombat() {
  player.autoCombat = !player.autoCombat;
  var btn = document.getElementById('btn-auto-combat');
  if (btn) btn.className = 'btn-auto-ep' + (player.autoCombat ? ' active' : '');
}

function quickUsePotion(effectType) {
  var idx = player.bag.findIndex(function(it) { return it && it.slot === 'consumable' && it.effect === effectType; });
  if (idx === -1) {
    addFloatingText(player.x, player.y - 35, 'Sem poção!', '#94a3b8');
    return;
  }
  consumeBagItem(idx);
}

function getSelectedTarget() {
  if (!selectedTargetId) return null;
  return monsters.find(function(m) { return m.id === selectedTargetId && m.hp > 0; }) || null;
}

function findNearestMonster() {
  var best = null, bestDist = Infinity;
  monsters.forEach(function(m) {
    if (m.hp <= 0) return;
    var d = Math.hypot(m.x - player.x, m.y - player.y);
    if (d < bestDist) { bestDist = d; best = m; }
  });
  return best;
}

function spawnSkillVFX(x, y, sk, isSelf) {
  vfxList.push({
    x: x,
    y: y,
    r: isSelf ? 16 : 14,
    maxR: isSelf ? 90 : (sk.aoe ? 140 : 72),
    color: sk.color,
    vfxType: sk.vfx || 'ring',
    alpha: 0.95
  });
}

function useClassSkill(idx) {
  if (!player || player.hp <= 0) return;

  if (typeof BossSkillsModule !== 'undefined') {
    if (BossSkillsModule.hasDebuff('debuff_stun')) {
      addFloatingText(player.x, player.y - 36, '💫 Atordoado!', '#eab308');
      return;
    }
    if (BossSkillsModule.hasDebuff('debuff_silence')) {
      addFloatingText(player.x, player.y - 36, '🔇 Silenciado!', '#a855f7');
      return;
    }
  }

  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;
  var sk = arch.skills[idx];
  if (!sk) return;

  if (skillCooldowns[idx] > 0) return;

  if (sk.res === 'mp' && player.mp < sk.cost) {
    addFloatingText(player.x, player.y - 36, 'MP Insuficiente!', '#60a5fa');
    return;
  }
  if (sk.res === 'sp' && player.sp < sk.cost) {
    addFloatingText(player.x, player.y - 36, 'SP Insuficiente!', '#facc15');
    return;
  }

  var st = getPlayerDerivedStats();
  var target = getSelectedTarget();

  if (sk.range === 0) {
    if (sk.res === 'mp') player.mp -= sk.cost; else player.sp -= sk.cost;
    skillCooldowns[idx] = sk.cd * (1 - st.cdrPct / 100);
    triggerPlayerAnim('attack', 0.36);

    if (sk.heal) {
      var healAmt = Math.round(st.maxHp * sk.heal);
      player.hp = Math.min(st.maxHp, player.hp + healAmt);
      addFloatingText(player.x, player.y - 42, '+' + healAmt + ' HP', '#34d399');
    }
    if (sk.buff) {
      player.buffs = player.buffs.filter(function(b) { return b.id !== sk.buff.id; });
      player.buffs.push({ id: sk.buff.id, label: sk.buff.label, timer: sk.buff.dur });
      addFloatingText(player.x, player.y - 56, sk.buff.label, '#fde047');
    }
    spawnSkillVFX(player.x, player.y, sk, true);
    updateAllHUD();
    return;
  }

  if (!target) {
    target = findNearestMonster();
    if (target) selectedTargetId = target.id;
  }
  if (!target) return;

  var dist = Math.hypot(target.x - player.x, target.y - player.y);
  if (dist > sk.range) {
    player.tx = target.x;
    player.ty = target.y;
    addFloatingText(player.x, player.y - 36, 'Aproximando...', '#cbd5e1');
    return;
  }

  if (sk.res === 'mp') player.mp -= sk.cost; else player.sp -= sk.cost;
  skillCooldowns[idx] = sk.cd * (1 - st.cdrPct / 100);
  player.facing = target.x >= player.x ? 1 : -1;
  triggerPlayerAnim('attack', 0.42);

  if (sk.dash) {
    player.x = target.x - player.facing * 42;
    player.y = target.y;
    player.tx = player.x;
    player.ty = player.y;
  }

  if (sk.heal) {
    var secondaryHeal = Math.round(st.maxHp * sk.heal);
    player.hp = Math.min(st.maxHp, player.hp + secondaryHeal);
    addFloatingText(player.x, player.y - 46, '+' + secondaryHeal + ' HP', '#34d399');
  }

  var basePower = arch.atkStyle === 'magic' ? st.magAtk : st.physAtk;
  var elemMult = getElementMultiplier(st.atkElem, target.elem);
  var isCrit = (Math.random() * 100) < st.critChance;

  var targetsHit = [target];
  if (sk.aoe) {
    monsters.forEach(function(m) {
      if (m.id !== target.id && m.hp > 0 && Math.hypot(m.x - target.x, m.y - target.y) <= 140) {
        targetsHit.push(m);
      }
    });
  }

  targetsHit.forEach(function(t) {
    var rawDmg = Math.max(5, Math.round((basePower * sk.mult - t.def * 0.45) * elemMult));
    if (isCrit) rawDmg = Math.round(rawDmg * 1.75);
    applyDamageToMonster(t, rawDmg, isCrit, elemMult, sk);
  });

  if (sk.proj || sk.vfx === 'abyss_whip' || sk.vfx === 'abyss_pull' || sk.vfx === 'telluric_beam') {
    projectiles.push({
      x: player.x,
      y: player.y - 14,
      tx: target.x,
      ty: target.y - 14,
      color: sk.color,
      vfxType: sk.vfx || 'beam',
      life: 0.28
    });
  }
  spawnSkillVFX(target.x, target.y, sk, false);
  updateAllHUD();
}

function applyDamageToMonster(m, dmg, isCrit, elemMult, sk) {
  m.hp -= dmg;
  var label = (isCrit ? '💥 ' : '') + dmg;
  if (elemMult > 1.05) label += ' 🔥SUP!';
  else if (elemMult < 0.95) label += ' 🛡️RES';

  addFloatingText(m.x, m.y - 34, label, isCrit ? '#fbbf24' : '#ffffff');

  if (sk && sk.stun) m.stunTimer = Math.max(m.stunTimer, sk.stun);
  if (sk && sk.dot) {
    m.dotTimer = 4.0;
    m.dotDmg = Math.max(4, Math.round(dmg * sk.dot));
  }

  if (m.hp <= 0) {
    m.hp = 0;
    handleMonsterDeath(m);
  }
}

function handleMonsterDeath(m) {
  player.kills = (player.kills || 0) + 1;
  player.xp += m.xp;
  player.gold += m.gold;

  if (m.isPvpRival) {
    addFloatingText(player.x, player.y - 58, '⚔️ +1 KILL PVP! +' + m.xp + ' XP  +$' + m.gold, '#fbbf24');
  } else {
    addFloatingText(player.x, player.y - 52, '+' + m.xp + ' XP  +$' + m.gold, '#34d399');
  }

  var dropChance = m.isPvpRival ? 0.85 : (m.tier === 'normal' ? 0.42 : 0.95);
  if (Math.random() < dropChance) {
    var dropItem = (Math.random() < 0.35) ? generateRandomLapisItem(m.isPvpRival ? 'boss' : m.tier) : generateDropItem(m.lvl, m.isPvpRival ? 'miniboss' : m.tier);
    if (player.bag.length < 120) {
      player.bag.push(dropItem);
      var rCol = RARITIES[dropItem.rarity] ? RARITIES[dropItem.rarity].color : '#38bdf8';
      addFloatingText(m.x, m.y - 18, '📦 ' + dropItem.name, rCol);
    }
  }

  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp;
    player.lvl += 1;
    player.nextXp = Math.round(player.nextXp * 1.32);
    player.freePts += EXTREME_MODE.ptsPerLvl;
    var st = getPlayerDerivedStats();
    player.hp = st.maxHp;
    player.mp = st.maxMp;
    player.sp = st.maxSp;
    addFloatingText(player.x, player.y - 72, '⭐ SUBIU PARA O NÍVEL ' + player.lvl + '!', '#fbbf24');
  }

  if (selectedTargetId === m.id) selectedTargetId = null;
  saveCurrentHero();

  setTimeout(function() {
    var idx = monsters.indexOf(m);
    if (idx !== -1) monsters.splice(idx, 1);
    if (!m.isPvpRival) {
      spawnOneMonster(Math.floor(Math.random() * 50));
    }
  }, 2400);
}

// ================= INVENTÁRIO: EQUIPAR MELHORES, VENDER TUDO & CLICAR NO ITEM =================
function equipBestItemsFromBag() {
  if (!player) return;
  var equippedCount = 0;

  for (var i = player.bag.length - 1; i >= 0; i--) {
    var item = player.bag[i];
    if (!item || item.slot === 'consumable' || item.slot === 'lapis') continue;

    var check = canEquipItem(item);
    if (!check.ok) continue;

    var targetSlot = item.slot;
    if (targetSlot === 'ring1' || targetSlot === 'ring2') {
      var s1 = getItemPowerScore(player.equip.ring1);
      var s2 = getItemPowerScore(player.equip.ring2);
      targetSlot = s1 <= s2 ? 'ring1' : 'ring2';
    } else if (targetSlot === 'loop1' || targetSlot === 'loop2') {
      var l1 = getItemPowerScore(player.equip.loop1);
      var l2 = getItemPowerScore(player.equip.loop2);
      targetSlot = l1 <= l2 ? 'loop1' : 'loop2';
    }

    var currentEquipped = player.equip[targetSlot];
    if (getItemPowerScore(item) > getItemPowerScore(currentEquipped)) {
      equipItemFromBag(i, targetSlot, true);
      equippedCount++;
    }
  }

  saveCurrentHero();
  renderInventoryWindow();
  updateAllHUD();

  var tip = document.getElementById('item-tooltip-box');
  if (tip) {
    tip.innerHTML = '<div style="color:#34d399; font-weight:bold; text-align:center; margin:auto;">' +
      (equippedCount > 0 ? '✨ ' + equippedCount + ' item(ns) mais forte(s) equipado(s) automaticamente!' : '✅ Você já está usando os melhores itens compatíveis com sua classe!') +
      '</div>';
  }
}

function sellAllLooseItemsInBag() {
  if (!player) return;
  var totalGold = 0;
  var soldCount = 0;

  for (var i = player.bag.length - 1; i >= 0; i--) {
    var it = player.bag[i];
    if (!it || it.slot === 'consumable') continue;
    totalGold += (it.sellPrice || 15) * (it.qty || 1);
    soldCount++;
    player.bag.splice(i, 1);
  }

  if (soldCount === 0) {
    alert('Não há equipamentos ou Lapis soltos na mochila para vender.');
    return;
  }

  player.gold += totalGold;
  selectedBagIndex = -1;
  saveCurrentHero();
  renderInventoryWindow();
  updateAllHUD();

  var tip = document.getElementById('item-tooltip-box');
  if (tip) {
    tip.innerHTML = '<div style="color:#fbbf24; font-weight:bold; text-align:center; margin:auto;">💰 Você vendeu ' + soldCount + ' item(ns) por +$' + totalGold + ' Ouro!</div>';
  }
}

function equipItemFromBag(bagIdx, forcedSlot, silent) {
  var item = player.bag[bagIdx];
  if (!item) return;

  if (item.slot === 'consumable') {
    consumeBagItem(bagIdx);
    return;
  }

  var check = canEquipItem(item);
  if (!check.ok) {
    if (!silent) alert(check.reason);
    return;
  }

  var targetSlot = forcedSlot || item.slot;
  if (!forcedSlot && (targetSlot === 'ring1' || targetSlot === 'loop1')) {
    var altSlot = targetSlot === 'ring1' ? 'ring2' : 'loop2';
    if (player.equip[targetSlot] && !player.equip[altSlot]) targetSlot = altSlot;
  }

  if (targetSlot === 'weapon' && item.is2H && player.equip.shield) {
    player.bag.push(player.equip.shield);
    player.equip.shield = null;
  }
  if (targetSlot === 'shield' && player.equip.weapon && player.equip.weapon.is2H) {
    player.bag.push(player.equip.weapon);
    player.equip.weapon = null;
  }

  var oldEquip = player.equip[targetSlot];
  player.equip[targetSlot] = item;
  player.bag.splice(bagIdx, 1);
  if (oldEquip) player.bag.push(oldEquip);

  if (!silent) {
    selectedBagIndex = -1;
    saveCurrentHero();
    renderInventoryWindow();
    updateAllHUD();
  }
}

function sellBagItem(bagIdx) {
  var item = player.bag[bagIdx];
  if (!item) return;
  var val = item.sellPrice || 15;
  player.gold += val;
  if (item.qty && item.qty > 1) {
    item.qty -= 1;
  } else {
    player.bag.splice(bagIdx, 1);
    selectedBagIndex = -1;
  }
  saveCurrentHero();
  renderInventoryWindow();
  updateAllHUD();
}

function consumeBagItem(bagIdx) {
  var item = player.bag[bagIdx];
  if (!item || item.slot !== 'consumable') return;
  var st = getPlayerDerivedStats();

  if (item.effect === 'hp') {
    player.hp = Math.min(st.maxHp, player.hp + item.amount);
    addFloatingText(player.x, player.y - 36, '+' + item.amount + ' HP', '#34d399');
  } else if (item.effect === 'mp_sp') {
    player.mp = Math.min(st.maxMp, player.mp + item.amount);
    player.sp = Math.min(st.maxSp, player.sp + item.amount);
    addFloatingText(player.x, player.y - 36, '+' + item.amount + ' MP/SP', '#38bdf8');
  } else {
    alert('Este item especial é usado automaticamente no Ferreiro ou na Ressurreição (UM)!');
    return;
  }

  if (item.qty && item.qty > 1) item.qty -= 1;
  else player.bag.splice(bagIdx, 1);

  saveCurrentHero();
  if (document.getElementById('bag-modal').style.display === 'flex') renderInventoryWindow();
  updateAllHUD();
}

function switchBagPage(p) {
  bagPage = p;
  for (var i = 0; i < 5; i++) {
    var b = document.getElementById('btab-' + i);
    if (b) b.className = 'bag-tab' + (i === p ? ' active' : '');
  }
  renderInventoryWindow();
}

function renderInventoryWindow() {
  if (!player) return;
  var st = getPlayerDerivedStats();
  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;
  document.getElementById('bag-gold-lbl').textContent = player.gold;
  document.getElementById('pd-hero-ico').textContent = arch.icon;
  document.getElementById('pd-hero-name').textContent = player.name;
  document.getElementById('pd-hero-br').textContent = 'Poder: ' + st.power;

  var atkEl = ELEMENTS[st.atkElem] || ELEMENTS.none;
  var defEl = ELEMENTS[st.defElem] || ELEMENTS.none;
  document.getElementById('pd-hero-elem').innerHTML = '<span class="elem-tag" style="color:' + atkEl.color + '; background:' + atkEl.bg + ';">ATQ: ' + atkEl.icon + ' ' + atkEl.label + '</span>';
  document.getElementById('pd-hero-def-elem').innerHTML = '<span class="elem-tag" style="color:' + defEl.color + '; background:' + defEl.bg + ';">DEF: ' + defEl.icon + ' ' + defEl.label + '</span>';

  Object.keys(SLOT_META).forEach(function(slotKey) {
    var el = document.getElementById('pd-' + slotKey);
    if (!el) return;
    var it = player.equip[slotKey];
    if (!it) {
      el.style.borderColor = '#334155';
      el.innerHTML = '<span class="pd-slot-ico" style="opacity:0.28;">' + SLOT_META[slotKey].icon + '</span><span class="pd-slot-lbl">' + SLOT_META[slotKey].label + '</span>';
    } else {
      var rCol = RARITIES[it.rarity] ? RARITIES[it.rarity].color : '#94a3b8';
      el.style.borderColor = rCol;
      var plusHtml = it.plus > 0 ? '<span class="pd-plus-tag">+' + it.plus + '</span>' : '';
      var elemHtml = (it.element && it.element !== 'none') ? '<span class="pd-elem-badge">' + ELEMENTS[it.element].icon + '</span>' : '';
      el.innerHTML = plusHtml + elemHtml + '<span class="pd-slot-ico">' + it.icon + '</span><span class="pd-slot-lbl" style="color:' + rCol + ';">' + SLOT_META[slotKey].label + '</span>';
    }
  });

  var grid = document.getElementById('bag-cells-grid');
  grid.innerHTML = '';
  var start = bagPage * 24;
  for (var c = 0; c < 24; c++) {
    var idx = start + c;
    var item = player.bag[idx];
    var cell = document.createElement('div');
    cell.className = 'bag-cell' + (selectedBagIndex === idx ? ' selected-cell' : '');

    if (item) {
      var rCol = RARITIES[item.rarity] ? RARITIES[item.rarity].color : '#475569';
      cell.style.borderColor = rCol;
      cell.onclick = (function(i) { return function() { inspectBagItem(i); }; })(idx);

      var dotsHtml = '';
      if (Array.isArray(item.sockets) && item.sockets.length > 0) {
        dotsHtml = '<div class="cell-sockets">' + item.sockets.map(function(s) {
          var dCol = s && LAPIS_CATALOG[s.lapisKey] ? LAPIS_CATALOG[s.lapisKey].color : 'transparent';
          return '<span class="cell-dot" style="background:' + dCol + ';"></span>';
        }).join('') + '</div>';
      }

      var check = canEquipItem(item);
      var cmpHtml = '';
      if (item.slot !== 'consumable' && item.slot !== 'lapis') {
        if (!check.ok) {
          cmpHtml = '<span class="cmp-arrow cmp-down" title="' + check.reason + '">✖</span>';
        } else {
          var curScore = getItemPowerScore(player.equip[item.slot]);
          var newScore = getItemPowerScore(item);
          if (newScore > curScore) cmpHtml = '<span class="cmp-arrow cmp-up">▲</span>';
        }
      }

      var qtyHtml = (item.qty && item.qty > 1) ? '<span class="cell-qty">x' + item.qty + '</span>' : '';
      cell.innerHTML = dotsHtml + cmpHtml + '<span>' + item.icon + '</span>' + qtyHtml;
    }
    grid.appendChild(cell);
  }
}

function inspectBagItem(idx) {
  selectedBagIndex = idx;
  renderInventoryWindow();
  var item = player.bag[idx];
  if (!item) return;

  var rMeta = RARITIES[item.rarity] || RARITIES.comum;
  var check = canEquipItem(item);
  var box = document.getElementById('item-tooltip-box');

  var statsLine = [];
  if (item.physAtk) statsLine.push('ATQ Físico: +' + item.physAtk);
  if (item.magAtk)  statsLine.push('ATQ Mágico: +' + item.magAtk);
  if (item.physDef) statsLine.push('DEF Física: +' + item.physDef);
  if (item.magDef)  statsLine.push('DEF Mágica: +' + item.magDef);
  if (item.blockChance) statsLine.push('Bloqueio Escudo: +' + item.blockChance + '%');
  if (item.bonusStr) statsLine.push('FOR +' + item.bonusStr);
  if (item.bonusDex) statsLine.push('DES +' + item.bonusDex);
  if (item.bonusRec) statsLine.push('REC +' + item.bonusRec);
  if (item.bonusInt) statsLine.push('INT +' + item.bonusInt);
  if (item.bonusWis) statsLine.push('SAB +' + item.bonusWis);
  if (item.bonusLuc) statsLine.push('SOR +' + item.bonusLuc);
  if (item.speedBonus) statsLine.push('Velocidade: +' + item.speedBonus);
  if (item.desc) statsLine.push(item.desc);

  var socketsInfo = '';
  if (Array.isArray(item.sockets) && item.sockets.length > 0) {
    socketsInfo = '<div style="font-size:0.7rem; color:#38bdf8; margin-top:4px;">Slots (' + item.sockets.length + '): ' +
      item.sockets.map(function(s) { return s ? '[' + LAPIS_CATALOG[s.lapisKey].code + ' Nv.' + s.level + ']' : '[Vazio]'; }).join(' ') +
      '</div>';
  }

  var reqHtml = '';
  if (item.reqArch) {
    reqHtml = '<div style="font-size:0.7rem; color:' + (check.ok ? '#34d399' : '#fb7185') + '; margin-top:3px;">Classe: ' + formatAllowedClassesLabel(item.reqArch) + '</div>';
  }

  var equipBtnLabel = item.slot === 'consumable' ? '🧪 Usar Item' : (check.ok ? '⚔️ Equipar' : '🔒 ' + check.reason);
  var equipDisabled = (item.slot === 'lapis' || (item.slot !== 'consumable' && !check.ok)) ? 'disabled' : '';

  box.innerHTML =
    '<div>' +
      '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        '<span style="font-weight:bold; font-size:0.9rem; color:' + rMeta.color + ';">' + item.icon + ' ' + item.name + (item.plus > 0 ? ' +' + item.plus : '') + '</span>' +
        '<span style="font-size:0.72rem; color:' + rMeta.color + '; border:1px solid ' + rMeta.color + '; padding:1px 6px; border-radius:4px;">' + rMeta.label + '</span>' +
      '</div>' +
      '<div style="font-size:0.75rem; color:#cbd5e1; margin-top:5px;">' + (statsLine.join(' • ') || 'Item especial') + '</div>' +
      reqHtml + socketsInfo +
    '</div>' +
    '<div class="tooltip-actions">' +
      '<button type="button" class="btn-act btn-act-equip" ' + equipDisabled + ' onclick="equipItemFromBag(' + idx + ')">' + equipBtnLabel + '</button>' +
      '<button type="button" class="btn-act btn-act-sell" onclick="sellBagItem(' + idx + ')">💰 Vender (+$' + (item.sellPrice || 15) + ')</button>' +
    '</div>';
}

function inspectEquipped(slotKey) {
  var item = player.equip[slotKey];
  var box = document.getElementById('item-tooltip-box');
  if (!item) {
    box.innerHTML = '<div style="color:#64748b; font-size:0.8rem; text-align:center; margin:auto;">Slot <b>' + SLOT_META[slotKey].label + '</b> está vazio.</div>';
    return;
  }
  var rMeta = RARITIES[item.rarity] || RARITIES.comum;
  var statsLine = [];
  if (item.physAtk) statsLine.push('ATQ Fís: +' + item.physAtk);
  if (item.magAtk)  statsLine.push('ATQ Mág: +' + item.magAtk);
  if (item.physDef) statsLine.push('DEF Fís: +' + item.physDef);
  if (item.magDef)  statsLine.push('DEF Mág: +' + item.magDef);
  if (item.blockChance) statsLine.push('Bloq: +' + item.blockChance + '%');
  if (item.bonusStr) statsLine.push('FOR +' + item.bonusStr);
  if (item.bonusDex) statsLine.push('DES +' + item.bonusDex);
  if (item.bonusRec) statsLine.push('REC +' + item.bonusRec);
  if (item.bonusInt) statsLine.push('INT +' + item.bonusInt);
  if (item.bonusWis) statsLine.push('SAB +' + item.bonusWis);
  if (item.bonusLuc) statsLine.push('SOR +' + item.bonusLuc);
  if (item.speedBonus) statsLine.push('Vel +' + item.speedBonus);

  box.innerHTML =
    '<div>' +
      '<div style="font-weight:bold; font-size:0.9rem; color:' + rMeta.color + ';">' + item.icon + ' ' + item.name + (item.plus > 0 ? ' +' + item.plus : '') + ' (Equipado)</div>' +
      '<div style="font-size:0.74rem; color:#cbd5e1; margin-top:4px;">' + (statsLine.join(' • ') || 'Equipamento') + '</div>' +
      '<div style="font-size:0.71rem; color:#fbbf24; margin-top:2px;">Poder do Item: <b>' + getItemPowerScore(item) + '</b></div>' +
    '</div>' +
    '<div class="tooltip-actions">' +
      '<button type="button" class="btn-act btn-act-sell" onclick="unequipToBag(\'' + slotKey + '\')">🎒 Guardar na Mochila</button>' +
    '</div>';
}

function unequipToBag(slotKey) {
  if (!player.equip[slotKey]) return;
  if (player.bag.length >= 120) { alert('Mochila cheia!'); return; }
  player.bag.push(player.equip[slotKey]);
  player.equip[slotKey] = null;
  saveCurrentHero();
  renderInventoryWindow();
  updateAllHUD();
}

// ================= FERREIRO: LINKAGEM DE LAPIS & ENCANTAMENTO =================
function switchSmithTab(tab) {
  smithTab = tab;
  document.getElementById('stab-link').className = 'smith-tab-btn' + (tab === 'link' ? ' active' : '');
  document.getElementById('stab-enchant').className = 'smith-tab-btn' + (tab === 'enchant' ? ' active' : '');
  renderSmithWindow();
}

function renderSmithWindow() {
  if (!player) return;
  document.getElementById('smith-gold-val').textContent = player.gold;
  var eqList = document.getElementById('smith-eq-list');
  eqList.innerHTML = '';

  var equipKeys = Object.keys(SLOT_META).filter(function(k) { return k !== 'mount' && player.equip[k]; });
  if (equipKeys.length === 0) {
    eqList.innerHTML = '<div style="font-size:0.74rem; color:#64748b;">Equipe um item primeiro para usar o Ferreiro.</div>';
    return;
  }
  if (!player.equip[smithSlot]) smithSlot = equipKeys[0];

  equipKeys.forEach(function(k) {
    var it = player.equip[k];
    var rCol = RARITIES[it.rarity] ? RARITIES[it.rarity].color : '#94a3b8';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'smith-eq-btn' + (smithSlot === k ? ' selected' : '');
    btn.onclick = function() { smithSlot = k; renderSmithWindow(); };
    btn.innerHTML = '<div style="font-weight:bold; color:' + rCol + ';">' + it.icon + ' ' + it.name + (it.plus > 0 ? ' +' + it.plus : '') + '</div>' +
                    '<div style="font-size:0.66rem; color:#94a3b8;">Slots: ' + (it.sockets ? it.sockets.length : 0) + '</div>';
    eqList.appendChild(btn);
  });

  var targetItem = player.equip[smithSlot];
  var center = document.getElementById('smith-center-panel');
  var right = document.getElementById('smith-right-panel');

  if (smithTab === 'enchant') {
    var curPlus = targetItem.plus || 0;
    var cost = (curPlus + 1) * 140;
    var chance = Math.max(20, 95 - curPlus * 4);
    center.innerHTML =
      '<div>' +
        '<div class="stat-col-title"><span class="step-badge">PASSO 2</span>Encantamento (+1 a +20)</div>' +
        '<div style="text-align:center; padding:18px 8px;">' +
          '<div style="font-size:2.4rem;">' + targetItem.icon + '</div>' +
          '<div style="font-weight:bold; font-size:0.95rem; margin-top:6px;">' + targetItem.name + ' <span style="color:#fbbf24;">+' + curPlus + '</span></div>' +
          '<div style="font-size:0.78rem; color:#38bdf8; margin-top:8px;">Taxa de Sucesso: <b>' + chance + '%</b> • Custo: <b>$' + cost + '</b></div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="btn-buy-mall" ' + (curPlus >= 20 ? 'disabled' : '') + ' onclick="enchantCurrentSmithItem()">✨ Encantar para +' + (curPlus + 1) + '</button>';

    right.innerHTML =
      '<div class="stat-col-title"><span class="step-badge">INFO</span>Regras de Encantamento</div>' +
      '<div style="font-size:0.76rem; color:#cbd5e1; line-height:1.5;">' +
        '• Cada nível de encantamento aumenta <b>+7%</b> nos atributos base de ataque e defesa do item.<br>' +
        '• O equipamento nunca quebra em caso de falha.' +
      '</div>';
    return;
  }

  var sockets = targetItem.sockets || [];
  var slotsHtml = '<div class="socket-visual-row">';
  if (sockets.length === 0) {
    slotsHtml += '<div style="font-size:0.76rem; color:#94a3b8;">Este equipamento (Normal) não possui slots para Lapis.</div>';
  } else {
    sockets.forEach(function(s, sIdx) {
      if (!s) {
        slotsHtml += '<div class="socket-slot-card"><div style="font-size:1.2rem; opacity:0.35;">⚪</div><div>Vazio</div></div>';
      } else {
        var lm = LAPIS_CATALOG[s.lapisKey];
        slotsHtml += '<div class="socket-slot-card filled" style="border-color:' + lm.color + ';">' +
          '<div style="font-size:1.2rem;">💎</div>' +
          '<div style="font-weight:bold; color:' + lm.color + ';">' + lm.code + ' Nv.' + s.level + '</div>' +
          '<button type="button" class="btn-extract-mini" onclick="extractLapisFromSocket(' + sIdx + ')">Extrair</button>' +
        '</div>';
      }
    });
  }
  slotsHtml += '</div>';

  var linkStoneCount = player.bag.reduce(function(acc, it) { return acc + (it && it.effect === 'link_stone' ? (it.qty || 1) : 0); }, 0);

  center.innerHTML =
    '<div>' +
      '<div class="stat-col-title"><span class="step-badge">PASSO 2</span>Slots do Equipamento</div>' +
      slotsHtml +
      '<div style="font-size:0.72rem; color:#94a3b8; text-align:center;">Pedras de Linkagem na mochila: <b style="color:#c084fc;">' + linkStoneCount + '</b> (+25% chance e evita quebra)</div>' +
    '</div>' +
    '<div class="shop-mini-grid">' +
      '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'link_stone\', 150)">🔮 Comprar Pedra Link ($150)</button>' +
      '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'extract_hammer\', 180)">🔨 Martelo Extração ($180)</button>' +
    '</div>';

  var lapisInBag = [];
  player.bag.forEach(function(it, bIdx) {
    if (it && it.slot === 'lapis') lapisInBag.push({ item: it, bagIdx: bIdx });
  });

  var listHtml = '<div class="stat-col-title"><span class="step-badge">PASSO 3</span>Escolha a Lapis para Linkar</div><div class="lapis-select-list">';
  if (lapisInBag.length === 0) {
    listHtml += '<div style="font-size:0.74rem; color:#64748b;">Nenhuma Lapis na mochila. Derrote monstros ou visite a Loja!</div>';
  } else {
    lapisInBag.forEach(function(entry) {
      var lap = entry.item;
      var meta = LAPIS_CATALOG[lap.lapisKey];
      var compat = canLinkLapisToItem(targetItem, lap);
      var baseRate = LAPIS_BASE_LINK_CHANCE[lap.level || 1] || 50;
      var finalRate = Math.min(100, baseRate + (linkStoneCount > 0 ? 25 : 0));

      listHtml +=
        '<div class="lapis-choice-card" style="border-color:' + meta.color + ';">' +
          '<div>' +
            '<div style="font-weight:bold; color:' + meta.color + ';">💎 ' + lap.name + '</div>' +
            '<div style="font-size:0.66rem; color:#cbd5e1;">' + formatLapisEffect(lap) + '</div>' +
            '<div style="font-size:0.64rem; color:' + (compat.ok ? '#38bdf8' : '#fb7185') + ';">' +
              (compat.ok ? 'Sucesso: ' + finalRate + '% • Custo: $' + ((lap.level || 1) * 90) : compat.reason) +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn-link-now" ' + (compat.ok ? '' : 'disabled') + ' onclick="linkLapisIntoEquipment(' + entry.bagIdx + ')">Linkar</button>' +
        '</div>';
    });
  }
  listHtml += '</div>';
  right.innerHTML = listHtml;
}

function buySmithSupply(type, cost) {
  if (player.gold < cost) { alert('Ouro insuficiente!'); return; }
  player.gold -= cost;
  var existing = player.bag.find(function(it) { return it && it.effect === type; });
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else {
    player.bag.push({
      id: type + '_' + Date.now(),
      name: type === 'link_stone' ? 'Pedra de Linkagem' : 'Martelo de Extração',
      icon: type === 'link_stone' ? '🔮' : '🔨',
      slot: 'consumable',
      effect: type,
      qty: 1,
      rarity: 'veneravel',
      sellPrice: 60
    });
  }
  saveCurrentHero();
  renderSmithWindow();
  updateAllHUD();
}

function linkLapisIntoEquipment(bagIdx) {
  var item = player.equip[smithSlot];
  var lap = player.bag[bagIdx];
  if (!item || !lap) return;

  var emptySocketIdx = item.sockets.findIndex(function(s) { return s === null; });
  if (emptySocketIdx === -1) {
    showSmithBanner('Todos os slots deste equipamento já estão ocupados!', false);
    return;
  }

  var compat = canLinkLapisToItem(item, lap);
  if (!compat.ok) {
    showSmithBanner(compat.reason, false);
    return;
  }

  var cost = (lap.level || 1) * 90;
  if (player.gold < cost) {
    showSmithBanner('Ouro insuficiente ($' + cost + ' necessário).', false);
    return;
  }

  player.gold -= cost;
  var stoneIdx = player.bag.findIndex(function(it) { return it && it.effect === 'link_stone'; });
  var usedStone = false;
  if (stoneIdx !== -1) {
    usedStone = true;
    if (player.bag[stoneIdx].qty > 1) player.bag[stoneIdx].qty -= 1;
    else player.bag.splice(stoneIdx, 1);
  }

  var rate = Math.min(100, (LAPIS_BASE_LINK_CHANCE[lap.level || 1] || 50) + (usedStone ? 25 : 0));
  var roll = Math.random() * 100;
  var curLapIdx = player.bag.indexOf(lap);

  if (roll <= rate) {
    item.sockets[emptySocketIdx] = { lapisKey: lap.lapisKey, level: lap.level || 1 };
    if (curLapIdx !== -1) player.bag.splice(curLapIdx, 1);
    showSmithBanner('✅ Sucesso! ' + lap.name + ' foi linkada no slot ' + (emptySocketIdx + 1) + '!', true);
  } else {
    if (!usedStone && curLapIdx !== -1) {
      player.bag.splice(curLapIdx, 1);
      showSmithBanner('💥 A linkagem falhou e a ' + lap.name + ' se estilhaçou!', false);
    } else {
      showSmithBanner('⚠️ A linkagem falhou, mas a Pedra de Linkagem protegeu sua Lapis!', false);
    }
  }

  saveCurrentHero();
  renderSmithWindow();
  updateAllHUD();
}

function extractLapisFromSocket(sIdx) {
  var item = player.equip[smithSlot];
  if (!item || !item.sockets[sIdx]) return;

  var hammerIdx = player.bag.findIndex(function(it) { return it && it.effect === 'extract_hammer'; });
  if (hammerIdx === -1) {
    showSmithBanner('Você precisa de um Martelo de Extração para remover uma Lapis sem destruí-la!', false);
    return;
  }

  if (player.bag[hammerIdx].qty > 1) player.bag[hammerIdx].qty -= 1;
  else player.bag.splice(hammerIdx, 1);

  var sock = item.sockets[sIdx];
  var meta = LAPIS_CATALOG[sock.lapisKey];
  item.sockets[sIdx] = null;

  player.bag.push({
    id: 'ext_' + Date.now(),
    name: meta.kind === 'elem' ? meta.name : (meta.name + ' Nv.' + sock.level),
    icon: '💎',
    slot: 'lapis',
    lapisKey: sock.lapisKey,
    level: sock.level,
    rarity: 'heroico',
    sellPrice: sock.level * 50,
    desc: formatLapisEffect(sock)
  });

  showSmithBanner('🔨 Lapis extraída com sucesso e devolvida à sua mochila!', true);
  saveCurrentHero();
  renderSmithWindow();
  updateAllHUD();
}

function enchantCurrentSmithItem() {
  var item = player.equip[smithSlot];
  if (!item || (item.plus || 0) >= 20) return;
  var cur = item.plus || 0;
  var cost = (cur + 1) * 140;
  if (player.gold < cost) { showSmithBanner('Ouro insuficiente!', false); return; }

  player.gold -= cost;
  var chance = Math.max(20, 95 - cur * 4);
  if (Math.random() * 100 <= chance) {
    item.plus = cur + 1;
    showSmithBanner('✨ Sucesso! ' + item.name + ' agora é +' + item.plus + '!', true);
  } else {
    showSmithBanner('⚠️ Falhou o encantamento, mas o item permaneceu intacto.', false);
  }
  saveCurrentHero();
  renderSmithWindow();
  updateAllHUD();
}

function showSmithBanner(msg, ok) {
  var b = document.getElementById('smith-banner');
  b.style.display = 'block';
  b.style.background = ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
  b.style.border = '1px solid ' + (ok ? '#10b981' : '#f43f5e');
  b.style.color = ok ? '#6ee7b7' : '#fda4af';
  b.textContent = msg;
}

// ================= LOJA EXCLUSIVA: PACKS DEUSA DAS 8 CLASSES, MONTARIAS & LAPIS =================
function switchShopCat(cat) {
  shopCategory = cat;
  ['sets', 'mounts', 'lapis', 'elem'].forEach(function(c) {
    var btn = document.getElementById('scat-' + c);
    if (btn) btn.className = 'shop-cat-btn' + (c === cat ? ' active' : '');
  });
  renderShopWindow();
}

function renderShopWindow() {
  if (!player) return;
  document.getElementById('shop-gold-val').textContent = player.gold;
  var grid = document.getElementById('shop-grid');
  grid.innerHTML = '';

  if (shopCategory === 'sets') {
    Object.keys(GODDESS_CLASS_PACKS).forEach(function(archKey) {
      var pack = GODDESS_CLASS_PACKS[archKey];
      var isMyClass = player.archKey === archKey;
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.style.borderColor = isMyClass ? '#fb7185' : '#263248';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico">' + pack.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">' + (isMyClass ? '⭐ SUA CLASSE' : pack.classLabel) + '</span>' +
              '<div style="font-weight:bold; font-size:0.86rem; color:#fb7185;">' + pack.title + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem; color:#cbd5e1; margin-top:7px;">' + pack.desc + '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" onclick="buyGoddessClassPack(\'' + archKey + '\')">👑 Comprar Pack ($' + pack.price + ')</button>';
      grid.appendChild(card);
    });
  } else if (shopCategory === 'mounts') {
    EXCLUSIVE_MOUNTS.forEach(function(mnt) {
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico">' + mnt.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">MONTARIA EXCLUSIVA</span>' +
              '<div style="font-weight:bold; font-size:0.86rem; color:' + mnt.color + ';">' + mnt.name + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem; color:#cbd5e1; margin-top:7px;">' + mnt.desc + '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" onclick="buyExclusiveMount(\'' + mnt.id + '\')">🐎 Comprar Montaria ($' + mnt.price + ')</button>';
      grid.appendChild(card);
    });
  } else if (shopCategory === 'lapis') {
    var specialLapis = [
      { key: 'sonic', lvl: 2, price: 950 },
      { key: 'sonic', lvl: 3, price: 1650 },
      { key: 'swift', lvl: 2, price: 950 },
      { key: 'swift', lvl: 3, price: 1650 },
      { key: 'dual_fury', lvl: 2, price: 1400 },
      { key: 'dual_arc',  lvl: 2, price: 1400 },
      { key: 'dual_tank', lvl: 2, price: 1400 }
    ];
    specialLapis.forEach(function(entry) {
      var meta = LAPIS_CATALOG[entry.key];
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico">💎</div>' +
            '<div>' +
              '<span class="shop-excl-tag">LAPIS ESPECIAL</span>' +
              '<div style="font-weight:bold; font-size:0.86rem; color:' + meta.color + ';">' + meta.name + ' Nv.' + entry.lvl + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem; color:#cbd5e1; margin-top:7px;">' + formatLapisEffect({ lapisKey: entry.key, level: entry.lvl }) + '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" onclick="buyShopLapis(\'' + entry.key + '\', ' + entry.lvl + ', ' + entry.price + ')">💎 Comprar Lapis ($' + entry.price + ')</button>';
      grid.appendChild(card);
    });
  } else if (shopCategory === 'elem') {
    ['elem_fire', 'elem_wind', 'elem_earth', 'elem_water'].forEach(function(eKey) {
      var meta = LAPIS_CATALOG[eKey];
      var elInfo = ELEMENTS[meta.element];
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico">' + elInfo.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">FOGO > VENTO > TERRA > ÁGUA</span>' +
              '<div style="font-weight:bold; font-size:0.86rem; color:' + meta.color + ';">' + meta.name + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem; color:#cbd5e1; margin-top:7px;">Imbui o elemento <b>' + elInfo.label + '</b> em Armas ou Peitorais (+40% dano contra elemento fraco).</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" onclick="buyShopLapis(\'' + eKey + '\', 1, 1100)">' + elInfo.icon + ' Comprar Elemental ($1100)</button>';
      grid.appendChild(card);
    });
  }
}

function buyGoddessClassPack(archKey) {
  var pack = GODDESS_CLASS_PACKS[archKey];
  if (!pack) return;
  if (player.gold < pack.price) { showShopBanner('Ouro insuficiente ($' + pack.price + ' necessários)!', false); return; }
  if (player.bag.length + 8 > 120) { showShopBanner('Libere pelo menos 8 espaços na mochila!', false); return; }

  player.gold -= pack.price;
  var armorSlots = ['helm', 'armor', 'pants', 'gloves', 'boots', 'cape'];
  armorSlots.forEach(function(sl) {
    player.bag.push({
      id: 'goddess_' + archKey + '_' + sl + '_' + Math.random().toString(36).slice(2, 7),
      name: SLOT_META[sl].label + ' Deusa (' + pack.classLabel.split('/')[0].trim() + ')',
      slot: sl,
      icon: SLOT_META[sl].icon,
      reqArch: [archKey],
      rarity: 'deusa',
      plus: 0,
      element: 'none',
      sockets: [null, null, null, null, null, null],
      physDef: 42,
      magDef: 38,
      bonusStr: pack.stats.str || 0,
      bonusDex: pack.stats.dex || 0,
      bonusRec: pack.stats.rec || 0,
      bonusInt: pack.stats.int || 0,
      bonusWis: pack.stats.wis || 0,
      bonusLuc: pack.stats.luc || 0,
      sellPrice: 320
    });
  });

  var w = pack.weaponTemplate;
  player.bag.push({
    id: 'goddess_w_' + Math.random().toString(36).slice(2, 7),
    name: w.name,
    slot: 'weapon',
    icon: w.icon,
    wType: w.wType,
    is2H: w.is2H,
    reqArch: [archKey],
    rarity: 'deusa',
    plus: 0,
    element: 'none',
    sockets: [null, null, null, null, null, null],
    physAtk: w.style === 'phys' ? w.baseAtk * 3 : 0,
    magAtk:  w.style === 'magic' ? w.baseAtk * 3 : 0,
    bonusStr: pack.stats.str || 0,
    bonusDex: pack.stats.dex || 0,
    bonusRec: pack.stats.rec || 0,
    bonusInt: pack.stats.int || 0,
    bonusWis: pack.stats.wis || 0,
    bonusLuc: pack.stats.luc || 0,
    sellPrice: 400
  });

  if (pack.includeGoddessShield) {
    player.bag.push({
      id: 'goddess_sh_' + Math.random().toString(36).slice(2, 7),
      name: 'Escudo Deusa do Bastião Solar',
      slot: 'shield',
      icon: '🛡️',
      wType: 'Escudo Deusa',
      reqArch: ['solar_guard'],
      rarity: 'deusa',
      plus: 0,
      element: 'none',
      sockets: [null, null, null, null, null, null],
      physDef: 58,
      magDef: 52,
      blockChance: 28,
      bonusRec: pack.stats.rec || 35,
      bonusStr: pack.stats.str || 18,
      bonusWis: pack.stats.wis || 15,
      sellPrice: 380
    });
  }

  showShopBanner('👑 ' + pack.title + ' entregue na sua mochila! (Exclusivo para ' + pack.classLabel + ')', true);
  saveCurrentHero();
  renderShopWindow();
  updateAllHUD();
}

function buyExclusiveMount(mntId) {
  var mnt = EXCLUSIVE_MOUNTS.find(function(m) { return m.id === mntId; });
  if (!mnt) return;
  if (player.gold < mnt.price) { showShopBanner('Ouro insuficiente!', false); return; }
  player.gold -= mnt.price;
  player.bag.push({
    id: 'mnt_item_' + Date.now(),
    name: mnt.name,
    slot: 'mount',
    icon: mnt.icon,
    rarity: 'lendario',
    speedBonus: mnt.speedBonus,
    sellPrice: 450,
    desc: mnt.desc
  });
  showShopBanner('🐎 ' + mnt.name + ' enviada para sua mochila!', true);
  saveCurrentHero();
  renderShopWindow();
  updateAllHUD();
}

function buyShopLapis(key, lvl, price) {
  if (player.gold < price) { showShopBanner('Ouro insuficiente!', false); return; }
  var meta = LAPIS_CATALOG[key];
  player.gold -= price;
  player.bag.push({
    id: 'shop_lap_' + Date.now(),
    name: meta.kind === 'elem' ? meta.name : (meta.name + ' Nv.' + lvl),
    icon: '💎',
    slot: 'lapis',
    lapisKey: key,
    level: lvl,
    rarity: 'deusa',
    sellPrice: 220,
    desc: formatLapisEffect({ lapisKey: key, level: lvl })
  });
  showShopBanner('💎 ' + meta.name + ' adicionada à mochila!', true);
  saveCurrentHero();
  renderShopWindow();
  updateAllHUD();
}

function showShopBanner(msg, ok) {
  var b = document.getElementById('shop-banner');
  b.style.display = 'block';
  b.style.background = ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)';
  b.style.border = '1px solid ' + (ok ? '#10b981' : '#f43f5e');
  b.style.color = ok ? '#6ee7b7' : '#fda4af';
  b.textContent = msg;
}

// ================= STATUS WINDOW (TECLA C) =================
function renderStatusWindow() {
  if (!player) return;
  var st = getPlayerDerivedStats();
  var cName = getArchetypeDisplayName(player.archKey, player.faction);

  document.getElementById('st-hero-title').innerHTML = renderKillRankBadgeHTML(player.kills || 0) + ' ' + player.name + ' (Nv.' + player.lvl + ')';
  document.getElementById('st-hero-sub').textContent = cName + ' • Modo Extremo (UM)';
  document.getElementById('st-free-pts').textContent = player.freePts;

  var attrMeta = [
    { key: 'str', label: 'FOR', color: '#f87171' },
    { key: 'dex', label: 'DES', color: '#34d399' },
    { key: 'rec', label: 'REC', color: '#fbbf24' },
    { key: 'int', label: 'INT', color: '#38bdf8' },
    { key: 'wis', label: 'SAB', color: '#c084fc' },
    { key: 'luc', label: 'SOR', color: '#f472b6' }
  ];

  var allocList = document.getElementById('attr-alloc-list');
  allocList.innerHTML = '';
  attrMeta.forEach(function(am) {
    var val = st.stats[am.key];
    var row = document.createElement('div');
    row.className = 'attr-row';
    row.innerHTML =
      '<span class="attr-name" style="color:' + am.color + ';">' + am.label + '</span>' +
      '<span class="attr-val">' + val + '</span>' +
      '<button type="button" class="btn-plus-stat" ' + (player.freePts <= 0 ? 'disabled' : '') + ' onclick="allocStatPoint(\'' + am.key + '\')">+</button>';
    allocList.appendChild(row);
  });

  var derivedList = document.getElementById('derived-stats-list');
  var rows = [
    ['Poder de Combate', st.power],
    ['ATQ Físico', st.physAtk],
    ['ATQ Mágico', st.magAtk],
    ['DEF Física', st.physDef],
    ['DEF Mágica', st.magDef],
    ['Bloqueio Escudo', st.blockChance + '%'],
    ['Absorção Lapis', '-' + st.absDamage],
    ['Taxa Crítica', st.critChance + '%'],
    ['Esquiva', st.evaChance + '%'],
    ['Elemento Ataque', ELEMENTS[st.atkElem].icon + ' ' + ELEMENTS[st.atkElem].label],
    ['Elemento Defesa', ELEMENTS[st.defElem].icon + ' ' + ELEMENTS[st.defElem].label]
  ];
  derivedList.innerHTML = rows.map(function(r) {
    return '<div class="derived-row"><span style="color:#94a3b8;">' + r[0] + '</span><b>' + r[1] + '</b></div>';
  }).join('');
}

function allocStatPoint(k) {
  if (!player || player.freePts <= 0) return;
  player.freePts -= 1;
  player.allocStats[k] = (player.allocStats[k] || 0) + 1;
  saveCurrentHero();
  renderStatusWindow();
  updateAllHUD();
}

function resetStatPoints() {
  if (!player) return;
  var spent = 0;
  Object.keys(player.allocStats).forEach(function(k) {
    spent += player.allocStats[k];
    player.allocStats[k] = 0;
  });
  player.freePts += spent;
  saveCurrentHero();
  renderStatusWindow();
  updateAllHUD();
}

// ================= JANELAS & CONTROLES =================
function toggleWindow(winId) {
  var win = document.getElementById(winId);
  var isOpen = win.style.display === 'flex';
  closeAllWindows();
  if (!isOpen) {
    win.style.display = 'flex';
    if (winId === 'status-modal') renderStatusWindow();
    if (winId === 'bag-modal')    renderInventoryWindow();
    if (winId === 'smith-modal')  renderSmithWindow();
    if (winId === 'shop-modal')   renderShopWindow();
  }
}

function closeAllWindows() {
  ['status-modal', 'bag-modal', 'smith-modal', 'shop-modal'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

window.addEventListener('keydown', function(e) {
  var k = e.key.toLowerCase();
  keys[k] = true;
  if (!player || document.getElementById('char-screen').style.display !== 'none') return;

  if (e.key >= '1' && e.key <= '6') useClassSkill(parseInt(e.key, 10) - 1);
  if (e.key === '7') quickUsePotion('hp');
  if (e.key === '8') quickUsePotion('mp_sp');
  if (k === 'z') toggleAutoCombat();
  if (k === 'c') toggleWindow('status-modal');
  if (k === 'b') toggleWindow('bag-modal');
  if (k === 'f') toggleWindow('smith-modal');
  if (k === 'l') toggleWindow('shop-modal');
  if (e.key === 'Escape') closeAllWindows();
});

window.addEventListener('keyup', function(e) {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousedown', function(e) {
  if (!player || document.getElementById('char-screen').style.display !== 'none') return;
  var mapLimit = (typeof WORLD_SIZE === 'number' && WORLD_SIZE > 200) ? WORLD_SIZE : 3200;
  var rect = canvas.getBoundingClientRect();
  var wx = (e.clientX - rect.left) + (player.x - canvas.width / 2);
  var wy = (e.clientY - rect.top) + (player.y - canvas.height / 2);

  var clickedMob = monsters.find(function(m) {
    return m.hp > 0 && Math.hypot(m.x - wx, m.y - wy) <= 38;
  });

  if (clickedMob) {
    selectedTargetId = clickedMob.id;
    useClassSkill(0);
  } else {
    player.autoCombat = false;
    player.tx = Math.max(96, Math.min(mapLimit - 96, wx));
    player.ty = Math.max(96, Math.min(mapLimit - 96, wy));
  }
  updateAllHUD();
});

// ================= HUD & TEXTOS FLUTUANTES =================
function addFloatingText(x, y, text, color) {
  floatingTexts.push({ x: x, y: y, text: text, color: color || '#fff', life: 1.15 });
}

function updateAllHUD() {
  if (!player) return;
  var st = getPlayerDerivedStats();
  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;

  document.getElementById('hud-portrait').firstChild.textContent = arch.icon;
  document.getElementById('hud-lvl').textContent = 'Nv.' + player.lvl;
  document.getElementById('hud-name').textContent = player.name;
  document.getElementById('hud-kill-emblem').innerHTML = renderKillRankBadgeHTML(player.kills || 0);

  document.getElementById('bar-hp').style.width = Math.max(0, Math.min(100, (player.hp / st.maxHp) * 100)) + '%';
  document.getElementById('txt-hp').textContent = 'HP ' + Math.round(player.hp) + ' / ' + st.maxHp;

  document.getElementById('bar-mp').style.width = Math.max(0, Math.min(100, (player.mp / st.maxMp) * 100)) + '%';
  document.getElementById('txt-mp').textContent = 'MP ' + Math.round(player.mp) + ' / ' + st.maxMp;

  document.getElementById('bar-sp').style.width = Math.max(0, Math.min(100, (player.sp / st.maxSp) * 100)) + '%';
  document.getElementById('txt-sp').textContent = 'SP ' + Math.round(player.sp) + ' / ' + st.maxSp;

  document.getElementById('hud-zone').textContent = player.faction === 'fury' ? '🔥 Floresta de Iris (Dark)' : '🌲 Floresta de Erina (Light)';
  document.getElementById('hud-gold').textContent = player.gold;
  document.getElementById('hud-br').textContent = st.power;

  var rk = getKillRankInfo(player.kills || 0);
  var rkTitle = rk ? rk.data.title : 'Sem Rank';
  document.getElementById('hud-kill-info').innerHTML = renderKillRankBadgeHTML(player.kills || 0) + ' ' + rkTitle + ' | Kills: ' + (player.kills || 0) + ' | Derrotas: ' + (player.deaths || 0);

  var statBtn = document.getElementById('btn-hud-status');
  if (statBtn) {
    statBtn.className = 'btn-ep' + (player.freePts > 0 ? ' stat-alert' : '');
    statBtn.textContent = player.freePts > 0 ? '📊 Status (+' + player.freePts + ')' : '📊 Status (C)';
  }

  var xpPct = Math.min(100, Math.round((player.xp / player.nextXp) * 100));
  document.getElementById('bar-xp').style.width = xpPct + '%';
  document.getElementById('txt-xp').textContent = 'XP: ' + player.xp + ' / ' + player.nextXp + ' (' + xpPct + '%)';

  var hpQty = player.bag.reduce(function(a, it) { return a + (it && it.effect === 'hp' ? (it.qty || 1) : 0); }, 0);
  var mpQty = player.bag.reduce(function(a, it) { return a + (it && it.effect === 'mp_sp' ? (it.qty || 1) : 0); }, 0);
  var elHpQ = document.getElementById('dock-hp-qty');
  var elMpQ = document.getElementById('dock-mp-qty');
  if (elHpQ) elHpQ.textContent = hpQty;
  if (elMpQ) elMpQ.textContent = mpQty;

  var buffsRow = document.getElementById('hud-buffs-row');
  buffsRow.innerHTML = player.buffs.map(function(b) {
    return '<span class="buff-chip">' + b.label + ' (' + Math.ceil(b.timer) + 's)</span>';
  }).join('');

  var target = getSelectedTarget();
  var tBox = document.getElementById('hud-target-box');
  if (!target) {
    tBox.style.display = 'none';
  } else {
    tBox.style.display = 'flex';
    var tEl = ELEMENTS[target.elem] || ELEMENTS.none;
    document.getElementById('target-name').textContent = '[Nv.' + target.lvl + '] ' + target.name;
    var elSpan = document.getElementById('target-elem');
    elSpan.textContent = tEl.icon + ' ' + tEl.label;
    elSpan.style.color = tEl.color;
    document.getElementById('target-hp-fill').style.width = Math.max(0, (target.hp / target.maxHp) * 100) + '%';
    document.getElementById('target-hp-txt').textContent = target.hp + ' / ' + target.maxHp;
  }
}

// ================= GAME LOOP 2.5D =================
var lastTime = performance.now();

function gameLoop(now) {
  var dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (player && document.getElementById('char-screen').style.display === 'none') {
    updateSimulation(dt);
    renderWorld();
  }
  requestAnimationFrame(gameLoop);
}

function updateSimulation(dt) {
  var st = getPlayerDerivedStats();

  player.hp = Math.min(st.maxHp, player.hp + st.maxHp * 0.015 * dt);
  player.mp = Math.min(st.maxMp, player.mp + st.maxMp * 0.04 * dt);
  player.sp = Math.min(st.maxSp, player.sp + st.maxSp * 0.05 * dt);

  for (var i = 0; i < 6; i++) {
    if (skillCooldowns[i] > 0) {
      skillCooldowns[i] = Math.max(0, skillCooldowns[i] - dt);
      var cdEl = document.getElementById('sk-cd-' + i);
      if (cdEl) {
        cdEl.style.display = skillCooldowns[i] > 0 ? 'flex' : 'none';
        cdEl.textContent = skillCooldowns[i].toFixed(1);
      }
    }
  }
  for (var b = player.buffs.length - 1; b >= 0; b--) {
    player.buffs[b].timer -= dt;
    if (player.buffs[b].timer <= 0) player.buffs.splice(b, 1);
  }

  var effectiveSpeed = (st && typeof st.moveSpeed === 'number' && !isNaN(st.moveSpeed) && st.moveSpeed > 0) ? st.moveSpeed : 210;
  if (typeof BossSkillsModule !== 'undefined') {
    if (BossSkillsModule.hasDebuff('debuff_stun')) effectiveSpeed = 0;
    else if (BossSkillsModule.hasDebuff('debuff_slow')) effectiveSpeed *= 0.55;
  }

  var mapLimit = (typeof WORLD_SIZE === 'number' && WORLD_SIZE > 200) ? WORLD_SIZE : 3200;
  if (typeof player.x !== 'number' || isNaN(player.x)) player.x = player.faction === 'fury' ? 2400 : 736;
  if (typeof player.y !== 'number' || isNaN(player.y)) player.y = player.faction === 'fury' ? 800 : 2496;
  if (typeof player.tx !== 'number' || isNaN(player.tx)) player.tx = player.x;
  if (typeof player.ty !== 'number' || isNaN(player.ty)) player.ty = player.y;

  var moveDt = (typeof dt === 'number' && !isNaN(dt) && dt > 0) ? Math.min(0.1, dt) : 0.016;

  var vx = 0, vy = 0;
  if (keys['w'] || keys['arrowup'])    vy -= 1;
  if (keys['s'] || keys['arrowdown'])  vy += 1;
  if (keys['a'] || keys['arrowleft'])  vx -= 1;
  if (keys['d'] || keys['arrowright']) vx += 1;

  var isMovingNow = false;
  if (vx !== 0 || vy !== 0) {
    if (player.autoCombat) player.autoCombat = false;
    isMovingNow = true;
    var len = Math.hypot(vx, vy);
    player.x = Math.max(96, Math.min(mapLimit - 96, player.x + (vx / len) * effectiveSpeed * moveDt));
    player.y = Math.max(96, Math.min(mapLimit - 96, player.y + (vy / len) * effectiveSpeed * moveDt));
    player.tx = player.x;
    player.ty = player.y;
    if (vx !== 0) player.facing = vx > 0 ? 1 : -1;
  } else {
    var dx = player.tx - player.x, dy = player.ty - player.y;
    var d = Math.hypot(dx, dy);
    if (d > 6) {
      isMovingNow = true;
      var step = Math.min(d, effectiveSpeed * moveDt);
      player.x = Math.max(96, Math.min(mapLimit - 96, player.x + (dx / d) * step));
      player.y = Math.max(96, Math.min(mapLimit - 96, player.y + (dy / d) * step));
      player.facing = dx >= 0 ? 1 : -1;
    }
  }

  if (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.resolveCollision === 'function') {
    WorldSceneryModule.resolveCollision(player, 16);
  }

  updatePlayerAnimation(moveDt, isMovingNow);

  if (player.autoCombat) {
    autoAttackTimer -= dt;
    var tgt = getSelectedTarget() || findNearestMonster();
    if (tgt) {
      selectedTargetId = tgt.id;
      var archRange = (ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard).range;
      var distToTgt = Math.hypot(tgt.x - player.x, tgt.y - player.y);
      if (distToTgt > archRange - 10) {
        player.tx = tgt.x;
        player.ty = tgt.y;
      } else if (autoAttackTimer <= 0) {
        autoAttackTimer = 0.65;
        for (var sIdx = 5; sIdx >= 0; sIdx--) {
          if (skillCooldowns[sIdx] <= 0) {
            useClassSkill(sIdx);
            break;
          }
        }
      }
    }
  }

  monsters.forEach(function(m) {
    if (m.hp <= 0 || m.isPvpRival) return;
    if (m.stunTimer > 0) { m.stunTimer -= dt; return; }
    if (m.dotTimer > 0) {
      m.dotTimer -= dt;
      if (Math.random() < dt * 2) applyDamageToMonster(m, m.dotDmg, false, 1.0, null);
    }

    var dPlayer = Math.hypot(player.x - m.x, player.y - m.y);
    var mobMoving = false;
    if (dPlayer < 290 && dPlayer > 48) {
      mobMoving = true;
      m.facing = player.x >= m.x ? 1 : -1;
      m.x += ((player.x - m.x) / dPlayer) * 105 * dt;
      m.y += ((player.y - m.y) / dPlayer) * 105 * dt;
      if (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.resolveCollision === 'function') {
        WorldSceneryModule.resolveCollision(m, m.tier === 'boss' ? 22 : 15);
      }
    } else if (dPlayer <= 54) {
      m.facing = player.x >= m.x ? 1 : -1;
      m.atkCd -= dt;
      if (m.atkCd <= 0) {
        m.atkCd = 1.65;
        m.animState = 'attack';
        m.animFrame = 0;
        if (Math.random() * 100 < st.evaChance) {
          addFloatingText(player.x, player.y - 36, '💨 Esquivou!', '#34d399');
        } else if (Math.random() * 100 < st.blockChance) {
          addFloatingText(player.x, player.y - 36, '🛡️ Bloqueado!', '#fbbf24');
        } else {
          var eMult = getElementMultiplier(m.elem, st.defElem);
          var dmgTaken = Math.max(1, Math.round((m.atk - st.physDef * 0.45) * eMult) - st.absDamage);
          player.hp -= dmgTaken;
          triggerPlayerAnim('hurt', 0.28);
          addFloatingText(player.x, player.y - 34, '-' + dmgTaken, '#f43f5e');
          if (player.hp <= 0) handlePlayerExtremeDeath();
        }
      }
    }

    if (m.animState !== 'attack') m.animState = mobMoving ? 'run' : 'idle';
    m.animTimer = (m.animTimer || 0) + dt;
    if (m.animTimer >= 0.14) {
      m.animTimer = 0;
      m.animFrame = (m.animFrame || 0) + 1;
      if (m.animState === 'attack' && m.animFrame >= 6) m.animState = 'idle';
    }
  });

  if (typeof BossSkillsModule !== 'undefined') {
    BossSkillsModule.update(dt);
  }
  if (typeof PvpRivalsModule !== 'undefined') {
    PvpRivalsModule.update(dt);
  }

  for (var p = projectiles.length - 1; p >= 0; p--) {
    projectiles[p].life -= dt;
    if (projectiles[p].life <= 0) projectiles.splice(p, 1);
  }
  for (var v = vfxList.length - 1; v >= 0; v--) {
    vfxList[v].r += 250 * dt;
    vfxList[v].alpha -= 2.1 * dt;
    if (vfxList[v].alpha <= 0) vfxList.splice(v, 1);
  }
  for (var f = floatingTexts.length - 1; f >= 0; f--) {
    floatingTexts[f].y -= 36 * dt;
    floatingTexts[f].life -= dt;
    if (floatingTexts[f].life <= 0) floatingTexts.splice(f, 1);
  }

  updateAllHUD();
}

function handlePlayerExtremeDeath() {
  player.deaths = (player.deaths || 0) + 1;
  var runeIdx = player.bag.findIndex(function(it) { return it && it.effect === 'res_rune'; });

  if (runeIdx !== -1) {
    if (player.bag[runeIdx].qty > 1) player.bag[runeIdx].qty -= 1;
    else player.bag.splice(runeIdx, 1);

    var st = getPlayerDerivedStats();
    player.hp = st.maxHp;
    player.mp = st.maxMp;
    player.sp = st.maxSp;

    var sp = (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.getFactionSpawn === 'function')
      ? WorldSceneryModule.getFactionSpawn(player.faction)
      : (player.faction === 'fury' ? { x: 2400, y: 800 } : { x: 736, y: 2496 });

    player.x = sp.x;
    player.y = sp.y;
    player.tx = sp.x;
    player.ty = sp.y;

    var fortName = player.faction === 'fury' ? 'Paroutian Fortress' : 'Delphinian Fortress';
    addFloatingText(player.x, player.y - 54, '✝️ Ressuscitado em ' + fortName + '!', '#fbbf24');
    saveCurrentHero();
  } else {
    alert('💀 Morte Permanente no Modo Extremo (UM)! Você não possuía Runa de Ressurreição.');
    var slots = loadSlots();
    slots[currentSlotIdx] = null;
    saveSlots(slots);
    player = null;
    returnToCharSelect();
  }
}

function renderWorld() {
  if (!player || !canvas || !ctx) return;
  var isFury = player.faction === 'fury';
  var camX = player.x - canvas.width / 2;
  var camY = player.y - canvas.height / 2;

  ctx.fillStyle = isFury ? '#2b1c1c' : '#262b1c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camX, -camY);

  if (typeof WorldSceneryModule !== 'undefined') {
    try {
      if (typeof WorldSceneryModule.renderGroundLayer === 'function') {
        WorldSceneryModule.renderGroundLayer(ctx, camX, camY, canvas.width, canvas.height, isFury);
      } else if (typeof WorldSceneryModule.renderTerrain === 'function') {
        WorldSceneryModule.renderTerrain(ctx, camX, camY, canvas.width, canvas.height, isFury);
      }
    } catch (errGround) {
      console.warn('Erro ao desenhar terreno:', errGround);
    }
  }

  if (typeof BossSkillsModule !== 'undefined' && typeof BossSkillsModule.renderGroundTelegraphs === 'function') {
    BossSkillsModule.renderGroundTelegraphs(ctx);
  }

  // Estruturas que estão ATRÁS do jogador (Y <= player.y)
  if (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.renderPropsLayer === 'function') {
    try {
      WorldSceneryModule.renderPropsLayer(ctx, camX, camY, canvas.width, canvas.height, isFury, player.y, 'back');
    } catch (errBack) {
      console.warn('Erro props back:', errBack);
    }
  }

  monsters.forEach(function(m) {
    if (m.hp <= 0) return;
    var isSelected = selectedTargetId === m.id;

    if (m.isPvpRival && typeof PvpRivalsModule !== 'undefined') {
      PvpRivalsModule.renderRival(ctx, m, isSelected);
      return;
    }

    if (isSelected) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(m.x, m.y + 16, 26, 11, 0, 0, Math.PI * 2); ctx.stroke();
    }

    var drewMob = (typeof drawConfiguredSprite === 'function')
      ? drawConfiguredSprite(ctx, 'mobs', m.name, m.animState || 'idle', m.animFrame || 0, m.x, m.y, m.facing || 1, null)
      : false;

    if (!drewMob) {
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.tier === 'boss' ? 26 : 19, 0, Math.PI * 2); ctx.fill();
      ctx.font = (m.tier === 'boss' ? '26px' : '20px') + ' Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(m.icon, m.x, m.y + 7);
    }

    var el = ELEMENTS[m.elem] || ELEMENTS.none;
    var mobTopY = drewMob ? -58 : -30;
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(el.icon + ' [Nv.' + m.lvl + '] ' + m.name, m.x, m.y + mobTopY);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(m.x - 24, m.y + mobTopY + 6, 48, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(m.x - 24, m.y + mobTopY + 6, 48 * (m.hp / m.maxHp), 5);
  });

  var arch = ARCHETYPES[player.archKey] || ARCHETYPES.solar_guard;
  ctx.fillStyle = 'rgba(0,0,0,0.48)';
  ctx.beginPath(); ctx.ellipse(player.x, player.y + 18, 24, 9, 0, 0, Math.PI * 2); ctx.fill();

  var drewSprite = drawAnimatedCharacter(ctx, player.archKey, player.x, player.y, player.facing);
  if (!drewSprite) {
    ctx.fillStyle = arch.armorColor;
    ctx.strokeStyle = arch.trimColor;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(player.x, player.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = '21px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(player.equip.mount ? player.equip.mount.icon : arch.icon, player.x, player.y + 7);
  } else if (player.equip.mount) {
    ctx.font = '18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(player.equip.mount.icon, player.x, player.y + 24);
  }

  var nameOffsetY = drewSprite ? -68 : -28;
  ctx.font = 'bold 12px Segoe UI';
  ctx.textAlign = 'center';
  var nameW = ctx.measureText(player.name).width;
  var rkInfo = getKillRankInfo(player.kills || 0);
  if (rkInfo) {
    drawShaiyaRankBadgeOnCanvas(ctx, rkInfo, player.x - nameW / 2 - 4, player.y + nameOffsetY - 4);
  }
  ctx.fillStyle = '#fde047';
  ctx.fillText(player.name, player.x + (rkInfo ? 8 : 0), player.y + nameOffsetY);

  // Estruturas que estão NA FRENTE do jogador (Y > player.y)
  if (typeof WorldSceneryModule !== 'undefined' && typeof WorldSceneryModule.renderPropsLayer === 'function') {
    try {
      WorldSceneryModule.renderPropsLayer(ctx, camX, camY, canvas.width, canvas.height, isFury, player.y, 'front');
    } catch (errFront) {
      console.warn('Erro props front:', errFront);
    }
  }

  projectiles.forEach(function(p) {
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.lineWidth = (p.vfxType === 'telluric_beam') ? 7 : 4;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    if (p.vfxType === 'abyss_whip' || p.vfxType === 'abyss_pull') {
      var midX = (p.x + p.tx) / 2;
      var midY = (p.y + p.ty) / 2 - 28;
      ctx.quadraticCurveTo(midX, midY, p.tx, p.ty);
    } else {
      ctx.lineTo(p.tx, p.ty);
    }
    ctx.stroke();
    ctx.restore();
  });

  vfxList.forEach(function(v) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, v.alpha);
    ctx.strokeStyle = v.color;
    ctx.fillStyle = v.color;
    ctx.shadowColor = v.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    var t = v.vfxType || '';
    if (t.indexOf('reaper') !== -1) {
      ctx.beginPath();
      ctx.moveTo(v.x - v.r * 0.7, v.y - v.r * 0.7);
      ctx.lineTo(v.x + v.r * 0.7, v.y + v.r * 0.7);
      ctx.moveTo(v.x + v.r * 0.7, v.y - v.r * 0.7);
      ctx.lineTo(v.x - v.r * 0.7, v.y + v.r * 0.7);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.85, 0, Math.PI * 2); ctx.stroke();
    } else if (t.indexOf('storm') !== -1) {
      ctx.beginPath();
      ctx.moveTo(v.x, v.y - v.r);
      ctx.lineTo(v.x - 14, v.y - v.r * 0.3);
      ctx.lineTo(v.x + 14, v.y + v.r * 0.2);
      ctx.lineTo(v.x, v.y + v.r * 0.6);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.8, 0, Math.PI * 2); ctx.stroke();
    } else if (t.indexOf('crystal') !== -1 || t.indexOf('glacial') !== -1) {
      for (var k = 0; k < 6; k++) {
        var ang = (k * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(v.x, v.y);
        ctx.lineTo(v.x + Math.cos(ang) * v.r * 0.9, v.y + Math.sin(ang) * v.r * 0.9);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.65, 0, Math.PI * 2); ctx.stroke();
    } else if (t.indexOf('lich') !== -1 || t.indexOf('abyss') !== -1) {
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.55, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = Math.max(0, v.alpha * 0.22);
      ctx.beginPath(); ctx.arc(v.x, v.y, v.r * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });

  floatingTexts.forEach(function(ft) {
    ctx.font = 'bold 13px Segoe UI';
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.restore();
  renderMinimap();
}

function renderMinimap() {
  miniCtx.fillStyle = '#070a10';
  miniCtx.fillRect(0, 0, 124, 124);
  var scale = 124 / WORLD_SIZE;

  monsters.forEach(function(m) {
    if (m.hp <= 0) return;
    miniCtx.fillStyle = m.tier === 'boss' ? '#fbbf24' : '#ef4444';
    miniCtx.fillRect(m.x * scale - 1.5, m.y * scale - 1.5, 3, 3);
  });

  miniCtx.fillStyle = '#38bdf8';
  miniCtx.beginPath();
  miniCtx.arc(player.x * scale, player.y * scale, 3.5, 0, Math.PI * 2);
  miniCtx.fill();
}

// ================= INICIALIZAÇÃO =================
renderClassGrid();
renderSlotsGrid();
requestAnimationFrame(gameLoop);
