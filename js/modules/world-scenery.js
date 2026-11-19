// ================= MÓDULO: MAPA 1 - PROELIUM FRONTIER (LAYOUT OFICIAL + COLISÃO SÓLIDA) =================
var WorldSceneryModule = (function () {
  var builtForSize = 0;
  var props = [];
  var groundDetails = [];
  var riverSegments = [];
  var bridges = [];

  function getMapSize() {
    return (typeof WORLD_SIZE !== 'undefined' && WORLD_SIZE > 0) ? WORLD_SIZE : 3200;
  }

  function createSeededRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function distToSegment(px, py, ax, ay, bx, by) {
    var dx = bx - ax;
    var dy = by - ay;
    var l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - ax, py - ay);
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function getFactionSpawn(faction) {
    var W = getMapSize();
    if (faction === 'fury') {
      // Paroutian Fortress (Nordeste)
      return { x: Math.round(W * 0.75), y: Math.round(W * 0.24) };
    }
    // Delphinian Fortress (Sudoeste)
    return { x: Math.round(W * 0.23), y: Math.round(W * 0.77) };
  }

  function getRedTowerPos() {
    var W = getMapSize();
    return { x: Math.round(W * 0.55), y: Math.round(W * 0.46) };
  }

  function getZoneLevelAt(x, y) {
    var W = getMapSize();
    var tower = getRedTowerPos();
    var distCenter = Math.hypot(x - tower.x, y - tower.y);
    var maxDist = W * 0.55;
    var ratio = 1 - Math.min(1, distCenter / maxDist);
    return Math.max(1, Math.min(15, Math.round(1 + ratio * 14)));
  }

  function buildMapGeometry(W) {
    // 1. Pontes transitáveis sobre os rios
    bridges = [
      { x: W * 0.495, y: W * 0.475, r: 72, angle: -0.65 }, // Ponte Central para Torre Vermelha
      { x: W * 0.145, y: W * 0.565, r: 64, angle: 0.35 }   // Ponte Oeste (Iron Blood)
    ];

    // 2. Rios Azuis fiéis à imagem de Proelium Frontier
    var riverPaths = [
      [
        [0.14, 0.08], [0.16, 0.16], [0.15, 0.25], [0.22, 0.28], [0.34, 0.31],
        [0.15, 0.25], [0.11, 0.34], [0.12, 0.44], [0.14, 0.55], [0.20, 0.61],
        [0.32, 0.64], [0.39, 0.72], [0.43, 0.83], [0.45, 0.93]
      ],
      [
        [0.49, 0.06], [0.48, 0.18], [0.51, 0.30], [0.52, 0.42], [0.49, 0.54],
        [0.45, 0.65], [0.43, 0.76], [0.45, 0.88]
      ],
      [
        [0.49, 0.54], [0.60, 0.53], [0.72, 0.50], [0.83, 0.47], [0.91, 0.44]
      ]
    ];

    riverSegments = [];
    for (var p = 0; p < riverPaths.length; p++) {
      var path = riverPaths[p];
      for (var i = 0; i < path.length - 1; i++) {
        riverSegments.push({
          ax: path[i][0] * W,
          ay: path[i][1] * W,
          bx: path[i + 1][0] * W,
          by: path[i + 1][1] * W,
          width: 44
        });
      }
    }
  }

  function isOnBridge(x, y) {
    for (var i = 0; i < bridges.length; i++) {
      if (Math.hypot(x - bridges[i].x, y - bridges[i].y) <= bridges[i].r) return true;
    }
    return false;
  }

  function isInWater(x, y, extraMargin) {
    ensureBuilt();
    if (isOnBridge(x, y)) return false;
    var margin = extraMargin || 0;
    for (var i = 0; i < riverSegments.length; i++) {
      var s = riverSegments[i];
      if (distToSegment(x, y, s.ax, s.ay, s.bx, s.by) < s.width + margin) {
        return true;
      }
    }
    return false;
  }

  function isOnRoadOrBase(x, y, margin, W) {
    if (Math.hypot(x - W * 0.23, y - W * 0.77) < 210 + margin) return true;
    if (Math.hypot(x - W * 0.75, y - W * 0.24) < 210 + margin) return true;
    if (Math.hypot(x - W * 0.55, y - W * 0.46) < 150 + margin) return true;

    var roadSegs = [
      [0.10, 0.89, 0.23, 0.77],
      [0.23, 0.77, 0.36, 0.66],
      [0.36, 0.66, 0.42, 0.53],
      [0.42, 0.53, 0.55, 0.46],
      [0.55, 0.46, 0.59, 0.35],
      [0.59, 0.35, 0.75, 0.24],
      [0.75, 0.24, 0.90, 0.08],
      [0.42, 0.53, 0.34, 0.49],
      [0.34, 0.49, 0.25, 0.51]
    ];

    for (var i = 0; i < roadSegs.length; i++) {
      var r = roadSegs[i];
      if (distToSegment(x, y, r[0] * W, r[1] * W, r[2] * W, r[3] * W) < 58 + margin) {
        return true;
      }
    }
    return false;
  }

  function ensureBuilt() {
    var W = getMapSize();
    if (builtForSize === W) return;
    builtForSize = W;
    props = [];
    groundDetails = [];

    buildMapGeometry(W);
    var rand = createSeededRandom(202609);

    // 1. Montanhas cercando SOMENTE as 4 bordas externas do mapa (W = 3200)
    var step = 76;
    for (var bx = 40; bx <= W - 40; bx += step) {
      props.push({ x: bx, y: 40, kind: 'mountain', scale: 1.15, hitRadius: 42 });
      props.push({ x: bx, y: W - 40, kind: 'mountain', scale: 1.15, hitRadius: 42 });
    }
    for (var by = 100; by <= W - 100; by += step) {
      props.push({ x: 40, y: by, kind: 'mountain', scale: 1.15, hitRadius: 42 });
      props.push({ x: W - 40, y: by, kind: 'mountain', scale: 1.15, hitRadius: 42 });
    }

    // 2. Maciço Rochoso Norte (entre os dois braços do rio)
    var northMountains = [
      [0.41, 0.17], [0.44, 0.19], [0.40, 0.22], [0.44, 0.24], [0.38, 0.20]
    ];
    for (var m = 0; m < northMountains.length; m++) {
      props.push({
        x: northMountains[m][0] * W,
        y: northMountains[m][1] * W,
        kind: 'mountain',
        scale: 1.05,
        hitRadius: 36
      });
    }

    // 3. Fortalezas (hitRadius: 0 no pátio para você andar livremente dentro da base)
    props.push({ x: W * 0.23, y: W * 0.77, kind: 'fortress_light', scale: 1.0, hitRadius: 0 });
    props.push({ x: W * 0.17, y: W * 0.67, kind: 'watchtower', scale: 1.0, hitRadius: 20 });

    props.push({ x: W * 0.75, y: W * 0.24, kind: 'fortress_fury', scale: 1.0, hitRadius: 0 });
    props.push({ x: W * 0.77, y: W * 0.14, kind: 'watchtower', scale: 1.0, hitRadius: 20 });

    // 4. Torre Vermelha Central (Altar do Boss Mundial)
    var tower = getRedTowerPos();
    props.push({ x: tower.x, y: tower.y, kind: 'red_tower', scale: 1.1, hitRadius: 26 });

    // 5. Grama e flores no solo
    for (var i = 0; i < 800; i++) {
      var gx = 100 + rand() * (W - 200);
      var gy = 100 + rand() * (W - 200);
      if (isInWater(gx, gy, 18) || isOnRoadOrBase(gx, gy, 0, W)) continue;
      groundDetails.push({
        x: gx, y: gy,
        type: rand() < 0.72 ? 'grass' : 'flower',
        scale: 0.8 + rand() * 0.5,
        variant: Math.floor(rand() * 3)
      });
    }

    // 6. Árvores e rochas nas áreas abertas
    for (var j = 0; j < 220; j++) {
      var px = 130 + rand() * (W - 260);
      var py = 130 + rand() * (W - 260);
      if (isInWater(px, py, 32) || isOnRoadOrBase(px, py, 38, W)) continue;

      var tooClose = false;
      for (var k = 0; k < props.length; k++) {
        if (Math.hypot(props[k].x - px, props[k].y - py) < 96) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      var roll = rand();
      var kind = roll > 0.76 ? 'rock' : 'tree';
      var sc = 0.85 + rand() * 0.45;
      props.push({
        x: px, y: py,
        kind: kind,
        scale: sc,
        hitRadius: Math.round((kind === 'rock' ? 22 : 18) * sc),
        variant: Math.floor(rand() * 3)
      });
    }

    props.sort(function (a, b) { return a.y - b.y; });
  }

  function resolveCollision(entity, entityRadius) {
    ensureBuilt();
    var W = getMapSize();
    var rEnt = entityRadius || 16;

    // A) Colisão com obstáculos sólidos (montanhas, árvores, rochas, torre)
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (!p.hitRadius || p.hitRadius <= 0) continue;

      var maxDist = p.hitRadius + rEnt;
      var dx = entity.x - p.x;
      var dy = entity.y - p.y;
      if (Math.abs(dx) >= maxDist || Math.abs(dy) >= maxDist) continue;

      var dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        if (dist < 0.001) { dx = 0; dy = 1; dist = 1; }
        var overlap = maxDist - dist;
        entity.x += (dx / dist) * overlap;
        entity.y += (dy / dist) * overlap;

        if (typeof entity.tx === 'number' && Math.hypot(entity.tx - p.x, entity.ty - p.y) < maxDist) {
          entity.tx = entity.x;
          entity.ty = entity.y;
        }
      }
    }

    // B) Colisão com os Rios Azuis (exceto pontes)
    if (!isOnBridge(entity.x, entity.y)) {
      for (var sIdx = 0; sIdx < riverSegments.length; sIdx++) {
        var s = riverSegments[sIdx];
        var abx = s.bx - s.ax;
        var aby = s.by - s.ay;
        var l2 = abx * abx + aby * aby;
        var t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((entity.x - s.ax) * abx + (entity.y - s.ay) * aby) / l2));
        var cx = s.ax + t * abx;
        var cy = s.ay + t * aby;

        var rdx = entity.x - cx;
        var rdy = entity.y - cy;
        var rDist = Math.hypot(rdx, rdy);
        var minWaterDist = s.width + rEnt * 0.7;

        if (rDist < minWaterDist) {
          if (rDist < 0.001) { rdx = 1; rdy = 0; rDist = 1; }
          var push = minWaterDist - rDist;
          entity.x += (rdx / rDist) * push;
          entity.y += (rdy / rDist) * push;

          if (typeof entity.tx === 'number' && isInWater(entity.tx, entity.ty, 0)) {
            entity.tx = entity.x;
            entity.ty = entity.y;
          }
        }
      }
    }

    // C) Limite interno das muralhas externas do mapa
    entity.x = Math.max(92, Math.min(W - 92, entity.x));
    entity.y = Math.max(92, Math.min(W - 92, entity.y));
  }

  function renderGround(ctx, camX, camY, viewW, viewH) {
    ensureBuilt();
    var W = getMapSize();

    // 1. Limpa completamente o fundo da câmera (evita qualquer rastro de frame)
    ctx.fillStyle = '#262b1c';
    ctx.fillRect(camX, camY, viewW, viewH);

    // 2. Manchas orgânicas de grama e terra
    var tile = 260;
    var startX = Math.floor(camX / tile) * tile;
    var startY = Math.floor(camY / tile) * tile;
    for (var tx = startX; tx < camX + viewW + tile; tx += tile) {
      for (var ty = startY; ty < camY + viewH + tile; ty += tile) {
        var h = Math.abs(Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453) % 1;
        ctx.fillStyle = h > 0.5 ? 'rgba(54, 64, 38, 0.42)' : 'rgba(72, 62, 42, 0.35)';
        ctx.beginPath();
        ctx.ellipse(tx + 130, ty + 130, 145, 105, h * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Estradas de terra batida
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var roadPaths = [
      [[0.10, 0.89], [0.23, 0.77], [0.36, 0.66], [0.42, 0.53], [0.55, 0.46], [0.59, 0.35], [0.75, 0.24], [0.90, 0.08]],
      [[0.42, 0.53], [0.34, 0.49], [0.25, 0.51]]
    ];

    for (var rIdx = 0; rIdx < roadPaths.length; rIdx++) {
      var rp = roadPaths[rIdx];
      ctx.beginPath();
      for (var ptIdx = 0; ptIdx < rp.length; ptIdx++) {
        if (ptIdx === 0) ctx.moveTo(rp[ptIdx][0] * W, rp[ptIdx][1] * W);
        else ctx.lineTo(rp[ptIdx][0] * W, rp[ptIdx][1] * W);
      }
      ctx.strokeStyle = '#5c4b36';
      ctx.lineWidth = 82;
      ctx.stroke();

      ctx.strokeStyle = '#8c7353';
      ctx.lineWidth = 48;
      ctx.stroke();
    }
    ctx.restore();

    // 4. Rios Azuis
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = '#164e63';
    ctx.lineWidth = 96;
    ctx.beginPath();
    for (var s1 = 0; s1 < riverSegments.length; s1++) {
      ctx.moveTo(riverSegments[s1].ax, riverSegments[s1].ay);
      ctx.lineTo(riverSegments[s1].bx, riverSegments[s1].by);
    }
    ctx.stroke();

    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 74;
    ctx.beginPath();
    for (var s2 = 0; s2 < riverSegments.length; s2++) {
      ctx.moveTo(riverSegments[s2].ax, riverSegments[s2].ay);
      ctx.lineTo(riverSegments[s2].bx, riverSegments[s2].by);
    }
    ctx.stroke();

    ctx.strokeStyle = '#22d3ee';
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 34;
    ctx.beginPath();
    for (var s3 = 0; s3 < riverSegments.length; s3++) {
      ctx.moveTo(riverSegments[s3].ax, riverSegments[s3].ay);
      ctx.lineTo(riverSegments[s3].bx, riverSegments[s3].by);
    }
    ctx.stroke();
    ctx.restore();

    // 5. Pontes de Pedra sobre o rio
    for (var bIdx = 0; bIdx < bridges.length; bIdx++) {
      var b = bridges[bIdx];
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-62, -38, 124, 76);
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 5;
      ctx.strokeRect(-62, -38, 124, 76);
      ctx.restore();
    }

    // 6. Detalhes de grama e flores
    for (var i = 0; i < groundDetails.length; i++) {
      var d = groundDetails[i];
      if (d.x < camX - 30 || d.x > camX + viewW + 30 || d.y < camY - 30 || d.y > camY + viewH + 30) continue;
      if (d.type === 'grass') {
        ctx.strokeStyle = '#4d5e36';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.x - 4, d.y); ctx.lineTo(d.x - 6, d.y - 7 * d.scale);
        ctx.moveTo(d.x, d.y);     ctx.lineTo(d.x, d.y - 9 * d.scale);
        ctx.moveTo(d.x + 4, d.y); ctx.lineTo(d.x + 6, d.y - 6 * d.scale);
        ctx.stroke();
      } else {
        ctx.fillStyle = ['#fef08a', '#fda4af', '#bae6fd'][d.variant % 3];
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.4 * d.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Rótulos das regiões
    ctx.save();
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('⚔️ IRON BLOOD (Nv. 6–12)', W * 0.27, W * 0.45);
    ctx.fillStyle = 'rgba(125, 211, 252, 0.9)';
    ctx.fillText('☀️ DELPHINIAN FORTRESS (Spawn Luz)', W * 0.23, W * 0.83);
    ctx.fillStyle = 'rgba(253, 164, 175, 0.9)';
    ctx.fillText('🔥 PAROUTIAN FORTRESS (Spawn Fúria)', W * 0.75, W * 0.30);
    ctx.restore();
  }

  function drawSingleProp(ctx, p, now) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);

    if (p.kind === 'mountain') {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath(); ctx.ellipse(0, 12, 46, 16, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(-44, 12); ctx.lineTo(-14, -46); ctx.lineTo(18, -38); ctx.lineTo(44, 12);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.moveTo(-14, -46); ctx.lineTo(4, -18); ctx.lineTo(-26, 12); ctx.lineTo(-44, 12);
      ctx.closePath(); ctx.fill();
    } else if (p.kind === 'fortress_light' || p.kind === 'fortress_fury') {
      var isLight = p.kind === 'fortress_light';
      var bannerCol = isLight ? '#38bdf8' : '#f43f5e';
      var glowCol   = isLight ? 'rgba(56, 189, 248, 0.24)' : 'rgba(244, 63, 94, 0.24)';

      ctx.fillStyle = '#3f3b37';
      ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = bannerCol;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 122, 0, Math.PI * 2); ctx.stroke();

      var pulse = 1 + Math.sin(now) * 0.12;
      ctx.fillStyle = glowCol;
      ctx.beginPath(); ctx.arc(0, -10, 48 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = bannerCol;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -10, 30 * pulse, 0, Math.PI * 2); ctx.stroke();

      [-90, 90].forEach(function (tx) {
        ctx.fillStyle = '#57534e';
        ctx.fillRect(tx - 16, -54, 32, 58);
        ctx.fillStyle = bannerCol;
        ctx.fillRect(tx - 6, -42, 12, 22);
      });
    } else if (p.kind === 'red_tower') {
      var rPulse = 1 + Math.sin(now * 1.4) * 0.14;
      ctx.fillStyle = 'rgba(225, 29, 72, 0.25)';
      ctx.beginPath(); ctx.arc(0, 0, 88 * rPulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 68, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.moveTo(-22, 10); ctx.lineTo(-12, -68); ctx.lineTo(0, -84); ctx.lineTo(12, -68); ctx.lineTo(22, 10);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fb7185';
      ctx.beginPath(); ctx.arc(0, -54, 7 * rPulse, 0, Math.PI * 2); ctx.fill();

      ctx.font = 'bold 12px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fda4af';
      ctx.fillText('🩸 ALTAR DO BOSS MUNDIAL (Nv. 15)', 0, -94);
    } else if (p.kind === 'watchtower') {
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-14, -44, 28, 48);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(-18, -50, 36, 8);
    } else if (p.kind === 'tree') {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath(); ctx.ellipse(4, 8, 34, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#452718';
      ctx.fillRect(-7, -26, 14, 30);
      ctx.fillStyle = '#2d4a22';
      ctx.beginPath(); ctx.arc(-15, -42, 22, 0, Math.PI * 2); ctx.arc(15, -42, 22, 0, Math.PI * 2); ctx.arc(0, -56, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4d7c2c';
      ctx.beginPath(); ctx.arc(-10, -48, 18, 0, Math.PI * 2); ctx.arc(10, -48, 18, 0, Math.PI * 2); ctx.arc(0, -62, 22, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'rock') {
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath(); ctx.ellipse(2, 6, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#57534e';
      ctx.beginPath(); ctx.moveTo(-22, 4); ctx.lineTo(-14, -18); ctx.lineTo(6, -22); ctx.lineTo(22, -10); ctx.lineTo(20, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4d7c2c';
      ctx.beginPath(); ctx.ellipse(-2, -14, 10, 4, -0.2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  function renderPropsLayer(ctx, camX, camY, viewW, viewH, isFury, splitY, layer) {
    ensureBuilt();
    var now = performance.now() * 0.004;
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (layer === 'back' && p.y > splitY) continue;
      if (layer === 'front' && p.y <= splitY) continue;
      if (p.x < camX - 180 || p.x > camX + viewW + 180 || p.y < camY - 180 || p.y > camY + viewH + 180) continue;
      drawSingleProp(ctx, p, now);
    }
  }

  return {
    renderGround: renderGround,
    renderPropsLayer: renderPropsLayer,
    resolveCollision: resolveCollision,
    getFactionSpawn: getFactionSpawn,
    getRedTowerPos: getRedTowerPos,
    getZoneLevelAt: getZoneLevelAt,
    isInWater: isInWater
  };
})();
