// ENGINE PRINCIPAL DO PROJECT: SHAYENOR (2.5D WEB MMORPG - MAPA ABERTO)
const Game = {
  saveKey: 'shayenor_save_data_v1',
  data: {
    chars: [null, null, null],
    activeCharIndex: null
  },
  currentScreen: 'char-select',
  selectedClassId: null,
  selectedSlotIndex: null,

  // Mundo e Mapa Aberto (Floresta Inicial - 2400x2400)
  world: {
    width: 2400,
    height: 2400,
    trees: [],
    mobs: []
  },
  
  // Posição e Movimentação do Jogador
  playerPos: { x: 1200, y: 1850, targetX: 1200, targetY: 1850, speed: 4.2 },
  keys: { w: false, a: false, s: false, d: false },
  camera: { x: 0, y: 0 },

  activeMob: null,
  isMounted: false,
  canvas: null,
  ctx: null,
  animationFrameId: null,
  lastAttackTime: 0,

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
      
      const newChar = {
        name: name,
        classId: classData.id,
        className: classData.name,
        faction: classData.faction,
        icon: classData.icon,
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 150, maxHp: 150,
        mp: 120, maxMp: 120,
        sp: 100, maxSp: 100,
        gold: 1500,
        ap: 5000,
        statPoints: 5,
        kills: 0,
        deaths: 0,
        stats: { ...classData.baseStats },
        equipment: { weapon: null, helmet: null, armor: null, pants: null, gauntlets: null, boots: null, shield: null, cape: null, accessory: null, mount: null },
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

    // Controles de Teclado (WASD, Setas e Atalhos)
    window.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'game') return;
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.w = true;
      if (k === 's' || e.key === 'ArrowDown') this.keys.s = true;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.a = true;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.d = true;
      
      if (k === 'q') this.usePotion('hp');
      if (k === 'e') this.usePotion('mp');
      if (k === 'm') this.toggleMount();
      if (k === 't') this.toggleModal('modal-stats');
      if (k === 'i') this.toggleModal('modal-inventory');
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.w = false;
      if (k === 's' || e.key === 'ArrowDown') this.keys.s = false;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.a = false;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.d = false;
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

    // Resetar posição inicial na entrada sul da Floresta
    this.playerPos = { x: 1200, y: 1950, targetX: 1200, targetY: 1950, speed: 4.5 };
    
    this.generateForestWorld();
    this.initCanvas();
    this.updateHud();
    this.renderSkillsBar();

    this.gameLoop();
  },

  generateForestWorld() {
    this.world.trees = [];
    this.world.mobs = [];

    // Gerar árvores e pedras decorativas espalhadas (deixando a clareira central livre para o Boss)
    for (let i = 0; i < 140; i++) {
      const tx = Math.random() * this.world.width;
      const ty = Math.random() * this.world.height;
      const distCenter = Math.hypot(tx - 1200, ty - 1200);
      if (distCenter > 260) {
        this.world.trees.push({
          x: tx,
          y: ty,
          icon: Math.random() > 0.25 ? '🌲' : '🌳',
          size: 42 + Math.floor(Math.random() * 24)
        });
      }
    }
    // Ordenar árvores por Y para profundidade 2.5D correta
    this.world.trees.sort((a, b) => a.y - b.y);

    // 1. Spawnar o BOSS no exato centro do mapa (1200, 1200)
    const bossTemplate = SHAIYA_MOBS.find(m => m.rank === 'BOSS') || SHAIYA_MOBS[SHAIYA_MOBS.length - 1];
    this.world.mobs.push({
      ...bossTemplate,
      uid: 'boss_center',
      x: 1200,
      y: 1200,
      spawnX: 1200,
      spawnY: 1200,
      hp: bossTemplate.maxHp,
      dead: false
    });

    // 2. Spawnar 22 mobs normais e mini-bosses espalhados pela floresta
    const normalPool = SHAIYA_MOBS.filter(m => m.rank !== 'BOSS');
    for (let i = 0; i < 22; i++) {
      const template = normalPool[i % normalPool.length];
      let mx, my;
      do {
        mx = 250 + Math.random() * (this.world.width - 500);
        my = 250 + Math.random() * (this.world.height - 500);
      } while (Math.hypot(mx - 1200, my - 1200) < 320); // Não nascer em cima do Boss

      this.world.mobs.push({
        ...template,
        uid: 'mob_' + i,
        x: mx,
        y: my,
        spawnX: mx,
        spawnY: my,
        hp: template.maxHp,
        dead: false
      });
    }
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

    // Clique / Toque no mapa (Estilo Asa de Cristal: clica no mob para selecionar/atacar, clica no chão para andar)
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) + this.camera.x;
      const clickY = (e.clientY - rect.top) + this.camera.y;

      // Verificar se clicou em algum mob vivo
      let clickedMob = null;
      for (const mob of this.world.mobs) {
        if (mob.dead) continue;
        const radius = mob.rank === 'BOSS' ? 55 : 38;
        if (Math.hypot(clickX - mob.x, clickY - mob.y) <= radius) {
          clickedMob = mob;
          break;
        }
      }

      if (clickedMob) {
        this.activeMob = clickedMob;
        this.updateTargetHud();
        // Anda até perto do mob para atacar
        this.playerPos.targetX = clickedMob.x - 45;
        this.playerPos.targetY = clickedMob.y + 15;
        
        // Se já estiver perto, desfere o golpe
        if (Math.hypot(this.playerPos.x - clickedMob.x, this.playerPos.y - clickedMob.y) < 120) {
          this.attackMob();
        }
      } else {
        // Andar livremente até o ponto clicado
        this.playerPos.targetX = Math.max(50, Math.min(this.world.width - 50, clickX));
        this.playerPos.targetY = Math.max(50, Math.min(this.world.height - 50, clickY));
      }
    };
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  updateMovement() {
    const moveSpeed = this.isMounted ? this.playerPos.speed * 1.65 : this.playerPos.speed;
    let movedByKey = false;

    if (this.keys.w) { this.playerPos.y -= moveSpeed; movedByKey = true; }
    if (this.keys.s) { this.playerPos.y += moveSpeed; movedByKey = true; }
    if (this.keys.a) { this.playerPos.x -= moveSpeed; movedByKey = true; }
    if (this.keys.d) { this.playerPos.x += moveSpeed; movedByKey = true; }

    if (movedByKey) {
      this.playerPos.targetX = this.playerPos.x;
      this.playerPos.targetY = this.playerPos.y;
    } else {
      // Movimento suave até o ponto clicado com o mouse/toque
      const dx = this.playerPos.targetX - this.playerPos.x;
      const dy = this.playerPos.targetY - this.playerPos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        this.playerPos.x += (dx / dist) * moveSpeed;
        this.playerPos.y += (dy / dist) * moveSpeed;
      }
    }

    // Limites do mapa da floresta
    this.playerPos.x = Math.max(40, Math.min(this.world.width - 40, this.playerPos.x));
    this.playerPos.y = Math.max(40, Math.min(this.world.height - 40, this.playerPos.y));

    // Câmera estilo Asa de Cristal (centralizada no herói com limite nas bordas do mapa)
    this.camera.x = Math.max(0, Math.min(this.world.width - this.canvas.width, this.playerPos.x - this.canvas.width / 2));
    this.camera.y = Math.max(0, Math.min(this.world.height - this.canvas.height, this.playerPos.y - this.canvas.height / 2));
  },

  gameLoop() {
    this.updateMovement();
    this.renderWorld25D();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  },

  renderWorld25D() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Gramado da Floresta Inicial
    ctx.fillStyle = '#1b2e1e';
    ctx.fillRect(0, 0, this.world.width, this.world.height);

    // Grid suave de terreno 2.5D para dar noção de movimento
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= this.world.width; gx += 100) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, this.world.height); ctx.stroke();
    }
    for (let gy = 0; gy <= this.world.height; gy += 100) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(this.world.width, gy); ctx.stroke();
    }

    // 2. Arena Central do Boss (Altar de Pedra no meio da Floresta)
    ctx.fillStyle = '#2b2d30';
    ctx.beginPath();
    ctx.arc(1200, 1200, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8c6d38';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Estrada de terra sul até a arena central
    ctx.fillStyle = '#3b3226';
    ctx.fillRect(1160, 1420, 80, 980);

    // Marcador de destino no chão (quando clica para andar)
    if (Math.hypot(this.playerPos.targetX - this.playerPos.x, this.playerPos.targetY - this.playerPos.y) > 8) {
      ctx.strokeStyle = '#f3c669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(this.playerPos.targetX, this.playerPos.targetY, 16, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Desenhar Mobs Vivos no Mapa
    for (const mob of this.world.mobs) {
      if (mob.dead) continue;
      // Otimização: só desenha o que está perto da câmera
      if (Math.abs(mob.x - this.playerPos.x) > w && Math.abs(mob.y - this.playerPos.y) > h) continue;

      // Círculo de seleção se for o alvo atual
      if (this.activeMob && this.activeMob.uid === mob.uid) {
        ctx.strokeStyle = '#ff4d4d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(mob.x, mob.y + 15, mob.rank === 'BOSS' ? 45 : 26, mob.rank === 'BOSS' ? 20 : 12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sombra no chão
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(mob.x, mob.y + 14, mob.rank === 'BOSS' ? 38 : 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ícone do Mob ou Boss
      ctx.font = mob.rank === 'BOSS' ? '74px sans-serif' : '42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mob.icon, mob.x, mob.y + 8);

      // Nome e Barra de Vida flutuante
      ctx.fillStyle = mob.rank === 'BOSS' ? '#ff6b6b' : '#e6e2d3';
      ctx.font = mob.rank === 'BOSS' ? 'bold 14px sans-serif' : '12px sans-serif';
      ctx.fillText(`[Nv.${mob.level}] ${mob.name}`, mob.x, mob.y - (mob.rank === 'BOSS' ? 52 : 32));

      const barW = mob.rank === 'BOSS' ? 90 : 48;
      ctx.fillStyle = '#111';
      ctx.fillRect(mob.x - barW / 2, mob.y - (mob.rank === 'BOSS' ? 46 : 27), barW, 5);
      ctx.fillStyle = '#e03131';
      ctx.fillRect(mob.x - barW / 2, mob.y - (mob.rank === 'BOSS' ? 46 : 27), barW * (mob.hp / mob.maxHp), 5);
    }

    // 4. Desenhar o Personagem do Jogador
    const char = this.getActiveChar();
    if (char) {
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(this.playerPos.x, this.playerPos.y + 16, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      if (this.isMounted) {
        ctx.font = '38px sans-serif';
        ctx.fillText('🐎', this.playerPos.x - 10, this.playerPos.y + 12);
      }

      ctx.font = '46px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(char.icon, this.playerPos.x, this.playerPos.y + 8);

      ctx.fillStyle = '#f3c669';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${char.name} [Nv.${char.level}]`, this.playerPos.x, this.playerPos.y - 34);
    }

    // 5. Desenhar Árvores da Floresta
    for (const tree of this.world.trees) {
      if (Math.abs(tree.x - this.playerPos.x) > w && Math.abs(tree.y - this.playerPos.y) > h) continue;
      ctx.font = `${tree.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(tree.icon, tree.x, tree.y);
    }

    ctx.restore();

    // Minimapa rápido no canto inferior direito mostrando o Boss no centro
    this.renderMinimap(ctx, w, h);
  },

  renderMinimap(ctx, screenW, screenH) {
    const mapSize = 110;
    const mx = screenW - mapSize - 12;
    const my = screenH - mapSize - 70;

    ctx.fillStyle = 'rgba(15, 17, 23, 0.85)';
    ctx.strokeStyle = '#8c6d38';
    ctx.lineWidth = 2;
    ctx.fillRect(mx, my, mapSize, mapSize);
    ctx.strokeRect(mx, my, mapSize, mapSize);

    // Ponto vermelho do Boss no centro
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(mx + mapSize / 2, my + mapSize / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Ponto dourado do Jogador
    const px = mx + (this.playerPos.x / this.world.width) * mapSize;
    const py = my + (this.playerPos.y / this.world.height) * mapSize;
    ctx.fillStyle = '#f3c669';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
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
    if (!this.activeMob || this.activeMob.dead) {
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

    if (skill.type === 'heal') {
      char.mp -= skill.cost;
      const healAmt = Math.floor(char.maxHp * skill.power);
      char.hp = Math.min(char.maxHp, char.hp + healAmt);
      this.logCombat(`✨ ${skill.name} curou ${healAmt} de HP!`, 'heal');
    } else if (skill.type === 'buff') {
      char.mp -= skill.cost;
      this.logCombat(`🛡️ ${skill.name} ativado! Status aumentados.`, 'buff');
    } else {
      if (!this.activeMob || this.activeMob.dead) {
        this.logCombat('Clique em um monstro primeiro para selecioná-lo!');
        return;
      }
      const dist = Math.hypot(this.playerPos.x - this.activeMob.x, this.playerPos.y - this.activeMob.y);
      if (dist > 260) {
        this.logCombat('Muito longe do alvo! Aproxime-se mais.');
        return;
      }

      char.mp -= skill.cost;
      const dmg = Math.floor((char.stats.str * 2.5 + 20) * skill.power);
      this.activeMob.hp -= dmg;
      this.logCombat(`⚔️ ${skill.name} causou ${dmg} de dano em ${this.activeMob.name}!`, 'damage');
      this.checkMobDeath();
    }

    this.updateHud();
    this.updateTargetHud();
  },

  attackMob() {
    if (!this.activeMob || this.activeMob.dead) return;
    const dist = Math.hypot(this.playerPos.x - this.activeMob.x, this.playerPos.y - this.activeMob.y);
    if (dist > 150) return;

    const char = this.getActiveChar();
    const dmg = Math.floor(char.stats.str * 1.5 + 12);
    this.activeMob.hp -= dmg;
    this.logCombat(`⚔️ Ataque básico! ${dmg} de dano em ${this.activeMob.name}.`, 'damage');

    this.checkMobDeath();
    this.updateHud();
    this.updateTargetHud();
  },

  checkMobDeath() {
    if (this.activeMob && this.activeMob.hp <= 0 && !this.activeMob.dead) {
      const deadMob = this.activeMob;
      deadMob.dead = true;
      deadMob.hp = 0;
      this.activeMob = null;

      const char = this.getActiveChar();
      char.kills = (char.kills || 0) + 1;
      char.gold += deadMob.gold;
      char.xp += deadMob.xp;

      this.logCombat(`🎉 Derrotou ${deadMob.name}! +${deadMob.xp} XP | +${deadMob.gold} Ouro.`, 'win');

      if (Math.random() < deadMob.dropRate) {
        const randomItem = { ...SHAIYA_ITEMS.equipments[Math.floor(Math.random() * SHAIYA_ITEMS.equipments.length)], uid: Date.now() };
        char.inventory.push(randomItem);
        this.logCombat(`🎁 Drop: ${randomItem.name}!`, 'drop');
      }

      if (char.xp >= char.maxXp) {
        char.level++;
        char.xp = 0;
        char.maxXp = Math.floor(char.maxXp * 1.35);
        char.maxHp += 40; char.hp = char.maxHp;
        char.maxMp += 30; char.mp = char.maxMp;
        char.statPoints += 5;
        this.logCombat(`⭐ LEVEL UP! Nível ${char.level} alcançado!`, 'levelup');
      }

      // Respawn do mob no mapa após 8 segundos (ou 20s se for o Boss)
      const respawnTime = deadMob.rank === 'BOSS' ? 20000 : 8000;
      setTimeout(() => {
        deadMob.hp = deadMob.maxHp;
        deadMob.x = deadMob.spawnX;
        deadMob.y = deadMob.spawnY;
        deadMob.dead = false;
      }, respawnTime);
    }
  },

  usePotion(type) {
    const char = this.getActiveChar();
    if (!char) return;

    if (type === 'hp') {
      if (char.potions.hp <= 0) { this.logCombat('Sem poções de HP!'); return; }
      char.potions.hp--;
      char.hp = Math.min(char.maxHp, char.hp + 80);
      this.logCombat('🧪 Poção de HP usada (+80 HP).', 'heal');
    } else if (type === 'mp') {
      if (char.potions.mp <= 0) { this.logCombat('Sem poções de MP!'); return; }
      char.potions.mp--;
      char.mp = Math.min(char.maxMp, char.mp + 80);
      this.logCombat('⚗️ Poção de MP usada (+80 MP).', 'heal');
    }
    this.updateHud();
  },

  toggleMount() {
    this.isMounted = !this.isMounted;
    this.logCombat(this.isMounted ? '🐎 Montaria invocada! Velocidade aumentada.' : 'Desmontado.');
    document.getElementById('hud-mount-icon').textContent = this.isMounted ? '💨' : '🐎';
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

  toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    const isHidden = modal.classList.contains('hidden');
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
      card.innerHTML = `<div><strong>${item.name}</strong></div><div style="font-size:0.68rem; color:#aaa;">${item.desc || ''}</div>`;
      card.onclick = () => {
        if (item.type === 'armor' || item.type === 'weapon') {
          const old = char.equipment[item.type];
          char.equipment[item.type] = item;
          char.inventory.splice(index, 1);
          if (old) char.inventory.push(old);
          this.renderInventory();
          this.logCombat(`Equipou ${item.name}!`);
        }
      };
      grid.appendChild(card);
    });
  },

  sellAllJunk() {
    const char = this.getActiveChar();
    if (!char) return;
    let totalEarned = 0;
    char.inventory = char.inventory.filter(() => { totalEarned += 150; return false; });
    char.gold += totalEarned;
    this.renderInventory();
    this.updateHud();
    this.logCombat(`💰 Vendeu todos os itens por ${totalEarned} Ouro!`, 'win');
  },

  renderShop(tab) {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';
    let itemsToDisplay = SHAIYA_ITEMS.shopExclusives;
    if (tab === 'lapis') itemsToDisplay = SHAIYA_ITEMS.lapis;

    itemsToDisplay.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div><strong>💎 ${item.name}</strong><p style="font-size:0.72rem; color:#aaa;">${item.desc}</p></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
          <span style="color:#f3c669;">${item.price || 500} AP</span>
          <button class="btn btn-gold btn-sm" onclick="Game.buyShopItem('${item.id}', ${item.price || 500})">Comprar</button>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  buyShopItem(itemId, price) {
    const char = this.getActiveChar();
    if (!char || char.ap < price) { alert('AP insuficientes!'); return; }
    char.ap -= price;
    let found = SHAIYA_ITEMS.shopExclusives.find(i => i.id === itemId) || SHAIYA_ITEMS.lapis.find(i => i.id === itemId);
    if (found) {
      char.inventory.push({ ...found, uid: Date.now() });
      this.logCombat(`🛒 Comprou: ${found.name}!`, 'win');
    }
    this.updateHud();
  }
};

window.onload = () => {
  Game.init();
};
