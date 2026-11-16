// ================= BANCO DE DADOS DE MOBS, MINI-BOSSES E BOSSES DO SHAIYA =================
var MONSTER_POOL = [
  // Mobs Iniciais (Nível 1 a 4)
  {
    name: 'Raposa Selvagem de Erina', kind: 'fox', lvl: 1, hp: 65, atk: 8, elem: 'wind',
    xp: 18, gold: 12, killsGain: 1, scale: 0.92, tier: 'normal'
  },
  {
    name: 'Javali Presa-de-Ferro', kind: 'boar', lvl: 2, hp: 85, atk: 11, elem: 'earth',
    xp: 26, gold: 18, killsGain: 1, scale: 0.98, tier: 'normal'
  },
  {
    name: 'Lobisomem Sanguinário', kind: 'wolf', lvl: 4, hp: 115, atk: 14, elem: 'wind',
    xp: 38, gold: 25, killsGain: 1, scale: 1.05, tier: 'normal',
    debuff: { id: 'bleed', label: '🩸 Sangramento', dur: 5.0, chance: 0.45, dotDmg: 6 }
  },

  // Mobs Intermediários com Debuffs Clássicos (Nível 6 a 11)
  {
    name: 'Aranha Venenosa de Keolloseu', kind: 'spider', lvl: 6, hp: 150, atk: 18, elem: 'earth',
    xp: 55, gold: 34, killsGain: 1, scale: 1.06, tier: 'normal',
    debuff: { id: 'slow', label: '🕸️ Teia & Veneno', dur: 4.5, chance: 0.50, dotDmg: 5 }
  },
  {
    name: 'Espectro Amaldiçoado', kind: 'ghost', lvl: 8, hp: 190, atk: 22, elem: 'water',
    xp: 78, gold: 46, killsGain: 1, scale: 1.12, tier: 'normal',
    debuff: { id: 'curse_def', label: '💀 Maldição (-35% DEF)', dur: 6.0, chance: 0.48 }
  },
  {
    name: 'Cultista de Etain', kind: 'cultist', lvl: 10, hp: 230, atk: 26, elem: 'fire',
    xp: 98, gold: 60, killsGain: 1, scale: 1.15, tier: 'normal',
    debuff: { id: 'curse_atk', label: '🔇 Silêncio (-28% ATQ)', dur: 5.5, chance: 0.45 }
  },
  {
    name: 'Guardião Esqueleto de Cornwell', kind: 'skeleton', lvl: 11, hp: 265, atk: 30, elem: 'earth',
    xp: 115, gold: 72, killsGain: 1, scale: 1.18, tier: 'normal',
    debuff: { id: 'bleed', label: '🩸 Corte Profundo', dur: 5.0, chance: 0.45, dotDmg: 8 }
  },

  // Mini-Bosses (Nível 13 a 14)
  {
    name: 'Golem de Obsidiana (Mini-Boss)', kind: 'golem', lvl: 13, hp: 540, atk: 36, elem: 'earth',
    xp: 230, gold: 185, killsGain: 1, scale: 1.42, tier: 'miniboss',
    bossSkillType: 'quake'
  },
  {
    name: 'Capitao Sombrio de Argilla (Mini-Boss)', kind: 'captain', lvl: 14, hp: 620, atk: 40, elem: 'wind',
    xp: 270, gold: 215, killsGain: 1, scale: 1.46, tier: 'miniboss',
    bossSkillType: 'quake'
  },

  // Bosses Épicos com Skills Dinâmicas (Nível 16 a 20)
  {
    name: 'Dios Exiel (BOSS)', kind: 'dios', lvl: 16, hp: 980, atk: 48, elem: 'water',
    xp: 540, gold: 460, killsGain: 1, scale: 1.65, tier: 'boss',
    bossSkillType: 'frost'
  },
  {
    name: 'Kimuraku Infernal (BOSS)', kind: 'kimuraku', lvl: 18, hp: 1180, atk: 54, elem: 'earth',
    xp: 640, gold: 540, killsGain: 1, scale: 1.70, tier: 'boss',
    bossSkillType: 'quake'
  },
  {
    name: 'Astaroth (BOSS)', kind: 'astaroth', lvl: 20, hp: 1380, atk: 62, elem: 'fire',
    xp: 780, gold: 680, killsGain: 1, scale: 1.78, tier: 'boss',
    bossSkillType: 'meteor'
  }
];
