function spawnOneMonster(seedIdx) {
  var db = (typeof MONSTER_POOL !== 'undefined' && MONSTER_POOL.length) ? MONSTER_POOL : [];
  if (db.length === 0) return;

  var tpl = db[seedIdx % db.length];
  var mx = 280 + Math.random() * (WORLD_SIZE - 560);
  var my = 280 + Math.random() * (WORLD_SIZE - 560);
  if (Math.hypot(mx - player.x, my - player.y) < 260) mx += 340;

  var scale = 1 + Math.max(0, player.lvl - 1) * 0.14;
  monsters.push({
    id: 'mob_' + Math.random().toString(36).slice(2, 9),
    name: tpl.name,
    kind: tpl.kind || 'mob',
    icon: tpl.icon || '👹',
    tier: tpl.tier || 'normal',
    lvl: Math.max(tpl.lvl || tpl.baseLvl || 1, player.lvl + (tpl.tier === 'boss' ? 2 : 0)),
    hp: Math.round(tpl.hp * scale),
    maxHp: Math.round(tpl.hp * scale),
    atk: Math.round(tpl.atk * scale),
    def: Math.round((tpl.def || 6) * scale),
    xp: Math.round(tpl.xp * scale),
    gold: Math.round(tpl.gold * scale),
    killsGain: tpl.killsGain || 1,
    visualScale: tpl.scale || 1.0,
    elem: tpl.elem || 'none',
    color: tpl.color || '#ef4444',
    debuff: tpl.debuff || null,
    bossSkillType: tpl.bossSkillType || null,
    x: mx, y: my,
    homeX: mx, homeY: my,
    facing: 1,
    animState: 'idle',
    animFrame: 0,
    animTimer: 0,
    atkCd: 0,
    bossSkillCd: 4.5,
    stunTimer: 0,
    dotTimer: 0,
    dotDmg: 0
  });
}
