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
    this.activeOrder = null;
    this.activeCustomer = null;
    this.playerStack = [];
    this.basePatienceSeconds = 24;
    this.patienceRemaining = 0;
    this.ingredientButtons = [];
    this.stackSprites = [];
    this.lastActionTime = 0;
    this.matchRule = 'exact-sequence';
  }

  create() {
    this.character = this.registry.get('selectedCharacter');
    this.palette = this.registry.get('palette');
    this.cameras.main.setBackgroundColor(0xf8d6ae);

    this.buildShopInterior();
    this.createCustomerVisual();
    this.createOrderUI();
    this.createControlButtons();

    this.spawnNextOrder();
    this.emitUiUpdate();
  }

  buildShopInterior() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height * 0.31, width, height * 0.62, 0xf4c793);
    this.add.rectangle(width / 2, height * 0.58, width, height * 0.07, 0xd98c5f);
    this.add.rectangle(width / 2, height * 0.76, width, height * 0.48, 0xa85d3b);

    const signGlow = this.add.text(width / 2, 90, 'Kebab Empire', {
      fontSize: '58px',
      color: '#ffb4af',
      fontStyle: 'bold',
      stroke: '#ff5e57',
      strokeThickness: 18,
    }).setOrigin(0.5).setAlpha(0.35);

    this.neonText = this.add.text(width / 2, 90, 'Kebab Empire', {
      fontSize: '56px',
      color: '#fff8ea',
      fontStyle: 'bold',
      stroke: '#ff5e57',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.add({ targets: [signGlow, this.neonText], alpha: { from: 0.9, to: 0.65 }, duration: 900, yoyo: true, repeat: -1 });

    this.add.rectangle(width / 2, 166, width * 0.68, 62, 0x6e3a22).setStrokeStyle(4, 0xfce8ca);
    this.menuBoardText = this.add
      .text(width / 2, 166, 'Order: --', {
        fontSize: '24px',
        color: '#ffe7c2',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.createDonerMachine(width * 0.85, height * 0.54);
  }

  createDonerMachine(x, y) {
    this.add.rectangle(x, y + 96, 84, 24, 0x4f3629).setStrokeStyle(4, 0x2e2019);
    this.add.rectangle(x, y + 22, 24, 168, 0x6e6e70).setStrokeStyle(4, 0x48484a);

    this.doner = this.add.ellipse(x, y, 76, 152, 0xd26036).setStrokeStyle(4, 0x6a321f);
    this.ember = this.add.ellipse(x, y + 82, 52, 18, 0xff8a3d, 0.85).setStrokeStyle(0, 0x000000);

    this.tweens.add({ targets: this.doner, scaleX: { from: 1, to: 0.86 }, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.ember, alpha: { from: 0.9, to: 0.45 }, duration: 500, yoyo: true, repeat: -1 });

    const steamFrame = this.add.graphics();
    steamFrame.fillStyle(0xffffff, 0.85);
    steamFrame.fillCircle(6, 6, 6);
    steamFrame.generateTexture('steam-dot', 12, 12);
    steamFrame.destroy();

    this.steam = this.add.particles(x, y - 48, 'steam-dot', {
      speedY: { min: -90, max: -42 },
      speedX: { min: -18, max: 18 },
      lifespan: { min: 800, max: 1200 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.6, end: 0 },
      quantity: 1,
      frequency: 120,
    });
  }

  createCustomerVisual() {
    const { width } = this.scale;
    this.customerContainer = this.add.container(width * 0.18, 250);
    this.customerOutline = this.add.circle(0, 0, 44, 0x75c97e).setStrokeStyle(4, 0x2f5932);
    const face = this.add.circle(0, 0, 34, 0xffd3af).setStrokeStyle(3, 0x5b2b1d);
    const eyeL = this.add.circle(-10, -6, 4, 0x362117);
    const eyeR = this.add.circle(10, -6, 4, 0x362117);
    const mouth = this.add.arc(0, 10, 12, 20, 160, false, 0x362117).setLineWidth(3, 3);

    this.customerPatienceBg = this.add.rectangle(0, -58, 84, 10, 0xffffff).setStrokeStyle(2, 0x6a4b3b);
    this.customerPatienceBar = this.add.rectangle(-42, -58, 84, 10, 0x7bd37f).setOrigin(0, 0.5);

    this.customerContainer.add([this.customerOutline, face, eyeL, eyeR, mouth, this.customerPatienceBg, this.customerPatienceBar]);
  }

  createOrderUI() {
    const { width, height } = this.scale;

    this.orderText = this.add
      .text(width * 0.5, 238, '', {
        fontSize: '26px',
        color: '#542d1d',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width * 0.75 },
      })
      .setOrigin(0.5);

    this.stackZone = this.add.rectangle(width * 0.34, height * 0.53, width * 0.46, 282, 0xf1ceb0).setStrokeStyle(4, 0x8f4f31);
    this.stackText = this.add
      .text(width * 0.34, height * 0.67, 'Stack: (empty)', {
        fontSize: '22px',
        color: '#5b311e',
        align: 'center',
        wordWrap: { width: width * 0.38 },
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(width * 0.5, height * 0.43, '', {
        fontSize: '30px',
        color: '#3b8f43',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.patienceBarBg = this.add.rectangle(width * 0.5, 308, width * 0.78, 18, 0xffffff).setStrokeStyle(3, 0x8e5a37);
    this.patienceBar = this.add.rectangle(width * 0.11, 308, width * 0.78, 18, 0x77c06f).setOrigin(0, 0.5);
  }

  createControlButtons() {
    const { width, height } = this.scale;

    this.serveButton = this.createButton(width * 0.74, height * 0.56, 190, 88, 'Serve', 0x3f9d51);
    this.clearButton = this.createButton(width * 0.74, height * 0.67, 190, 74, 'Clear', 0xa45f3a);

    this.serveButton.bg.on('pointerdown', () => this.serveOrder());
    this.clearButton.bg.on('pointerdown', () => {
      this.playerStack = [];
      this.refreshStackVisuals();
      this.playSfx('clear');
    });

    this.buttonPanelY = height * 0.79;
    this.buttonPanelWidth = width - 36;
  }

  createIngredientButtons(options) {
    this.ingredientButtons.forEach((item) => item.container.destroy());
    this.ingredientButtons = [];

    const { width } = this.scale;
    const columns = 2;
    const gapX = 16;
    const gapY = 14;
    const btnWidth = (this.buttonPanelWidth - gapX) / columns;
    const btnHeight = 70;
    const startX = width / 2 - this.buttonPanelWidth / 2 + btnWidth / 2;

    options.forEach((ingredient, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * (btnWidth + gapX);
      const y = this.buttonPanelY + row * (btnHeight + gapY);
      const color = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;

      const c = this.add.container(x, y);
      const shadow = this.add.rectangle(0, 6, btnWidth, btnHeight, 0x000000, 0.18).setStrokeStyle(0, 0x000000);
      const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color).setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 0, ingredient, {
          fontSize: '25px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#6a2e1b',
          strokeThickness: 4,
          align: 'center',
          wordWrap: { width: btnWidth - 20 },
        })
        .setOrigin(0.5);

      c.add([shadow, bg, label]);

      bg.on('pointerdown', () => {
        this.handleIngredientPick(ingredient);
        this.tweens.add({ targets: c, scale: 1.08, duration: 90, yoyo: true });
        this.emitPopParticles(x, y);
      });
      bg.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.04, duration: 90 }));
      bg.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 90 }));

      this.ingredientButtons.push({ container: c, bg, label });
    });
  }

  createButton(x, y, w, h, text, color) {
    const c = this.add.container(x, y);
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

  handleIngredientPick(ingredient) {
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

    const baseX = this.stackZone.x;
    const baseY = this.stackZone.y + 96;
    const stackItems = this.playerStack.slice(-8);

    stackItems.forEach((ingredient, i) => {
      const y = baseY - i * 28;
      const color = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;
      const plate = this.add.rectangle(baseX, y, 180, 24, color).setStrokeStyle(3, 0xffffff);
      const text = this.add
        .text(baseX, y, ingredient, {
          fontSize: '16px',
          color: '#fff',
          fontStyle: 'bold',
          stroke: '#6b3a24',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      this.stackSprites.push(plate, text);
    });

    this.stackText.setText(this.playerStack.length ? `Stack: ${this.playerStack.join(' • ')}` : 'Stack: (empty)');
  }

  emitPopParticles(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0xffe6b8, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('pop-dot', 8, 8);
    g.destroy();

    const emitter = this.add.particles(x, y, 'pop-dot', {
      speed: { min: 40, max: 110 },
      angle: { min: 0, max: 360 },
      lifespan: 280,
      scale: { start: 1, end: 0 },
      quantity: 8,
      gravityY: 80,
    });

    this.time.delayedCall(260, () => emitter.destroy());
  }

  updateServeButtonState() {
    const target = this.activeOrder?.ingredients ?? [];
    const correctLength = this.playerStack.length === target.length;
    const correctSeq = correctLength && this.playerStack.every((item, i) => item === target[i]);

    this.serveButton.glow.fillColor = correctSeq ? 0xfff08b : 0xfff2c6;
    this.serveButton.glow.alpha = correctSeq ? 0.45 : 0.15;

    if (correctSeq) {
      this.tweens.add({ targets: this.serveButton.container, scale: { from: 1, to: 1.06 }, duration: 260, yoyo: true, repeat: 1 });
    }
  }

  serveOrder() {
    if (!this.activeOrder || this.playerStack.length === 0) {
      this.showFeedback('Build your kebab first!', '#a14d22');
      return;
    }

    const target = this.activeOrder.ingredients;
    const isCorrect = this.playerStack.length === target.length && this.playerStack.every((item, i) => item === target[i]);

    if (isCorrect) {
      this.applyOrderSuccess();
    } else {
      this.applyOrderFailure('Wrong recipe served.', 'mistake');
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

    this.showFeedback(`Perfect! +${gained}`, '#2f9144');
    this.playSfx('success');
    this.spawnNextOrder();
  }

  applyOrderFailure(message, reason = 'mistake') {
    const basePenalty = reason === 'timeout' ? 24 : 42;
    const penalty = Math.floor((basePenalty + this.level * 4) * this.character.mistakePenaltyMultiplier);
    this.score = Math.max(0, this.score - penalty);
    this.combo = 1;

    this.showFeedback(`${message} -${penalty}`, '#be4636');
    this.playSfx('fail');
    this.spawnNextOrder();
  }

  spawnNextOrder() {
    this.activeCustomer = Phaser.Utils.Array.GetRandom(CUSTOMER_TYPES);
    this.activeOrder = this.pickMenuItemForLevel();

    const patienceTotal = this.basePatienceSeconds * this.character.patienceMultiplier * this.activeCustomer.patienceMultiplier;
    this.activeOrder.timeLimit = Phaser.Math.Clamp(Math.floor(patienceTotal), 8, 45);

    this.playerStack = [];
    this.patienceRemaining = this.activeOrder.timeLimit;

    this.menuBoardText.setText(`${this.activeOrder.name}`);
    this.orderText.setText(`Required: ${this.activeOrder.ingredients.join(' + ')}`);

    const borderColor = this.activeCustomer.patienceMultiplier >= 1 ? 0x75c97e : 0xe27266;
    this.customerOutline.fillColor = borderColor;

    const pool = this.buildIngredientPool(this.activeOrder.ingredients, 8);
    this.createIngredientButtons(pool);
    this.refreshStackVisuals();
    this.updateServeButtonState();
    this.emitUiUpdate();
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
    this.tweens.add({ targets: this.feedbackText, y: this.feedbackText.y - 10, alpha: 0, duration: 900, delay: 150, onComplete: () => this.feedbackText.setY(this.scale.height * 0.43) });
  }

  playSfx(_name) {
    // Placeholder for future free audio SFX.
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
    if (!this.activeOrder) return;

    this.patienceRemaining -= delta / 1000;
    if (this.patienceRemaining <= 0) {
      this.applyOrderFailure('Customer left!', 'timeout');
      return;
    }

    this.updatePatienceBars();
    this.emitUiUpdate();
  }

  updatePatienceBars() {
    const full = this.scale.width * 0.78;
    const ratio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.timeLimit, 0, 1);
    this.patienceBar.width = full * ratio;
    this.customerPatienceBar.width = 84 * ratio;

    const color = ratio < 0.3 ? 0xd95a4d : ratio < 0.6 ? 0xddad49 : 0x77c06f;
    this.patienceBar.fillColor = color;
    this.customerPatienceBar.fillColor = color;
  }
}
