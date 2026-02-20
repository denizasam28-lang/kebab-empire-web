import { MENU_ITEMS } from '../data/menuData.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { CUSTOMER_TYPES } from '../data/customers.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.combo = 1;
    this.level = 1;
    this.completedOrders = 0;
    this.basePatienceSeconds = 24;
    this.activeOrder = null;
    this.activeCustomer = null;
    this.playerStack = [];
    this.patienceRemaining = 0;
    this.lastActionTime = 0;
    this.ingredientButtons = [];
    this.stackSprites = [];
    this.matchRule = 'exact-sequence';
    this.isTransitioningCustomer = false;
  }

  create() {
    this.character = this.registry.get('selectedCharacter');
    this.cameras.main.setBackgroundColor(0xf8d6ae);

    this.createReusableTextures();
    this.createSceneLayers();
    this.createEnvironment();
    this.createCounterUI();
    this.createControls();

    this.spawnCustomerAndOrder();
    this.emitUiUpdate();
  }

  createReusableTextures() {
    if (!this.textures.exists('steam-dot')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(6, 6, 6);
      g.generateTexture('steam-dot', 12, 12);
      g.destroy();
    }

    if (!this.textures.exists('pop-dot')) {
      const g = this.add.graphics();
      g.fillStyle(0xffebbe, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('pop-dot', 8, 8);
      g.destroy();
    }
  }

  createSceneLayers() {
    this.bgLayer = this.add.container(0, 0).setDepth(0);
    this.midLayer = this.add.container(0, 0).setDepth(10);
    this.customerLayer = this.add.container(0, 0).setDepth(20);
    this.foregroundLayer = this.add.container(0, 0).setDepth(30);
    this.fxLayer = this.add.container(0, 0).setDepth(40);
  }

  createEnvironment() {
    const { width, height } = this.scale;

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        const color = (row + col) % 2 === 0 ? 0xf8d4aa : 0xf2c793;
        const tile = this.add.rectangle(col * 96 + 48, row * 88 + 44, 96, 88, color).setStrokeStyle(1, 0xe9b780);
        this.bgLayer.add(tile);
      }
    }

    const signGlow = this.add
      .text(width / 2, 84, 'Kebab Empire', {
        fontSize: '58px',
        color: '#ffb4af',
        fontStyle: 'bold',
        stroke: '#ff5e57',
        strokeThickness: 18,
      })
      .setOrigin(0.5)
      .setAlpha(0.35);

    this.neonText = this.add
      .text(width / 2, 84, 'Kebab Empire', {
        fontSize: '55px',
        color: '#fff8ea',
        fontStyle: 'bold',
        stroke: '#ff5e57',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.tweens.add({ targets: [signGlow, this.neonText], alpha: { from: 0.95, to: 0.62 }, duration: 1400, yoyo: true, repeat: -1 });
    this.bgLayer.add([signGlow, this.neonText]);

    this.menuBoard = this.add.rectangle(width / 2, 154, width * 0.72, 66, 0x6e3a22).setStrokeStyle(5, 0xfce8ca);
    this.menuBoardText = this.add
      .text(width / 2, 154, '--', {
        fontSize: '24px',
        color: '#ffe7c2',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.bgLayer.add([this.menuBoard, this.menuBoardText]);

    this.createDoor();
    this.createDonerMachine(width * 0.84, height * 0.45);

    this.counterTop = this.add.rectangle(width / 2, height * 0.58, width, 86, 0xce7f4e).setStrokeStyle(4, 0x8b4c2f);
    this.counterFront = this.add.rectangle(width / 2, height * 0.77, width, height * 0.36, 0xa65b3b).setStrokeStyle(4, 0x7a3f27);
    this.midLayer.add([this.counterFront, this.counterTop]);

    this.vignette = this.add.graphics().setDepth(50);
    this.vignette.fillStyle(0x000000, 0.16);
    this.vignette.fillRect(0, 0, width, 40);
    this.vignette.fillRect(0, height - 50, width, 50);
    this.vignette.fillRect(0, 0, 24, height);
    this.vignette.fillRect(width - 24, 0, 24, height);
  }

  createDoor() {
    const { height } = this.scale;
    const x = 60;
    const y = height * 0.45;

    const frame = this.add.rectangle(x, y, 96, 190, 0x6a3f2c).setStrokeStyle(4, 0xf9ddc1);
    const leftDoor = this.add.rectangle(x - 20, y, 36, 172, 0xa56c49).setStrokeStyle(2, 0x5a3526);
    const rightDoor = this.add.rectangle(x + 20, y, 36, 172, 0xa56c49).setStrokeStyle(2, 0x5a3526);

    this.door = { leftDoor, rightDoor, baseX: x };
    this.bgLayer.add([frame, leftDoor, rightDoor]);
  }

  animateDoorOpen() {
    this.play('door-open');
    this.tweens.add({ targets: this.door.leftDoor, x: this.door.baseX - 34, duration: 220, yoyo: true });
    this.tweens.add({ targets: this.door.rightDoor, x: this.door.baseX + 34, duration: 220, yoyo: true });
  }

  createDonerMachine(x, y) {
    const stand = this.add.rectangle(x, y + 100, 92, 26, 0x4f3629).setStrokeStyle(4, 0x2e2019);
    const pole = this.add.rectangle(x, y + 18, 24, 178, 0x6e6e70).setStrokeStyle(4, 0x48484a);
    this.doner = this.add.ellipse(x, y, 76, 160, 0xd26036).setStrokeStyle(4, 0x6a321f);
    this.ember = this.add.ellipse(x, y + 86, 52, 20, 0xff8a3d, 0.85);

    this.midLayer.add([stand, pole, this.doner, this.ember]);

    this.tweens.add({ targets: this.doner, scaleX: { from: 1, to: 0.84 }, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.ember, alpha: { from: 0.9, to: 0.45 }, duration: 560, yoyo: true, repeat: -1 });

    this.steam = this.add.particles(x, y - 54, 'steam-dot', {
      speedY: { min: -90, max: -50 },
      speedX: { min: -18, max: 18 },
      lifespan: { min: 700, max: 1100 },
      scale: { start: 0.95, end: 0 },
      alpha: { start: 0.6, end: 0 },
      quantity: 1,
      frequency: 100,
    }).setDepth(12);
  }

  createCounterUI() {
    const { width, height } = this.scale;

    this.feedbackText = this.add
      .text(width / 2, 330, '', {
        fontSize: '32px',
        color: '#fff8ef',
        stroke: '#6e3a22',
        strokeThickness: 8,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(42)
      .setAlpha(0);

    this.globalPatienceBarBg = this.add.rectangle(width / 2, 294, width * 0.8, 18, 0xffffff).setStrokeStyle(3, 0x8e5a37);
    this.globalPatienceBar = this.add.rectangle(width * 0.1, 294, width * 0.8, 18, 0x77c06f).setOrigin(0, 0.5);
    this.foregroundLayer.add([this.globalPatienceBarBg, this.globalPatienceBar]);

    this.plateShadow = this.add.ellipse(width * 0.34, height * 0.66, 200, 34, 0x000000, 0.2);
    this.plate = this.add.ellipse(width * 0.34, height * 0.64, 190, 32, 0xf8f8f8).setStrokeStyle(4, 0xb0b0b0);
    this.foregroundLayer.add([this.plateShadow, this.plate]);

    this.stackText = this.add
      .text(width * 0.34, height * 0.73, 'Stack: (empty)', {
        fontSize: '22px',
        color: '#fff8ef',
        stroke: '#5b311e',
        strokeThickness: 6,
        align: 'center',
        wordWrap: { width: width * 0.48 },
      })
      .setOrigin(0.5);
    this.foregroundLayer.add(this.stackText);
  }

  createControls() {
    const { width, height } = this.scale;
    this.serveButton = this.createButton(width * 0.75, height * 0.61, 192, 90, 'Serve', 0x3f9d51);
    this.clearButton = this.createButton(width * 0.75, height * 0.72, 192, 74, 'Clear', 0xa45f3a);

    this.serveButton.bg.on('pointerdown', () => this.serveOrder());
    this.clearButton.bg.on('pointerdown', () => {
      this.playerStack = [];
      this.refreshStackVisuals();
      this.playSfx('clear');
      this.updateServeButtonState();
    });

    this.buttonPanelY = height * 0.81;
    this.buttonPanelWidth = width - 36;
  }

  createButton(x, y, w, h, text, color) {
    const c = this.add.container(x, y).setDepth(35);
    const glow = this.add.rectangle(0, 0, w + 20, h + 20, 0xfff2c6, 0.15);
    const bg = this.add.rectangle(0, 0, w, h, color).setStrokeStyle(5, 0xffffff).setInteractive({ useHandCursor: true });
    const label = this.add
      .text(0, 0, text, {
        fontSize: '34px',
        color: '#fff',
        fontStyle: 'bold',
        stroke: '#6c341f',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    c.add([glow, bg, label]);
    bg.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.05, duration: 100 }));
    bg.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 100 }));
    return { container: c, bg, label, glow };
  }

  createIngredientButtons(options) {
    this.ingredientButtons.forEach((button) => button.container.destroy());
    this.ingredientButtons = [];

    const { width } = this.scale;
    const columns = 2;
    const gapX = 16;
    const gapY = 14;
    const btnWidth = (this.buttonPanelWidth - gapX) / columns;
    const btnHeight = 72;
    const startX = width / 2 - this.buttonPanelWidth / 2 + btnWidth / 2;

    options.forEach((ingredient, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * (btnWidth + gapX);
      const y = this.buttonPanelY + row * (btnHeight + gapY);
      const color = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;

      const c = this.add.container(x, y).setDepth(36);
      const shadow = this.add.rectangle(0, 6, btnWidth, btnHeight, 0x000000, 0.18);
      const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 0, ingredient, {
          fontSize: '24px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#6a2e1b',
          strokeThickness: 4,
          wordWrap: { width: btnWidth - 20 },
          align: 'center',
        })
        .setOrigin(0.5);

      c.add([shadow, bg, label]);

      bg.on('pointerdown', () => {
        this.handleIngredientPick(ingredient);
        this.tweens.add({ targets: c, scale: 1.08, duration: 90, yoyo: true });
        this.emitPopParticles(x, y);
      });
      bg.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.04, duration: 80 }));
      bg.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 80 }));

      this.ingredientButtons.push({ container: c, bg, label });
    });
  }

  createCustomerAtEntrance() {
    const { height } = this.scale;
    const container = this.add.container(-80, height * 0.49).setDepth(22);

    const glow = this.add.circle(0, 0, 58, 0x75c97e, 0.22);
    const body = this.add.rectangle(0, 36, 84, 94, 0x6ea7c6).setStrokeStyle(4, 0x2d1e16);
    const head = this.add.circle(0, -18, 36, 0xffd3af).setStrokeStyle(4, 0x5b2b1d);
    const eyeL = this.add.circle(-11, -24, 4, 0x362117);
    const eyeR = this.add.circle(11, -24, 4, 0x362117);
    const mouth = this.add.arc(0, -6, 10, 20, 160, false, 0x362117).setLineWidth(3, 3);

    const bubble = this.add.container(0, -108).setScale(0.2).setAlpha(0);
    const bubbleBg = this.add.rectangle(0, 0, 220, 88, 0xffffff).setStrokeStyle(4, 0x6f4a35);
    const bubbleTail = this.add.triangle(-60, 42, 0, 0, 22, 8, 8, 20, 0xffffff).setStrokeStyle(3, 0x6f4a35);
    const iconRow = this.add.container(-88, 0);

    bubble.add([bubbleBg, bubbleTail, iconRow]);
    container.add([glow, body, head, eyeL, eyeR, mouth, bubble]);

    this.customerLayer.add(container);

    return {
      container,
      glow,
      mouth,
      bubble,
      iconRow,
      patienceBg: this.add.rectangle(0, -162, 160, 12, 0xffffff).setStrokeStyle(3, 0x6a4b3b).setDepth(23),
      patienceBar: this.add.rectangle(-80, -162, 160, 12, 0x7bd37f).setOrigin(0, 0.5).setDepth(24),
    };
  }

  enterCustomerAndSetupOrder() {
    this.animateDoorOpen();
    this.customerVisual = this.createCustomerAtEntrance();

    this.customerVisual.patienceBg.setPosition(-80, this.scale.height * 0.49 - 162);
    this.customerVisual.patienceBar.setPosition(-160, this.scale.height * 0.49 - 162);

    this.tweens.add({
      targets: this.customerVisual.container,
      x: 130,
      duration: 680,
      ease: 'Sine.out',
      onUpdate: () => {
        const cx = this.customerVisual.container.x;
        this.customerVisual.patienceBg.x = cx;
        this.customerVisual.patienceBar.x = cx - 80;
      },
      onComplete: () => {
        this.tweens.add({ targets: this.customerVisual.container, y: this.customerVisual.container.y - 8, duration: 120, yoyo: true });
        this.showOrderBubble();
        this.isTransitioningCustomer = false;
      },
    });
  }

  showOrderBubble() {
    if (!this.customerVisual || !this.activeOrder) return;

    this.customerVisual.iconRow.removeAll(true);
    this.activeOrder.ingredients.forEach((ingredient, i) => {
      const color = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;
      const x = i * 42;
      const icon = this.add.circle(x, 0, 16, color).setStrokeStyle(3, 0xffffff);
      const dot = this.add.text(x, 0, ingredient[0], { fontSize: '14px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      this.customerVisual.iconRow.add([icon, dot]);
    });

    this.customerVisual.bubble.x = -((this.activeOrder.ingredients.length - 1) * 21);
    this.tweens.add({ targets: this.customerVisual.bubble, alpha: 1, scale: 1, duration: 230, ease: 'Back.out' });
  }

  spawnCustomerAndOrder() {
    this.activeCustomer = Phaser.Utils.Array.GetRandom(CUSTOMER_TYPES);
    this.activeOrder = this.pickMenuItemForLevel();
    const patienceTotal = this.basePatienceSeconds * this.character.patienceMultiplier * this.activeCustomer.patienceMultiplier;

    this.playerStack = [];
    this.patienceRemaining = Phaser.Math.Clamp(Math.floor(patienceTotal), 8, 45);
    this.activeOrder.timeLimit = this.patienceRemaining;
    this.menuBoardText.setText(this.activeOrder.name);

    const pool = this.buildIngredientPool(this.activeOrder.ingredients, 8);
    this.createIngredientButtons(pool);
    this.refreshStackVisuals();
    this.updateServeButtonState();

    this.isTransitioningCustomer = true;
    this.enterCustomerAndSetupOrder();
    this.emitUiUpdate();
  }

  handleIngredientPick(ingredient) {
    if (this.isTransitioningCustomer) return;

    const now = this.time.now;
    const cooldown = 200 / this.character.prepMultiplier;
    if (now - this.lastActionTime < cooldown) return;

    this.lastActionTime = now;
    this.playerStack.push(ingredient);
    this.refreshStackVisuals();
    this.updateServeButtonState();
    this.playSfx('ingredient');
  }

  refreshStackVisuals() {
    this.stackSprites.forEach((s) => s.destroy());
    this.stackSprites = [];

    const baseX = this.plate.x;
    const baseY = this.plate.y - 6;
    const stackItems = this.playerStack.slice(-8);

    stackItems.forEach((ingredient, i) => {
      const y = baseY - i * 26;
      const color = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;
      const shadow = this.add.ellipse(baseX, y + 10, 148, 12, 0x000000, 0.16).setDepth(31);
      const plate = this.add.rectangle(baseX, y, 160, 22, color).setStrokeStyle(3, 0xffffff).setDepth(32);
      const label = this.add
        .text(baseX, y, ingredient, {
          fontSize: '15px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#6b3a24',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(33);
      this.stackSprites.push(shadow, plate, label);
    });

    this.stackText.setText(this.playerStack.length ? `Stack: ${this.playerStack.join(' • ')}` : 'Stack: (empty)');
  }

  emitPopParticles(x, y) {
    const emitter = this.add.particles(x, y, 'pop-dot', {
      speed: { min: 40, max: 110 },
      angle: { min: 0, max: 360 },
      lifespan: 260,
      scale: { start: 1, end: 0 },
      quantity: 8,
      gravityY: 80,
    }).setDepth(45);

    this.time.delayedCall(240, () => emitter.destroy());
  }

  updateServeButtonState() {
    const target = this.activeOrder?.ingredients ?? [];
    const correctLength = this.playerStack.length === target.length;
    const correctSeq = correctLength && this.playerStack.every((item, i) => item === target[i]);

    this.serveButton.glow.fillColor = correctSeq ? 0xffef7a : 0xfff2c6;
    this.serveButton.glow.alpha = correctSeq ? 0.5 : 0.15;
  }

  serveOrder() {
    if (this.isTransitioningCustomer || !this.activeOrder) return;
    if (this.playerStack.length === 0) {
      this.showFeedback('Build your kebab first!', '#a14d22');
      return;
    }

    const target = this.activeOrder.ingredients;
    const isCorrect = this.playerStack.length === target.length && this.playerStack.every((item, i) => item === target[i]);

    if (isCorrect) {
      this.applyOrderSuccess();
    } else {
      this.applyOrderMistake();
    }
  }

  applyOrderSuccess() {
    const timeRatio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.timeLimit, 0, 1);
    const difficultyScore = 60 + this.activeOrder.difficulty * 40;
    const speedBonus = Math.floor(90 * timeRatio);
    const comboMultiplier = 1 + (this.combo - 1) * 0.35;
    const gained = Math.floor(difficultyScore * comboMultiplier + speedBonus);

    this.score += gained;
    this.completedOrders += 1;
    this.combo = Math.min(this.combo + 0.2, 5);
    if (this.completedOrders % 3 === 0) this.level += 1;

    this.play('serve-success');
    this.playSfx('success');
    this.showMoneyPop(`+$${gained}`);
    this.showFeedback('Great serve!', '#2f9144');

    if (this.customerVisual) {
      this.customerVisual.mouth.setStartAngle(20).setEndAngle(160).setAnticlockwise(false);
    }

    this.exitCustomerToRight(() => {
      this.cleanupCustomerVisual();
      this.spawnCustomerAndOrder();
    });
  }

  applyOrderMistake() {
    this.play('mistake');
    this.playSfx('fail');
    this.combo = 1;

    const sharpDrop = Math.max(2.5, this.activeOrder.timeLimit * 0.3);
    this.patienceRemaining -= sharpDrop;
    this.showFeedback('Wrong recipe!', '#c43e34');

    this.flashRedOverlay();
    this.shakeCustomerAngry();

    if (this.patienceRemaining <= 0) {
      const penalty = Math.floor((24 + this.level * 4) * this.character.mistakePenaltyMultiplier);
      this.score = Math.max(0, this.score - penalty);
      this.exitCustomerToRight(() => {
        this.cleanupCustomerVisual();
        this.spawnCustomerAndOrder();
      });
    }

    this.emitUiUpdate();
  }

  shakeCustomerAngry() {
    if (!this.customerVisual) return;
    this.tweens.add({ targets: this.customerVisual.container, x: this.customerVisual.container.x + 6, duration: 50, yoyo: true, repeat: 4 });
    this.customerVisual.mouth.setStartAngle(200).setEndAngle(340).setAnticlockwise(false);
  }

  flashRedOverlay() {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.22).setDepth(48);
    this.tweens.add({ targets: flash, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
  }

  showMoneyPop(text) {
    const pop = this.add
      .text(this.scale.width * 0.6, this.scale.height * 0.47, text, {
        fontSize: '34px',
        color: '#e2ff9f',
        stroke: '#2b7d34',
        strokeThickness: 7,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(46);

    this.tweens.add({ targets: pop, y: pop.y - 46, alpha: 0, duration: 760, onComplete: () => pop.destroy() });
  }

  exitCustomerToRight(onComplete) {
    if (!this.customerVisual) {
      onComplete();
      return;
    }

    this.isTransitioningCustomer = true;
    this.tweens.add({
      targets: this.customerVisual.container,
      x: this.scale.width + 90,
      duration: 620,
      ease: 'Sine.in',
      onUpdate: () => {
        const cx = this.customerVisual.container.x;
        this.customerVisual.patienceBg.x = cx;
        this.customerVisual.patienceBar.x = cx - 80;
      },
      onComplete,
    });
  }

  cleanupCustomerVisual() {
    if (!this.customerVisual) return;
    this.customerVisual.patienceBg.destroy();
    this.customerVisual.patienceBar.destroy();
    this.customerVisual.container.destroy();
    this.customerVisual = null;
  }

  pickMenuItemForLevel() {
    const weighted = MENU_ITEMS.map((item) => {
      const levelDiff = Math.abs(item.difficulty - this.level);
      const levelWeight = Math.max(1, 6 - levelDiff);
      const difficultyWeight = 1 + item.difficulty * 0.3;
      return { item, weight: levelWeight * difficultyWeight };
    });

    const total = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * total;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        return {
          name: entry.item.name,
          ingredients: [...entry.item.ingredients],
          difficulty: entry.item.difficulty,
          prepTime: entry.item.prepTime,
        };
      }
    }

    const fallback = MENU_ITEMS[0];
    return {
      name: fallback.name,
      ingredients: [...fallback.ingredients],
      difficulty: fallback.difficulty,
      prepTime: fallback.prepTime,
    };
  }

  buildIngredientPool(required, targetCount) {
    const pool = new Set(required);
    const extras = Object.keys(INGREDIENTS).filter((name) => !pool.has(name));
    while (pool.size < targetCount && extras.length) {
      const idx = Phaser.Math.Between(0, extras.length - 1);
      pool.add(extras[idx]);
      extras.splice(idx, 1);
    }
    return Phaser.Utils.Array.Shuffle(Array.from(pool));
  }

  showFeedback(message, color) {
    this.feedbackText.setText(message).setColor(color).setAlpha(1).setScale(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({
      targets: this.feedbackText,
      y: this.feedbackText.y - 10,
      alpha: 0,
      duration: 900,
      delay: 120,
      onComplete: () => this.feedbackText.setY(330),
    });
  }

  play(name) {
    // Placeholder event hook for future audio integration.
    return name;
  }

  playSfx(_name) {
    // Additional SFX hook for future free audio assets.
  }

  emitUiUpdate() {
    this.events.emit('ui-update', {
      score: this.score,
      combo: this.combo,
      level: this.level,
      character: this.character,
      timeLeft: this.patienceRemaining,
      timeTotal: this.activeOrder?.timeLimit ?? 0,
    });
  }

  update(_, delta) {
    if (!this.activeOrder || this.isTransitioningCustomer) return;

    this.patienceRemaining -= delta / 1000;
    if (this.patienceRemaining <= 0) {
      const penalty = Math.floor((24 + this.level * 4) * this.character.mistakePenaltyMultiplier);
      this.score = Math.max(0, this.score - penalty);
      this.combo = 1;
      this.showFeedback('Customer left!', '#be4636');
      this.exitCustomerToRight(() => {
        this.cleanupCustomerVisual();
        this.spawnCustomerAndOrder();
      });
      return;
    }

    this.updatePatienceBars();
    this.emitUiUpdate();
  }

  updatePatienceBars() {
    if (!this.activeOrder) return;

    const ratio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.timeLimit, 0, 1);
    const full = this.scale.width * 0.8;
    const color = ratio < 0.3 ? 0xd95a4d : ratio < 0.6 ? 0xddad49 : 0x77c06f;

    this.globalPatienceBar.width = full * ratio;
    this.globalPatienceBar.fillColor = color;

    if (this.customerVisual) {
      this.customerVisual.patienceBar.width = 160 * ratio;
      this.customerVisual.patienceBar.fillColor = color;
      this.customerVisual.glow.fillColor = color;
    }
  }
}
