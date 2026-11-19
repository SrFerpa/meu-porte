// ================= MÓDULO: CENÁRIO 2.5D DO MAPA 1 (FLORESTA DE ERINA / IRIS) =================
var WorldSceneryModule = (function () {
  var initialized = false;
  var props = [];       // Árvores, rochas, arbustos e lanternas
  var groundDetails = []; // Tufos de grama, flores e pedrinhas no solo
  var roadNodes = [];     // Pontos da estrada principal

  // Gerador pseudoaleatório determinístico (mantém o mapa sempre igual)
  function createSeededRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function isPointOnRoad(x, y, margin) {
    var half = WORLD_SIZE / 2;
    // Estrada horizontal principal e vertical principal cruzando a praça central
    var distCenter = Math.hypot(x - half, y - half);
    if (distCenter < 210 + margin) return true;

    // Estrada leste-oeste com leve ondulação
    var waveY = half + Math.sin(x * 0.0028) * 140;
    if (Math.abs(y - waveY) < 68 + margin) return true;

    // Estrada norte-sul com leve ondulação
    var waveX = half + Math.cos(y * 0.0028) * 140;
    if (Math.abs(x - waveX) < 68 + margin) return true;

    return false;
  }

  function init() {
    if (initialized || typeof WORLD_SIZE === 'undefined') return;
    initialized = true;

    var rand = createSeededRandom(202605);
    var half = WORLD_SIZE / 2;

    // 1. Detalhes leves no chão (flores, tufos de grama, folhas caídas)
    for (var i = 0; i < 650; i++) {
      var gx = 80 + rand() * (WORLD_SIZE - 160);
      var gy = 80 + rand() * (WORLD_SIZE - 160);
      if (isPointOnRoad(gx, gy, -10)) continue;

      var rType = rand();
      groundDetails.push({
        x: gx,
        y: gy,
        type: rType < 0.62 ? 'grass' : (rType < 0.88 ? 'flower' : 'pebble'),
        scale: 0.75 + rand() * 0.6,
        variant: Math.floor(rand() * 3)
      });
    }

    // 2. Árvores, rochas e arbustos (evitando estradas e a praça central de spawn)
    for (var j = 0; j < 210; j++) {
      var px = 110 + rand() * (WORLD_SIZE - 220);
      var py = 110 + rand() * (WORLD_SIZE - 220);

      // Mantém estradas e praça central livres
      if (isPointOnRoad(px, py, 36)) continue;

      // Evita sobreposição muito próxima entre árvores
      var tooClose = false;
      for (var k = 0; k < props.length; k++) {
        if (Math.hypot(props[k].x - px, props[k].y - py) < 78) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      var pRoll = rand();
      var kind = 'tree';
      if (pRoll > 0.78) kind = 'rock';
      else if (pRoll > 0.62) kind = 'bush';

      props.push({
        x: px,
        y: py,
        kind: kind,
        scale: 0.85 + rand() * 0.48,
        variant: Math.floor(rand() * 3)
      });
    }

    // 3. Tochas/Lanternas de pedra ao redor da Praça Central (Ponto Seguro)
    var campAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    campAngles.forEach(function (ang) {
      props.push({
        x: half + Math.cos(ang) * 185,
        y: half + Math.sin(ang) * 185,
        kind: 'lantern',
        scale: 1.0,
        variant: 0
      });
    });

    // Ordena por Y para profundidade 2.5D correta
    props.sort(function (a, b) { return a.y - b.y; });
  }

  function renderGround(ctx, camX, camY, viewW, viewH, isFury) {
    init();
    var half = WORLD_SIZE / 2;

    // 1. Base de grama do Mapa 1 (Erina = Verde Floresta | Iris = Verde Musgo Crepuscular)
    ctx.fillStyle = isFury ? '#141f18' : '#132a1c';
    ctx.fillRect(camX, camY, viewW, viewH);

    // 2. Manchas orgânicas de variação de grama (tiles grandes suaves)
    var tile = 240;
    var startX = Math.floor(camX / tile) * tile;
    var startY = Math.floor(camY / tile) * tile;

    for (var tx = startX; tx < camX + viewW + tile; tx += tile) {
      for (var ty = startY; ty < camY + viewH + tile; ty += tile) {
        var hash = Math.abs(Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453) % 1;
        if (hash > 0.45) {
          ctx.fillStyle = isFury ? 'rgba(30, 48, 34, 0.45)' : 'rgba(26, 61, 39, 0.52)';
          ctx.beginPath();
          ctx.ellipse(tx + 120, ty + 120, 130, 95, hash * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Estradas de Terra Batida (Eixo Leste-Oeste e Norte-Sul)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Borda externa da estrada (grama pisoteada)
    ctx.strokeStyle = isFury ? '#2b241d' : '#362d22';
    ctx.lineWidth = 136;
    drawRoadsPath(ctx, half);
    ctx.stroke();

    // Miolo da estrada de terra
    ctx.strokeStyle = isFury ? '#3d3126' : '#4d3e2e';
    ctx.lineWidth = 104;
    drawRoadsPath(ctx, half);
    ctx.stroke();

    // Trilha central mais clara
    ctx.strokeStyle = isFury ? '#4a3b2e' : '#5e4c38';
    ctx.lineWidth = 54;
    drawRoadsPath(ctx, half);
    ctx.stroke();

    // Praça Central de Pedra (Ponto de Encontro do Mapa 1)
    ctx.fillStyle = isFury ? '#332d2b' : '#3f3b37';
    ctx.beginPath();
    ctx.arc(half, half, 195, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isFury ? '#574944' : '#6b635b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(half, half, 175, 0, Math.PI * 2);
    ctx.stroke();

    // Emblema sutil no centro da praça
    ctx.strokeStyle = isFury ? 'rgba(244, 63, 94, 0.25)' : 'rgba(250, 204, 21, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half, half, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Detalhes de vegetação rasteira (somente dentro da câmera)
    for (var i = 0; i < groundDetails.length; i++) {
      var d = groundDetails[i];
      if (d.x < camX - 40 || d.x > camX + viewW + 40 || d.y < camY - 40 || d.y > camY + viewH + 40) continue;

      if (d.type === 'grass') {
        ctx.strokeStyle = isFury ? '#2d4a36' : '#2f6e44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.x - 4, d.y);
        ctx.lineTo(d.x - 7, d.y - 8 * d.scale);
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y - 10 * d.scale);
        ctx.moveTo(d.x + 4, d.y);
        ctx.lineTo(d.x + 7, d.y - 7 * d.scale);
        ctx.stroke();
      } else if (d.type === 'flower') {
        var fColors = isFury
          ? ['#fb7185', '#c084fc', '#fbbf24']
          : ['#fef08a', '#f8fafc', '#60a5fa'];
        ctx.fillStyle = fColors[d.variant % fColors.length];
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.6 * d.scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, 4.5 * d.scale, 2.8 * d.scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Muralha/Cerca natural da borda do Mapa 1
    ctx.strokeStyle = isFury ? '#4c1d24' : '#3f6212';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, WORLD_SIZE - 80, WORLD_SIZE - 80);
  }

  function drawRoadsPath(ctx, half) {
    ctx.beginPath();
    // Estrada Horizontal
    for (var x = 60; x <= WORLD_SIZE - 60; x += 80) {
      var wy = half + Math.sin(x * 0.0028) * 140;
      if (x === 60) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    // Estrada Vertical
    for (var y = 60; y <= WORLD_SIZE - 60; y += 80) {
      var wx = half + Math.cos(y * 0.0028) * 140;
      if (y === 60) ctx.moveTo(wx, y);
      else ctx.lineTo(wx, y);
    }
  }

  function renderProps(ctx, camX, camY, viewW, viewH, isFury) {
    init();
    var now = performance.now() * 0.004;

    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (p.x < camX - 130 || p.x > camX + viewW + 130 || p.y < camY - 160 || p.y > camY + viewH + 120) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      if (p.kind === 'tree') {
        // Sombra no chão
        ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
        ctx.beginPath();
        ctx.ellipse(4, 8, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tronco
        ctx.fillStyle = '#452718';
        ctx.fillRect(-7, -26, 14, 30);
        ctx.fillStyle = '#2e180e';
        ctx.fillRect(1, -26, 6, 30);

        // Copa em 3 camadas 2.5D
        var cDark  = isFury ? '#1a3326' : '#14532d';
        var cMid   = isFury ? '#264d38' : '#166534';
        var cLight = isFury ? '#3b7352' : '#22c55e';

        ctx.fillStyle = cDark;
        ctx.beginPath();
        ctx.arc(-16, -42, 24, 0, Math.PI * 2);
        ctx.arc(16, -42, 24, 0, Math.PI * 2);
        ctx.arc(0, -56, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cMid;
        ctx.beginPath();
        ctx.arc(-11, -48, 20, 0, Math.PI * 2);
        ctx.arc(11, -48, 20, 0, Math.PI * 2);
        ctx.arc(0, -64, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cLight;
        ctx.globalAlpha = 0.72;
        ctx.beginPath();
        ctx.arc(-6, -68, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'rock') {
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(2, 6, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo da rocha
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.moveTo(-22, 4);
        ctx.lineTo(-16, -16);
        ctx.lineTo(2, -22);
        ctx.lineTo(20, -12);
        ctx.lineTo(22, 4);
        ctx.closePath();
        ctx.fill();

        // Luz e musgo no topo
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.moveTo(-14, -14);
        ctx.lineTo(2, -20);
        ctx.lineTo(12, -10);
        ctx.lineTo(-4, -6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = isFury ? '#2d523c' : '#3f7d4c';
        ctx.beginPath();
        ctx.ellipse(-2, -15, 11, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'bush') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isFury ? '#1f422f' : '#15803d';
        ctx.beginPath();
        ctx.arc(-8, -4, 11, 0, Math.PI * 2);
        ctx.arc(8, -4, 11, 0, Math.PI * 2);
        ctx.arc(0, -10, 13, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'lantern') {
        // Pilar de pedra com chama da facção
        ctx.fillStyle = '#44403c';
        ctx.fillRect(-6, -26, 12, 28);
        ctx.fillStyle = '#292524';
        ctx.fillRect(-9, -30, 18, 5);

        var pulse = 1 + Math.sin(now + p.x) * 0.15;
        var flameCol = isFury ? '#f43f5e' : '#fbbf24';
        ctx.fillStyle = flameCol;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(0, -38, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(0, -37, 6 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  return {
    renderGround: renderGround,
    renderProps: renderProps
  };
})();
