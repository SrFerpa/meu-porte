// ================= MÓDULO: IA DE JOGADORES RIVAIS DA FACÇÃO OPOSTA (PVP) =================
var PvpRivalsModule = (function () {
  var MAX_RIVALS = 5;
  var spawnTimer = 2.0;

  var LIGHT_ARCHS = ['solar_guard', 'storm_valkyrie', 'telluric_colossus', 'crystal_seraph'];
  var FURY_ARCHS  = ['spectral_reaper', 'abyssal_scourge', 'royal_lich', 'glacial_lich'];

  var LIGHT_NAMES = ['Aurelion', 'LyraSolar', 'ValenLight', 'Seraphina', 'Kaelith', 'Solarius', 'Elowen', 'Thalion'];
  var FURY_NAMES  = ['Malakor', 'Vespera', 'DravenDark', 'Nyxia', 'ZarekFury', 'Morgath', 'KaelVail', 'Sylas'];

  var ELEM_POOL = ['fire', 'water', 'earth', 'wind'];

  function getEnemyFaction() {
    if (!player) return 'fury';
    return player.faction === 'fury' ? 'light' : 'fury';
  }

  function countActiveRivals() {
    if (!Array.isArray(monsters)) return 0;
    return monsters.filter(function (m) { return m.isPvpRival && m.hp > 0; }).length;
  }

  function spawnOneRival() {
    if (!player || typeof ARCHETYPES === 'undefined') return;

    var enemyFaction = getEnemyFaction();
    var archPool = enemyFaction === 'light' ? LIGHT_ARCHS : FURY_ARCHS;
    var namePool = enemyFaction === 'light' ? LIGHT_NAMES : FURY_NAMES;

    var archKey = archPool[Math.floor(Math.random() * archPool.length)];
    var arch = ARCHETYPES[archKey];
    if (!arch) return;

    var rivalLvl = Math.max(1, player.lvl + Math.floor(Math.random() * 3) - 1);
    var scale = 1 + Math.max(0, rivalLvl - 1) * 0.16;

    // Posição distante do jogador para não nascer em cima
    var rx = 320 + Math.random() * (WORLD_SIZE - 640);
    var ry = 320 + Math.random() * (WORLD_SIZE - 640);
    if (Math.hypot(rx - player.x, ry - player.y) < 380) {
      rx = Math.min(WORLD_SIZE - 260, Math.max(260, rx + 440));
    }

    var baseName = namePool[Math.floor(Math.random() * namePool.length)];
    var fakeKills = [0, 5, 65, 340, 1200, 5500, 12000][Math.floor(Math.random() * 7)];
    var elem = ELEM_POOL[Math.floor(Math.random() * ELEM_POOL.length)];

    monsters.push({
      id: 'pvp_' + Math.random().toString(36).slice(2, 9),
      isPvpRival: true,
      rivalFaction: enemyFaction,
      archKey: archKey,
      rivalKills: fakeKills,
      name: baseName + ' (' + getArchetypeDisplayName(archKey, enemyFaction) + ')',
      icon: arch.icon,
      tier: 'pvp',
      lvl: rivalLvl,
      hp: Math.round(480 * scale),
      maxHp: Math.round(480 * scale),
      atk: Math.round(32 * scale),
      def: Math.round(14 * scale),
      xp: Math.round(160 * scale),
      gold: Math.round(95 * scale),
      elem: elem,
      color: enemyFaction === 'light' ? '#38bdf8' : '#f43f5e',
      x: rx,
      y: ry,
      homeX: rx,
      homeY: ry,
      patrolX: rx + (Math.random() * 320 - 160),
      patrolY: ry + (Math.random() * 320 - 160),
      facing: 1,
      animState: 'idle',
      animFrame: 0,
      animTimer: 0,
      atkCd: 0.8,
      skillCd: 3.2,
      aggroRange: arch.range > 200 ? 380 : 320,
      combatRange: Math.max(54, Math.min(260, arch.range - 20))
    });
  }

  function executeRivalAttack(m, st, isSpecial) {
    var arch = ARCHETYPES[m.archKey];
    var sk = arch && arch.skills ? arch.skills[isSpecial ? 2 : 0] : null;
    var mult = isSpecial ? 1.55 : 1.0;

    m.animState = 'attack';
    m.animFrame = 0;

    // Dispara projétil ou VFX da classe do rival
    if (sk) {
      if (sk.proj || (arch && arch.range > 180)) {
        projectiles.push({
          x: m.x,
          y: m.y - 14,
          tx: player.x,
          ty: player.y - 14,
          color: sk.color,
          vfxType: sk.vfx || 'beam',
          life: 0.28
        });
      }
      vfxList.push({
        x: player.x,
        y: player.y,
        r: 14,
        maxR: isSpecial ? 85 : 55,
        color: sk.color,
        vfxType: sk.vfx || 'ring',
        alpha: 0.9
      });
    }

    if (Math.random() * 100 < st.evaChance) {
      addFloatingText(player.x, player.y - 36, '💨 Esquivou (PvP)!', '#34d399');
      return;
    }
    if (Math.random() * 100 < st.blockChance) {
      addFloatingText(player.x, player.y - 36, '🛡️ Bloqueado (PvP)!', '#fbbf24');
      return;
    }

    var eMult = getElementMultiplier(m.elem, st.defElem);
    var defStat = (arch && arch.atkStyle === 'magic') ? (st.magDef || st.physDef) : st.physDef;
    var dmgTaken = Math.max(4, Math.round((m.atk * mult - defStat * 0.42) * eMult) - st.absDamage);

    player.hp -= dmgTaken;
    triggerPlayerAnim('hurt', 0.30);

    var prefix = isSpecial && sk ? ('⚔️ ' + sk.name + ': -') : '⚔️ -';
    addFloatingText(player.x, player.y - 36, prefix + dmgTaken, '#fb7185');

    if (player.hp <= 0) {
      handlePlayerExtremeDeath();
    }
  }

  // Atualiza IA de patrulha, perseguição e combate dos rivais
  function update(dt) {
    if (!player || player.hp <= 0) return;

    // Mantém até MAX_RIVALS jogadores rivais ativos no mapa
    if (countActiveRivals() < MAX_RIVALS) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = 4.5;
        spawnOneRival();
      }
    }

    var st = getPlayerDerivedStats();

    monsters.forEach(function (m) {
      if (!m.isPvpRival || m.hp <= 0) return;
      if (m.stunTimer > 0) {
        m.stunTimer -= dt;
        return;
      }

      if (m.dotTimer > 0) {
        m.dotTimer -= dt;
        if (Math.random() < dt * 2) {
          applyDamageToMonster(m, m.dotDmg, false, 1.0, null);
        }
      }

      var dPlayer = Math.hypot(player.x - m.x, player.y - m.y);
      var isMoving = false;
      var moveSpd = 138;

      if (dPlayer <= m.aggroRange) {
        // Modo Combate PvP: aproxima até o alcance da classe e ataca
        m.facing = player.x >= m.x ? 1 : -1;
        if (dPlayer > m.combatRange) {
          isMoving = true;
          m.x += ((player.x - m.x) / dPlayer) * moveSpd * dt;
          m.y += ((player.y - m.y) / dPlayer) * moveSpd * dt;
        } else {
          m.atkCd -= dt;
          m.skillCd -= dt;

          if (m.skillCd <= 0) {
            m.skillCd = 5.2 + Math.random() * 2.0;
            m.atkCd = 1.4;
            executeRivalAttack(m, st, true);
          } else if (m.atkCd <= 0) {
            m.atkCd = 1.55;
            executeRivalAttack(m, st, false);
          }
        }
      } else {
        // Modo Patrulha livre pelo mapa
        var pdx = m.patrolX - m.x;
        var pdy = m.patrolY - m.y;
        var pDist = Math.hypot(pdx, pdy);
        if (pDist > 14) {
          isMoving = true;
          m.facing = pdx >= 0 ? 1 : -1;
          m.x += (pdx / pDist) * 85 * dt;
          m.y += (pdy / pDist) * 85 * dt;
        } else if (Math.random() < dt * 0.6) {
          m.patrolX = Math.max(180, Math.min(WORLD_SIZE - 180, m.x + (Math.random() * 440 - 220)));
          m.patrolY = Math.max(180, Math.min(WORLD_SIZE - 180, m.y + (Math.random() * 440 - 220)));
        }
      }

      // Atualiza frames de animação do sprite da classe
      if (m.animState !== 'attack') {
        m.animState = isMoving ? 'run' : 'idle';
      }
      m.animTimer = (m.animTimer || 0) + dt;
      if (m.animTimer >= 0.11) {
        m.animTimer = 0;
        m.animFrame = (m.animFrame || 0) + 1;
        if (m.animState === 'attack' && m.animFrame >= 6) {
          m.animState = 'idle';
        }
      }
    });
  }

  // Desenha um jogador rival com o sprite da sua classe, facção e patente de PvP
  function renderRival(ctx, m, isSelected) {
    if (isSelected) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 18, 28, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Aura de facção inimiga nos pés
    var facColor = m.rivalFaction === 'light' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(244, 63, 94, 0.35)';
    ctx.fillStyle = facColor;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 18, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    var drew = (typeof drawConfiguredSprite === 'function')
      ? drawConfiguredSprite(ctx, 'classes', m.archKey, m.animState || 'idle', m.animFrame || 0, m.x, m.y, m.facing || 1, m.color)
      : false;

    if (!drew) {
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '20px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(m.icon, m.x, m.y + 7);
    }

    var topY = drew ? -66 : -32;
    var facBadge = m.rivalFaction === 'light' ? '☀️ ' : '🔥 ';
    var label = facBadge + '[Nv.' + m.lvl + '] ' + m.name;

    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    var textW = ctx.measureText(label).width;

    if (typeof getKillRankInfo === 'function' && typeof drawShaiyaRankBadgeOnCanvas === 'function') {
      var rk = getKillRankInfo(m.rivalKills || 0);
      if (rk) {
        drawShaiyaRankBadgeOnCanvas(ctx, rk, m.x - textW / 2 - 4, m.y + topY - 4);
      }
    }

    ctx.fillStyle = m.rivalFaction === 'light' ? '#7dd3fc' : '#fda4af';
    ctx.fillText(label, m.x + 6, m.y + topY);

    // Barra de HP do jogador rival
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(m.x - 26, m.y + topY + 6, 52, 5);
    ctx.fillStyle = m.rivalFaction === 'light' ? '#0284c7' : '#e11d48';
    ctx.fillRect(m.x - 26, m.y + topY + 6, 52 * (m.hp / m.maxHp), 5);
  }

  return {
    update: update,
    renderRival: renderRival,
    spawnOneRival: spawnOneRival
  };
})();
