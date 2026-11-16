// BANCO DE DADOS DAS CLASSES DO SHAIYA (ADAPTADAS PARA PROJECT: SHAYENOR)
const SHAIYA_CLASSES = {
  // === ALIANÇA DA LUZ ===
  lutador: {
    id: 'lutador',
    name: 'Lutador',
    faction: 'Luz',
    role: 'Dano Físico / Berserker',
    icon: '⚔️',
    color: '#e03131',
    weaponType: 'Espada Pesada / Machados',
    desc: 'Mestre do combate corpo a corpo ofensivo. Sacrifica defesa para causar explosões devastadoras de dano crítico.',
    baseStats: { str: 16, dex: 12, rec: 10, int: 6, wis: 6, luk: 10 },
    skills: [
      { id: 'furia_carmesim', name: 'Fúria Carmesim', icon: '🔥', type: 'buff', cd: 12, cost: 15, desc: 'Aumenta o Ataque Físico em +35% por 10s.', effect: { atkMult: 1.35, duration: 10 } },
      { id: 'corte_brutal', name: 'Corte Brutal', icon: '🗡️', type: 'damage', cd: 3, cost: 10, power: 1.6, desc: 'Golpe pesado que causa 160% de dano físico.' },
      { id: 'impacto_sismico', name: 'Impacto Sísmico', icon: '💥', type: 'aoe', cd: 6, cost: 20, power: 1.4, desc: 'Golpeia o chão causando dano em área nos inimigos próximos.' },
      { id: 'quebra_escudo', name: 'Quebra-Armadura', icon: '🛡️', type: 'damage', cd: 5, cost: 15, power: 1.8, desc: 'Perfura a defesa do alvo causando 180% de dano.' },
      { id: 'sede_sangue', name: 'Sede de Sangue', icon: '🩸', type: 'drain', cd: 8, cost: 18, power: 1.5, desc: 'Causa 150% de dano e recupera 30% do dano em HP.' },
      { id: 'execucao_divina', name: 'Execução Suprema', icon: '⚡', type: 'damage', cd: 10, cost: 30, power: 2.8, desc: 'Golpe final devastador com 280% de dano físico.' }
    ]
  },

  defensor: {
    id: 'defensor',
    name: 'Defensor',
    faction: 'Luz',
    role: 'Tanque / Linha de Frente',
    icon: '🛡️',
    color: '#3b5bdb',
    weaponType: 'Espada & Escudo',
    desc: 'Muralha inabalável da Aliança. Alta resistência, provocação de chefes e escudos protetores.',
    baseStats: { str: 11, dex: 10, rec: 18, int: 6, wis: 8, luk: 7 },
    skills: [
      { id: 'bencao_titan', name: 'Égide do Titã', icon: '🔰', type: 'buff', cd: 15, cost: 20, desc: 'Aumenta a Defesa Física e Mágica em +50% por 12s.', effect: { defMult: 1.5, duration: 12 } },
      { id: 'golpe_escudo', name: 'Escudada Atordoante', icon: '🛡️', type: 'damage', cd: 4, cost: 10, power: 1.4, desc: 'Acerta o alvo com o escudo causando 140% de dano.' },
      { id: 'rugido_provocador', name: 'Rugido de Guerra', icon: '📢', type: 'aoe', cd: 6, cost: 15, power: 1.2, desc: 'Atrai todos os monstros próximos e causa dano leve.' },
      { id: 'muralha_ferro', name: 'Vigor Inabalável', icon: '❤️', type: 'heal', cd: 10, cost: 20, power: 0.35, desc: 'Restaura 35% do HP máximo imediatamente.' },
      { id: 'lamina_justica', name: 'Lâmina da Justiça', icon: '⚔️', type: 'damage', cd: 5, cost: 12, power: 1.65, desc: 'Ataque sagrado baseado em força e resistência.' },
      { id: 'juizo_final', name: 'Bastião Supremo', icon: '🏰', type: 'aoe', cd: 12, cost: 25, power: 2.1, desc: 'Onda de choque defensiva em todos os alvos ao redor.' }
    ]
  },

  patrulheiro: {
    id: 'patrulheiro',
    name: 'Patrulheiro',
    faction: 'Luz',
    role: 'Assassino / Evasão',
    icon: '🗡️',
    color: '#2f9e44',
    weaponType: 'Adagas / Garras',
    desc: 'Especialista em ataques furtivos, venenos mortais e altíssima taxa de esquiva e críticos.',
    baseStats: { str: 12, dex: 16, rec: 9, int: 6, wis: 6, luk: 11 },
    skills: [
      { id: 'passo_fantasma', name: 'Passo Fantasma', icon: '💨', type: 'buff', cd: 12, cost: 15, desc: 'Aumenta velocidade e crítico em +30% por 10s.', effect: { critBonus: 0.3, duration: 10 } },
      { id: 'punhalada_veneno', name: 'Lâmina Venenosa', icon: '☠️', type: 'damage', cd: 3, cost: 10, power: 1.55, desc: 'Ataque rápido infundido com toxina.' },
      { id: 'danca_laminas', name: 'Dança das Adagas', icon: '🌪️', type: 'aoe', cd: 6, cost: 18, power: 1.45, desc: 'Gira cortando todos os inimigos ao redor.' },
      { id: 'emboscada_letal', name: 'Emboscada Letal', icon: '🎯', type: 'damage', cd: 5, cost: 15, power: 2.0, desc: 'Golpe preciso com alto multiplicador de dano.' },
      { id: 'corte_garganta', name: 'Corte Silencioso', icon: '🩸', type: 'damage', cd: 7, cost: 20, power: 2.3, desc: 'Perfura pontos vitais causando 230% de dano.' },
      { id: 'chuva_punhais', name: 'Tempestade Sombria', icon: '🌑', type: 'damage', cd: 11, cost: 28, power: 3.0, desc: 'Rajada frenética de golpes mortais.' }
    ]
  },

  arqueiro: {
    id: 'arqueiro',
    name: 'Arqueiro',
    faction: 'Luz',
    role: 'Atirador à Distância / Sorte',
    icon: '🏹',
    color: '#66a80f',
    weaponType: 'Arco Longo / Besta',
    desc: 'Abate inimigos antes mesmo que se aproximem, usando flechas elementais e sorte extrema.',
    baseStats: { str: 11, dex: 14, rec: 8, int: 6, wis: 6, luk: 15 },
    skills: [
      { id: 'olho_aguia', name: 'Olho de Águia', icon: '👁️', type: 'buff', cd: 14, cost: 15, desc: 'Aumenta Dano Crítico e alcance por 12s.', effect: { atkMult: 1.3, duration: 12 } },
      { id: 'disparo_veloz', name: 'Disparo Triplo', icon: '🏹', type: 'damage', cd: 3, cost: 10, power: 1.6, desc: 'Dispara três flechas rápidas no alvo.' },
      { id: 'chuva_flechas', name: 'Chuva de Flechas', icon: '🌧️', type: 'aoe', cd: 6, cost: 20, power: 1.5, desc: 'Cobre a área com flechas perfurantes.' },
      { id: 'flecha_perfurante', name: 'Tiro Perfurante', icon: '💫', type: 'damage', cd: 5, cost: 15, power: 1.9, desc: 'Flecha carregada que atravessa a armadura.' },
      { id: 'flecha_congelante', name: 'Disparo Glacial', icon: '❄️', type: 'damage', cd: 7, cost: 18, power: 2.1, desc: 'Causa dano elemental de água/gelo.' },
      { id: 'tiro_celestial', name: 'Meteoro de Luz', icon: '☄️', type: 'damage', cd: 10, cost: 28, power: 2.9, desc: 'Disparo concentrado de energia estelar.' }
    ]
  },

  mago: {
    id: 'mago',
    name: 'Mago',
    faction: 'Luz',
    role: 'Dano Mágico / Explosão Elemental',
    icon: '🔮',
    color: '#7048e8',
    weaponType: 'Cajado / Orbe',
    desc: 'Canalizador dos elementos Fogo, Água, Terra e Vento para aniquilar hordas inteiras.',
    baseStats: { str: 6, dex: 8, rec: 8, int: 19, wis: 12, luk: 7 },
    skills: [
      { id: 'mente_arcana', name: 'Sobrecarga Arcana', icon: '✨', type: 'buff', cd: 14, cost: 20, desc: 'Amplifica o Poder Mágico em +40% por 10s.', effect: { atkMult: 1.4, duration: 10 } },
      { id: 'esfera_fogo', name: 'Esfera Infernal', icon: '🔥', type: 'damage', cd: 3, cost: 14, power: 1.75, desc: 'Lança uma bola de fogo explosiva no alvo.' },
      { id: 'tempestade_raios', name: 'Tempestade Voltaica', icon: '⚡', type: 'aoe', cd: 6, cost: 25, power: 1.65, desc: 'Raios caem sobre todos os monstros próximos.' },
      { id: 'lanca_gelo', name: 'Lança de Cristal', icon: '🧊', type: 'damage', cd: 4, cost: 16, power: 1.95, desc: 'Perfura o inimigo com gelo absoluto.' },
      { id: 'terremoto_arcano', name: 'Fissura Telúrica', icon: '🌋', type: 'aoe', cd: 8, cost: 30, power: 2.1, desc: 'Rompe a terra causando dano mágico massivo em área.' },
      { id: 'cataclisma', name: 'Juízo Elemental', icon: '🌌', type: 'damage', cd: 11, cost: 35, power: 3.2, desc: 'Explosão pura de energia elemental.' }
    ]
  },

  sacerdote: {
    id: 'sacerdote',
    name: 'Sacerdote',
    faction: 'Luz',
    role: 'Suporte / Cura & Luz Sagrada',
    icon: '✨',
    color: '#f59f00',
    weaponType: 'Cetro / Cajado Sagrado',
    desc: 'Guardião da vida. Possui curas poderosas, bênçãos de atributos e magias sagradas.',
    baseStats: { str: 6, dex: 8, rec: 10, int: 12, wis: 18, luk: 6 },
    skills: [
      { id: 'bencao_deusa', name: 'Bênção da Deusa', icon: '👑', type: 'buff', cd: 15, cost: 20, desc: 'Aumenta Ataque e Defesa em +25% por 15s.', effect: { atkMult: 1.25, defMult: 1.25, duration: 15 } },
      { id: 'luz_purificadora', name: 'Luz Purificadora', icon: '🌟', type: 'damage', cd: 3, cost: 12, power: 1.6, desc: 'Raio de luz que fere criaturas das trevas.' },
      { id: 'cura_divina', name: 'Cura Divina', icon: '💚', type: 'heal', cd: 5, cost: 20, power: 0.5, desc: 'Recupera 50% do HP instantaneamente.' },
      { id: 'nova_sagrada', name: 'Nova Sagrada', icon: '☀️', type: 'aoe', cd: 7, cost: 24, power: 1.5, desc: 'Explosão de luz que atinge inimigos ao redor.' },
      { id: 'punicao_celeste', name: 'Punição Celeste', icon: '⚡', type: 'damage', cd: 6, cost: 18, power: 2.0, desc: 'Julgamento divino sobre o alvo.' },
      { id: 'milagre_eterno', name: 'Milagre de Etain', icon: '🕊️', type: 'heal', cd: 12, cost: 30, power: 0.85, desc: 'Restaura 85% do HP e regenera mana.' }
    ]
  },

  // === UNIÃO DA FÚRIA ===
  guerreiro: {
    id: 'guerreiro',
    name: 'Guerreiro',
    faction: 'Fúria',
    role: 'Dano Físico / Brutalidade',
    icon: '🪓',
    color: '#c92a2a',
    weaponType: 'Machado Gigante / Lança',
    desc: 'Força bruta da União da Fúria. Esmaga ossos e armaduras com golpes colossais.',
    baseStats: { str: 17, dex: 11, rec: 11, int: 6, wis: 6, luk: 9 },
    skills: [
      { id: 'ira_sangrenta', name: 'Ira Sangrenta', icon: '💢', type: 'buff', cd: 12, cost: 15, desc: 'Aumenta o Ataque Físico em +38% por 10s.', effect: { atkMult: 1.38, duration: 10 } },
      { id: 'esmagar_cranio', name: 'Esmagar Crânio', icon: '🪓', type: 'damage', cd: 3, cost: 10, power: 1.65, desc: 'Golpe vertical devastador.' },
      { id: 'redemoinho_furia', name: 'Redemoinho Brutal', icon: '🌪️', type: 'aoe', cd: 6, cost: 20, power: 1.45, desc: 'Gira a arma atingindo todos ao redor.' },
      { id: 'fenda_mortal', name: 'Fenda Mortal', icon: '💥', type: 'damage', cd: 5, cost: 16, power: 1.85, desc: 'Abre feridas profundas no alvo.' },
      { id: 'golpe_vampirico', name: 'Frenesi Carniceiro', icon: '🩸', type: 'drain', cd: 8, cost: 18, power: 1.55, desc: 'Causa dano e drena 30% de HP.' },
      { id: 'aniquilacao', name: 'Aniquilação Total', icon: '☠️', type: 'damage', cd: 10, cost: 30, power: 2.85, desc: 'Impacto máximo da União da Fúria.' }
    ]
  },

  guardiao: {
    id: 'guardiao',
    name: 'Guardião',
    faction: 'Fúria',
    role: 'Tanque / Colosso',
    icon: '👹',
    color: '#495057',
    weaponType: 'Maça & Escudo Pesado',
    desc: 'Colosso blindado que absorve quantidades absurdas de dano enquanto protege aliados.',
    baseStats: { str: 11, dex: 9, rec: 19, int: 6, wis: 8, luk: 7 },
    skills: [
      { id: 'pele_rocha', name: 'Pele de Obsidiana', icon: '🪨', type: 'buff', cd: 15, cost: 20, desc: 'Aumenta Defesa em +55% por 12s.', effect: { defMult: 1.55, duration: 12 } },
      { id: 'golpe_colossal', name: 'Impacto Colossal', icon: '🔨', type: 'damage', cd: 4, cost: 10, power: 1.45, desc: 'Esmaga o inimigo com força bruta.' },
      { id: 'grito_abismo', name: 'Grito do Abismo', icon: '📢', type: 'aoe', cd: 6, cost: 15, power: 1.25, desc: 'Provoca todos os mobs próximos.' },
      { id: 'regeneracao_sombria', name: 'Sangue de Troll', icon: '❤️', type: 'heal', cd: 10, cost: 20, power: 0.35, desc: 'Regenera 35% da vida máxima.' },
      { id: 'esmagamento', name: 'Quebra-Ossos', icon: '🦴', type: 'damage', cd: 5, cost: 12, power: 1.7, desc: 'Ataque pesado que ignora parte da defesa.' },
      { id: 'terremoto_colosso', name: 'Fúria da Terra', icon: '🌋', type: 'aoe', cd: 12, cost: 25, power: 2.1, desc: 'Abala o terreno ao redor.' }
    ]
  },

  assassino: {
    id: 'assassino',
    name: 'Assassino',
    faction: 'Fúria',
    role: 'Furtividade / Crítico Letal',
    icon: '🦇',
    color: '#5f3dc4',
    weaponType: 'Lâminas Reversas',
    desc: 'Sombra mortal que surge das trevas para eliminar alvos em segundos.',
    baseStats: { str: 12, dex: 16, rec: 8, int: 6, wis: 6, luk: 12 },
    skills: [
      { id: 'manto_trevas', name: 'Manto das Trevas', icon: '🌑', type: 'buff', cd: 12, cost: 15, desc: 'Aumenta crítico em +35% por 10s.', effect: { critBonus: 0.35, duration: 10 } },
      { id: 'corte_sombrio', name: 'Corte Sombrio', icon: '🗡️', type: 'damage', cd: 3, cost: 10, power: 1.6, desc: 'Ataque veloz das sombras.' },
      { id: 'espiral_morte', name: 'Espiral da Morte', icon: '🌀', type: 'aoe', cd: 6, cost: 18, power: 1.45, desc: 'Fere todos os inimigos próximos.' },
      { id: 'golpe_traicoeiro', name: 'Golpe Traiçoeiro', icon: '🔪', type: 'damage', cd: 5, cost: 15, power: 2.05, desc: 'Ataque crítico nas costas do alvo.' },
      { id: 'veneno_abissal', name: 'Toxina Abissal', icon: '🧪', type: 'damage', cd: 7, cost: 20, power: 2.35, desc: 'Causa dano corrosivo elevado.' },
      { id: 'ceifador', name: 'Toque do Ceifador', icon: '💀', type: 'damage', cd: 11, cost: 28, power: 3.05, desc: 'Execução sombria de altíssimo dano.' }
    ]
  },

  cacador: {
    id: 'cacador',
    name: 'Caçador',
    faction: 'Fúria',
    role: 'Artilharia / Controle',
    icon: '🏹',
    color: '#d9480f',
    weaponType: 'Dardo / Arco de Caça',
    desc: 'Predador implacável que caça suas presas à distância com tiros devastadores.',
    baseStats: { str: 12, dex: 14, rec: 8, int: 6, wis: 6, luk: 14 },
    skills: [
      { id: 'instinto_predador', name: 'Instinto Predador', icon: '🐺', type: 'buff', cd: 14, cost: 15, desc: 'Aumenta o Ataque em +32% por 12s.', effect: { atkMult: 1.32, duration: 12 } },
      { id: 'tiro_brutal', name: 'Tiro Brutal', icon: '🏹', type: 'damage', cd: 3, cost: 10, power: 1.6, desc: 'Disparo pesado de curto recarregamento.' },
      { id: 'saraivada', name: 'Saraivada Mortal', icon: '🌧️', type: 'aoe', cd: 6, cost: 20, power: 1.5, desc: 'Chuva de projéteis em área.' },
      { id: 'flecha_explosiva', name: 'Flecha Explosiva', icon: '💣', type: 'damage', cd: 5, cost: 16, power: 1.95, desc: 'Detona ao atingir o inimigo.' },
      { id: 'tiro_sombrio', name: 'Disparo das Trevas', icon: '🌑', type: 'damage', cd: 7, cost: 18, power: 2.15, desc: 'Dano perfurante de longo alcance.' },
      { id: 'cacada_final', name: 'Caçada Final', icon: '🔥', type: 'damage', cd: 10, cost: 28, power: 2.95, desc: 'O disparo definitivo do caçador.' }
    ]
  },

  pagao: {
    id: 'pagao',
    name: 'Pagão',
    faction: 'Fúria',
    role: 'Feitiçaria Sombria / AoE',
    icon: '🔥',
    color: '#ae3ec9',
    weaponType: 'Cajado Sombrio',
    desc: 'Mestre das artes proibidas e magias de destruição em massa.',
    baseStats: { str: 6, dex: 8, rec: 8, int: 20, wis: 11, luk: 7 },
    skills: [
      { id: 'pacto_sombrio', name: 'Pacto Sombrio', icon: '😈', type: 'buff', cd: 14, cost: 20, desc: 'Aumenta o Ataque Mágico em +42% por 10s.', effect: { atkMult: 1.42, duration: 10 } },
      { id: 'chama_negra', name: 'Chama Negra', icon: '🔥', type: 'damage', cd: 3, cost: 14, power: 1.8, desc: 'Queima o alvo com fogo do abismo.' },
      { id: 'inferno_area', name: 'Inferno na Terra', icon: '🌋', type: 'aoe', cd: 6, cost: 25, power: 1.7, desc: 'Incendeia todos os inimigos próximos.' },
      { id: 'maldicao_dor', name: 'Agonia Mental', icon: '🧠', type: 'damage', cd: 4, cost: 16, power: 2.0, desc: 'Ataque psíquico direto.' },
      { id: 'vortice_caos', name: 'Vórtice do Caos', icon: '🌀', type: 'aoe', cd: 8, cost: 30, power: 2.15, desc: 'Implosão mágica em área.' },
      { id: 'apocalipse', name: 'Apocalipse', icon: '☄️', type: 'damage', cd: 11, cost: 35, power: 3.25, desc: 'Invoca um meteoro sombrio sobre o inimigo.' }
    ]
  },

  oraculo: {
    id: 'oraculo',
    name: 'Oráculo',
    faction: 'Fúria',
    role: 'Suporte Sombrio / Cura',
    icon: '🌙',
    color: '#1098ad',
    weaponType: 'Cetro Lunar',
    desc: 'Canalizador dos espíritos lunares, capaz de curar feridas mortais e amaldiçoar inimigos.',
    baseStats: { str: 6, dex: 8, rec: 10, int: 12, wis: 18, luk: 6 },
    skills: [
      { id: 'aura_lunar', name: 'Aura Lunar', icon: '🌙', type: 'buff', cd: 15, cost: 20, desc: 'Aumenta Ataque e Defesa em +25% por 15s.', effect: { atkMult: 1.25, defMult: 1.25, duration: 15 } },
      { id: 'raio_sombrio', name: 'Raio Lunar', icon: '⚡', type: 'damage', cd: 3, cost: 12, power: 1.6, desc: 'Descarga de energia mística.' },
      { id: 'toque_vital', name: 'Toque Vital', icon: '💚', type: 'heal', cd: 5, cost: 20, power: 0.5, desc: 'Cura 50% do HP instantaneamente.' },
      { id: 'eclipse', name: 'Eclipse Total', icon: '🌑', type: 'aoe', cd: 7, cost: 24, power: 1.5, desc: 'Onda sombria que atinge todos ao redor.' },
      { id: 'dreno_alma', name: 'Dreno de Alma', icon: '👻', type: 'drain', cd: 6, cost: 18, power: 1.8, desc: 'Causa dano e rouba vida do alvo.' },
      { id: 'renascimento', name: 'Bálsamo dos Espíritos', icon: '✨', type: 'heal', cd: 12, cost: 30, power: 0.85, desc: 'Restaura 85% do HP imediatamente.' }
    ]
  }
};
