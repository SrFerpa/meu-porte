// BANCO DE DADOS DE MOBS, MINI-BOSSES E BOSSES (COM DROPS DE XP E GOLD)
const SHAIYA_MOBS = [
  // Mobs Normais (Início do Jogo)
  { id: 'goblin_vigia', name: 'Goblin Vigia', level: 1, rank: 'NORMAL', hp: 80, maxHp: 80, atk: 12, def: 5, xp: 25, gold: 15, dropRate: 0.3, icon: '👺' },
  { id: 'lobo_selvagem', name: 'Lobo Cinzento', level: 3, rank: 'NORMAL', hp: 140, maxHp: 140, atk: 18, def: 8, xp: 45, gold: 28, dropRate: 0.35, icon: '🐺' },
  { id: 'esqueleto_guerreiro', name: 'Esqueleto Errante', level: 6, rank: 'NORMAL', hp: 220, maxHp: 220, atk: 27, def: 14, xp: 80, gold: 50, dropRate: 0.4, icon: '💀' },

  // Mini-Bosses
  { id: 'capitao_goblin', name: 'Capitão Goblin Zark', level: 10, rank: 'MINI-BOSS', hp: 650, maxHp: 650, atk: 55, def: 30, xp: 350, gold: 250, dropRate: 0.75, icon: '👹' },
  { id: 'lider_bandido', name: 'Líder dos Mercenários', level: 15, rank: 'MINI-BOSS', hp: 1100, maxHp: 1100, atk: 85, def: 45, xp: 700, gold: 520, dropRate: 0.85, icon: '🗡️' },

  // Boss Principal
  { id: 'dragon_teos', name: 'Dragão Guardião de Teos (Boss)', level: 25, rank: 'BOSS', hp: 4500, maxHp: 4500, atk: 150, def: 90, xp: 3500, gold: 2500, dropRate: 1.0, icon: '🐉' }
];
