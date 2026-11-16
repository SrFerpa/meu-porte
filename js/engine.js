// ENGINE PRINCIPAL DO PROJECT: SHAYENOR (2.5D WEB MMORPG)
const Game = {
  saveKey: 'shayenor_save_data_v1',
  data: {
    chars: [null, null, null],
    activeCharIndex: null
  },
  currentScreen: 'char-select',
  selectedClassId: null,
  selectedSlotIndex: null,
  
  // Estado do personagem em jogo
  activeMob: null,
  isMounted: false,
  canvas: null,
  ctx: null,
  animationFrameId: null,

  init() {
    this.loadGame();
    this.renderCharSlots();
    this.renderClassSelection();
    this.setupEvents();
  },

  loadGame() {
    const saved = localStorage.getItem(this.saveKey);
    if (saved) {
      try { this.data = JSON.parse(saved); } catch (e) { console.error('Erro ao carregar save', e); }
    }
  },

  saveGame() {
    localStorage.setItem(this.saveKey, JSON.stringify(this.data));
  },

  setupEvents() {
    document.getElementById('btn-open-create').onclick = () => {
      if (this.selectedSlotIndex === null) {
        alert('Selecione um slot vazio primeiro!');
        return;
      }
      document.getElementById('panel-create-char').classList.remove('hidden');
    };

    document.getElementById('btn-cancel-create').onclick = () => {
      document.getElementById('panel-create-char').classList.add('hidden');
    };

    document.getElementById('btn-confirm-create').onclick = () => {
      const name = document.getElementById('input-char-name').value.trim();
      if (!name) { alert('Digite um nome para o herói!'); return; }
      if (!this.selectedClassId) { alert('Escolha uma classe!'); return; }

      const classData = SHAIYA_CLASSES[this.selectedClassId];
      
      // Criação do personagem fiel ao Shaiya
      const newChar = {
        name: name,
        classId: classData.id,
        className: classData.name,
        faction: classData.faction,
        icon: classData.icon,
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 120, maxHp: 120,
        mp: 100, maxMp: 100,
        sp: 100, maxSp: 100,
        gold: 1500,
        ap: 5000,
        statPoints: 5,
        stats: { ...classData.baseStats },
        equipment: { weapon: null, helmet: null, armor: null, gauntlets: null, boots: null, accessory: null, mount: null },
        inventory: [
          { ...SHAIYA_ITEMS.equipments[0], uid: Date.now() + 1 },
          { ...SHAIYA_ITEMS.lapis[0], uid: Date.now() + 2 },
          { ...SHAIYA_ITEMS.shopExclusives[1], uid: Date.now() + 3 }
        ],
        potions: { hp: 15, mp: 15 }
      };

      this.data.chars[this.selectedSlotIndex] = newChar;
      this.saveGame();
      document.getElementById('panel-create-char').classList.add('hidden');
      document.getElementById('input-char-name').value = '';
      this.renderCharSlots();
    };

    document.getElementById('btn-enter-world').onclick = () => {
      if (this.data.activeCharIndex === null) return;
      this.startWorld();
    };

    document.getElementById('btn-delete-char').onclick = () => {
      if (this.data.activeCharIndex === null) return;
      if (confirm('Deseja realmente excluir este herói?')) {
        this.data.chars[this.data.activeCharIndex] = null;
        this.data.activeCharIndex = null;
        this.saveGame();
        this.renderCharSlots();
      }
    };

    // Atalhos de teclado para PC (Q = Poção HP, E = Poção MP, M = Montaria)
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'game') return;
      if (e.key === 'q' || e.key === 'Q') this.usePotion('hp');
      if (e.key === 'e' || e.key === 'E') this.usePotion('mp');
      if (e.key === 'm' || e.key === 'M') this.toggleMount();
    });
  },

  renderCharSlots() {
    const list = document.getElementById('char-slots-list');
    list.innerHTML = '';
    
    this.data.chars.forEach((char, index) => {
      const card = document.createElement('div');
      card.className = `char-slot-card ${char ? '' : 'empty'} ${this.data.activeCharIndex === index ? 'selected' : ''}`;
      
      if (char) {
        card.innerHTML = `
          <div>
            <strong>${char.icon} ${char.name}</strong>
            <div style="font-size:0.75rem; color:#aaa;">${char.className} • Nv. ${char.level} [${char.faction}]</div>
          </div>
          <span class="badge">Selecionado</span>
        `;
      } else {
        card.innerHTML = `<span>+ Slot Vazio ${index + 1}</span>`;
      }

      card.onclick = () => {
        this.data.activeCharIndex = char ? index : null;
        this.selectedSlotIndex = index;
        document.querySelectorAll('.char-slot-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        document.getElementById('btn-enter-world').disabled = !char;
        document.getElementById('btn-delete-char').disabled = !char;
      };

      list.appendChild(card);
    });
  },

  renderClassSelection() {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';

    Object.values(SHAIYA_CLASSES).forEach(cls => {
      const btn = document.createElement('button');
      btn.className = `class-btn ${this.selectedClassId === cls.id ? 'active' : ''}`;
      btn.innerHTML = `${cls.icon} ${cls.name}`;
      btn.onclick = () => {
        this.selectedClassId = cls.id;
        document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateClassPreview(cls);
      };
      grid.appendChild(btn);
    });
  },

  updateClassPreview(cls) {
    document.getElementById('preview-class-name').textContent = cls.name;
    document.getElementById('preview-class-role').textContent = `${cls.faction} • ${cls.role}`;
    document.getElementById('preview-class-desc').textContent = cls.desc;
    
    document.getElementById('preview-class-stats').innerHTML = 
      `Atributos Base -> FOR:${cls.baseStats.str} | DES:${cls.baseStats.dex} | REC:${cls.baseStats.rec} | INT:${cls.baseStats.int} | SAB:${cls.baseStats.wis} | SOR:${cls.baseStats.luk}`;
    
    const skillsHtml = cls.skills.map(s => `<span title="${s.desc}">${s.icon} ${s.name}</span>`).join(' | ');
    document.getElementById('preview-class-skills').innerHTML = `Habilidades: ${skillsHtml}`;
  },

  startWorld() {
    document.getElementById('screen-char-select').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    this.currentScreen = 'game';

    this.initCanvas();
    this.updateHud();
    this.renderSkillsBar();
    this.spawnRandomMob();

    this.gameLoop();
  },

  returnToCharSelect() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    document.getElementById('screen-game').classList.remove('active');
    document.getElementById('screen-char-select').classList.add('active');
    this.currentScreen = 'char-select';
    this.renderCharSlots();
  },

  getActiveChar() {
    return this.data.chars[this.data.activeCharIndex];
  },

  initCanvas() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.onresize = () => this.resizeCanvas();

    // Clique no mapa para atacar ou interagir
    this.canvas.onclick = (e) => {
      if (this.activeMob) {
        this.attackMob();
      }
    };
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawnRandomMob() {
    const mobsPool = SHAIYA_MOBS;
    const randomIndex = Math.floor(Math.random() * mobsPool.length);
    const template = mobsPool[randomIndex];
    
    // Cópia do mob com HP atual
    this.activeMob = { ...template, hp: template.maxHp };
    this.updateTargetHud();
  },

  gameLoop() {
    this.renderWorld25D();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  },

  renderWorld25D() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Fundo Estilo 2.5D (Cenário Teos / Grid Isométrico)
    ctx.fillStyle = '#11141c';
    ctx.fillRect(0, 0, w, h);

    // Chão com efeito 2.5D / Perspectiva
    ctx.fillStyle = '#181b24';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Linhas de perspectiva do terreno
    ctx.strokeStyle = '#222736';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < w; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, h * 0.55);
      ctx.lineTo(i - 150, h);
      ctx.stroke();
    }

    const char = this.getActiveChar();
    if (!char) return;

    // Renderizar Personagem (Centro-Esquerda)
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.icon, w * 0.35, h * 0.72);
    
    ctx.fillStyle = '#f3c669';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${char.name} (Nv. ${char.level})`, w * 0.35, h * 0.77);

    if (this.isMounted) {
      ctx.fillText('🐎 [Montado]', w * 0.35, h * 0.80);
    }

    // Renderizar Mob / Boss Atual (Centro-Direita)
    if (this.activeMob) {
      ctx.font = '72px sans-serif';
      ctx.fillText(this.activeMob.icon, w * 0.68, h * 0.70);

      ctx.fillStyle = this.activeMob.rank === 'BOSS' ? '#ff6b6b' : '#f8f9fa';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${this.activeMob.name}`, w * 0.68, h * 0.76);
    }
  },

  updateHud() {
    const char = this.getActiveChar();
    if (!char) return;

    document.getElementById('hud-name').textContent = char.name;
    document.getElementById('hud-level').textContent = `Nv. ${char.level}`;
    document.getElementById('hud-avatar').textContent = char.icon;

    document.getElementById('hud-hp-fill').style.width = `${(char.hp / char.maxHp) * 100}%`;
    document.getElementById('hud-hp-text').textContent = `${char.hp} / ${char.maxHp}`;

    document.getElementById('hud-mp-fill').style.width = `${(char.mp / char.maxMp) * 100}%`;
    document.getElementById('hud-mp-text').textContent = `${char.mp} / ${char.maxMp}`;

    document.getElementById('hud-sp-fill').style.width = `${(char.sp / char.maxSp) * 100}%`;
    document.getElementById('hud-sp-text').textContent = `${char.sp} / ${char.maxSp}`;

    const xpPct = (char.xp / char.maxXp) * 100;
    document.getElementById('hud-xp-fill').style.width = `${xpPct}%`;
    document.getElementById('hud-xp-text').textContent = `XP: ${Math.floor(xpPct)}%`;

    document.getElementById('hud-gold').textContent = char.gold;
    document.getElementById('shop-ap-display').textContent = char.ap;

    document.getElementById('qty-pot-hp').textContent = char.potions.hp;
    document.getElementById('qty-pot-mp').textContent = char.potions.mp;

    this.saveGame();
  },

  updateTargetHud() {
    const hud = document.getElementById('hud-target');
    if (!this.activeMob) {
      hud.classList.add('hidden');
      return;
    }

    hud.classList.remove('hidden');
    document.getElementById('target-rank').textContent = this.activeMob.rank;
    document.getElementById('target-name').textContent = this.activeMob.name;
    document.getElementById('target-level').textContent = `Nv. ${this.activeMob.level}`;
    document.getElementById('target-hp-fill').style.width = `${(this.activeMob.hp / this.activeMob.maxHp) * 100}%`;
    document.getElementById('target-hp-text').textContent = `${this.activeMob.hp} / ${this.activeMob.maxHp}`;
  },

  renderSkillsBar() {
    const char = this.getActiveChar();
    if (!char) return;

    const classData = SHAIYA_CLASSES[char.classId];
    const container = document.getElementById('skill-bar');
    container.innerHTML = '';

    classData.skills.forEach((skill, idx) => {
      const btn = document.createElement('button');
      btn.className = 'skill-slot';
      btn.innerHTML = `<span class="skill-key">${idx + 1}</span><span>${skill.icon}</span><small>${skill.name.split(' ')[0]}</small>`;
      btn.title = `${skill.name}: ${skill.desc} (Custo: ${skill.cost} MP)`;
      
      btn.onclick = () => this.useSkill(skill);
      container.appendChild(btn);
    });
  },

  useSkill(skill) {
    const char = this.getActiveChar();
    if (!char) return;

    if (char.mp < skill.cost) {
      this.logCombat('Mana insuficiente para usar a habilidade!');
      return;
    }

    char.mp -= skill.cost;

    if (skill.type === 'heal') {
      const healAmt = Math.floor(char.maxHp * skill.power);
      char.hp = Math.min(char.maxHp, char.hp + healAmt);
      this.logCombat(`✨ ${skill.name} curou ${healAmt} de HP!`, 'heal');
    } else if (skill.type === 'buff') {
      this.logCombat(`🛡️ ${skill.name} ativado! Status aumentados.`, 'buff');
    } else {
      // Dano em alvo ou AoE
      if (!this.activeMob) {
        this.logCombat('Nenhum alvo selecionado para atacar!');
        this.updateHud();
        return;
      }
      const dmg = Math.floor((char.stats.str * 2.5 + 20) * skill.power);
      this.activeMob.hp -= dmg;
      this.logCombat(`⚔️ Você usou ${skill.name} e causou ${dmg} de dano em ${this.activeMob.name}!`, 'damage');
      
      this.checkMobDeath();
    }

    this.updateHud();
    this.updateTargetHud();
  },

  attackMob() {
    if (!this.activeMob) return;
    const char = this.getActiveChar();

    const dmg = Math.floor(char.stats.str * 1.5 + 10);
    this.activeMob.hp -= dmg;
    this.logCombat(`⚔️ Ataque básico! Causou ${dmg} de dano.`, 'damage');

    this.checkMobDeath();
    this.updateHud();
    this.updateTargetHud();
  },

  checkMobDeath() {
    if (this.activeMob.hp <= 0) {
      const char = this.getActiveChar();
      this.logCombat(`🎉 Você derrotou ${this.activeMob.name}! Ganhou ${this.activeMob.xp} XP e ${this.activeMob.gold} Ouro.`, 'win');
      
      char.gold += this.activeMob.gold;
      char.xp += this.activeMob.xp;

      // Drop de item aleatório
      if (Math.random() < this.activeMob.dropRate) {
        const randomItem = { ...SHAIYA_ITEMS.equipments[Math.floor(Math.random() * SHAIYA_ITEMS.equipments.length)], uid: Date.now() };
        char.inventory.push(randomItem);
        this.logCombat(`🎁 Drop obtido: ${randomItem.name}!`, 'drop');
      }

      // Sistema de Level Up
      if (char.xp >= char.maxXp) {
        char.level++;
        char.xp = 0;
        char.maxXp = Math.floor(char.maxXp * 1.35);
        char.maxHp += 40;
        char.hp = char.maxHp;
        char.maxMp += 30;
        char.mp = char.maxMp;
        char.statPoints += 5;
        this.logCombat(`⭐ LEVEL UP! Você alcançou o Nível ${char.level}! +5 Pontos de Atributo ganham.`, 'levelup');
      }

      // Spawnar próximo mob após 1.5s
      this.activeMob = null;
      setTimeout(() => {
        if (this.currentScreen === 'game') this.spawnRandomMob();
      }, 1200);
    }
  },

  usePotion(type) {
    const char = this.getActiveChar();
    if (!char) return;

    if (type === 'hp') {
      if (char.potions.hp <= 0) { this.logCombat('Sem poções de HP!'); return; }
      char.potions.hp--;
      char.hp = Math.min(char.maxHp, char.hp + 60);
      this.logCombat('🧪 Poção de HP usada (+60 HP).', 'heal');
    } else if (type === 'mp') {
      if (char.potions.mp <= 0) { this.logCombat('Sem poções de MP!'); return; }
      char.potions.mp--;
      char.mp = Math.min(char.maxMp, char.mp + 60);
      this.logCombat('⚗️ Poção de MP usada (+60 MP).', 'heal');
    }
    this.updateHud();
  },

  toggleMount() {
    this.isMounted = !this.isMounted;
    const char = this.getActiveChar();
    if (this.isMounted) {
      this.logCombat('🐎 Montaria invocada! Velocidade aumentada.');
      document.getElementById('hud-mount-icon').textContent = '💨';
    } else {
      this.logCombat('Dis montado.');
      document.getElementById('hud-mount-icon').textContent = '🐎';
    }
  },

  logCombat(text, type = 'normal') {
    const logBox = document.getElementById('combat-log');
    if (!logBox) return;
    const div = document.createElement('div');
    div.textContent = text;
    if (type === 'win') div.style.color = '#51cf66';
    if (type === 'drop') div.style.color = '#f3c669';
    if (type === 'levelup') div.style.color = '#7048e8';
    if (type === 'heal') div.style.color = '#38d9a9';
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
  },

  // Modais & Sistemas
  toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    const isHidden = modal.classList.contains('hidden');
    
    // Fechar todos
    document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));

    if (isHidden) {
      modal.classList.remove('hidden');
      if (modalId === 'modal-stats') this.renderStatsModal();
      if (modalId === 'modal-inventory') this.renderInventory();
      if (modalId === 'modal-shop') this.renderShop('packs');
    }
  },

  renderStatsModal() {
    const char = this.getActiveChar();
    if (!char) return;

    document.getElementById('ui-stat-points').textContent = char.statPoints;
    document.getElementById('ui-str').textContent = char.stats.str;
    document.getElementById('ui-dex').textContent = char.stats.dex;
    document.getElementById('ui-rec').textContent = char.stats.rec;
    document.getElementById('ui-int').textContent = char.stats.int;
    document.getElementById('ui-wis').textContent = char.stats.wis;
    document.getElementById('ui-luk').textContent = char.stats.luk;

    const alertDot = document.getElementById('stat-points-alert');
    if (char.statPoints > 0) alertDot.classList.remove('hidden');
    else alertDot.classList.add('hidden');

    const derived = document.getElementById('ui-derived-stats');
    derived.innerHTML = `
      Poder de Ataque Físico: <b>${char.stats.str * 2 + 15}</b><br>
      Poder de Ataque Mágico: <b>${char.stats.int * 2 + 15}</b><br>
      Defesa Física: <b>${char.stats.rec * 1.5 + 10}</b><br>
      Taxa de Crítico (Sorte): <b>${char.stats.luk * 0.5}%</b>
    `;

    // Equipados
    ['weapon', 'helmet', 'armor', 'gauntlets', 'boots', 'accessory', 'mount'].forEach(slot => {
      const eqItem = char.equipment[slot];
      const elem = document.getElementById(`eq-${slot}`);
      if (eqItem) {
        elem.innerHTML = `${slot.toUpperCase()}: <span>${eqItem.name}</span>`;
      } else {
        elem.innerHTML = `${slot.toUpperCase()}: <span style="color:#777">Vazio</span>`;
      }
    });
  },

  addStat(statName) {
    const char = this.getActiveChar();
    if (!char || char.statPoints <= 0) return;
    char.statPoints--;
    char.stats[statName]++;
    this.renderStatsModal();
    this.updateHud();
  },

  renderInventory() {
    const char = this.getActiveChar();
    if (!char) return;

    document.getElementById('inv-count').textContent = char.inventory.length;
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    char.inventory.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `inv-item ${item.rarity === 'deusa' ? 'rarity-deusa' : item.type === 'lapis' ? 'rarity-lapis' : ''}`;
      card.innerHTML = `
        <div><strong>${item.name}</strong></div>
        <div style="font-size:0.68rem; color:#aaa;">${item.desc || 'Item utilitário'}</div>
      `;

      card.onclick = () => {
        if (item.type === 'armor' || item.type === 'weapon') {
          // Equipar item
          const old = char.equipment[item.type];
          char.equipment[item.type] = item;
          char.inventory.splice(index, 1);
          if (old) char.inventory.push(old);
          this.renderInventory();
          this.logCombat(`Equipou ${item.name}!`);
        } else {
          alert(`Você usou o item: ${item.name}`);
        }
      };

      grid.appendChild(card);
    });
  },

  sellAllJunk() {
    const char = this.getActiveChar();
    if (!char) return;

    let totalEarned = 0;
    // Filtrar apenas itens que não estão equipados
    char.inventory = char.inventory.filter(item => {
      totalEarned += 150; // Valor padrão de venda por item
      return false;
    });

    char.gold += totalEarned;
    this.renderInventory();
    this.updateHud();
    this.logCombat(`💰 Vendeu todos os itens da bolsa por ${totalEarned} Ouro!`, 'win');
  },

  renderShop(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    let itemsToDisplay = [];
    if (tab === 'packs') itemsToDisplay = SHAIYA_ITEMS.shopExclusives.filter(i => i.type === 'bundle' || i.type === 'special');
    if (tab === 'lapis') itemsToDisplay = [...SHAIYA_ITEMS.lapis, ...SHAIYA_ITEMS.shopExclusives.filter(i => i.type === 'buff')];
    if (tab === 'mounts') itemsToDisplay = SHAIYA_ITEMS.shopExclusives.filter(i => i.type === 'mount');

    itemsToDisplay.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <strong>💎 ${item.name}</strong>
          <p style="font-size:0.72rem; color:#aaa; margin-top:3px;">${item.desc}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
          <span style="color:#f3c669; font-weight:bold;">${item.price} AP</span>
          <button class="btn btn-gold btn-sm" onclick="Game.buyShopItem('${item.id}', ${item.price})">Comprar</button>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  buyShopItem(itemId, price) {
    const char = this.getActiveChar();
    if (!char) return;

    if (char.ap < price) {
      alert('AP (Pontos da Loja) insuficientes!');
      return;
    }

    char.ap -= price;
    
    // Encontrar o item na loja
    let found = SHAIYA_ITEMS.shopExclusives.find(i => i.id === itemId) || SHAIYA_ITEMS.lapis.find(i => i.id === itemId);
    if (found) {
      char.inventory.push({ ...found, uid: Date.now() });
      this.logCombat(`🛒 Comprou com sucesso: ${found.name}! Verifique sua bolsa.`, 'win');
    }

    this.updateHud();
  }
};

// Inicializar o jogo quando a página carregar
window.onload = () => {
  Game.init();
};
