var STORAGE_KEY_EP45 = 'aethelgard_ep45_slots_v5';
var WORLD_W = 2800;
var WORLD_H = 2800;
var keysPressed = {};

var characterSlots = [null, null, null];
var activeSlotIndex = -1;
var selectedFaction = 'light';
var selectedArchKey = 'fighter';
var selectedMode = 'hm';

var player = null;
var selectedTarget = null;
var enemies = [];
var hazardZones = [];
var worldProps = [];
var floatingTexts = [];
var effects = [];
var projectiles = [];
var clickMarker = null;
var autoCombat = false;
var gameRunning = false;
var loopStarted = false;
var lastTime = performance.now();
var worldAnimTime = 0;

var currentBagPage = 0;
var selectedBagIndex = -1;
var selectedEquippedSlot = null;

var currentShopCat = 'sets';

var currentSmithTab = 'link';
var smithSelectedSlot = 'weapon';
var useLinkStone = false;
var useExtHammer = false;
var useProtRune = false;

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var minimapCanvas = document.getElementById('minimapCanvas');
var mCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

// ================= ÁUDIO =================
var audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSuccessChime() {
  try {
    var c = getAudioCtx();
    if (!c) return;
    var now = c.currentTime;
    [587.33, 880, 1174.66, 1760].forEach(function(freq, i) {
      var osc = c.createOscillator(), g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      g.gain.setValueAtTime(0.001, now + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.15, now + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.42);
      osc.connect(g); g.connect(c.destination);
      osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.44);
    });
  } catch (e) {}
}

function playBreakSound() {
  try {
    var c = getAudioCtx();
    if (!c) return;
    var now = c.currentTime;
    var len = Math.floor(c.sampleRate * 0.4);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2) * (Math.random() > 0.7 ? 1 : 0.25);
    var src = c.createBufferSource(); src.buffer = buf;
    var flt = c.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.setValueAtTime(1750, now);
    var g = c.createGain(); g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    src.connect(flt); flt.connect(g); g.connect(c.destination);
    src.start(now);
  } catch (e) {}
}

// ================= TEXTURAS DE TERRENO =================
var WORLD_TEXTURES = {
  grama:   { src: 'assets/grama.png',   img: null, loaded: false, pattern: null },
  estrada: { src: 'assets/estrada.png', img: null, loaded: false, pattern: null },
  agua:    { src: 'assets/agua.png',    img: null, loaded: false, pattern: null }
};

function initWorldTextures() {
  Object.keys(WORLD_TEXTURES).forEach(function(key) {
    var entry = WORLD_TEXTURES[key];
    var image = new Image();
    image.onload = function() { entry.img = image; entry.loaded = true; entry.pattern = ctx.createPattern(image, 'repeat'); };
    image.onerror = function() { entry.loaded = false; };
    image.src = entry.src;
  });
}
initWorldTextures();

var grassPatternCanvas = document.createElement('canvas');
grassPatternCanvas.width = 256; grassPatternCanvas.height = 256;
(function buildFallbackGrass() {
  var g = grassPatternCanvas.getContext('2d');
  g.fillStyle = '#0e281e'; g.fillRect(0, 0, 256, 256);
  for (var i = 0; i < 60; i++) {
    g.fillStyle = i % 2 === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(6, 78, 59, 0.22)';
    g.beginPath(); g.arc((i * 47) % 256, (i * 83) % 256, 16 + (i % 18), 0, Math.PI * 2); g.fill();
  }
})();
var fallbackGrassPattern = null;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ================= LOJA EXCLUSIVA DE TEOS =================
function switchShopCat(cat) {
  currentShopCat = cat;
  ['sets', 'acc', 'mounts', 'lapis'].forEach(function(c) {
    document.getElementById('scat-' + c).classList.toggle('active', c === cat);
  });
  renderShopWindow();
}

function showShopBanner(msg, ok) {
  var b = document.getElementById('shop-banner');
  b.style.display = 'block';
  b.style.background = ok ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.22)';
  b.style.border = ok ? '1px solid #10b981' : '1px solid #f43f5e';
  b.style.color = ok ? '#34d399' : '#fda4af';
  b.textContent = msg;
}

function renderShopWindow() {
  document.getElementById('shop-gold-val').textContent = player.gold;
  var grid = document.getElementById('shop-grid');
  grid.innerHTML = '';

  if (currentShopCat === 'sets') {
    Object.keys(GODDESS_SET_NAMES).forEach(function(ak) {
      var gs = GODDESS_SET_NAMES[ak];
      var clsName = ARCHETYPES[ak].lightName + ' / ' + ARCHETYPES[ak].furyName;
      var isMyClass = (ak === player.archKey);
      var price = 2500;
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.style.borderColor = isMyClass ? '#fbbf24' : '#263248';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico" style="border:1.5px solid #fbbf24;">' + gs.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">EXCLUSIVO LOJA • 6 SLOTS</span>' +
              '<div style="font-weight:bold; color:#fbbf24; font-size:0.86rem;">' + gs.title + '</div>' +
              '<div style="font-size:0.7rem; color:' + (isMyClass ? '#34d399' : '#94a3b8') + '; font-weight:bold;">Classe: ' + clsName + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.71rem; color:#cbd5e1; margin-top:7px; line-height:1.35;">' +
            'Entrega as <b>5 peças Deusa completas</b> (Elmo, Peitoral, Calça, Manoplas e Botas) com <b>6 engastes de Lapis</b> cada.' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" ' + (player.gold >= price ? '' : 'disabled') + ' onclick="buyGoddessSet(\'' + ak + '\',' + price + ')">👑 Comprar Set ($' + price + ' Ouro)</button>';
      grid.appendChild(card);
    });
  } else if (currentShopCat === 'acc') {
    var accPacks = [
      { key: 'duel', title: 'Pacote Acc Deusa (Duelo Físico)', icon: '💍', price: 2200, desc: 'Colar, 2 Anéis e 2 Braceletes Deusa (6 slots cada) focados em FOR/DES/SOR.' },
      { key: 'myst', title: 'Pacote Acc Deusa (Arcano / Cura)', icon: '📿', price: 2200, desc: 'Colar, 2 Anéis e 2 Braceletes Deusa (6 slots cada) focados em INT/SAB/REC.' },
      { key: 'tank', title: 'Pacote Acc Deusa (Tanque / Vigor)', icon: '🧿', price: 2200, desc: 'Colar, 2 Anéis e 2 Braceletes Deusa (6 slots cada) focados em REC/SAB/DES.' }
    ];
    accPacks.forEach(function(pk) {
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.style.borderColor = '#fbbf24';
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico" style="border:1.5px solid #fbbf24;">' + pk.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">EXCLUSIVO LOJA • 5 PEÇAS</span>' +
              '<div style="font-weight:bold; color:#fbbf24; font-size:0.86rem;">' + pk.title + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.71rem; color:#cbd5e1; margin-top:7px; line-height:1.35;">' + pk.desc + '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" ' + (player.gold >= pk.price ? '' : 'disabled') + ' onclick="buyGoddessAccPack(\'' + pk.key + '\',' + pk.price + ')">📿 Comprar Pacote ($' + pk.price + ' Ouro)</button>';
      grid.appendChild(card);
    });
  } else if (currentShopCat === 'mounts') {
    EXCLUSIVE_MOUNTS.forEach(function(m) {
      var facName = m.faction === 'fury' ? '🔥 União da Fúria' : '☀️ Aliança da Luz';
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.style.borderColor = m.color;
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico" style="border:1.5px solid ' + m.color + ';">' + m.icon + '</div>' +
            '<div>' +
              '<span class="shop-excl-tag">MONTARIA EXCLUSIVA</span>' +
              '<div style="font-weight:bold; color:' + m.color + '; font-size:0.88rem;">' + m.name + '</div>' +
              '<div style="font-size:0.69rem; color:#94a3b8;">' + facName + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.71rem; color:#cbd5e1; margin-top:7px; line-height:1.35;">' + m.desc + '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" ' + (player.gold >= m.price ? '' : 'disabled') + ' onclick="buyExclusiveMount(\'' + m.id + '\')">🐎 Comprar Montaria ($' + m.price + ' Ouro)</button>';
      grid.appendChild(card);
    });
  } else if (currentShopCat === 'lapis') {
    var shopLapisList = [
      { key: 'sonic', lvl: 1, price: 850 },
      { key: 'sonic', lvl: 2, price: 1650 },
      { key: 'swift', lvl: 1, price: 800 },
      { key: 'swift', lvl: 2, price: 1550 },
      { key: 'abs',   lvl: 5, price: 1200 },
      { key: 'abs',   lvl: 6, price: 2100 }
    ];
    shopLapisList.forEach(function(sl) {
      var meta = LAPIS_CATALOG[sl.key];
      var fullName = meta.name + ' Nv.' + sl.lvl;
      var card = document.createElement('div');
      card.className = 'shop-card';
      card.style.borderColor = meta.color;
      card.innerHTML =
        '<div>' +
          '<div class="shop-card-top">' +
            '<div class="shop-card-ico" style="border:1.5px solid ' + meta.color + ';">💎</div>' +
            '<div>' +
              '<span class="shop-excl-tag">LAPIS EXCLUSIVA LOJA</span>' +
              '<div style="font-weight:bold; color:' + meta.color + '; font-size:0.88rem;">' + fullName + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.72rem; color:#e2e8f0; margin-top:7px; line-height:1.35;">' +
            formatLapisEffect({ lapisKey: sl.key, level: sl.lvl }) + '<br><span style="color:#94a3b8; font-size:0.66rem;">Não dropa em monstros. Linkável no Ferreiro.</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-buy-mall" ' + (player.gold >= sl.price ? '' : 'disabled') + ' onclick="buyExclusiveLapis(\'' + sl.key + '\',' + sl.lvl + ',' + sl.price + ')">💎 Comprar Lapis ($' + sl.price + ' Ouro)</button>';
      grid.appendChild(card);
    });
  }
}

function buyGoddessSet(archKey, price) {
  if (player.gold < price) return;
  if (player.bag.length + 5 > 120) {
    showShopBanner('Libere pelo menos 5 espaços na Mochila (B) antes de comprar o Set Completo!', false);
    return;
  }
  var gs = GODDESS_SET_NAMES[archKey];
  var parts = ['helm', 'armor', 'pants', 'gloves', 'boots'];
  var scale = 1 + Math.max(player.level, 10) * 0.22;

  parts.forEach(function(slot) {
    player.bag.push({
      id: 'gd_' + Math.random().toString(36).slice(2, 10),
      name: SLOT_META[slot].label + ' Deusa (' + ARCHETYPES[archKey].lightName + ')',
      slot: slot,
      icon: SLOT_META[slot].icon,
      rarity: 'deusa',
      shopExclusive: true,
      plus: 0,
      element: 'none',
      reqArch: [archKey],
      sockets: [null, null, null, null, null, null],
      physAtk: 0, magAtk: 0,
      physDef: Math.round(11 * 4.3 * scale),
      magDef:  Math.round(10 * 4.3 * scale),
      bonusStr: gs.stats.str || 0,
      bonusDex: gs.stats.dex || 0,
      bonusRec: gs.stats.rec || 0,
      bonusInt: gs.stats.int || 0,
      bonusWis: gs.stats.wis || 0,
      bonusLuc: gs.stats.luc || 0,
      sellPrice: 600
    });
  });

  player.gold -= price;
  playSuccessChime();
  saveSlots();
  updateHUD();
  renderShopWindow();
  showShopBanner('👑 ' + gs.title + ' (5 peças Deusa de 6 slots) enviado para sua Mochila!', true);
}

function buyGoddessAccPack(packKey, price) {
  if (player.gold < price) return;
  if (player.bag.length + 5 > 120) {
    showShopBanner('Libere pelo menos 5 espaços na Mochila (B) antes de comprar o Pacote de Acessórios!', false);
    return;
  }
  var map = {
    duel: { label: 'Duelo',  stats: { str: 26, dex: 22, luc: 18, rec: 14 } },
    myst: { label: 'Arcano', stats: { int: 26, wis: 26, rec: 16, luc: 14 } },
    tank: { label: 'Vigor',  stats: { rec: 30, str: 16, wis: 20, dex: 16 } }
  };
  var cfg = map[packKey];
  var accList = [
    { slot: 'amulet', name: 'Colar Deusa (' + cfg.label + ')' },
    { slot: 'ring1',  name: 'Anel Deusa I (' + cfg.label + ')' },
    { slot: 'ring2',  name: 'Anel Deusa II (' + cfg.label + ')' },
    { slot: 'loop1',  name: 'Bracelete Deusa I (' + cfg.label + ')' },
    { slot: 'loop2',  name: 'Bracelete Deusa II (' + cfg.label + ')' }
  ];

  accList.forEach(function(a) {
    player.bag.push({
      id: 'gdacc_' + Math.random().toString(36).slice(2, 10),
      name: a.name,
      slot: a.slot,
      icon: SLOT_META[a.slot].icon,
      rarity: 'deusa',
      shopExclusive: true,
      plus: 0,
      element: 'none',
      sockets: [null, null, null, null, null, null],
      physAtk: 24, magAtk: 24, physDef: 22, magDef: 22,
      bonusStr: cfg.stats.str || 0,
      bonusDex: cfg.stats.dex || 0,
      bonusRec: cfg.stats.rec || 0,
      bonusInt: cfg.stats.int || 0,
      bonusWis: cfg.stats.wis || 0,
      bonusLuc: cfg.stats.luc || 0,
      sellPrice: 550
    });
  });

  player.gold -= price;
  playSuccessChime();
  saveSlots();
  updateHUD();
  renderShopWindow();
  showShopBanner('📿 Pacote Completo de Acessórios Deusa (5 peças com 6 slots) enviado para sua Mochila!', true);
}

function buyExclusiveMount(mountId) {
  var m = EXCLUSIVE_MOUNTS.filter(function(x) { return x.id === mountId; })[0];
  if (!m || player.gold < m.price) return;
  if (player.bag.length >= 120) {
    showShopBanner('Mochila cheia!', false);
    return;
  }
  player.gold -= m.price;
  player.bag.push({
    id: 'mnt_' + Math.random().toString(36).slice(2, 10),
    name: m.name,
    slot: 'mount',
    icon: m.icon,
    rarity: 'deusa',
    shopExclusive: true,
    speedBonus: m.speedBonus,
    mountColor: m.color,
    desc: m.desc,
    sellPrice: Math.round(m.price * 0.4)
  });
  playSuccessChime();
  saveSlots();
  updateHUD();
  renderShopWindow();
  showShopBanner('🐎 Montaria ' + m.name + ' enviada para sua Mochila! Equipe-a no slot Montaria.', true);
}

function buyExclusiveLapis(lapisKey, lvl, price) {
  if (player.gold < price) return;
  if (player.bag.length >= 120) {
    showShopBanner('Mochila cheia!', false);
    return;
  }
  var meta = LAPIS_CATALOG[lapisKey];
  player.gold -= price;
  player.bag.push({
    id: 'lapex_' + Math.random().toString(36).slice(2, 10),
    name: meta.name + ' Nv.' + lvl,
    icon: '💎',
    slot: 'lapis',
    lapisKey: lapisKey,
    level: lvl,
    rarity: 'deusa',
    shopExclusive: true,
    sellPrice: Math.round(price * 0.4),
    desc: formatLapisEffect({ lapisKey: lapisKey, level: lvl })
  });
  playSuccessChime();
  saveSlots();
  updateHUD();
  renderShopWindow();
  showShopBanner('💎 ' + meta.name + ' Nv.' + lvl + ' enviada para sua Mochila!', true);
}

// ================= CÁLCULO COMPLETO DE ATRIBUTOS =================
function getItemPowerScore(item) {
  if (!item) return 0;
  if (item.slot === 'mount') return (item.speedBonus || 0) * 2;
  var plusMult = 1 + (item.plus || 0) * 0.10;
  var score = ((item.physAtk || 0) + (item.magAtk || 0) + (item.physDef || 0) + (item.magDef || 0)) * plusMult;
  score += ((item.bonusStr || 0) + (item.bonusDex || 0) + (item.bonusRec || 0) + (item.bonusInt || 0) + (item.bonusWis || 0) + (item.bonusLuc || 0)) * 3;
  if (Array.isArray(item.sockets)) {
    score += item.sockets.length * 4;
    item.sockets.forEach(function(s) { if (s) score += (s.level || 1) * 10; });
  }
  if (item.element && item.element !== 'none') score += 10;
  return score;
}

function compareBagItemToEquipped(item) {
  if (!item || item.slot === 'consumable' || item.slot === 'lapis') return 0;
  var eq = player.equipped[item.slot];
  if (!eq) return 1;
  var diff = getItemPowerScore(item) - getItemPowerScore(eq);
  if (diff > 0.5) return 1;
  if (diff < -0.5) return -1;
  return 0;
}

function computeFullStats(p) {
  var arch = ARCHETYPES[p.archKey];
  var totalStr = p.stats.str;
  var totalDex = p.stats.dex;
  var totalRec = p.stats.rec;
  var totalInt = p.stats.int;
  var totalWis = p.stats.wis;
  var totalLuc = p.stats.luc;

  var eqPhysAtk = 0, eqMagAtk = 0, eqPhysDef = 0, eqMagDef = 0;
  var totalAbs = 0;
  var totalCdr = 0;
  var bonusMoveSpeed = (p.equipped.mount && p.equipped.mount.speedBonus) ? p.equipped.mount.speedBonus : 0;

  Object.keys(p.equipped).forEach(function(slotKey) {
    var it = p.equipped[slotKey];
    if (!it) return;
    var plusMult = 1 + (it.plus || 0) * 0.10;
    eqPhysAtk += Math.round((it.physAtk || 0) * plusMult);
    eqMagAtk  += Math.round((it.magAtk  || 0) * plusMult);
    eqPhysDef += Math.round((it.physDef || 0) * plusMult);
    eqMagDef  += Math.round((it.magDef  || 0) * plusMult);

    totalStr += (it.bonusStr || 0);
    totalDex += (it.bonusDex || 0);
    totalRec += (it.bonusRec || 0);
    totalInt += (it.bonusInt || 0);
    totalWis += (it.bonusWis || 0);
    totalLuc += (it.bonusLuc || 0);

    if (Array.isArray(it.sockets)) {
      it.sockets.forEach(function(sock) {
        if (!sock || !LAPIS_CATALOG[sock.lapisKey]) return;
        var meta = LAPIS_CATALOG[sock.lapisKey];
        var lvl = sock.level || 1;
        if (meta.kind === 'abs') {
          totalAbs += (meta.abs[lvl] || 0);
        } else if (meta.kind === 'sonic') {
          totalCdr += (meta.cdr[lvl] || 0);
        } else if (meta.kind === 'swift') {
          bonusMoveSpeed += (meta.spd[lvl] || 0);
        } else if (meta.kind !== 'elem' && meta.stats) {
          if (meta.stats.str) totalStr += (meta.stats.str[lvl] || 0);
          if (meta.stats.dex) totalDex += (meta.stats.dex[lvl] || 0);
          if (meta.stats.rec) totalRec += (meta.stats.rec[lvl] || 0);
          if (meta.stats.int) totalInt += (meta.stats.int[lvl] || 0);
          if (meta.stats.wis) totalWis += (meta.stats.wis[lvl] || 0);
          if (meta.stats.luc) totalLuc += (meta.stats.luc[lvl] || 0);
        }
      });
    }
  });

  totalCdr = Math.min(60, totalCdr);

  var maxHp = Math.round(120 + p.level * 24 + totalRec * 14);
  var maxMp = Math.round(70  + p.level * 14 + totalWis * 12);
  var maxSp = Math.round(80  + p.level * 12 + totalDex * 10);

  var physAtk = Math.round(totalStr * 2.2 + totalDex * 0.5 + eqPhysAtk);
  var magAtk  = Math.round(totalInt * 2.3 + totalWis * 0.5 + eqMagAtk);
  var physDef = Math.round(totalRec * 1.6 + eqPhysDef);
  var magDef  = Math.round(totalWis * 1.7 + eqMagDef);
  var critChance = Math.min(85, Math.round((5 + totalLuc * 0.35) * 10) / 10);
  var evaChance  = Math.min(65, Math.round((3 + totalDex * 0.28) * 10) / 10);

  if (Array.isArray(p.activeBuffs)) {
    p.activeBuffs.forEach(function(b) {
      if (b.id === 'atk') { physAtk = Math.round(physAtk * 1.25); magAtk = Math.round(magAtk * 1.28); }
      if (b.id === 'def') { physDef = Math.round(physDef * 1.38); magDef = Math.round(magDef * 1.38); }
      if (b.id === 'crit') critChance = Math.min(95, critChance + 25);
      if (b.id === 'eva') evaChance = Math.min(80, evaChance + 25);
    });
  }

  var moveSpeedMult = 1.0;
  if (Array.isArray(p.activeDebuffs)) {
    p.activeDebuffs.forEach(function(db) {
      if (db.id === 'curse_def') { physDef = Math.round(physDef * 0.65); magDef = Math.round(magDef * 0.65); }
      if (db.id === 'curse_atk') { physAtk = Math.round(physAtk * 0.72); magAtk = Math.round(magAtk * 0.72); }
      if (db.id === 'slow') moveSpeedMult *= 0.55;
      if (db.id === 'freeze') moveSpeedMult = 0;
    });
  }

  var baseSpd = p.archKey === 'ranger' ? 235 : 200;
  var finalMoveSpeed = Math.round((baseSpd + bonusMoveSpeed) * moveSpeedMult);

  var primaryAtk = arch.atkStyle === 'magic' ? magAtk : physAtk;
  var br = Math.round(maxHp * 0.4 + primaryAtk * 4 + (physDef + magDef) * 2 + totalAbs * 10 + (critChance + evaChance) * 7 + p.level * 25 + Math.floor((p.kills || 0) / 10));

  var atkElem = (p.equipped.weapon && p.equipped.weapon.element) || 'none';
  var defElem = (p.equipped.armor  && p.equipped.armor.element)  || 'none';

  return {
    totalStr: totalStr, totalDex: totalDex, totalRec: totalRec,
    totalInt: totalInt, totalWis: totalWis, totalLuc: totalLuc,
    maxHp: maxHp, maxMp: maxMp, maxSp: maxSp,
    physAtk: physAtk, magAtk: magAtk, primaryAtk: primaryAtk,
    physDef: physDef, magDef: magDef,
    totalAbs: totalAbs, totalCdr: totalCdr, finalMoveSpeed: finalMoveSpeed,
    critChance: critChance, evaChance: evaChance,
    atkElem: atkElem, defElem: defElem, br: br
  };
}

// ================= CRIAÇÃO E GERENCIAMENTO DE PERSONAGENS =================
function renderCreationClassCards() {
  var grid = document.getElementById('class-grid');
  grid.innerHTML = '';
  Object.keys(ARCHETYPES).forEach(function(key) {
    var a = ARCHETYPES[key];
    var cName = getArchetypeDisplayName(key, selectedFaction);
    var race  = selectedFaction === 'fury' ? a.raceFury : a.raceLight;
    var card = document.createElement('div');
    card.className = 'class-card' + (selectedArchKey === key ? ' selected' : '');
    card.onclick = function() { selectedArchKey = key; renderCreationClassCards(); };
    card.innerHTML =
      '<div class="class-icon" style="background:' + a.color + '22; border:2px solid ' + a.color + '; color:' + a.color + '">' + a.icon + '</div>' +
      '<h3 style="color:' + a.color + '">' + cName + '</h3>' +
      '<div class="sub-race">Raça: ' + race + ' • ' + (a.atkStyle === 'magic' ? 'Mágico' : 'Físico') + '</div>' +
      '<div class="auto-stat">' + a.autoStatLabel + '</div>' +
      '<div class="desc">' + a.desc + '</div>';
    grid.appendChild(card);
  });
}

function selectFaction(fac) {
  selectedFaction = fac;
  document.getElementById('fac-light').className = 'faction-btn' + (fac === 'light' ? ' active-light' : '');
  document.getElementById('fac-fury').className  = 'faction-btn' + (fac === 'fury'  ? ' active-fury'  : '');
  renderCreationClassCards();
}

function selectMode(m) {
  selectedMode = m;
  document.getElementById('mode-nm').className = 'mode-card' + (m === 'nm' ? ' selected-nm' : '');
  document.getElementById('mode-hm').className = 'mode-card' + (m === 'hm' ? ' selected-hm' : '');
  document.getElementById('mode-um').className = 'mode-card' + (m === 'um' ? ' selected-um' : '');
}

function addBagItem(bag, itemObj) {
  if (itemObj.stackKey) {
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].stackKey === itemObj.stackKey) {
        bag[i].qty = (bag[i].qty || 1) + (itemObj.qty || 1);
        return true;
      }
    }
  }
  if (bag.length >= 120) return false;
  bag.push(itemObj);
  return true;
}

function createHero() {
  var freeIdx = -1;
  for (var i = 0; i < 3; i++) {
    if (characterSlots[i] === null) { freeIdx = i; break; }
  }
  if (freeIdx === -1) {
    alert('Limite de 3 personagens atingido! Exclua um slot abaixo para criar outro.');
    return;
  }

  var rawName = document.getElementById('hero-name-input').value.trim() || 'Herói';
  var arch = ARCHETYPES[selectedArchKey];
  var b = arch.baseStats;

  var newHero = {
    name: rawName,
    faction: selectedFaction,
    archKey: selectedArchKey,
    mode: selectedMode,
    level: 1,
    kills: 0,
    deaths: 0,
    claimedRankIdx: 0,
    xp: 0,
    maxXp: 100,
    gold: 3000,
    freePoints: MODES[selectedMode].ptsPerLvl,
    stats: { str: b.str, dex: b.dex, rec: b.rec, int: b.int, wis: b.wis, luc: b.luc },
    allocated: { str: 0, dex: 0, rec: 0, int: 0, wis: 0, luc: 0 },
    x: WORLD_W / 2, y: WORLD_H / 2,
    targetX: WORLD_W / 2, targetY: WORLD_H / 2,
    facing: 1, attackAnimTimer: 0, walkCycle: 0,
    hp: 9999, mp: 9999, sp: 9999,
    cooldowns: [0, 0, 0, 0, 0, 0, 0, 0],
    activeBuffs: [],
    activeDebuffs: [],
    equipped: {
      weapon: null, shield: null, helm: null, armor: null, pants: null,
      gloves: null, boots: null, cape: null, amulet: null,
      ring1: null, ring2: null, loop1: null, loop2: null, mount: null
    },
    bag: []
  };

  var classWeaponMeta = SHAIYA_WEAPONS_DB.filter(function(w) { return w.slot === 'weapon' && w.reqArch.indexOf(selectedArchKey) >= 0; })[0];
  var startWeapon = generateDropItem(1, 'normal');
  startWeapon.slot = 'weapon';
  startWeapon.name = classWeaponMeta ? classWeaponMeta.name : ('Arma de ' + getArchetypeDisplayName(selectedArchKey, selectedFaction));
  startWeapon.icon = classWeaponMeta ? classWeaponMeta.icon : arch.icon;
  startWeapon.reqArch = [selectedArchKey];
  startWeapon.wType = classWeaponMeta ? classWeaponMeta.wType : 'Arma de Classe';
  startWeapon.is2H = classWeaponMeta ? !!classWeaponMeta.is2H : false;
  startWeapon.rarity = 'veneravel';
  startWeapon.reqMode = 'nm';
  startWeapon.sockets = [null, null];
  newHero.equipped.weapon = startWeapon;

  if (selectedArchKey === 'defender') {
    var startShield = generateDropItem(1, 'normal');
    startShield.slot = 'shield';
    startShield.name = 'Escudo Torre do Bastião';
    startShield.icon = '🛡️';
    startShield.reqArch = ['defender'];
    startShield.wType = 'Escudo Torre';
    startShield.rarity = 'veneravel';
    startShield.reqMode = 'nm';
    startShield.sockets = [null, null];
    newHero.equipped.shield = startShield;
  }

  var mainLapis = arch.atkStyle === 'magic' ? 'int' : 'str';
  newHero.bag.push({
    id: 'lap_init1', name: LAPIS_CATALOG[mainLapis].name + ' Nv.2', icon: '💎',
    slot: 'lapis', lapisKey: mainLapis, level: 2, rarity: 'nobre', sellPrice: 90,
    desc: formatLapisEffect({ lapisKey: mainLapis, level: 2 })
  });
  newHero.bag.push({
    id: 'lap_init2', name: 'Lapis Elemental Fogo', icon: '💎',
    slot: 'lapis', lapisKey: 'elem_fire', level: 1, rarity: 'heroico', sellPrice: 150,
    desc: formatLapisEffect({ lapisKey: 'elem_fire', level: 1 })
  });
  addBagItem(newHero.bag, { id: 'sup_ls', stackKey: 'link_stone', name: 'Pedra de Linkagem', icon: '🔷', slot: 'consumable', rarity: 'nobre', qty: 3, sellPrice: 50, desc: '+25% de chance de linkar e protege a Lapis.' });
  addBagItem(newHero.bag, { id: 'sup_la', stackKey: 'lapisia_atk', name: 'Lapisia de Ataque', icon: '⚔️', slot: 'consumable', rarity: 'veneravel', qty: 2, sellPrice: 80, desc: 'Encanta Armas e Acessórios no Ferreiro.' });

  if (selectedMode === 'um') {
    addBagItem(newHero.bag, {
      id: 'rune_res_1', stackKey: 'rune_res', name: 'Runa de Ressurreição', icon: '🔮',
      slot: 'consumable', rarity: 'heroico', qty: 1, sellPrice: 0,
      desc: 'Protege contra a morte permanente no Modo Extremo (UM) uma vez.'
    });
  }

  var st = computeFullStats(newHero);
  newHero.hp = st.maxHp;
  newHero.mp = st.maxMp;
  newHero.sp = st.maxSp;

  characterSlots[freeIdx] = newHero;
  activeSlotIndex = freeIdx;
  player = newHero;
  saveSlots();
  enterWorld();
}

function saveSlots() {
  try {
    if (activeSlotIndex >= 0 && player) characterSlots[activeSlotIndex] = player;
    localStorage.setItem(STORAGE_KEY_EP45, JSON.stringify(characterSlots));
  } catch (e) {}
}

function loadSlots() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY_EP45);
    if (raw) {
      var arr = JSON.parse(raw);
      if (Array.isArray(arr)) characterSlots = [arr[0] || null, arr[1] || null, arr[2] || null];
    }
  } catch (e) { characterSlots = [null, null, null]; }
}

function renderSlotsGrid() {
  var grid = document.getElementById('slots-grid');
  grid.innerHTML = '';
  var hasFree = false;

  for (var i = 0; i < 3; i++) {
    var p = characterSlots[i];
    var card = document.createElement('div');
    if (p && ARCHETYPES[p.archKey]) {
      var arch = ARCHETYPES[p.archKey];
      var mInfo = MODES[p.mode] || MODES.hm;
      var st = computeFullStats(p);
      var rankBadge = renderKillRankBadgeHTML(p.kills || 0);
      var facTxt = p.faction === 'fury' ? '🔥 União da Fúria' : '☀️ Aliança da Luz';

      card.className = 'slot-card occupied';
      card.innerHTML =
        '<span class="slot-tag">SLOT ' + (i + 1) + '</span>' +
        '<button type="button" class="btn-del" onclick="deleteHeroSlot(' + i + ')">Excluir</button>' +
        '<div style="font-size:2rem; margin-bottom:4px;">' + arch.icon + '</div>' +
        '<div style="font-weight:bold; font-size:1.05rem; color:#fff; display:flex; align-items:center; gap:6px;">' + rankBadge + '<span>' + p.name + '</span></div>' +
        '<div style="font-size:0.78rem; color:' + arch.color + '; font-weight:bold;">' + getArchetypeDisplayName(p.archKey, p.faction) + ' • Nv.' + p.level + '</div>' +
        '<div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">' + facTxt + ' • <b style="color:' + mInfo.color + ';">' + mInfo.short + '</b> • Kills: <b>' + (p.kills || 0).toLocaleString('pt-BR') + '</b> | Derrotas: <b>' + (p.deaths || 0) + '</b></div>' +
        '<div style="font-size:0.76rem; color:#fbbf24; margin-top:4px; font-weight:bold;">🔥 BR: ' + st.br + '</div>' +
        '<button type="button" class="btn-play-slot" onclick="playHeroSlot(' + i + ')">▶ Jogar</button>';
    } else {
      hasFree = true;
      card.className = 'slot-card empty';
      card.innerHTML =
        '<span class="slot-tag">SLOT ' + (i + 1) + '</span>' +
        '<div style="font-size:1.7rem; margin-bottom:6px;">➕</div>' +
        '<div style="font-weight:bold;">Espaço Livre</div>';
    }
    grid.appendChild(card);
  }

  var btn = document.getElementById('btn-create-hero');
  btn.disabled = !hasFree;
  btn.textContent = hasFree ? 'Entrar em Teos' : '3 Slots Ocupados';
}

function playHeroSlot(idx) {
  if (!characterSlots[idx]) return;
  activeSlotIndex = idx;
  player = characterSlots[idx];
  if (typeof player.kills !== 'number') player.kills = 0;
  if (typeof player.deaths !== 'number') player.deaths = 0;
  if (typeof player.claimedRankIdx !== 'number') player.claimedRankIdx = 0;
  if (!Array.isArray(player.activeBuffs)) player.activeBuffs = [];
  if (!Array.isArray(player.activeDebuffs)) player.activeDebuffs = [];
  player.cooldowns = [0, 0, 0, 0, 0, 0, 0, 0];
  player.targetX = player.x;
  player.targetY = player.y;
  enterWorld();
}

function deleteHeroSlot(idx) {
  if (confirm('Excluir permanentemente o personagem do Slot ' + (idx + 1) + '?')) {
    characterSlots[idx] = null;
    saveSlots();
    renderSlotsGrid();
  }
}

function returnToCharSelect() {
  saveSlots();
  gameRunning = false;
  autoCombat = false;
  closeAllWindows();
  document.getElementById('hud-top-left').style.display = 'none';
  document.getElementById('hud-target-box').style.display = 'none';
  document.getElementById('hud-top-right').style.display = 'none';
  document.getElementById('controls-hint').style.display = 'none';
  document.getElementById('hud-bottom').style.display = 'none';
  document.getElementById('char-screen').style.display = 'flex';
  renderSlotsGrid();
}

// ================= MUNDO, SPAWN DE MOBS & DEBUFFS =================
function buildWorldProps() {
  worldProps = [];
  for (var b = 60; b < WORLD_W; b += 120) {
    worldProps.push({ type: 'pine', x: b, y: 60, scale: 1.15 });
    worldProps.push({ type: 'pine', x: b, y: WORLD_H - 50, scale: 1.15 });
    worldProps.push({ type: 'pine', x: 60, y: b, scale: 1.15 });
    worldProps.push({ type: 'pine', x: WORLD_W - 60, y: b, scale: 1.15 });
  }
  var spots = [
    { type: 'crystal', x: 1050, y: 1080, scale: 1.15, col: '#38bdf8' },
    { type: 'crystal', x: 1850, y: 920,  scale: 1.25, col: '#fbbf24' },
    { type: 'oak',     x: 840,  y: 640,  scale: 1.25 },
    { type: 'oak',     x: 1620, y: 580,  scale: 1.3 },
    { type: 'oak',     x: 2350, y: 1340, scale: 1.35 },
    { type: 'rock',    x: 920,  y: 740,  scale: 1.1 },
    { type: 'rock',    x: 1980, y: 2150, scale: 1.2 }
  ];
  spots.forEach(function(s) { worldProps.push(s); });
}

function isPointInLake(wx, wy) {
  var dx = (wx - 760) / 310;
  var dy = (wy - 2080) / 210;
  return (dx * dx + dy * dy) <= 1.0;
}

function spawnEnemy(forcedIdx) {
  var idx = typeof forcedIdx === 'number' ? forcedIdx : 0;
  if (typeof forcedIdx !== 'number') {
    var r = Math.random();
    if (r > 0.96) idx = 11;       // Astaroth (BOSS)
    else if (r > 0.92) idx = 10;  // Kimuraku Infernal (BOSS)
    else if (r > 0.88) idx = 9;   // Dios Exiel (BOSS)
    else if (r > 0.81) idx = 8;   // Capitão Sombrio (Mini-Boss)
    else if (r > 0.74) idx = 7;   // Golem de Obsidiana (Mini-Boss)
    else idx = Math.floor(Math.random() * 7); // Mobs normais 0 a 6
  }
  if (idx >= MONSTER_POOL.length) idx = MONSTER_POOL.length - 1;
  var m = MONSTER_POOL[idx];

  var wx = 0, wy = 0, tries = 0;
  do {
    var ang = Math.random() * Math.PI * 2;
    var dist = 320 + Math.random() * 980;
    wx = Math.max(130, Math.min(WORLD_W - 130, WORLD_W / 2 + Math.cos(ang) * dist));
    wy = Math.max(130, Math.min(WORLD_H - 130, WORLD_H / 2 + Math.sin(ang) * dist));
    tries++;
  } while (isPointInLake(wx, wy) && tries < 15);

  enemies.push({
    id: Math.random(), name: m.name, kind: m.kind, level: m.lvl,
    x: wx, y: wy, hp: m.hp, maxHp: m.hp, atk: m.atk, elem: m.elem,
    xp: m.xp, gold: m.gold, killsGain: m.killsGain || 1, scale: m.scale, tier: m.tier,
    debuff: m.debuff || null,
    bossSkillType: m.bossSkillType || null,
    bossSkillCd: 5.5,
    castTimer: 0,
    castLabel: '',
    atkTimer: 0, stunTimer: 0, dotTimer: 0, dotDmg: 0
  });
}

function applyPlayerDebuff(dbObj) {
  if (!Array.isArray(player.activeDebuffs)) player.activeDebuffs = [];
  player.activeDebuffs = player.activeDebuffs.filter(function(d) { return d.id !== dbObj.id; });
  player.activeDebuffs.push({
    id: dbObj.id,
    label: dbObj.label,
    timer: dbObj.dur,
    dotDmg: dbObj.dotDmg || 0,
    tickTimer: 1.0
  });
  addFloatingText(player.x, player.y - 54, dbObj.label + ' (' + dbObj.dur.toFixed(0) + 's)', '#fb7185');
}

// ================= CONTROLES & 6 SKILLS DINÂMICAS =================
canvas.addEventListener('mousedown', function(e) {
  if (!gameRunning) return;
  getAudioCtx();
  var rect = canvas.getBoundingClientRect();
  var camX = player.x - canvas.width / 2;
  var camY = player.y - canvas.height / 2;
  var worldX = Math.max(60, Math.min(WORLD_W - 60, (e.clientX - rect.left) + camX));
  var worldY = Math.max(60, Math.min(WORLD_H - 60, (e.clientY - rect.top) + camY));

  player.targetX = worldX;
  player.targetY = worldY;
  if (Math.abs(worldX - player.x) > 4) player.facing = worldX >= player.x ? 1 : -1;
  clickMarker = { x: worldX, y: worldY, timer: 0.45 };

  var clickedEnemy = getNearestEnemy(worldX, worldY, 85);
  if (clickedEnemy) {
    selectedTarget = clickedEnemy;
    updateTargetHUD();
    var arch = ARCHETYPES[player.archKey];
    if (getDist(player, clickedEnemy) <= arch.range + 20) useSkill(0);
  }
});

window.addEventListener('keydown', function(e) {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  var k = e.key.toLowerCase();
  keysPressed[k] = true;
  if (!gameRunning) return;
  if (e.key === '1') useSkill(0);
  if (e.key === '2') useSkill(1);
  if (e.key === '3') useSkill(2);
  if (e.key === '4') useSkill(3);
  if (e.key === '5') useSkill(4);
  if (e.key === '6') useSkill(5);
  if (e.key === '7') useHpPotion();
  if (e.key === '8') useSpMpPotion();
  if (k === 'a') toggleAuto();
  if (k === 'l') toggleWindow('shop-modal');
  if (k === 'c') toggleWindow('status-modal');
  if (k === 'b' || k === 'i') toggleWindow('bag-modal');
  if (k === 'f') toggleWindow('smith-modal');
  if (e.key === 'Escape') closeAllWindows();
});

window.addEventListener('keyup', function(e) { keysPressed[e.key.toLowerCase()] = false; });

function getDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function getNearestEnemy(x, y, maxR) {
  var limit = typeof maxR === 'number' ? maxR : Infinity;
  var best = null, bestD = limit;
  enemies.forEach(function(en) {
    var d = Math.hypot(en.x - x, en.y - y);
    if (d < bestD) { bestD = d; best = en; }
  });
  return best;
}

function useHpPotion() {
  var st = computeFullStats(player);
  if (player.cooldowns[6] > 0 || player.hp >= st.maxHp) return;
  var heal = Math.round(st.maxHp * 0.5);
  player.hp = Math.min(st.maxHp, player.hp + heal);
  player.cooldowns[6] = 4.0;
  addFloatingText(player.x, player.y - 38, '+' + heal + ' HP', '#f87171');
  updateHUD();
}

function useSpMpPotion() {
  var st = computeFullStats(player);
  if (player.cooldowns[7] > 0) return;
  player.mp = Math.min(st.maxMp, player.mp + Math.round(st.maxMp * 0.5));
  player.sp = Math.min(st.maxSp, player.sp + Math.round(st.maxSp * 0.5));
  player.cooldowns[7] = 4.0;
  addFloatingText(player.x, player.y - 38, '+50% MP / SP', '#38bdf8');
  updateHUD();
}

function applyPlayerBuff(buffObj) {
  if (!Array.isArray(player.activeBuffs)) player.activeBuffs = [];
  player.activeBuffs = player.activeBuffs.filter(function(b) { return b.id !== buffObj.id; });
  player.activeBuffs.push({ id: buffObj.id, label: buffObj.label, timer: buffObj.dur });
}

function useSkill(idx) {
  var arch = ARCHETYPES[player.archKey];
  var sk = arch.skills[idx];
  var st = computeFullStats(player);
  if (!sk || player.cooldowns[idx] > 0) return;

  if (sk.res === 'sp' && player.sp < sk.cost) {
    addFloatingText(player.x, player.y - 35, 'Sem Vigor (SP)!', '#facc15');
    return;
  }
  if (sk.res === 'mp' && player.mp < sk.cost) {
    addFloatingText(player.x, player.y - 35, 'Sem Mana (MP)!', '#60a5fa');
    return;
  }

  var cdrMult = 1 - (st.totalCdr / 100);
  var finalCd = Math.max(0.45, sk.cd * cdrMult);
  player.attackAnimTimer = 0.34;

  if (sk.mult === 0 && (sk.heal || sk.buff)) {
    if (sk.res === 'sp') player.sp -= sk.cost; else player.mp -= sk.cost;
    player.cooldowns[idx] = finalCd;

    if (sk.heal) {
      var heal = Math.round(st.maxHp * sk.heal);
      player.hp = Math.min(st.maxHp, player.hp + heal);
      addFloatingText(player.x, player.y - 45, '+' + heal + ' HP', '#34d399');
    }
    if (sk.buff) {
      applyPlayerBuff(sk.buff);
      addFloatingText(player.x, player.y - 66, sk.buff.label, sk.color);
    }
    effects.push({ x: player.x, y: player.y, radius: 85, color: sk.color, vfx: 'aura', timer: 0.55, maxTimer: 0.55 });
    updateHUD();
    return;
  }

  var target = (selectedTarget && enemies.indexOf(selectedTarget) >= 0 && getDist(player, selectedTarget) <= sk.range + 45)
    ? selectedTarget
    : getNearestEnemy(player.x, player.y, sk.range + 45);

  if (!target) {
    if (!autoCombat) addFloatingText(player.x, player.y - 35, 'Alvo fora de alcance!', '#fbbf24');
    return;
  }

  selectedTarget = target;
  updateTargetHUD();
  player.facing = target.x >= player.x ? 1 : -1;
  if (sk.res === 'sp') player.sp -= sk.cost; else player.mp -= sk.cost;
  player.cooldowns[idx] = finalCd;

  if (sk.dash) {
    effects.push({ x: player.x, y: player.y, radius: 45, color: sk.color, vfx: 'aura', timer: 0.35, maxTimer: 0.35 });
    player.x = target.x - 32 * player.facing;
    player.y = target.y;
    player.targetX = player.x;
    player.targetY = player.y;
  }

  if (sk.proj) {
    projectiles.push({
      x: player.x, y: player.y - 12, tx: target.x, ty: target.y - 10,
      color: sk.color, icon: sk.icon, timer: 0.24, maxTimer: 0.24
    });
  }

  var targets = sk.aoe ? enemies.filter(function(en) { return getDist(target, en) <= 145; }) : [target];
  effects.push({
    x: target.x, y: target.y, radius: sk.aoe ? 140 : 64,
    color: sk.color, vfx: sk.vfx || 'slash', timer: 0.42, maxTimer: 0.42
  });

  targets.forEach(function(en) {
    var elemMult = getElementMultiplier(st.atkElem, en.elem);
    var isCrit = (Math.random() * 100) < st.critChance;
    var dmg = Math.round(st.primaryAtk * sk.mult * elemMult * (0.92 + Math.random() * 0.16));
    if (isCrit) dmg = Math.round(dmg * 1.65);
    en.hp -= dmg;

    if (sk.stun) {
      en.stunTimer = Math.max(en.stunTimer || 0, sk.stun);
      addFloatingText(en.x, en.y - 52 * en.scale, '💫 ATORDOADO!', '#fde047');
    }
    if (sk.dot) {
      en.dotTimer = 4.0;
      en.dotDmg = Math.max(4, Math.round(st.primaryAtk * sk.dot));
      addFloatingText(en.x, en.y - 52 * en.scale, '🩸 VENENO / SANGRAMENTO', '#fb7185');
    }

    var tag = elemMult > 1.05 ? '🔥⚡ ' : (elemMult < 0.95 ? '🛡️ ' : '');
    addFloatingText(en.x, en.y - 30 * en.scale, isCrit ? '💥 ' + tag + dmg + '!' : '-' + tag + dmg, isCrit ? '#fbbf24' : (elemMult > 1.05 ? '#34d399' : '#ffffff'));
    if (en.hp <= 0) killEnemy(en);
  });

  updateTargetHUD();
  updateHUD();
}

function killEnemy(en) {
  enemies = enemies.filter(function(e) { return e.id !== en.id; });
  if (selectedTarget && selectedTarget.id === en.id) {
    selectedTarget = null;
    updateTargetHUD();
  }

  var gainK = en.killsGain || 1;
  player.kills = (player.kills || 0) + gainK;
  player.xp += en.xp;
  player.gold += en.gold;
  addFloatingText(en.x, en.y - 45, '+' + en.xp + ' XP  +' + en.gold + ' Ouro  +' + gainK + ' Kill', '#fbbf24');

  var rankInfo = getKillRankInfo(player.kills);
  if (rankInfo && rankInfo.rankNum > (player.claimedRankIdx || 0)) {
    var bonusPtsTotal = 0;
    for (var r = (player.claimedRankIdx || 0); r < rankInfo.rankNum; r++) {
      var row = SHAIYA_KILL_RANKS[r];
      bonusPtsTotal += (row[player.mode] || row.hm);
    }
    player.claimedRankIdx = rankInfo.rankNum;
    player.freePoints += bonusPtsTotal;
    addFloatingText(player.x, player.y - 86, '🎖️ RANK ' + rankInfo.rankNum + ' (' + rankInfo.data.title + ') +' + bonusPtsTotal + ' Pts!', '#38bdf8');
    playSuccessChime();
  }

  var dropChance = en.tier === 'boss' ? 0.95 : (en.tier === 'miniboss' ? 0.72 : 0.44);
  if (player.bag.length < 120 && Math.random() < dropChance) {
    var item = generateDropItem(player.level, en.tier);
    player.bag.push(item);
    addFloatingText(en.x, en.y - 70, '🎁 ' + item.name + '!', RARITIES[item.rarity].color);
  }

  var lapisChance = en.tier === 'boss' ? 0.90 : (en.tier === 'miniboss' ? 0.58 : 0.30);
  if (player.bag.length < 120 && Math.random() < lapisChance) {
    var lap = generateRandomLapisItem(en.tier);
    player.bag.push(lap);
    var lMeta = LAPIS_CATALOG[lap.lapisKey];
    addFloatingText(en.x, en.y - 94, '💎 ' + lap.name + '!', lMeta ? lMeta.color : '#38bdf8');
  }

  if ((en.tier === 'boss' || en.tier === 'miniboss') && Math.random() < 0.65) {
    var isAtk = Math.random() > 0.5;
    addBagItem(player.bag, {
      id: 'lap_drop_' + Math.random().toString(36).slice(2, 8),
      stackKey: isAtk ? 'lapisia_atk' : 'lapisia_def',
      name: isAtk ? 'Lapisia de Ataque' : 'Lapisia de Defesa',
      icon: isAtk ? '⚔️' : '🛡️',
      slot: 'consumable', rarity: 'heroico', qty: 1, sellPrice: 90,
      desc: isAtk ? 'Encanta Armas e Acessórios.' : 'Encanta Armaduras e Escudos.'
    });
    addFloatingText(en.x, en.y - 116, '✨ +1 Lapisia!', '#c084fc');
  }

  while (player.xp >= player.maxXp) {
    var arch = ARCHETYPES[player.archKey];
    var mInfo = MODES[player.mode] || MODES.hm;
    player.xp -= player.maxXp;
    player.level += 1;
    player.maxXp = Math.round(player.maxXp * 1.35);

    player.stats[arch.autoStat] += 1;
    player.freePoints += mInfo.ptsPerLvl;

    var st = computeFullStats(player);
    player.hp = st.maxHp;
    player.mp = st.maxMp;
    player.sp = st.maxSp;
    addFloatingText(player.x, player.y - 68, '🎉 NÍVEL ' + player.level + '! (+' + mInfo.ptsPerLvl + ' Pts)', '#fbbf24');
  }

  saveSlots();
  setTimeout(function() { if (gameRunning) spawnEnemy(); }, 2400);
}

function handlePlayerDeath() {
  var st = computeFullStats(player);
  player.activeDebuffs = [];
  player.deaths = (player.deaths || 0) + 1;

  if (player.mode === 'um') {
    var runeIdx = -1;
    for (var i = 0; i < player.bag.length; i++) {
      if (player.bag[i].stackKey === 'rune_res' || player.bag[i].name === 'Runa de Ressurreição') { runeIdx = i; break; }
    }
    if (runeIdx >= 0) {
      if ((player.bag[runeIdx].qty || 1) > 1) player.bag[runeIdx].qty -= 1;
      else player.bag.splice(runeIdx, 1);
      player.hp = st.maxHp;
      player.x = WORLD_W / 2; player.y = WORLD_H / 2;
      player.targetX = player.x; player.targetY = player.y;
      addFloatingText(player.x, player.y - 55, '🔮 Runa de Ressurreição Usada! (Derrotas: ' + player.deaths + ')', '#c084fc');
      saveSlots();
      updateHUD();
      return;
    } else {
      alert('💀 VOCÊ MORREU NO MODO EXTREMO (UM) SEM RUNA DE RESSURREIÇÃO!\nSeu personagem "' + player.name + '" foi deletado permanentemente.');
      characterSlots[activeSlotIndex] = null;
      activeSlotIndex = -1;
      player = null;
      saveSlots();
      returnToCharSelect();
      return;
    }
  }

  player.hp = st.maxHp;
  player.x = WORLD_W / 2; player.y = WORLD_H / 2;
  player.targetX = player.x; player.targetY = player.y;
  addFloatingText(player.x, player.y - 45, '💀 +1 Derrota (Total: ' + player.deaths + ') • Ressuscitado', '#f43f5e');
  saveSlots();
  updateHUD();
}

function addFloatingText(x, y, text, color) {
  floatingTexts.push({ x: x, y: y, text: text, color: color, timer: 1.35 });
}

// ================= LOOP 2.5D, SKILLS DE BOSSES & DEBUFFS =================
function enterWorld() {
  document.getElementById('char-screen').style.display = 'none';
  document.getElementById('hud-top-left').style.display = 'flex';
  document.getElementById('hud-target-box').style.display = 'none';
  document.getElementById('hud-top-right').style.display = 'flex';
  document.getElementById('controls-hint').style.display = 'block';
  document.getElementById('hud-bottom').style.display = 'flex';

  buildWorldProps();
  buildSkillDock();
  enemies = [];
  hazardZones = [];
  for (var i = 0; i < 14; i++) spawnEnemy();
  spawnEnemy(7);  // Golem de Obsidiana (Mini-Boss)
  spawnEnemy(9);  // Dios Exiel (BOSS)
  spawnEnemy(10); // Kimuraku Infernal (BOSS)
  spawnEnemy(11); // Astaroth (BOSS)

  updateHUD();
  gameRunning = true;
  if (!loopStarted) {
    loopStarted = true;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function gameLoop(now) {
  var dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  worldAnimTime += dt;
  if (gameRunning && player) {
    updateWorld(dt);
    renderWorld();
    renderMinimap();
  }
  requestAnimationFrame(gameLoop);
}

function updateWorld(dt) {
  var st = computeFullStats(player);
  player.hp = Math.min(st.maxHp, player.hp + st.maxHp * 0.015 * dt);
  player.mp = Math.min(st.maxMp, player.mp + st.maxMp * 0.04 * dt);
  player.sp = Math.min(st.maxSp, player.sp + st.maxSp * 0.05 * dt);

  if (Array.isArray(player.activeBuffs) && player.activeBuffs.length > 0) {
    player.activeBuffs.forEach(function(b) { b.timer -= dt; });
    player.activeBuffs = player.activeBuffs.filter(function(b) { return b.timer > 0; });
  }

  if (Array.isArray(player.activeDebuffs) && player.activeDebuffs.length > 0) {
    player.activeDebuffs.forEach(function(db) {
      db.timer -= dt;
      if (db.dotDmg > 0) {
        db.tickTimer -= dt;
        if (db.tickTimer <= 0) {
          db.tickTimer = 1.0;
          var actualDot = Math.max(1, db.dotDmg - Math.floor(st.totalAbs * 0.15));
          player.hp -= actualDot;
          addFloatingText(player.x, player.y - 32, '-' + actualDot + ' ' + (db.id === 'bleed' ? '🩸' : '🧪'), '#fb7185');
          if (player.hp <= 0) handlePlayerDeath();
        }
      }
    });
    player.activeDebuffs = player.activeDebuffs.filter(function(db) { return db.timer > 0; });
  }

  for (var i = 0; i < player.cooldowns.length; i++) {
    if (player.cooldowns[i] > 0) {
      player.cooldowns[i] = Math.max(0, player.cooldowns[i] - dt);
      var cdEl = document.getElementById('sk-cd-' + i);
      if (cdEl) {
        cdEl.style.display = player.cooldowns[i] > 0 ? 'flex' : 'none';
        if (player.cooldowns[i] > 0) cdEl.textContent = player.cooldowns[i].toFixed(1);
      }
    }
  }

  if (player.attackAnimTimer > 0) player.attackAnimTimer = Math.max(0, player.attackAnimTimer - dt);

  var curSpeed = st.finalMoveSpeed;
  var mx = 0, my = 0;
  if (keysPressed['w'] || keysPressed['arrowup']) my -= 1;
  if (keysPressed['s'] || keysPressed['arrowdown']) my += 1;
  if (keysPressed['a'] || keysPressed['arrowleft']) mx -= 1;
  if (keysPressed['d'] || keysPressed['arrowright']) mx += 1;

  var moving = false;
  if (curSpeed > 0 && (mx !== 0 || my !== 0)) {
    var len = Math.hypot(mx, my);
    player.x += (mx / len) * curSpeed * dt;
    player.y += (my / len) * curSpeed * dt;
    player.targetX = player.x; player.targetY = player.y;
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
    moving = true;
  } else {
    if (autoCombat) {
      if (player.hp < st.maxHp * 0.45) useHpPotion();
      var arch = ARCHETYPES[player.archKey];
      if (arch.resourceType === 'sp' && player.sp < st.maxSp * 0.25) useSpMpPotion();
      if (arch.resourceType === 'mp' && player.mp < st.maxMp * 0.25) useSpMpPotion();

      var near = getNearestEnemy(player.x, player.y);
      if (near) {
        selectedTarget = near;
        updateTargetHUD();
        var d = getDist(player, near);
        if (d > arch.range * 0.85) {
          player.targetX = near.x; player.targetY = near.y;
        } else {
          player.targetX = player.x; player.targetY = player.y;
          for (var s = 5; s >= 0; s--) {
            var sk = arch.skills[s];
            var hasRes = sk.res === 'sp' ? player.sp >= sk.cost : player.mp >= sk.cost;
            if (player.cooldowns[s] <= 0 && hasRes) { useSkill(s); break; }
          }
        }
      }
    }
    var dx = player.targetX - player.x, dy = player.targetY - player.y, d2 = Math.hypot(dx, dy);
    if (curSpeed > 0 && d2 > 5) {
      player.x += (dx / d2) * curSpeed * dt;
      player.y += (dy / d2) * curSpeed * dt;
      if (Math.abs(dx) > 2) player.facing = dx > 0 ? 1 : -1;
      moving = true;
    }
  }

  player.walkCycle = moving ? (player.walkCycle || 0) + dt * 14 : 0;
  player.x = Math.max(70, Math.min(WORLD_W - 70, player.x));
  player.y = Math.max(70, Math.min(WORLD_H - 70, player.y));

  for (var h = hazardZones.length - 1; h >= 0; h--) {
    var hz = hazardZones[h];
    hz.timer -= dt;
    if (hz.timer <= 0) {
      effects.push({ x: hz.x, y: hz.y, radius: hz.radius, color: hz.color, vfx: 'nova', timer: 0.5, maxTimer: 0.5 });
      if (getDist(player, hz) <= hz.radius) {
        var eMult = getElementMultiplier(hz.elem, st.defElem);
        var rawDmg = Math.max(10, Math.round((hz.dmg - st.magDef * 0.35 - st.totalAbs) * eMult));
        player.hp -= rawDmg;
        addFloatingText(player.x, player.y - 42, '💥 ' + hz.skillName + ': -' + rawDmg, hz.color);
        if (hz.debuff) applyPlayerDebuff(hz.debuff);
        if (player.hp <= 0) handlePlayerDeath();
      }
      hazardZones.splice(h, 1);
    }
  }

  enemies.slice().forEach(function(en) {
    if (en.dotTimer > 0) {
      en.dotTimer -= dt;
      if (Math.floor((en.dotTimer + dt)) !== Math.floor(en.dotTimer)) {
        en.hp -= (en.dotDmg || 5);
        addFloatingText(en.x, en.y - 25 * en.scale, '-' + (en.dotDmg || 5) + ' 🩸', '#fb7185');
        if (en.hp <= 0) { killEnemy(en); return; }
      }
    }
    if (en.stunTimer > 0) {
      en.stunTimer -= dt;
      return;
    }

    var d = getDist(player, en);

    if (en.bossSkillType && d < 360) {
      if (en.castTimer > 0) {
        en.castTimer -= dt;
        if (en.castTimer <= 0) en.castLabel = '';
      } else {
        en.bossSkillCd -= dt;
        if (en.bossSkillCd <= 0) {
          en.bossSkillCd = en.tier === 'boss' ? 6.5 : 7.5;
          if (en.bossSkillType === 'meteor') {
            en.castTimer = 1.4;
            en.castLabel = '☄️ Conjurando Chuva de Meteoros!';
            addFloatingText(en.x, en.y - 60, '☄️ CHUVA DE METEOROS!', '#fb7185');
            hazardZones.push({
              x: player.x, y: player.y, radius: 115, timer: 1.4, maxTimer: 1.4,
              color: '#fb7185', elem: 'fire', dmg: Math.round(en.atk * 2.1),
              skillName: 'Meteoro de Astaroth',
              debuff: { id: 'bleed', label: '🔥 Queimadura Infernal', dur: 4.0, dotDmg: 8 }
            });
          } else if (en.bossSkillType === 'frost') {
            en.castTimer = 1.3;
            en.castLabel = '❄️ Conjurando Prisão Glacial!';
            addFloatingText(en.x, en.y - 60, '❄️ PRISÃO GLACIAL!', '#38bdf8');
            hazardZones.push({
              x: player.x, y: player.y, radius: 110, timer: 1.3, maxTimer: 1.3,
              color: '#38bdf8', elem: 'water', dmg: Math.round(en.atk * 1.9),
              skillName: 'Tsunami de Dios Exiel',
              debuff: { id: 'freeze', label: '🧊 Congelado', dur: 2.0 }
            });
          } else if (en.bossSkillType === 'quake') {
            en.castTimer = 1.2;
            en.castLabel = '🌋 Impacto Sísmico!';
            addFloatingText(en.x, en.y - 55, '🌋 IMPACTO SÍSMICO!', '#fbbf24');
            hazardZones.push({
              x: en.x, y: en.y, radius: 145, timer: 1.2, maxTimer: 1.2,
              color: '#fbbf24', elem: 'earth', dmg: Math.round(en.atk * 1.8),
              skillName: 'Impacto Sísmico',
              debuff: { id: 'curse_def', label: '🪨 Armadura Quebrada (-35% DEF)', dur: 5.0 }
            });
          }
        }
      }
    }

    if (d < 320 && d > 62) {
      en.x += ((player.x - en.x) / d) * 85 * dt;
      en.y += ((player.y - en.y) / d) * 85 * dt;
    } else if (d <= 68) {
      en.atkTimer += dt;
      if (en.atkTimer >= 1.65) {
        en.atkTimer = 0;
        if ((Math.random() * 100) < st.evaChance) {
          addFloatingText(player.x, player.y - 38, '💨 ESQUIVA!', '#38bdf8');
        } else {
          var eMult = getElementMultiplier(en.elem, st.defElem);
          var raw = (en.atk - st.physDef * 0.45) * eMult - st.totalAbs;
          var dmg = Math.max(1, Math.round(raw));
          player.hp -= dmg;
          addFloatingText(player.x, player.y - 35, '-' + dmg, '#fb7185');

          if (en.debuff && Math.random() < en.debuff.chance) {
            applyPlayerDebuff(en.debuff);
          }

          if (player.hp <= 0) handlePlayerDeath();
        }
      }
    }
  });

  projectiles.forEach(function(p) { p.timer -= dt; });
  projectiles = projectiles.filter(function(p) { return p.timer > 0; });
  effects.forEach(function(ef) { ef.timer -= dt; });
  effects = effects.filter(function(ef) { return ef.timer > 0; });
  floatingTexts.forEach(function(ft) { ft.y -= 34 * dt; ft.timer -= dt; });
  floatingTexts = floatingTexts.filter(function(ft) { return ft.timer > 0; });
  if (clickMarker) { clickMarker.timer -= dt; if (clickMarker.timer <= 0) clickMarker = null; }

  updateHUD();
  updateTargetHUD();
}

function renderWorld() {
  var camX = player.x - canvas.width / 2;
  var camY = player.y - canvas.height / 2;

  if (!fallbackGrassPattern && grassPatternCanvas) {
    fallbackGrassPattern = ctx.createPattern(grassPatternCanvas, 'repeat');
  }

  ctx.save();
  ctx.translate(-camX, -camY);
  if (WORLD_TEXTURES.grama.loaded && WORLD_TEXTURES.grama.pattern) {
    ctx.fillStyle = WORLD_TEXTURES.grama.pattern;
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(6, 15, 12, 0.22)';
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = fallbackGrassPattern || '#0e281e';
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
  }
  ctx.restore();

  ctx.save();
  ctx.lineCap = 'round';
  if (WORLD_TEXTURES.estrada.loaded && WORLD_TEXTURES.estrada.pattern) {
    ctx.translate(-camX, -camY);
    ctx.strokeStyle = WORLD_TEXTURES.estrada.pattern;
    ctx.lineWidth = 86;
    ctx.beginPath();
    ctx.moveTo(220, 1650);
    ctx.quadraticCurveTo(950, 1480, 1400, 1400);
    ctx.quadraticCurveTo(1950, 1300, 2550, 1520);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 80;
    ctx.beginPath();
    ctx.moveTo(220 - camX, 1650 - camY);
    ctx.quadraticCurveTo(950 - camX, 1480 - camY, 1400 - camX, 1400 - camY);
    ctx.quadraticCurveTo(1950 - camX, 1300 - camY, 2550 - camX, 1520 - camY);
    ctx.stroke();
  }
  ctx.restore();

  var cx = WORLD_W / 2 - camX, cy = WORLD_H / 2 - camY;
  ctx.save();
  ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';
  ctx.beginPath(); ctx.arc(cx, cy, 200, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = player.faction === 'fury' ? 'rgba(244, 63, 94, 0.45)' : 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  var lx = 760 - camX, ly = 2080 - camY;
  ctx.save();
  if (WORLD_TEXTURES.agua.loaded && WORLD_TEXTURES.agua.pattern) {
    ctx.translate(-camX, -camY);
    ctx.fillStyle = WORLD_TEXTURES.agua.pattern;
    ctx.beginPath(); ctx.ellipse(760, 2080, 295, 195, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.ellipse(lx, ly, 295, 195, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  hazardZones.forEach(function(hz) {
    var hx = hz.x - camX, hy = hz.y - camY;
    var prog = 1 - (hz.timer / hz.maxTimer);
    ctx.save();
    ctx.fillStyle = hz.color + '28';
    ctx.strokeStyle = hz.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(hx, hy, hz.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hz.color + '44';
    ctx.beginPath(); ctx.arc(hx, hy, hz.radius * prog, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  if (clickMarker) {
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(clickMarker.x - camX, clickMarker.y - camY, 18, 9, 0, 0, Math.PI * 2); ctx.stroke();
  }

  var queue = [];
  worldProps.forEach(function(pr) { queue.push({ kind: 'prop', y: pr.y, data: pr }); });
  enemies.forEach(function(en) { queue.push({ kind: 'enemy', y: en.y, data: en }); });
  queue.push({ kind: 'player', y: player.y, data: player });
  queue.sort(function(a, b) { return a.y - b.y; });

  queue.forEach(function(item) {
    if (item.kind === 'prop') drawProp(item.data, camX, camY);
    else if (item.kind === 'enemy') drawEnemy(item.data, camX, camY);
    else drawPlayer(camX, camY);
  });

  projectiles.forEach(function(p) {
    var prog = 1 - (p.timer / p.maxTimer);
    var px = p.x + (p.tx - p.x) * prog - camX;
    var py = p.y + (p.ty - p.y) * prog - camY;
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  effects.forEach(function(ef) {
    var sx = ef.x - camX, sy = ef.y - camY;
    var prog = 1 - (ef.timer / (ef.maxTimer || 0.4));
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - prog * 0.85);
    ctx.strokeStyle = ef.color;
    ctx.fillStyle = ef.color + '33';

    if (ef.vfx === 'whirl') {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(sx, sy, ef.radius * (0.5 + prog * 0.6), ef.radius * 0.65 * (0.5 + prog * 0.6), prog * 6, 0, Math.PI * 1.65);
      ctx.stroke();
    } else if (ef.vfx === 'nova') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(sx, sy, ef.radius * (0.3 + prog * 0.9), ef.radius * 0.65 * (0.3 + prog * 0.9), 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (ef.vfx === 'aura') {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 10 - prog * 35, 36, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sx, sy - 10, ef.radius * (0.6 + prog * 0.4), -0.8 + prog, 1.4 + prog);
      ctx.stroke();
    }
    ctx.restore();
  });

  floatingTexts.forEach(function(ft) {
    ctx.font = 'bold 14px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText(ft.text, ft.x - camX + 1, ft.y - camY + 1);
    ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
  });
}

function drawProp(pr, camX, camY) {
  var sx = pr.x - camX, sy = pr.y - camY, s = pr.scale || 1;
  if (sx < -150 || sy < -150 || sx > canvas.width + 150 || sy > canvas.height + 150) return;
  ctx.save();
  if (pr.type === 'pine' || pr.type === 'oak') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(sx + 8 * s, sy + 12 * s, 40 * s, 16 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#451a03'; ctx.fillRect(sx - 7 * s, sy - 28 * s, 14 * s, 32 * s);
    ctx.fillStyle = pr.type === 'pine' ? '#047857' : '#15803d';
    ctx.beginPath(); ctx.arc(sx, sy - 54 * s, 40 * s, 0, Math.PI * 2); ctx.fill();
  } else if (pr.type === 'rock') {
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.ellipse(sx, sy - 8 * s, 28 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
  } else if (pr.type === 'crystal') {
    ctx.fillStyle = pr.col || '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(sx, sy - 54 * s); ctx.lineTo(sx - 16 * s, sy - 18 * s);
    ctx.lineTo(sx, sy + 4 * s); ctx.lineTo(sx + 16 * s, sy - 18 * s);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(camX, camY) {
  var px = player.x - camX, py = player.y - camY;
  var arch = ARCHETYPES[player.archKey];
  var bob = Math.sin(player.walkCycle || 0) * 3;
  var facColor = player.faction === 'fury' ? '#f43f5e' : '#38bdf8';
  var wPlus = (player.equipped.weapon && player.equipped.weapon.plus) || 0;
  var rankInfo = getKillRankInfo(player.kills || 0);
  var mount = player.equipped.mount;

  ctx.save();
  ctx.translate(px, py);

  if (mount) {
    ctx.fillStyle = (mount.mountColor || '#fbbf24') + '44';
    ctx.strokeStyle = mount.mountColor || '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 12, 32, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = '22px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(mount.icon, 0, 14 + bob * 0.6);
  }

  var liftY = mount ? -14 : 0;

  if (wPlus >= 10) {
    ctx.strokeStyle = wPlus >= 15 ? 'rgba(251, 191, 36, 0.7)' : 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 14, 29, 13, 0, 0, Math.PI * 2); ctx.stroke();
  }

  if (!mount) {
    ctx.fillStyle = facColor + '28';
    ctx.beginPath(); ctx.ellipse(0, 14, 23, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = facColor; ctx.lineWidth = 1.8; ctx.stroke();
  }

  ctx.fillStyle = arch.armorColor;
  ctx.beginPath(); ctx.roundRect(-12, -16 + liftY + bob * 0.5, 24, 24, 6); ctx.fill();
  ctx.strokeStyle = arch.trimColor; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(0, -25 + liftY + bob * 0.5, 10, 0, Math.PI * 2); ctx.fill();

  ctx.font = 'bold 12px Segoe UI';
  var plusTag = wPlus > 0 ? ' [' + wPlus + ']' : '';
  var nameStr = '[Nv.' + player.level + '] ' + player.name + plusTag;
  var nameW = ctx.measureText(nameStr).width;
  var textY = -44 + liftY;

  if (rankInfo) {
    var pillW = 18;
    var totalW = pillW + 5 + nameW;
    var startX = -totalW / 2;
    drawShaiyaRankBadgeOnCanvas(ctx, rankInfo, startX + pillW, textY - 4);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000'; ctx.fillText(nameStr, startX + pillW + 6, textY + 1);
    ctx.fillStyle = '#fff'; ctx.fillText(nameStr, startX + pillW + 5, textY);
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText(nameStr, 1, textY + 1);
    ctx.fillStyle = '#fff'; ctx.fillText(nameStr, 0, textY);
  }
  ctx.restore();
}

function drawEnemy(en, camX, camY) {
  var ex = en.x - camX, ey = en.y - camY, s = en.scale || 1;
  if (ex < -140 || ey < -140 || ex > canvas.width + 140 || ey > canvas.height + 140) return;
  var elMeta = ELEMENTS[en.elem] || ELEMENTS.none;

  ctx.save();
  ctx.translate(ex, ey);

  if (selectedTarget && selectedTarget.id === en.id) {
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 11 * s, 26 * s, 12 * s, 0, 0, Math.PI * 2); ctx.stroke();
  }

  if (en.elem && en.elem !== 'none') {
    var pulse = 1 + Math.sin(worldAnimTime * 5 + en.id * 10) * 0.12;
    ctx.strokeStyle = elMeta.color + '88';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -10 * s, 22 * s * pulse, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.fillStyle = elMeta.color;
  ctx.beginPath(); ctx.arc(0, -10 * s, 18 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();

  ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center';
  var mobTitle = elMeta.icon + ' Nv.' + en.level + ' ' + en.name;
  ctx.fillStyle = '#000'; ctx.fillText(mobTitle, 1, -24 * s - 12);
  ctx.fillStyle = '#fff'; ctx.fillText(mobTitle, 0, -24 * s - 13);

  var barW = 54 * Math.min(1.4, s);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(-barW / 2, -24 * s - 7, barW, 5);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(-barW / 2, -24 * s - 7, barW * Math.max(0, en.hp / en.maxHp), 5);
  ctx.restore();
}

function renderMinimap() {
  if (!mCtx || !minimapCanvas) return;
  var w = minimapCanvas.width, h = minimapCanvas.height;
  var sx = w / WORLD_W, sy = h / WORLD_H;

  mCtx.fillStyle = '#0c241d'; mCtx.fillRect(0, 0, w, h);
  mCtx.fillStyle = '#0284c7';
  mCtx.beginPath(); mCtx.ellipse(760 * sx, 2080 * sy, 310 * sx, 210 * sy, 0, 0, Math.PI * 2); mCtx.fill();

  enemies.forEach(function(en) {
    mCtx.fillStyle = en.tier === 'boss' ? '#f97316' : (en.tier === 'miniboss' ? '#fbbf24' : '#f43f5e');
    mCtx.beginPath(); mCtx.arc(en.x * sx, en.y * sy, en.tier === 'normal' ? 2 : 3.5, 0, Math.PI * 2); mCtx.fill();
  });

  mCtx.fillStyle = '#ffffff';
  mCtx.beginPath(); mCtx.arc(player.x * sx, player.y * sy, 3.2, 0, Math.PI * 2); mCtx.fill();
}

// ================= HUD & BARRA DE 6 SKILLS =================
function updateHUD() {
  var arch = ARCHETYPES[player.archKey];
  var mInfo = MODES[player.mode] || MODES.hm;
  var st = computeFullStats(player);
  var rankBadge = renderKillRankBadgeHTML(player.kills || 0);
  var rInfo = getKillRankInfo(player.kills || 0);

  document.getElementById('hud-portrait').childNodes[0].textContent = arch.icon;
  document.getElementById('hud-lvl').textContent = 'Nv.' + player.level;
  document.getElementById('hud-name').textContent = player.name;
  document.getElementById('hud-kill-emblem').innerHTML = rankBadge;

  var badge = document.getElementById('hud-mode-badge');
  badge.textContent = mInfo.short;
  badge.style.background = mInfo.badgeBg;
  badge.style.color = mInfo.color;

  document.getElementById('bar-hp').style.width = Math.min(100, (player.hp / st.maxHp) * 100) + '%';
  document.getElementById('txt-hp').textContent = 'HP ' + Math.ceil(player.hp) + ' / ' + st.maxHp;
  document.getElementById('bar-mp').style.width = Math.min(100, (player.mp / st.maxMp) * 100) + '%';
  document.getElementById('txt-mp').textContent = 'MP ' + Math.ceil(player.mp) + ' / ' + st.maxMp;
  document.getElementById('bar-sp').style.width = Math.min(100, (player.sp / st.maxSp) * 100) + '%';
  document.getElementById('txt-sp').textContent = 'SP ' + Math.ceil(player.sp) + ' / ' + st.maxSp;

  var buffsEl = document.getElementById('hud-buffs-row');
  var chips = [];
  if (Array.isArray(player.activeBuffs)) {
    player.activeBuffs.forEach(function(b) {
      chips.push('<span class="buff-chip">' + b.label + ' (' + Math.ceil(b.timer) + 's)</span>');
    });
  }
  if (Array.isArray(player.activeDebuffs)) {
    player.activeDebuffs.forEach(function(db) {
      chips.push('<span class="debuff-chip">' + db.label + ' (' + Math.ceil(db.timer) + 's)</span>');
    });
  }
  buffsEl.innerHTML = chips.join('');

  document.getElementById('hud-zone').textContent = player.faction === 'fury' ? '🔥 Floresta de Iris (Nv. 1-20)' : '🌲 Floresta de Erina (Nv. 1-20)';
  document.getElementById('hud-gold').textContent = player.gold;
  document.getElementById('hud-br').textContent = st.br;
  document.getElementById('hud-kill-info').innerHTML =
    (rInfo ? rankBadge + ' Rank ' + rInfo.rankNum : 'Sem Rank') +
    ' &nbsp;|&nbsp; Kills: <b style="color:#38bdf8;">' + (player.kills || 0).toLocaleString('pt-BR') + '</b>' +
    ' &nbsp;|&nbsp; Derrotas: <b style="color:#f43f5e;">' + (player.deaths || 0).toLocaleString('pt-BR') + '</b>';

  var xpPct = Math.min(100, (player.xp / player.maxXp) * 100);
  document.getElementById('bar-xp').style.width = xpPct + '%';
  document.getElementById('txt-xp').textContent = 'XP: ' + player.xp + ' / ' + player.maxXp + ' (' + xpPct.toFixed(0) + '%)';

  var stBtn = document.getElementById('btn-hud-status');
  if (player.freePoints > 0) {
    stBtn.classList.add('stat-alert');
    stBtn.textContent = '📊 Status (+' + player.freePoints + ')';
  } else {
    stBtn.classList.remove('stat-alert');
    stBtn.textContent = '📊 Status (C)';
  }
}

function updateTargetHUD() {
  var box = document.getElementById('hud-target-box');
  if (!selectedTarget || enemies.indexOf(selectedTarget) < 0) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'flex';
  var elMeta = ELEMENTS[selectedTarget.elem] || ELEMENTS.none;
  document.getElementById('target-name').textContent = '[Nv.' + selectedTarget.level + '] ' + selectedTarget.name;
  var tag = document.getElementById('target-elem');
  tag.textContent = elMeta.label;
  tag.style.background = elMeta.bg;
  tag.style.color = elMeta.color;
  document.getElementById('target-hp-fill').style.width = Math.max(0, (selectedTarget.hp / selectedTarget.maxHp) * 100) + '%';
  document.getElementById('target-hp-txt').textContent = Math.max(0, Math.ceil(selectedTarget.hp)) + ' / ' + selectedTarget.maxHp;

  var castEl = document.getElementById('target-cast-txt');
  if (selectedTarget.castTimer > 0 && selectedTarget.castLabel) {
    castEl.style.display = 'block';
    castEl.textContent = selectedTarget.castLabel + ' (' + selectedTarget.castTimer.toFixed(1) + 's)';
  } else {
    castEl.style.display = 'none';
  }
}

function buildSkillDock() {
  var dock = document.getElementById('skill-dock');
  dock.innerHTML = '';
  var arch = ARCHETYPES[player.archKey];

  arch.skills.forEach(function(sk, idx) {
    var resColor = sk.res === 'sp' ? '#facc15' : '#60a5fa';
    var slot = document.createElement('div');
    slot.className = 'sk-slot';
    slot.style.borderColor = sk.color + '88';
    slot.title = sk.name + ' (' + sk.cost + ' ' + sk.res.toUpperCase() + ')';
    slot.innerHTML =
      '<span class="sk-key">' + (idx + 1) + '</span>' +
      '<span class="sk-ico">' + sk.icon + '</span>' +
      '<span class="sk-cost-dot" style="color:' + resColor + '">' + sk.cost + '</span>' +
      '<div class="sk-cd" id="sk-cd-' + idx + '"></div>';
    slot.onclick = function() { useSkill(idx); };
    dock.appendChild(slot);
  });

  var potHp = document.createElement('div');
  potHp.className = 'sk-slot';
  potHp.title = 'Poção de Vida (50% HP)';
  potHp.innerHTML = '<span class="sk-key">7</span><span class="sk-ico">🧪</span><div class="sk-cd" id="sk-cd-6"></div>';
  potHp.onclick = useHpPotion;
  dock.appendChild(potHp);

  var potRes = document.createElement('div');
  potRes.className = 'sk-slot';
  potRes.title = 'Elixir de Energia (50% MP e SP)';
  potRes.innerHTML = '<span class="sk-key">8</span><span class="sk-ico">⚗️</span><div class="sk-cd" id="sk-cd-7"></div>';
  potRes.onclick = useSpMpPotion;
  dock.appendChild(potRes);

  var autoBtn = document.createElement('button');
  autoBtn.type = 'button';
  autoBtn.className = 'btn-auto-ep';
  autoBtn.id = 'btn-auto-ep';
  autoBtn.innerHTML = '🤖<br>AUTO';
  autoBtn.onclick = toggleAuto;
  dock.appendChild(autoBtn);
}

function toggleAuto() {
  autoCombat = !autoCombat;
  var btn = document.getElementById('btn-auto-ep');
  btn.classList.toggle('active', autoCombat);
  addFloatingText(player.x, player.y - 38, autoCombat ? 'AUTO ATIVADO' : 'AUTO DESLIGADO', autoCombat ? '#34d399' : '#fb7185');
}

// ================= JANELAS FLUTUANTES =================
function toggleWindow(winId) {
  var el = document.getElementById(winId);
  var isOpen = el.style.display === 'flex';
  closeAllWindows();
  if (!isOpen) {
    el.style.display = 'flex';
    if (winId === 'shop-modal') renderShopWindow();
    if (winId === 'status-modal') renderStatusWindow();
    if (winId === 'bag-modal') renderInventoryWindow();
    if (winId === 'smith-modal') renderSmithWindow();
  }
}

function closeAllWindows() {
  document.querySelectorAll('.ep-window').forEach(function(w) { w.style.display = 'none'; });
}

function renderStatusWindow() {
  var mInfo = MODES[player.mode] || MODES.hm;
  var st = computeFullStats(player);
  var rankBadge = renderKillRankBadgeHTML(player.kills || 0);
  var rInfo = getKillRankInfo(player.kills || 0);

  document.getElementById('st-hero-title').innerHTML = rankBadge + ' ' + player.name + ' (Nv. ' + player.level + ')';
  document.getElementById('st-hero-sub').textContent =
    getArchetypeDisplayName(player.archKey, player.faction) + ' • ' + mInfo.label +
    ' • ' + (rInfo ? 'Rank ' + rInfo.rankNum : 'Sem Rank') +
    ' (Kills: ' + (player.kills || 0).toLocaleString('pt-BR') + ' | Derrotas: ' + (player.deaths || 0).toLocaleString('pt-BR') + ')';
  document.getElementById('st-free-pts').textContent = player.freePoints;

  var attrs = [
    { key: 'str', label: 'FOR', desc: 'ATQ Físico', total: st.totalStr, base: player.stats.str, color: '#f87171' },
    { key: 'dex', label: 'DES', desc: 'SP & Esquiva', total: st.totalDex, base: player.stats.dex, color: '#34d399' },
    { key: 'rec', label: 'REC', desc: 'HP & DEF Fís.', total: st.totalRec, base: player.stats.rec, color: '#fbbf24' },
    { key: 'int', label: 'INT', desc: 'ATQ Mágico', total: st.totalInt, base: player.stats.int, color: '#38bdf8' },
    { key: 'wis', label: 'SAB', desc: 'MP & DEF Mág.', total: st.totalWis, base: player.stats.wis, color: '#c084fc' },
    { key: 'luc', label: 'SOR', desc: 'Crítico', total: st.totalLuc, base: player.stats.luc, color: '#f472b6' }
  ];

  var list = document.getElementById('attr-alloc-list');
  list.innerHTML = '';
  attrs.forEach(function(a) {
    var eqDiff = a.total - a.base;
    var bonusTxt = eqDiff > 0 ? ' <span class="attr-bonus">(+' + eqDiff + ')</span>' : '';
    var row = document.createElement('div');
    row.className = 'attr-row';
    row.innerHTML =
      '<div><span class="attr-name" style="color:' + a.color + '">' + a.label + '</span> <span style="font-size:0.7rem; color:#94a3b8;">' + a.desc + '</span></div>' +
      '<div style="display:flex; align-items:center; gap:8px;">' +
        '<span class="attr-val">' + a.total + bonusTxt + '</span>' +
        '<button type="button" class="btn-plus-stat" ' + (player.freePoints > 0 ? '' : 'disabled') + ' onclick="allocateStat(\'' + a.key + '\')">+</button>' +
      '</div>';
    list.appendChild(row);
  });

  var atkElMeta = ELEMENTS[st.atkElem] || ELEMENTS.none;
  var defElMeta = ELEMENTS[st.defElem] || ELEMENTS.none;

  document.getElementById('derived-stats-list').innerHTML =
    '<div class="derived-row"><span>❤️ Vida Máx (HP):</span><b>' + st.maxHp + '</b></div>' +
    '<div class="derived-row"><span>💧 Mana Máx (MP):</span><b>' + st.maxMp + '</b></div>' +
    '<div class="derived-row"><span>⚡ Vigor Máx (SP):</span><b>' + st.maxSp + '</b></div>' +
    '<div class="derived-row"><span>⚔️ ATQ Físico:</span><b style="color:#f87171;">' + st.physAtk + '</b></div>' +
    '<div class="derived-row"><span>🔮 ATQ Mágico:</span><b style="color:#38bdf8;">' + st.magAtk + '</b></div>' +
    '<div class="derived-row"><span>🛡️ DEF Física / Mágica:</span><b>' + st.physDef + ' / ' + st.magDef + '</b></div>' +
    '<div class="derived-row"><span>🔰 Absorção (Lapis ABS):</span><b style="color:#fbbf24;">-' + st.totalAbs + ' Dano</b></div>' +
    '<div class="derived-row"><span>⚡ Vel. Ataque (Sônico):</span><b style="color:#f43f5e;">-' + st.totalCdr + '% Recarga</b></div>' +
    '<div class="derived-row"><span>🐎 Vel. Movimento (Veloz):</span><b style="color:#38bdf8;">' + st.finalMoveSpeed + '</b></div>' +
    '<div class="derived-row"><span>💥 Crítico / 💨 Esquiva:</span><b style="color:#34d399;">' + st.critChance + '% / ' + st.evaChance + '%</b></div>' +
    '<div class="derived-row"><span>🔥 Elem. Arma / Armad.:</span><b style="color:' + atkElMeta.color + ';">' + atkElMeta.short + ' / ' + defElMeta.short + '</b></div>';
}

function allocateStat(statKey) {
  if (player.freePoints <= 0) return;
  player.freePoints -= 1;
  player.stats[statKey] += 1;
  player.allocated[statKey] = (player.allocated[statKey] || 0) + 1;
  saveSlots();
  updateHUD();
  renderStatusWindow();
}

function resetStatPoints() {
  var totalRefund = 0;
  Object.keys(player.allocated).forEach(function(k) {
    var spent = player.allocated[k] || 0;
    player.stats[k] -= spent;
    totalRefund += spent;
    player.allocated[k] = 0;
  });
  if (totalRefund > 0) {
    player.freePoints += totalRefund;
    saveSlots();
    updateHUD();
    renderStatusWindow();
  }
}

// ================= INVENTÁRIO COM RESTRIÇÃO DE ARMAS POR CLASSE & MONTARIA =================
function switchBagPage(page) {
  currentBagPage = page;
  for (var i = 0; i < 5; i++) document.getElementById('btab-' + i).classList.toggle('active', i === page);
  renderBagCells();
}

function renderInventoryWindow() {
  var arch = ARCHETYPES[player.archKey];
  var st = computeFullStats(player);
  var atkElMeta = ELEMENTS[st.atkElem] || ELEMENTS.none;
  var defElMeta = ELEMENTS[st.defElem] || ELEMENTS.none;

  document.getElementById('bag-gold-lbl').textContent = player.gold;
  document.getElementById('pd-hero-ico').textContent = arch.icon;
  document.getElementById('pd-hero-name').textContent = player.name;
  document.getElementById('pd-hero-elem').innerHTML = '<span class="elem-tag" style="background:' + atkElMeta.bg + '; color:' + atkElMeta.color + ';">Arma: ' + atkElMeta.label + '</span>';
  document.getElementById('pd-hero-def-elem').innerHTML = '<span class="elem-tag" style="background:' + defElMeta.bg + '; color:' + defElMeta.color + ';">Armad.: ' + defElMeta.label + '</span>';
  document.getElementById('pd-hero-br').textContent = 'BR: ' + st.br;

  Object.keys(SLOT_META).forEach(function(slotKey) {
    var el = document.getElementById('pd-' + slotKey);
    if (!el) return;
    var eq = player.equipped[slotKey];
    if (eq) {
      var r = RARITIES[eq.rarity] || RARITIES.comum;
      var elIcon = (eq.element && eq.element !== 'none' && ELEMENTS[eq.element]) ? ELEMENTS[eq.element].icon : '';
      el.style.borderColor = r.color;
      el.style.background = r.color + '18';
      el.innerHTML =
        (eq.plus > 0 ? '<span class="pd-plus-tag">[' + eq.plus + ']</span>' : '') +
        (elIcon ? '<span class="pd-elem-badge">' + elIcon + '</span>' : '') +
        '<span class="pd-slot-ico">' + eq.icon + '</span>' +
        '<span class="pd-slot-lbl" style="color:' + r.color + '">' + SLOT_META[slotKey].label + '</span>';
    } else {
      el.style.borderColor = '#334155';
      el.style.background = '#121927';
      el.innerHTML = '<span class="pd-slot-ico" style="opacity:0.35;">' + SLOT_META[slotKey].icon + '</span><span class="pd-slot-lbl">' + SLOT_META[slotKey].label + '</span>';
    }
  });

  renderBagCells();
}

function renderBagCells() {
  var grid = document.getElementById('bag-cells-grid');
  grid.innerHTML = '';
  var startIdx = currentBagPage * 24;

  for (var i = 0; i < 24; i++) {
    var realIdx = startIdx + i;
    var item = player.bag[realIdx];
    var cell = document.createElement('div');
    cell.className = 'bag-cell' + (selectedBagIndex === realIdx ? ' selected-cell' : '');

    if (item) {
      var r = RARITIES[item.rarity] || RARITIES.comum;
      var eqCheck = canEquipItem(item);
      cell.style.borderColor = r.color;
      cell.style.background = r.color + '16';

      var dotsHtml = '';
      if (Array.isArray(item.sockets) && item.sockets.length > 0) {
        dotsHtml = '<div class="cell-sockets">';
        for (var s = 0; s < item.sockets.length; s++) {
          var sk = item.sockets[s];
          var dotCol = sk && LAPIS_CATALOG[sk.lapisKey] ? LAPIS_CATALOG[sk.lapisKey].color : 'transparent';
          dotsHtml += '<span class="cell-dot" style="border-color:' + r.color + '; background:' + dotCol + ';"></span>';
        }
        dotsHtml += '</div>';
      }

      var cmp = compareBagItemToEquipped(item);
      var arrowHtml = '';
      if (!eqCheck.ok && item.slot !== 'consumable' && item.slot !== 'lapis') {
        arrowHtml = '<span class="cmp-arrow cmp-down" title="' + eqCheck.reason + '">✖</span>';
      } else if (cmp > 0) {
        arrowHtml = '<span class="cmp-arrow cmp-up" title="Melhor que o equipado">▲</span>';
      } else if (cmp < 0) {
        arrowHtml = '<span class="cmp-arrow cmp-down" title="Inferior ao equipado">▼</span>';
      }

      var elemCorner = '';
      if (item.element && item.element !== 'none' && ELEMENTS[item.element]) {
        elemCorner = '<span class="cell-elem-corner">' + ELEMENTS[item.element].icon + '</span>';
      } else if (item.slot === 'lapis' && LAPIS_CATALOG[item.lapisKey] && LAPIS_CATALOG[item.lapisKey].kind === 'elem') {
        elemCorner = '<span class="cell-elem-corner">' + ELEMENTS[LAPIS_CATALOG[item.lapisKey].element].icon + '</span>';
      }

      cell.innerHTML =
        dotsHtml +
        arrowHtml +
        elemCorner +
        '<span>' + item.icon + '</span>' +
        (item.qty > 1 ? '<span class="cell-qty">x' + item.qty + '</span>' : '');
      cell.onclick = (function(idx) { return function() { inspectBagItem(idx); }; })(realIdx);
    }
    grid.appendChild(cell);
  }
}

function inspectBagItem(idx) {
  selectedBagIndex = idx;
  selectedEquippedSlot = null;
  renderBagCells();
  var item = player.bag[idx];
  if (item) renderItemTooltip(item, true);
}

function inspectEquipped(slotKey) {
  var item = player.equipped[slotKey];
  if (!item) return;
  selectedEquippedSlot = slotKey;
  selectedBagIndex = -1;
  renderBagCells();
  renderItemTooltip(item, false);
}

function renderItemTooltip(item, fromBag) {
  var box = document.getElementById('item-tooltip-box');
  var r = RARITIES[item.rarity] || RARITIES.comum;
  var elMeta = ELEMENTS[item.element || 'none'] || ELEMENTS.none;
  var check = canEquipItem(item);
  var plusTxt = item.plus > 0 ? ' [' + item.plus + ']' : '';

  var cmpBadge = '';
  if (fromBag && item.slot !== 'consumable' && item.slot !== 'lapis') {
    var cmp = compareBagItemToEquipped(item);
    if (cmp > 0) cmpBadge = '<span style="color:#10b981; font-weight:bold; font-size:0.74rem;">▲ MELHOR QUE O EQUIPADO</span>';
    else if (cmp < 0) cmpBadge = '<span style="color:#f43f5e; font-weight:bold; font-size:0.74rem;">▼ INFERIOR AO EQUIPADO</span>';
  }

  var reqClassLine = '';
  if (Array.isArray(item.reqArch) && item.reqArch.length > 0) {
    reqClassLine = '<div style="font-size:0.7rem; font-weight:bold; color:' + (check.ok ? '#34d399' : '#fb7185') + ';">Classe Requerida: ' + formatAllowedClassesLabel(item.reqArch) + (item.wType ? ' (' + item.wType + ')' : '') + '</div>';
  }

  var lines = [];
  if (item.physAtk > 0) lines.push('ATQ Físico: +' + Math.round(item.physAtk * (1 + (item.plus || 0) * 0.10)));
  if (item.magAtk > 0)  lines.push('ATQ Mágico: +' + Math.round(item.magAtk  * (1 + (item.plus || 0) * 0.10)));
  if (item.physDef > 0) lines.push('DEF Física: +' + Math.round(item.physDef * (1 + (item.plus || 0) * 0.10)));
  if (item.magDef > 0)  lines.push('DEF Mágica: +' + Math.round(item.magDef  * (1 + (item.plus || 0) * 0.10)));
  if (item.speedBonus > 0) lines.push('Velocidade Montaria: +' + item.speedBonus);
  if (item.bonusStr > 0) lines.push('FOR +' + item.bonusStr);
  if (item.bonusDex > 0) lines.push('DES +' + item.bonusDex);
  if (item.bonusRec > 0) lines.push('REC +' + item.bonusRec);
  if (item.bonusInt > 0) lines.push('INT +' + item.bonusInt);
  if (item.bonusWis > 0) lines.push('SAB +' + item.bonusWis);
  if (item.bonusLuc > 0) lines.push('SOR +' + item.bonusLuc);
  if (item.desc) lines.push(item.desc);

  if (Array.isArray(item.sockets)) {
    item.sockets.forEach(function(sk) {
      if (sk && LAPIS_CATALOG[sk.lapisKey]) lines.push('💎 ' + formatLapisEffect(sk));
    });
  }

  var isEquippable = item.slot !== 'consumable' && item.slot !== 'lapis';
  var actionsHtml = '';
  if (fromBag && isEquippable) {
    actionsHtml =
      '<div class="tooltip-actions">' +
        '<button type="button" class="btn-act btn-act-equip" ' + (check.ok ? '' : 'disabled') + ' onclick="equipSelectedBagItem()">' + (check.ok ? 'Equipar' : check.reason) + '</button>' +
        '<button type="button" class="btn-act btn-act-sell" onclick="sellSelectedBagItem()">Vender (+$' + item.sellPrice + ')</button>' +
      '</div>';
  } else if (fromBag && item.slot === 'lapis') {
    actionsHtml =
      '<div class="tooltip-actions">' +
        '<button type="button" class="btn-act btn-act-equip" style="background:#38bdf8;" onclick="toggleWindow(\'smith-modal\')">🔨 Linkar no Ferreiro</button>' +
        '<button type="button" class="btn-act btn-act-sell" onclick="sellSelectedBagItem()">Vender (+$' + item.sellPrice + ')</button>' +
      '</div>';
  } else if (!fromBag) {
    actionsHtml =
      '<div class="tooltip-actions">' +
        '<button type="button" class="btn-act btn-act-equip" onclick="unequipSelectedSlot()">Desequipar para Mochila</button>' +
      '</div>';
  }

  box.style.borderColor = r.color;
  box.innerHTML =
    '<div>' +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">' +
        '<b style="color:' + r.color + '; font-size:0.92rem;">' + item.icon + ' ' + item.name + plusTxt + '</b>' +
        (item.slot !== 'mount' && item.slot !== 'lapis' ? '<span class="elem-tag" style="background:' + elMeta.bg + '; color:' + elMeta.color + ';">' + elMeta.label + '</span>' : '') +
      '</div>' +
      reqClassLine +
      '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:#94a3b8; margin:3px 0;">' +
        '<span>Raridade: <b style="color:' + r.color + '">' + r.label + '</b>' + (Array.isArray(item.sockets) ? ' • Slots Lapis: ' + item.sockets.length : '') + '</span>' +
        cmpBadge +
      '</div>' +
      '<div style="font-size:0.75rem; color:#e2e8f0; line-height:1.42; margin-top:4px;">' + lines.join(' &nbsp;|&nbsp; ') + '</div>' +
    '</div>' +
    actionsHtml;
}

function equipSelectedBagItem() {
  if (selectedBagIndex < 0) return;
  var item = player.bag[selectedBagIndex];
  var check = canEquipItem(item);
  if (!item || !check.ok) return;

  var targetSlot = item.slot;
  if (targetSlot === 'ring1' && player.equipped.ring1 && !player.equipped.ring2) targetSlot = 'ring2';
  if (targetSlot === 'loop1' && player.equipped.loop1 && !player.equipped.loop2) targetSlot = 'loop2';

  if (targetSlot === 'weapon' && item.is2H && player.equipped.shield) {
    if (player.bag.length >= 119) return;
    player.bag.push(player.equipped.shield);
    player.equipped.shield = null;
  }
  if (targetSlot === 'shield' && player.equipped.weapon && player.equipped.weapon.is2H) {
    alert('Você está usando uma Arma de Duas Mãos! Desequipe-a antes de equipar o Escudo Torre.');
    return;
  }

  var prev = player.equipped[targetSlot];
  player.equipped[targetSlot] = item;
  player.bag.splice(selectedBagIndex, 1);
  if (prev) player.bag.push(prev);

  selectedBagIndex = -1;
  selectedEquippedSlot = targetSlot;
  saveSlots();
  updateHUD();
  renderInventoryWindow();
  renderItemTooltip(item, false);
}

function unequipSelectedSlot() {
  if (!selectedEquippedSlot) return;
  var item = player.equipped[selectedEquippedSlot];
  if (!item || player.bag.length >= 120) return;
  player.bag.push(item);
  player.equipped[selectedEquippedSlot] = null;
  selectedEquippedSlot = null;
  saveSlots();
  updateHUD();
  renderInventoryWindow();
  document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#64748b; font-size:0.8rem; text-align:center; margin:auto;">Item guardado na mochila.</div>';
}

function sellSelectedBagItem() {
  if (selectedBagIndex < 0) return;
  var item = player.bag[selectedBagIndex];
  if (!item) return;
  player.gold += (item.sellPrice || 10);
  player.bag.splice(selectedBagIndex, 1);
  selectedBagIndex = -1;
  saveSlots();
  updateHUD();
  renderInventoryWindow();
  document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#fbbf24; font-size:0.8rem; text-align:center; margin:auto;">Item vendido por +' + item.sellPrice + ' Ouro!</div>';
}

function sellAllEquipsInBag() {
  var totalGold = 0, count = 0;
  var kept = [];
  for (var i = 0; i < player.bag.length; i++) {
    var it = player.bag[i];
    if (it.slot !== 'consumable' && it.slot !== 'lapis' && !it.shopExclusive) {
      totalGold += (it.sellPrice || 15);
      count++;
    } else {
      kept.push(it);
    }
  }
  if (count === 0) {
    document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; text-align:center; margin:auto;">Não há equipamentos comuns soltos (itens Deusa da Loja são protegidos).</div>';
    return;
  }
  player.bag = kept;
  player.gold += totalGold;
  selectedBagIndex = -1;
  saveSlots();
  updateHUD();
  renderInventoryWindow();
  document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#fbbf24; font-size:0.82rem; text-align:center; margin:auto;">💰 Vendidos <b>' + count + '</b> equipamentos por <b>+$' + totalGold + ' Ouro</b>!</div>';
}

function sellAllLapisInBag() {
  var totalGold = 0, count = 0;
  var kept = [];
  for (var i = 0; i < player.bag.length; i++) {
    var it = player.bag[i];
    if (it.slot === 'lapis' && !it.shopExclusive) {
      totalGold += (it.sellPrice || 45);
      count++;
    } else {
      kept.push(it);
    }
  }
  if (count === 0) {
    document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; text-align:center; margin:auto;">Não há Lapis comuns soltas (Lapis exclusivas da Loja são protegidas).</div>';
    return;
  }
  player.bag = kept;
  player.gold += totalGold;
  selectedBagIndex = -1;
  saveSlots();
  updateHUD();
  renderInventoryWindow();
  document.getElementById('item-tooltip-box').innerHTML = '<div style="color:#38bdf8; font-size:0.82rem; text-align:center; margin:auto;">💎 Vendidas <b>' + count + '</b> Lapis por <b>+$' + totalGold + ' Ouro</b>!</div>';
}

// ================= FERREIRO SIMPLIFICADO =================
function switchSmithTab(tab) {
  currentSmithTab = tab;
  document.getElementById('stab-link').classList.toggle('active', tab === 'link');
  document.getElementById('stab-enchant').classList.toggle('active', tab === 'enchant');
  renderSmithWindow();
}

function showSmithBanner(msg, ok) {
  var b = document.getElementById('smith-banner');
  b.style.display = 'block';
  b.style.background = ok ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.22)';
  b.style.border = ok ? '1px solid #10b981' : '1px solid #f43f5e';
  b.style.color = ok ? '#34d399' : '#fda4af';
  b.textContent = msg;
}

function getSupplyCount(stackKey) {
  var total = 0;
  for (var i = 0; i < player.bag.length; i++) {
    if (player.bag[i].stackKey === stackKey) total += (player.bag[i].qty || 1);
  }
  return total;
}

function consumeSupply(stackKey) {
  for (var i = 0; i < player.bag.length; i++) {
    if (player.bag[i].stackKey === stackKey) {
      if ((player.bag[i].qty || 1) > 1) player.bag[i].qty -= 1;
      else player.bag.splice(i, 1);
      return true;
    }
  }
  return false;
}

function buySmithSupply(type, price) {
  if (player.gold < price) {
    showSmithBanner('Ouro insuficiente para comprar este suprimento!', false);
    return;
  }
  var map = {
    link_stone:  { name: 'Pedra de Linkagem', icon: '🔷', rarity: 'nobre', desc: '+25% de chance na linkagem e protege a Lapis.' },
    ext_hammer:  { name: 'Martelo de Extração', icon: '🔨', rarity: 'nobre', desc: '+30% de chance na extração de Lapis.' },
    lapisia_atk: { name: 'Lapisia de Ataque', icon: '⚔️', rarity: 'veneravel', desc: 'Encanta Armas e Acessórios.' },
    lapisia_def: { name: 'Lapisia de Defesa', icon: '🛡️', rarity: 'veneravel', desc: 'Encanta Armaduras e Escudos.' },
    prot_rune:   { name: 'Runa de Proteção', icon: '📜', rarity: 'heroico', desc: 'Protege o nível de encantamento se falhar.' }
  };
  var info = map[type];
  if (!info) return;
  if (!addBagItem(player.bag, {
    id: 'sup_' + Math.random().toString(36).slice(2, 8),
    stackKey: type, name: info.name, icon: info.icon, slot: 'consumable', rarity: info.rarity, qty: 1, sellPrice: Math.round(price * 0.4), desc: info.desc
  })) {
    showSmithBanner('Sua mochila está cheia!', false);
    return;
  }
  player.gold -= price;
  saveSlots();
  updateHUD();
  renderSmithWindow();
  showSmithBanner('Você comprou 1x ' + info.name + '!', true);
}

function renderSmithWindow() {
  document.getElementById('smith-gold-val').textContent = player.gold;

  var eqList = document.getElementById('smith-eq-list');
  eqList.innerHTML = '';
  var validSlot = null;

  Object.keys(SLOT_META).forEach(function(slotKey) {
    if (slotKey === 'mount') return;
    var eq = player.equipped[slotKey];
    if (!eq) return;
    if (!validSlot) validSlot = slotKey;
    if (smithSelectedSlot === slotKey) validSlot = slotKey;
  });
  if (validSlot) smithSelectedSlot = validSlot;

  Object.keys(SLOT_META).forEach(function(slotKey) {
    if (slotKey === 'mount') return;
    var eq = player.equipped[slotKey];
    if (!eq) return;
    var r = RARITIES[eq.rarity] || RARITIES.comum;
    var filledCount = Array.isArray(eq.sockets) ? eq.sockets.filter(Boolean).length : 0;
    var totalSlots = Array.isArray(eq.sockets) ? eq.sockets.length : 0;
    var elIcon = (eq.element && eq.element !== 'none' && ELEMENTS[eq.element]) ? ' ' + ELEMENTS[eq.element].icon : '';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'smith-eq-btn' + (smithSelectedSlot === slotKey ? ' selected' : '');
    btn.style.borderColor = r.color;
    btn.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        '<b style="color:' + r.color + '">' + eq.icon + ' ' + eq.name + elIcon + '</b>' +
        '<span style="color:#fbbf24; font-weight:bold;">[' + (eq.plus || 0) + ']</span>' +
      '</div>' +
      '<div style="font-size:0.66rem; color:#94a3b8; margin-top:2px;">Engastes: <b>' + filledCount + '/' + totalSlots + '</b></div>';
    btn.onclick = function() { smithSelectedSlot = slotKey; renderSmithWindow(); };
    eqList.appendChild(btn);
  });

  var centerPanel = document.getElementById('smith-center-panel');
  var rightPanel = document.getElementById('smith-right-panel');
  var item = player.equipped[smithSelectedSlot];

  if (!item) {
    centerPanel.innerHTML = '<div style="color:#94a3b8; margin:auto;">Equipe um item na Mochila (B) primeiro.</div>';
    rightPanel.innerHTML = '';
    return;
  }

  var r = RARITIES[item.rarity] || RARITIES.comum;
  var elMeta = ELEMENTS[item.element || 'none'] || ELEMENTS.none;

  if (currentSmithTab === 'link') {
    var socketsHtml = '';
    var hasFreeSlot = false;

    if (!Array.isArray(item.sockets) || item.sockets.length === 0) {
      socketsHtml = '<div style="color:#f87171; font-size:0.78rem; text-align:center; padding:12px;">Este item Normal não possui engastes. Use itens Nobre, Heroico, Lendário ou Deusa.</div>';
    } else {
      socketsHtml = '<div class="socket-visual-row">';
      item.sockets.forEach(function(sk, idx) {
        if (sk && LAPIS_CATALOG[sk.lapisKey]) {
          var meta = LAPIS_CATALOG[sk.lapisKey];
          var extChance = Math.min(95, Math.max(25, 85 - (sk.level || 1) * 10) + (useExtHammer ? 30 : 0));
          socketsHtml +=
            '<div class="socket-slot-card filled" style="border-color:' + meta.color + ';">' +
              '<div style="font-size:1.15rem;">💎</div>' +
              '<div style="font-weight:bold; color:' + meta.color + ';">' + meta.code + (meta.kind === 'elem' ? '' : ' Nv.' + sk.level) + '</div>' +
              '<button type="button" class="btn-extract-mini" onclick="extractLapisFromSlot(' + idx + ')">Extrair (' + extChance + '%)</button>' +
            '</div>';
        } else {
          hasFreeSlot = true;
          socketsHtml +=
            '<div class="socket-slot-card">' +
              '<div style="font-size:1.1rem; opacity:0.3;">⭕</div>' +
              '<div style="color:#64748b; margin-top:2px;">Livre</div>' +
            '</div>';
        }
      });
      socketsHtml += '</div>';
    }

    var lsCount = getSupplyCount('link_stone');
    var ehCount = getSupplyCount('ext_hammer');
    if (lsCount === 0) useLinkStone = false;
    if (ehCount === 0) useExtHammer = false;

    centerPanel.innerHTML =
      '<div>' +
        '<div class="stat-col-title"><span class="step-badge">PASSO 2</span>Engastes & Extração do Item</div>' +
        '<div style="text-align:center; margin:4px 0;">' +
          '<b style="color:' + r.color + '; font-size:0.95rem;">' + item.icon + ' ' + item.name + ' [' + (item.plus || 0) + ']</b><br>' +
          '<span class="elem-tag" style="margin-top:4px; background:' + elMeta.bg + '; color:' + elMeta.color + ';">Elemento: ' + elMeta.label + '</span>' +
        '</div>' +
        socketsHtml +
      '</div>' +
      '<div style="background:#111827; border:1px solid #1e293b; border-radius:8px; padding:8px; font-size:0.74rem;">' +
        '<label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin-bottom:5px;">' +
          '<input type="checkbox" ' + (useLinkStone ? 'checked' : '') + ' ' + (lsCount === 0 ? 'disabled' : '') + ' onchange="useLinkStone=this.checked; renderSmithWindow()">' +
          '<span>🔷 Usar <b>Pedra de Linkagem</b> (+25% chance & salva Lapis) — <b>' + lsCount + '</b></span>' +
        '</label>' +
        '<label style="display:flex; align-items:center; gap:6px; cursor:pointer;">' +
          '<input type="checkbox" ' + (useExtHammer ? 'checked' : '') + ' ' + (ehCount === 0 ? 'disabled' : '') + ' onchange="useExtHammer=this.checked; renderSmithWindow()">' +
          '<span>🔨 Usar <b>Martelo de Extração</b> (+30% chance ao extrair) — <b>' + ehCount + '</b></span>' +
        '</label>' +
      '</div>';

    var lapisBagHtml = '';
    var foundLapis = 0;
    for (var b = 0; b < player.bag.length; b++) {
      var bItem = player.bag[b];
      if (bItem && bItem.slot === 'lapis' && LAPIS_CATALOG[bItem.lapisKey]) {
        foundLapis++;
        var lMeta = LAPIS_CATALOG[bItem.lapisKey];
        var lvl = bItem.level || 1;
        var baseCh = lMeta.kind === 'elem' ? 60 : (LAPIS_BASE_LINK_CHANCE[lvl] || 40);
        var finalCh = Math.min(98, baseCh + (useLinkStone ? 25 : 0));
        var cost = lvl * 60;

        lapisBagHtml +=
          '<div class="lapis-choice-card" style="border-color:' + lMeta.color + '66;">' +
            '<div>' +
              '<b style="color:' + lMeta.color + ';">💎 ' + bItem.name + '</b><br>' +
              '<span style="font-size:0.66rem; color:#94a3b8;">' + formatLapisEffect(bItem) + ' • Chance: <b style="color:#34d399;">' + finalCh + '%</b></span>' +
            '</div>' +
            '<button type="button" class="btn-link-now" ' + (hasFreeSlot ? '' : 'disabled') + ' onclick="linkBagLapisToCurrentItem(' + b + ')">Linkar ($' + cost + ')</button>' +
          '</div>';
      }
    }

    if (foundLapis === 0) {
      lapisBagHtml = '<div style="color:#94a3b8; font-size:0.75rem; text-align:center; padding:16px;">Você não tem Lapis na mochila. Compre Lapis Sônico/Veloz/ABS na Loja (L) ou derrote monstros!</div>';
    }

    rightPanel.innerHTML =
      '<div>' +
        '<div class="stat-col-title"><span class="step-badge">PASSO 3</span>Clique na Lapis para Linkar</div>' +
        '<div class="lapis-select-list">' + lapisBagHtml + '</div>' +
      '</div>' +
      '<div style="border-top:1px solid #1e293b; padding-top:7px;">' +
        '<div style="font-size:0.68rem; color:#94a3b8; font-weight:bold;">Suprimentos Rápidos do Ferreiro:</div>' +
        '<div class="shop-mini-grid">' +
          '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'link_stone\', 120)">🔷 Pedra Linkagem ($120)</button>' +
          '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'ext_hammer\', 100)">🔨 Martelo Extração ($100)</button>' +
        '</div>' +
      '</div>';
  } else {
    var curPlus = item.plus || 0;
    var nextPlus = curPlus + 1;
    var isWeaponOrAcc = ['weapon', 'amulet', 'ring1', 'ring2', 'loop1', 'loop2'].indexOf(smithSelectedSlot) >= 0;
    var reqKey = isWeaponOrAcc ? 'lapisia_atk' : 'lapisia_def';
    var reqName = isWeaponOrAcc ? 'Lapisia de Ataque' : 'Lapisia de Defesa';
    var lapCount = getSupplyCount(reqKey);
    var runeCount = getSupplyCount('prot_rune');
    if (runeCount === 0) useProtRune = false;

    var successRate = Math.max(12, 95 - curPlus * 4);
    var goldCost = nextPlus * 90;

    centerPanel.innerHTML =
      '<div>' +
        '<div class="stat-col-title"><span class="step-badge">PASSO 2</span>Nível de Encantamento</div>' +
        '<div style="text-align:center; padding:12px 6px;">' +
          '<div style="font-size:2.3rem; margin-bottom:4px;">' + item.icon + '</div>' +
          '<b style="color:' + r.color + '; font-size:0.96rem;">' + item.name + '</b><br>' +
          '<div style="font-size:1.15rem; font-weight:bold; color:#fbbf24; margin-top:6px;">[' + curPlus + ']  ➔  [' + Math.min(20, nextPlus) + ']</div>' +
          '<div style="font-size:0.75rem; color:#34d399; margin-top:4px;">Bônus de Status: +' + (curPlus * 10) + '% ➔ +' + (Math.min(20, nextPlus) * 10) + '%</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#111827; border:1px solid #1e293b; border-radius:8px; padding:8px; font-size:0.74rem;">' +
        '<div style="margin-bottom:5px;">Requer: <b>1x ' + reqName + '</b> (Você tem: <b style="color:' + (lapCount > 0 ? '#34d399' : '#f87171') + ';">' + lapCount + '</b>)</div>' +
        '<label style="display:flex; align-items:center; gap:6px; cursor:pointer;">' +
          '<input type="checkbox" ' + (useProtRune ? 'checked' : '') + ' ' + (runeCount === 0 ? 'disabled' : '') + ' onchange="useProtRune=this.checked; renderSmithWindow()">' +
          '<span>📜 Usar <b>Runa de Proteção</b> (Impede perda de nível) — <b>' + runeCount + '</b></span>' +
        '</label>' +
      '</div>';

    rightPanel.innerHTML =
      '<div>' +
        '<div class="stat-col-title"><span class="step-badge">PASSO 3</span>Confirmar Encantamento</div>' +
        '<div style="background:#111827; border:1px solid #1e293b; border-radius:8px; padding:12px; text-align:center; margin-bottom:8px;">' +
          '<div style="font-size:0.8rem; color:#cbd5e1;">Taxa de Sucesso: <b style="color:#34d399; font-size:1rem;">' + successRate + '%</b></div>' +
          '<div style="font-size:0.78rem; color:#fbbf24; margin-top:4px;">Custo: <b>$' + goldCost + ' Ouro</b></div>' +
          '<button type="button" class="btn-create" style="width:100%; margin-top:10px;" ' + (curPlus >= 20 ? 'disabled' : '') + ' onclick="enchantCurrentItem()">' +
            (curPlus >= 20 ? 'Nível Máximo [20]' : '✨ Encantar para [' + nextPlus + ']') +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div style="border-top:1px solid #1e293b; padding-top:7px;">' +
        '<div style="font-size:0.68rem; color:#94a3b8; font-weight:bold;">Comprar Lapisias & Runas:</div>' +
        '<div class="shop-mini-grid">' +
          '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'lapisia_atk\', 150)">⚔️ Lapisia ATQ ($150)</button>' +
          '<button type="button" class="btn-buy-supply" onclick="buySmithSupply(\'lapisia_def\', 150)">🛡️ Lapisia DEF ($150)</button>' +
          '<button type="button" class="btn-buy-supply" style="grid-column:span 2;" onclick="buySmithSupply(\'prot_rune\', 240)">📜 Runa de Proteção ($240)</button>' +
        '</div>' +
      '</div>';
  }
}

function linkBagLapisToCurrentItem(bagIdx) {
  var item = player.equipped[smithSelectedSlot];
  var lapisItem = player.bag[bagIdx];
  if (!item || !lapisItem || lapisItem.slot !== 'lapis') return;

  var freeSlotIdx = -1;
  for (var i = 0; i < item.sockets.length; i++) {
    if (item.sockets[i] === null) { freeSlotIdx = i; break; }
  }
  if (freeSlotIdx === -1) {
    showSmithBanner('Este item já está com todos os engastes cheios!', false);
    return;
  }

  var meta = LAPIS_CATALOG[lapisItem.lapisKey];
  var lvl = lapisItem.level || 1;
  var cost = lvl * 60;
  if (player.gold < cost) {
    showSmithBanner('Ouro insuficiente! São necessários $' + cost + ' de Ouro.', false);
    return;
  }

  var hasStone = useLinkStone && getSupplyCount('link_stone') > 0;
  if (hasStone) consumeSupply('link_stone');
  player.gold -= cost;

  var baseChance = meta.kind === 'elem' ? 60 : (LAPIS_BASE_LINK_CHANCE[lvl] || 40);
  var finalChance = Math.min(98, baseChance + (hasStone ? 25 : 0));

  if (Math.random() * 100 <= finalChance) {
    item.sockets[freeSlotIdx] = { lapisKey: lapisItem.lapisKey, level: lvl };
    if (meta.kind === 'elem' && meta.element) item.element = meta.element;
    player.bag.splice(bagIdx, 1);
    playSuccessChime();
    showSmithBanner('SUCESSO! ' + lapisItem.name + ' foi linkada em ' + item.name + '!', true);
  } else {
    playBreakSound();
    if (hasStone) {
      showSmithBanner('A linkagem falhou, mas a Pedra de Linkagem salvou sua Lapis!', false);
    } else {
      player.bag.splice(bagIdx, 1);
      showSmithBanner('FALHA! A Lapis quebrou durante a linkagem.', false);
    }
  }

  saveSlots();
  updateHUD();
  renderSmithWindow();
}

function extractLapisFromSlot(socketIdx) {
  var item = player.equipped[smithSelectedSlot];
  if (!item || !item.sockets[socketIdx]) return;
  if (player.bag.length >= 120) {
    showSmithBanner('Libere espaço na mochila antes de extrair a Lapis!', false);
    return;
  }

  var sock = item.sockets[socketIdx];
  var meta = LAPIS_CATALOG[sock.lapisKey];
  var cost = (sock.level || 1) * 45;
  if (player.gold < cost) {
    showSmithBanner('Ouro insuficiente ($' + cost + ') para extrair.', false);
    return;
  }

  var hasHammer = useExtHammer && getSupplyCount('ext_hammer') > 0;
  if (hasHammer) consumeSupply('ext_hammer');
  player.gold -= cost;

  var chance = Math.min(95, Math.max(25, 85 - (sock.level || 1) * 10) + (hasHammer ? 30 : 0));
  item.sockets[socketIdx] = null;

  if (meta.kind === 'elem') {
    var remainingElem = 'none';
    item.sockets.forEach(function(s) {
      if (s && LAPIS_CATALOG[s.lapisKey] && LAPIS_CATALOG[s.lapisKey].kind === 'elem') remainingElem = LAPIS_CATALOG[s.lapisKey].element;
    });
    item.element = remainingElem;
  }

  if (Math.random() * 100 <= chance) {
    player.bag.push({
      id: 'ext_' + Math.random().toString(36).slice(2, 10),
      name: meta.kind === 'elem' ? meta.name : (meta.name + ' Nv.' + sock.level),
      icon: '💎', slot: 'lapis', lapisKey: sock.lapisKey, level: sock.level,
      rarity: sock.level >= 5 ? 'heroico' : 'veneravel', sellPrice: sock.level * 45,
      desc: formatLapisEffect(sock)
    });
    playSuccessChime();
    showSmithBanner('EXTRAÇÃO CONCLUÍDA! A Lapis voltou intacta para sua mochila.', true);
  } else {
    playBreakSound();
    showSmithBanner('A Lapis estilhaçou durante a remoção.', false);
  }

  saveSlots();
  updateHUD();
  renderSmithWindow();
}

function enchantCurrentItem() {
  var item = player.equipped[smithSelectedSlot];
  if (!item || (item.plus || 0) >= 20) return;

  var curPlus = item.plus || 0;
  var nextPlus = curPlus + 1;
  var isWeaponOrAcc = ['weapon', 'amulet', 'ring1', 'ring2', 'loop1', 'loop2'].indexOf(smithSelectedSlot) >= 0;
  var reqKey = isWeaponOrAcc ? 'lapisia_atk' : 'lapisia_def';
  var goldCost = nextPlus * 90;

  if (getSupplyCount(reqKey) <= 0) {
    showSmithBanner('Você precisa de 1x ' + (isWeaponOrAcc ? 'Lapisia de Ataque' : 'Lapisia de Defesa') + '!', false);
    return;
  }
  if (player.gold < goldCost) {
    showSmithBanner('Ouro insuficiente ($' + goldCost + ')!', false);
    return;
  }

  consumeSupply(reqKey);
  var hasProt = useProtRune && getSupplyCount('prot_rune') > 0;
  if (hasProt) consumeSupply('prot_rune');
  player.gold -= goldCost;

  var successRate = Math.max(12, 95 - curPlus * 4);
  if (Math.random() * 100 <= successRate) {
    item.plus = nextPlus;
    playSuccessChime();
    showSmithBanner('BRILHO INTENSO! ' + item.name + ' encantado com sucesso para [' + nextPlus + ']!', true);
  } else {
    playBreakSound();
    if (hasProt) {
      showSmithBanner('O encantamento falhou, mas a Runa de Proteção manteve [' + curPlus + ']!', false);
    } else {
      item.plus = Math.max(0, curPlus - 1);
      showSmithBanner('FALHA! O nível do item caiu para [' + item.plus + '].', false);
    }
  }

  saveSlots();
  updateHUD();
  renderSmithWindow();
}

// Inicialização
loadSlots();
renderCreationClassCards();
renderSlotsGrid();
