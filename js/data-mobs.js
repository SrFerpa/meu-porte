// ================= MOBS CLÁSSICOS DO SHAIYA COM DEBUFFS & BOSSES DINÂMICOS =================
var MONSTER_POOL = [
  {
    name: 'Lobisomem Sanguinário', kind: 'wolf', lvl: 3, hp: 110, atk: 14, elem: 'wind',
    xp: 35, gold: 24, killsGain: 1, scale: 1.05, tier: 'normal',
    debuff: { id: 'bleed', label: '🩸 Sangramento', dur: 5.0, chance: 0.45, dotDmg: 6 }
  },
  {
    name: 'Aranha Venenosa de Keolloseu', kind: 'spider', lvl: 5, hp: 140, atk: 17, elem: 'earth',
    xp: 50, gold: 32, killsGain: 1, scale: 1.05, tier: 'normal',
    debuff: { id: 'slow', label: '🕸️ Teia & Veneno', dur: 4.5, chance: 0.50, dotDmg: 5 }
  },
  {
    name: 'Espectro Amaldiçoado', kind: 'ghost', lvl: 8, hp: 185, atk: 22, elem: 'water',
    xp: 75, gold: 45, killsGain: 1, scale: 1.12, tier: 'normal',
    debuff: { id: 'curse_def', label: '💀 Maldição (-35% DEF)', dur: 6.0, chance: 0.48 }
  },
  {
    name: 'Cultista de Etain', kind: 'cultist', lvl: 10, hp: 220, atk: 26, elem: 'fire',
    xp: 95, gold: 58, killsGain: 1, scale: 1.15, tier: 'normal',
    debuff: { id: 'curse_atk', label: '🔇 Silêncio (-28% ATQ)', dur: 5.5, chance: 0.45 }
  },
  {
    name: 'Golem de Obsidiana (Mini-Boss)', kind: 'golem', lvl: 13, hp: 520, atk: 36, elem: 'earth',
    xp: 220, gold: 180, killsGain: 1, scale: 1.42, tier: 'miniboss',
    bossSkillType: 'quake'
  },
  {
    name: 'Dios Exiel (BOSS)', kind: 'dios', lvl: 16, hp: 960, atk: 48, elem: 'water',
    xp: 520, gold: 450, killsGain: 1, scale: 1.65, tier: 'boss',
    bossSkillType: 'frost'
  },
  {
    name: 'Astaroth (BOSS)', kind: 'astaroth', lvl: 18, hp: 1150, atk: 56, elem: 'fire',
    xp: 650, gold: 580, killsGain: 1, scale: 1.72, tier: 'boss',
    bossSkillType: 'meteor'
  }
];
