// ================= MÓDULO DE CENÁRIO: LOBBY PASSIVO & TORRE DO ABISMO (5 DUNGEONS) =================
var WorldSceneryModule = (function() {
  var LOBBY_BOUNDS = { x: 1100, y: 1100, w: 1000, h: 850 };
  var ARENA_BOUNDS = { x: 1050, y: 1050, w: 1100, h: 850 };

  var DG_CONFIGS = [
    {
      id: 0,
      name: 'DG 1–15: Cavernas Telúricas',
      shortName: 'DG 1–15',
      minLvl: 1,
      maxLvl: 15,
      elem: 'earth',
      weakElem: 'wind',
      portalColor: '#a16207',
      floorBg: '#242118',
      tileA: '#2e2a1f',
      tileB: '#28241a',
      borderLava: '#78350f',
      torchColor: '#fbbf24'
    },
    {
      id: 1,
      name: 'DG 15–25: Cânion das Tempestades',
      shortName: 'DG 15–25',
      minLvl: 15,
      maxLvl: 25,
      elem: 'wind',
      weakElem: 'fire',
      portalColor: '#10b981',
      floorBg: '#162622',
      tileA: '#1d332d',
      tileB: '#182b26',
      borderLava: '#065f46',
      torchColor: '#34d399'
    },
    {
      id: 2,
      name: 'DG 25–35: Abismo Glacial',
      shortName: 'DG 25–35',
      minLvl: 25,
      maxLvl: 35,
      elem: 'water',
      weakElem: 'earth',
      portalColor: '#2563eb',
      floorBg: '#131d2e',
      tileA: '#19273d',
      tileB: '#152134',
      borderLava: '#1d4ed8',
      torchColor: '#38bdf8'
    },
    {
      id: 3,
      name: 'DG 35–45: Forja Vulcânica',
      shortName: 'DG 35–45',
      minLvl: 35,
      maxLvl: 45,
      elem: 'fire',
      weakElem: 'water',
      portalColor: '#dc2626',
      floorBg: '#291515',
      tileA: '#361b1b',
      tileB: '#2e1717',
      borderLava: '#b91c1c',
      torchColor: '#fb923c'
    },
    {
      id: 4,
      name: 'DG 45–60: Trono do Abismo',
      shortName: 'DG 45–60',
      minLvl: 45,
      maxLvl: 60,
      elem: 'mixed',
      weakElem: 'all',
      portalColor: '#9333ea',
      floorBg: '#1e1329',
      tileA: '#281936',
      tileB: '#22152e',
      borderLava: '#7e22ce',
      torchColor: '#e879f9'
    }
  ];

  // Posição dos 5 Portais no topo do Lobby
  function getLobbyPortals() {
    var baseY = LOBBY_BOUNDS.y + 165;
    var startX = LOBBY_BOUNDS.x + 140;
    var gapX = 180;
    return DG_CONFIGS.map(function(cfg, idx) {
      return {
        dgIndex: idx,
        x: startX + idx * gapX,
        y: baseY,
        r: 42,
        cfg: cfg
      };
    });
  }

  // NPCs decorativos/interativos no Lobby
  function getLobbyNpcs() {
    return [
      { id: 'npc_smith', name: '🔨 Ferreiro de Teos (F)', x: LOBBY_BOUNDS.x + 210, y: LOBBY_BOUNDS.y + 470, color: '#f59e0b', action: 'smith-modal' },
      { id: 'npc_shop',  name: '👑 Loja Exclusiva (L)',  x: LOBBY_BOUNDS.x + 790, y: LOBBY_BOUNDS.y + 470, color: '#ec4899', action: 'shop-modal' }
    ];
  }

  // Portais de saída quando limpa um andar da DG
  function getFloorExitPortals() {
    return {
      lobby: {
        x: ARENA_BOUNDS.x + 340,
        y: ARENA_BOUNDS.y + 150,
        r: 44,
        label: '🏛️ Voltar ao Lobby Seguro',
        color: '#38bdf8'
      },
      next: {
        x: ARENA_BOUNDS.x + 760,
        y: ARENA_BOUNDS.y + 150,
        r: 44,
        label: '🔥 Próximo Andar',
        color: '#fbbf24'
      }
    };
  }

  function getLobbySpawn() {
    return { x: LOBBY_BOUNDS.x + LOBBY_BOUNDS.w / 2, y: LOBBY_BOUNDS.y + 620 };
  }

  function getArenaSpawn() {
    return { x: ARENA_BOUNDS.x + ARENA_BOUNDS.w / 2, y: ARENA_BOUNDS.y + ARENA_BOUNDS.h - 140 };
  }

  function getFactionSpawn() {
    return getLobbySpawn();
  }

  function getActiveBounds(isLobby) {
    return isLobby ? LOBBY_BOUNDS : ARENA_BOUNDS;
  }

  // Pilares internos da arena (poucos e bem espaçados para nunca travar o jogador)
  function getArenaPillars(isLobby) {
    if (isLobby) return [];
    var b = ARENA_BOUNDS;
    return [
      { x: b.x + 280, y: b.y + 320, r: 26 },
      { x: b.x + b.w - 280, y: b.y + 320, r: 26 },
      { x: b.x + 280, y: b.y + b.h - 280, r: 26 },
      { x: b.x + b.w - 280, y: b.y + b.h - 280, r: 26 }
    ];
  }

  function resolveCollision(entity, radius, isLobby) {
    var b = getActiveBounds(isLobby !== false);
    var pad = (radius || 16) + 28;
    if (entity.x < b.x + pad) entity.x = b.x + pad;
    if (entity.x > b.x + b.w - pad) entity.x = b.x + b.w - pad;
    if (entity.y < b.y + pad) entity.y = b.y + pad;
    if (entity.y > b.y + b.h - pad) entity.y = b.y + b.h - pad;

    var pillars = getArenaPillars(isLobby !== false);
    for (var i = 0; i < pillars.length; i++) {
      var p = pillars[i];
      var dx = entity.x - p.x;
      var dy = entity.y - p.y;
      var dist = Math.hypot(dx, dy);
      var minDist = p.r + (radius || 16);
      if (dist > 0 && dist < minDist) {
        entity.x = p.x + (dx / dist) * minDist;
        entity.y = p.y + (dy / dist) * minDist;
      }
    }
  }

  function drawPortalCircle(ctx, x, y, r, color, timeSec) {
    ctx.save();
    var pulse = Math.sin(timeSec * 4) * 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, r + pulse * 0.5, (r + pulse * 0.5) * 0.68, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.85, r * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.52, timeSec * 2.5, timeSec * 2.5 + Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }

  function renderGroundLayer(ctx, camX, camY, viewW, viewH, isFury, stateInfo) {
    var isLobby = !stateInfo || stateInfo.isLobby;
    var dgIdx = (stateInfo && typeof stateInfo.dgIndex === 'number') ? stateInfo.dgIndex : 0;
    var cfg = DG_CONFIGS[dgIdx] || DG_CONFIGS[0];
    var b = getActiveBounds(isLobby);
    var timeSec = performance.now() / 1000;

    // Fundo abissal/lava fora da sala
    ctx.fillStyle = isLobby ? '#0b101b' : '#09070d';
    ctx.fillRect(camX, camY, viewW, viewH);

    // Borda externa luminosa da sala
    ctx.fillStyle = isLobby ? '#1e293b' : cfg.borderLava;
    ctx.fillRect(b.x - 18, b.y - 18, b.w + 36, b.h + 36);

    // Piso em ladrilhos 2.5D
    var tileSize = 64;
    for (var gx = b.x; gx < b.x + b.w; gx += tileSize) {
      for (var gy = b.y; gy < b.y + b.h; gy += tileSize) {
        var odd = (((gx - b.x) / tileSize) + ((gy - b.y) / tileSize)) % 2 === 0;
        if (isLobby) {
          ctx.fillStyle = odd ? '#182234' : '#141d2c';
        } else {
          ctx.fillStyle = odd ? cfg.tileA : cfg.tileB;
        }
        ctx.fillRect(gx, gy, tileSize, tileSize);
      }
    }

    // Círculo rúnico central
    var cx = b.x + b.w / 2;
    var cy = b.y + b.h / 2 + 20;
    ctx.save();
    ctx.strokeStyle = isLobby ? 'rgba(56, 189, 248, 0.22)' : 'rgba(251, 191, 36, 0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (isLobby) {
      // Título do Lobby no piso
      ctx.font = 'bold 20px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🏛️ SANTUÁRIO DE TEOS — ZONA SEGURA (SEM PVP)', cx, b.y + 62);
      ctx.font = '13px Segoe UI';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Caminhe até um dos 5 Portais abaixo ou clique sobre ele para entrar na Dungeon', cx, b.y + 86);

      // Desenha os 5 Portais de DG
      var portals = getLobbyPortals();
      portals.forEach(function(pt) {
        drawPortalCircle(ctx, pt.x, pt.y, pt.r, pt.cfg.portalColor, timeSec);
        ctx.font = 'bold 13px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pt.cfg.shortName, pt.x, pt.y - 48);

        var elLabel = pt.cfg.elem === 'earth' ? '🪨 Terra' :
                      pt.cfg.elem === 'wind'  ? '🌪️ Vento' :
                      pt.cfg.elem === 'water' ? '💧 Água' :
                      pt.cfg.elem === 'fire'  ? '🔥 Fogo' : '🌀 Caos Misto';
        var weakLabel = pt.cfg.weakElem === 'wind'  ? 'Fraqueza: 🌪️' :
                        pt.cfg.weakElem === 'fire'  ? 'Fraqueza: 🔥' :
                        pt.cfg.weakElem === 'earth' ? 'Fraqueza: 🪨' :
                        pt.cfg.weakElem === 'water' ? 'Fraqueza: 💧' : 'Todas Elementos';

        ctx.font = 'bold 11px Segoe UI';
        ctx.fillStyle = '#fde047';
        ctx.fillText(elLabel, pt.x, pt.y + 44);
        ctx.font = '10px Segoe UI';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(weakLabel, pt.x, pt.y + 58);
      });

      // NPCs visuais do Lobby
      getLobbyNpcs().forEach(function(npc) {
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.x, npc.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(npc.name, npc.x, npc.y - 28);
      });
    } else {
      // Cabeçalho do Andar atual na arena
      var floorNum = (stateInfo && stateInfo.floor) ? stateInfo.floor : 1;
      var stageTag = (floorNum % 10 === 0) ? '👑 ANDAR DE BOSS SUPREMO' :
                     (floorNum % 5 === 0)  ? '🔥 ANDAR DE MINI-BOSS' : '⚔️ ANDAR DE COMBATE';
      ctx.font = 'bold 18px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(cfg.name + ' — Andar ' + floorNum + ' (' + stageTag + ')', cx, b.y + 56);

      // Se a sala estiver limpa, desenha os 2 Portais de escolha no topo
      if (stateInfo && stateInfo.floorCleared) {
        var exits = getFloorExitPortals();
        drawPortalCircle(ctx, exits.lobby.x, exits.lobby.y, exits.lobby.r, exits.lobby.color, timeSec);
        ctx.font = 'bold 13px Segoe UI';
        ctx.fillStyle = exits.lobby.color;
        ctx.fillText(exits.lobby.label, exits.lobby.x, exits.lobby.y - 46);

        drawPortalCircle(ctx, exits.next.x, exits.next.y, exits.next.r, exits.next.color, timeSec);
        ctx.fillStyle = exits.next.color;
        ctx.fillText(exits.next.label + ' (' + (floorNum + 1) + ')', exits.next.x, exits.next.y - 46);
      }
    }
  }

  function renderPropsLayer(ctx, camX, camY, viewW, viewH, isFury, playerY, layer, stateInfo) {
    var isLobby = !stateInfo || stateInfo.isLobby;
    var dgIdx = (stateInfo && typeof stateInfo.dgIndex === 'number') ? stateInfo.dgIndex : 0;
    var cfg = DG_CONFIGS[dgIdx] || DG_CONFIGS[0];
    var b = getActiveBounds(isLobby);

    // Tochas nas bordas da sala
    var torches = [
      { x: b.x + 40, y: b.y + 40 },
      { x: b.x + b.w - 40, y: b.y + 40 },
      { x: b.x + 40, y: b.y + b.h - 40 },
      { x: b.x + b.w - 40, y: b.y + b.h - 40 }
    ];
    torches.forEach(function(t) {
      var isFront = t.y > playerY;
      if ((layer === 'front' && !isFront) || (layer === 'back' && isFront)) return;
      ctx.save();
      ctx.fillStyle = '#475569';
      ctx.fillRect(t.x - 6, t.y - 24, 12, 28);
      ctx.fillStyle = isLobby ? '#38bdf8' : cfg.torchColor;
      ctx.shadowColor = isLobby ? '#38bdf8' : cfg.torchColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(t.x, t.y - 30, 9 + Math.sin(performance.now() * 0.01) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Pilares 2.5D da arena
    var pillars = getArenaPillars(isLobby);
    pillars.forEach(function(p) {
      var isFront = p.y > playerY;
      if ((layer === 'front' && !isFront) || (layer === 'back' && isFront)) return;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 12, p.r + 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x - p.r + 4, p.y - 54, (p.r - 4) * 2, 62);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 54, p.r - 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  return {
    DG_CONFIGS: DG_CONFIGS,
    getLobbyPortals: getLobbyPortals,
    getLobbyNpcs: getLobbyNpcs,
    getFloorExitPortals: getFloorExitPortals,
    getLobbySpawn: getLobbySpawn,
    getArenaSpawn: getArenaSpawn,
    getFactionSpawn: getFactionSpawn,
    getActiveBounds: getActiveBounds,
    resolveCollision: resolveCollision,
    renderGroundLayer: renderGroundLayer,
    renderPropsLayer: renderPropsLayer,
    isInWater: function() { return false; },
    getZoneLevelAt: function() { return 1; }
  };
})();
