// BANCO DE DADOS DE ITENS, ARMAS, SETS DEUSA E LOJA FAWKES
const SHAIYA_ITEMS = {
  // Sets Deusa e Armas principais
  equipments: [
    { id: 'set_deusa_guerreiro', name: 'Set Deusa da Fúria (Completo)', type: 'armor', rarity: 'deusa', classReq: ['lutador', 'guerreiro'], stats: { str: 45, rec: 40, hp: 1200 }, desc: 'O lendário set divino das deusas para guerreiros.' },
    { id: 'set_deusa_defensor', name: 'Set Deusa da Muralha (Completo)', type: 'armor', rarity: 'deusa', classReq: ['defensor', 'guardiao'], stats: { rec: 60, str: 25, hp: 1800 }, desc: 'Armadura pesada indestrutível.' },
    { id: 'set_deusa_patrulheiro', name: 'Set Deusa das Sombras (Completo)', type: 'armor', rarity: 'deusa', classReq: ['patrulheiro', 'assassino'], stats: { dex: 50, luk: 40, atk: 150 }, desc: 'Leveza e letalidade suprema.' },
    { id: 'set_deusa_arqueiro', name: 'Set Deusa do Horizonte (Completo)', type: 'armor', rarity: 'deusa', classReq: ['arqueiro', 'cacador'], stats: { dex: 45, luk: 45, atk: 140 }, desc: 'Foco em precisão e dano crítico.' },
    { id: 'set_deusa_mago', name: 'Set Deusa dos Elementos (Completo)', type: 'armor', rarity: 'deusa', classReq: ['mago', 'pagao'], stats: { int: 60, wis: 35, mp: 1500 }, desc: 'Mantos arcanos de poder absoluto.' },
    { id: 'set_deusa_sacerdote', name: 'Set Deusa da Luz/Lua (Completo)', type: 'armor', rarity: 'deusa', classReq: ['sacerdote', 'oraculo'], stats: { wis: 60, int: 40, mp: 1600 }, desc: 'Bênçãos divinas canalizadas.' },
    
    // Armas Lendárias
    { id: 'arma_deusa_1', name: 'Espada Lendária de Etain', type: 'weapon', rarity: 'deusa', atkBonus: 350, desc: 'Espada sagrada com o poder da luz e trevas.' },
    { id: 'arma_deusa_2', name: 'Cajado Arcano Primordial', type: 'weapon', rarity: 'deusa', matkBonus: 400, desc: 'Cajado capaz de rasgar a realidade.' }
  ],

  // Lapis e Elementos
  lapis: [
    { id: 'lapis_str_6', name: 'Lapis de Força Nível 6 (STR)', type: 'lapis', stat: 'str', value: 30, desc: 'Insere +30 de Força no equipamento.' },
    { id: 'lapis_dex_6', name: 'Lapis de Destreza Nível 6 (DEX)', type: 'lapis', stat: 'dex', value: 30, desc: 'Insere +30 de Destreza no equipamento.' },
    { id: 'lapis_rec_6', name: 'Lapis de Resistência Nível 6 (REC)', type: 'lapis', stat: 'rec', value: 30, desc: 'Insere +30 de Resistência no equipamento.' },
    { id: 'lapis_int_6', name: 'Lapis de Inteligência Nível 6 (INT)', type: 'lapis', stat: 'int', value: 30, desc: 'Insere +30 de Inteligência no equipamento.' }
  ],

  // Loja Exclusiva Fawkes (Itens Exclusivos)
  shopExclusives: [
    { id: 'item_elemento_2', name: 'Elemento 2 (Encantamento Supremo)', price: 1200, type: 'special', desc: 'Concede bônus elemental avançado às armas e armaduras.' },
    { id: 'item_sonico', name: 'Poção Sônica (Velocidade de Ataque +50%)', price: 800, type: 'buff', desc: 'Acelera drasticamente os ataques por 15 minutos.' },
    { id: 'item_veloz', name: 'Elixir Veloz (Velocidade de Movimento +80%)', price: 750, type: 'buff', desc: 'Permite voar pelo mapa em velocidade máxima.' },
    { id: 'pack_deusa_completo', name: 'Pack Set & Arma Deusa (Escolha da Classe)', price: 3500, type: 'bundle', desc: 'Contém o set completo Deusa + Arma sagrada tier máximo.' },
    { id: 'montaria_fawkes', name: 'Montaria Épica Fawkes (Dragão de Teos)', price: 2500, type: 'mount', desc: 'Montaria exclusiva com bônus de movimento e status.' }
  ]
};
