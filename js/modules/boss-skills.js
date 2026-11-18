// ================= MÓDULO: HABILIDADES DE BOSSES (TELEGRAPHS) & DEBUFFS =================
var BossSkillsModule = (function () {
  var activeTelegraphs = [];
  var debuffTickTimer = 0;

  // Catálogo de habilidades especiais por elemento/nome do Boss
  var BOSS_ABILITY_DB = {
    fire: {
      name: '☄️ Chuva de Meteoros',
      radius: 85,
      castTime: 1.65,
      mult: 1.85,
      count: 3,
      color: '#f97316',
      debuff: { id: 'debuff_bleed', label: '🩸 Sangramento', dur: 5.0, isDebuff: true }
    },
    water: {
      name: '❄️ Tempestade Glacial',
      radius: 135,
      castTime: 1.85,
      mult: 1.65,
      count: 1,
      color: '#38bdf8',
      debuff: { id: 'debuff_slow', label: '❄️ Lentidão (-45%)', dur: 4.5, isDebuff: true }
    },
    earth: {
      name: '🌋 Terremoto Sísmico',
      radius: 155,
      castTime: 1.75,
      mult: 1.95,
      count: 1,
      selfCentered: true,
      color: '#eab308',
      debuff: { id: 'debuff_stun', label: '💫 Atordoado', dur: 1.5, isDebuff: true }
    },
    wind: {
      name: '🌪️ Prisão Silenciadora',
      radius: 110,
      castTime: 1.55,
      mult: 1.55,
      count: 2,
      color: '#a855f7',
      debuff: { id: 'debuff_silence', label: '🔇 Silenciado', dur: 3.2, isDebuff: true }
    },
    none: {
      name: '💀 Explosão Abissal',
      radius: 125,
      castTime: 1.70,
      mult: 1.75,
      count: 1,
      color: '#ef4444',
      debuff: { id: 'debuff_bleed', label: '🩸 Sangramento', dur: 4.0, isDebuff: true }
    }
  };

  function hasDebuff(debuffId) {
    if (!player || !player.buffs) return false;
    return player.buffs.some(function (b) { return b.id === debuffId && b.timer > 0; });
  }

  function applyDebuffToPlayer(debuffTpl) {
    if (!debuffTpl || !player) return;
    player.buffs = player.buffs.filter(function (b) { return b.id !== debuffTpl.id; });
    player.buffs.push({
      id: debuffTpl.id,
      label: debuffTpl.label,
      timer: debuffTpl.dur,
      isDebuff: true
    });
    addFloatingText(player.x, player.y - 54, debuffTpl.label + '!', '#fb7185');
  }

  function triggerBossSpecial(m) {
    var elemKey = BOSS_ABILITY_DB[m.elem] ? m.elem : 'none';
    var sk = BOSS_ABILITY_DB[elemKey];

    m.specialCd = m.tier === 'boss' ? 7.5 : 10.5;
    m.castingSkillName = sk.name;
    m.castingTimer = sk.castTime;
    m.animState = 'attack';
    m.animFrame = 0;

    addFloatingText(m.x, m.y - 68, sk.name + '!', sk.color);

    var totalZones = sk.count || 1;
    for (var i = 0; i < totalZones; i++) {
      var tx = sk.selfCentered ? m.x : player.x;
      var ty = sk.selfCentered ? m.y : player.y;

      if (i > 0) {
        var ang = (Math.PI * 2 * i) / totalZones + Math.random() * 0.6;
        var spread = 95 + Math.random() * 65;
        tx += Math.cos(ang) * spread;
        ty += Math.sin(ang) * spread;
      }

      activeTelegraphs.push({
        bossId: m.id,
        bossName: m.name,
        bossAtk: m.atk,
        bossElem: m.elem || 'none',
        skillName: sk.name,
        x: tx,
        y: ty,
        radius: sk.radius,
        elapsed: 0,
        duration: sk.castTime,
        mult: sk.mult,
        color: sk.color,
        debuff: sk.debuff
      });
    }
  }

  function resolveTelegraphImpact(tg) {
    // Efeito visual explosivo no impacto
    vfxList.push({
      x: tg.x,
      y: tg.y,
      r: 18,
      maxR: tg.radius + 25,
      color: tg.color,
      vfxType: tg.bossElem === 'water' ? 'glacial' : 'ring',
      alpha: 1.0
    });

    if (!player || player.hp <= 0) return;

    var dist = Math.hypot(player.x - tg.x, player.y - tg.y);
    if (dist <= tg.radius) {
      var st = getPlayerDerivedStats();
      var eMult = getElementMultiplier(tg.bossElem, st.defElem);
      var rawDmg = Math.max(8, Math.round((tg.bossAtk * tg.mult - st.physDef * 0.35) * eMult) - st.absDamage);

      player.hp -= rawDmg;
      triggerPlayerAnim('hurt', 0.35);
      addFloatingText(player.x, player.y - 40, '💥 -' + rawDmg + ' (' + tg.skillName + ')', '#f43f5e');

      if (tg.debuff) {
        applyDebuffToPlayer(tg.debuff);
      }

      if (player.hp <= 0) {
        handlePlayerExtremeDeath();
      }
    } else if (dist <= tg.radius + 55) {
      addFloatingText(player.x, player.y - 36, '✨ Desviou!', '#34d399');
    }
  }

  // Atualizado a cada frame dentro de updateSimulation(dt)
  function update(dt) {
    if (!player || player.hp <= 0) return;

    // 1. Verifica Bosses e Minibosses prontos para usar habilidades especiais
    monsters.forEach(function (m) {
      if (m.hp <= 0) return;
      if (m.tier !== 'boss' && m.tier !== 'miniboss') return;

      if (typeof m.specialCd === 'undefined') {
        m.specialCd = 3.5 + Math.random() * 2.5;
      }

      if (m.castingTimer > 0) {
        m.castingTimer -= dt;
        if (m.castingTimer <= 0) {
          m.castingSkillName = null;
        }
      }

      if (m.stunTimer > 0) return;

      var dPlayer = Math.hypot(player.x - m.x, player.y - m.y);
      if (dPlayer < 340) {
        m.specialCd -= dt;
        if (m.specialCd <= 0) {
          triggerBossSpecial(m);
        }
      }
    });

    // 2. Atualiza círculos de aviso (Telegraphs) no chão
    for (var i = activeTelegraphs.length - 1; i >= 0; i--) {
      var tg = activeTelegraphs[i];
      tg.elapsed += dt;
      if (tg.elapsed >= tg.duration) {
        resolveTelegraphImpact(tg);
        activeTelegraphs.splice(i, 1);
      }
    }

    // 3. Dano periódico de Sangramento (Bleed) no jogador
    if (hasDebuff('debuff_bleed')) {
      debuffTickTimer += dt;
      if (debuffTickTimer >= 1.0) {
        debuffTickTimer = 0;
        var st = getPlayerDerivedStats();
        var bleedDmg = Math.max(3, Math.round(st.maxHp * 0.03));
        player.hp -= bleedDmg;
        addFloatingText(player.x, player.y - 30, '🩸 -' + bleedDmg, '#fb7185');
        if (player.hp <= 0) handlePlayerExtremeDeath();
      }
    } else {
      debuffTickTimer = 0;
    }

    // 4. Atualiza barra de aviso de cast no HUD do alvo selecionado
    var castEl = document.getElementById('target-cast-txt');
    if (castEl) {
      var sel = getSelectedTarget();
      if (sel && sel.castingTimer > 0 && sel.castingSkillName) {
        castEl.style.display = 'block';
        castEl.textContent = '⚠️ CONJURANDO: ' + sel.castingSkillName + ' (' + sel.castingTimer.toFixed(1) + 's)';
      } else {
        castEl.style.display = 'none';
      }
    }
  }

  // Desenha os círculos de perigo no chão antes dos monstros/jogador
  function renderGroundTelegraphs(ctx) {
    activeTelegraphs.forEach(function (tg) {
      var progress = Math.min(1, tg.elapsed / tg.duration);
      ctx.save();

      // Borda externa fixa do alcance do ataque
      ctx.strokeStyle = tg.color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fundo translúcido
      ctx.fillStyle = tg.color;
      ctx.globalAlpha = 0.14 + progress * 0.18;
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.radius, 0, Math.PI * 2);
      ctx.fill();

      // Círculo interno que cresce até completar a borda (indica o momento exato do impacto)
      ctx.globalAlpha = 0.35 + progress * 0.25;
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.radius * progress, 0, Math.PI * 2);
      ctx.fill();

      // Nome da habilidade no centro do aviso
      ctx.globalAlpha = 0.95;
      ctx.font = 'bold 11px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(tg.skillName, tg.x, tg.y + 4);

      ctx.restore();
    });
  }

  function clearAll() {
    activeTelegraphs = [];
  }

  return {
    update: update,
    renderGroundTelegraphs: renderGroundTelegraphs,
    hasDebuff: hasDebuff,
    clearAll: clearAll
  };
})();
