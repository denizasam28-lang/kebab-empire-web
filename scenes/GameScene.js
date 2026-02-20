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
    this.basePatienceSeconds = 24;
    this.patienceRemaining = 0;
    this.ingredientButtons = [];
    this.stackSprites = [];
    this.lastActionTime = 0;
    this.basePatienceSeconds = 24;
    this.matchRule = 'exact-sequence';
    this.ingredientButtons = [];
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
    this.cameras.main.setBackgroundColor('#f7ead7');
    this.character = this.registry.get('selectedCharacter');

    this.add.rectangle(width / 2, height * 0.42, width - 56, height * 0.42, 0xf1dcc2).setStrokeStyle(2, 0xe0b07e);
    this.add.rectangle(width / 2, height * 0.8, width - 56, 178, 0xedd2b1).setStrokeStyle(2, 0xe0b07e);

    this.customerText = this.add
      .text(28, 76, '', {
        fontSize: '24px',
        color: '#4e2f19',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    this.orderText = this.add
      .text(width / 2, 116, '', {
        fontSize: '24px',
        color: '#4e2f19',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width * 0.75 },
      })
      .setOrigin(0.5);

    this.patienceBarBg = this.add.rectangle(width / 2, 154, width * 0.56, 18, 0xffffff).setStrokeStyle(2, 0xd3a46e);
    this.patienceBar = this.add.rectangle(width / 2 - width * 0.28, 154, width * 0.56, 18, 0x77c06f).setOrigin(0, 0.5);

    this.stackText = this.add
      .text(width / 2, height * 0.46, 'Current Stack: (empty)', {
        fontSize: '26px',
        color: '#6c4828',
        align: 'center',
        wordWrap: { width: width * 0.38 },
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
      .text(width / 2, height * 0.54, '', {
        fontSize: '30px',
        color: '#3b8f43',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(42)
      .setAlpha(0);

    this.createActionButtons();
    this.spawnNextOrder();
    this.emitUiUpdate();
  }

  createActionButtons() {
    const { width, height } = this.scale;
    const serveButton = this.createButton(width * 0.23, height * 0.64, 180, 64, 'Serve', 0x3d9543, '#ffffff');
    const clearButton = this.createButton(width * 0.43, height * 0.64, 180, 64, 'Clear', 0xa56038, '#ffffff');

    serveButton.button.on('pointerdown', () => this.serveOrder());
    clearButton.button.on('pointerdown', () => {
      this.playerStack = [];
      this.stackText.setText('Current Stack: (empty)');
      this.playSfx('clear');
    });

    this.buttonPanelY = height * 0.79;
    this.buttonPanelWidth = width - 72;
  }

  createIngredientButtons(options) {
    this.ingredientButtons.forEach(({ button, label }) => {
      button.destroy();
      label.destroy();
    });
    this.ingredientButtons = [];

    const { width } = this.scale;
    const columns = 3;
    const rows = Math.ceil(options.length / columns);
    const gapX = 14;
    const gapY = 12;
    const panelWidth = this.buttonPanelWidth;
    const btnWidth = Math.min(240, (panelWidth - gapX * (columns - 1)) / columns);
    const btnHeight = rows > 1 ? 56 : 62;
    const startX = width / 2 - panelWidth / 2 + btnWidth / 2;

    options.forEach((ingredient, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * (btnWidth + gapX);
      const y = this.buttonPanelY + row * (btnHeight + gapY);
      const fillColor = INGREDIENTS[ingredient]?.color ?? 0xd97a2f;

      const button = this.add
        .rectangle(x, y, btnWidth, btnHeight, fillColor)
        .setStrokeStyle(2, 0xfff5ea)
        .setInteractive({ useHandCursor: true });

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
          align: 'center',
          wordWrap: { width: btnWidth - 18 },
        })
        .setOrigin(0.5);

      button.on('pointerdown', () => this.handleIngredientPick(ingredient));
      button.on('pointerover', () => this.tweens.add({ targets: [button, label], scale: 1.04, duration: 90 }));
      button.on('pointerout', () => this.tweens.add({ targets: [button, label], scale: 1, duration: 90 }));

      this.ingredientButtons.push({ button, label });
    });
  }

  createButton(x, y, w, h, text, color, textColor) {
    const button = this.add
      .rectangle(x, y, w, h, color)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(x, y, text, {
        fontSize: '30px',
        color: textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.on('pointerover', () => this.tweens.add({ targets: [button, label], scale: 1.04, duration: 100 }));
    button.on('pointerout', () => this.tweens.add({ targets: [button, label], scale: 1, duration: 100 }));

    return { button, label };
  }

  handleIngredientPick(ingredient) {
    if (this.isTransitioningCustomer) return;

    const now = this.time.now;
    const cooldown = 210 / this.character.prepMultiplier;
    if (now - this.lastActionTime < cooldown) {
      return;
    }
    this.lastActionTime = now;

    this.lastActionTime = now;
    this.playerStack.push(ingredient);
    this.stackText.setText(`Current Stack: ${this.playerStack.join(' + ')}`);
    this.playSfx('ingredient');
  }

  serveOrder() {
    if (!this.activeOrder || this.playerStack.length === 0) {
      this.showFeedback('Build the order first!', '#a14d22');
      return;
    }

    const target = this.activeOrder.ingredients;
    const isCorrect =
      this.playerStack.length === target.length &&
      this.playerStack.every((ingredient, index) => ingredient === target[index]);

    if (isCorrect) {
      this.applyOrderSuccess();
      return;
    }

    this.applyOrderFailure('Wrong recipe served.', 'mistake');
  }

  applyOrderSuccess() {
    const timeRatio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.timeLimit, 0, 1);
    const difficultyScore = 60 + this.activeOrder.difficulty * 40;
    const speedBonus = Math.floor(80 * timeRatio);
    const comboMultiplier = 1 + (this.combo - 1) * 0.35;
    const gained = Math.floor(difficultyScore * comboMultiplier + speedBonus);

    this.score += gained;
    this.completedOrders += 1;
    this.combo = Math.min(this.combo + 0.2, 5);

    this.play('serve-success');
    this.playSfx('success');
    this.showMoneyPop(`+$${gained}`);
    this.showFeedback('Great serve!', '#2f9144');

    this.showFloatingMoney(`+$${gained}`);
    this.showFeedback('Perfect serve!', '#3b8f43');
    this.playSfx('success');
    this.spawnNextOrder();
  }

  applyOrderFailure(message, reason = 'mistake') {
    const basePenalty = reason === 'timeout' ? 25 : 45;
    const penalty = Math.floor((basePenalty + this.level * 4) * this.character.mistakePenaltyMultiplier);
    this.score = Math.max(0, this.score - penalty);
    this.combo = 1;

    this.showFeedback(`${message} (-$${penalty})`, '#b84433');
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
    this.stackText.setText('Current Stack: (empty)');
    this.orderText.setText(`Order (${this.matchRule}): ${this.activeOrder.ingredients.join(' + ')}`);
    this.customerText.setText(`Customer: ${this.activeCustomer.name}`);

    const ingredientPool = this.buildIngredientPool(this.activeOrder.ingredients, 6);
    this.createIngredientButtons(ingredientPool);
    this.emitUiUpdate();
  }

  pickMenuItemForLevel() {
    const weighted = MENU_ITEMS.map((item) => {
      const levelDiff = Math.abs(item.difficulty - this.level);
      const levelWeight = Math.max(1, 6 - levelDiff);
      const difficultyWeight = 1 + item.difficulty * 0.3;
      return { item, weight: levelWeight * difficultyWeight };
    });

    const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

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

  buildIngredientPool(requiredIngredients, targetCount) {
    const pool = new Set(requiredIngredients);
    const candidates = Object.keys(INGREDIENTS).filter((ingredient) => !pool.has(ingredient));

    while (pool.size < targetCount && candidates.length > 0) {
      const index = Phaser.Math.Between(0, candidates.length - 1);
      pool.add(candidates[index]);
      candidates.splice(index, 1);
    }

    return Phaser.Utils.Array.Shuffle(Array.from(pool));
  }

  showFloatingMoney(label) {
    const text = this.add
      .text(this.scale.width / 2, this.scale.height * 0.6, label, {
        fontSize: '30px',
        color: '#2a8a2f',
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

  playSfx(_name) {
    // Placeholder hook for future free SFX integration.
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

    this.updatePatienceBar();
    this.emitUiUpdate();
  }

  updatePatienceBar() {
    const fullWidth = this.scale.width * 0.56;
    const ratio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.timeLimit, 0, 1);
    this.patienceBar.width = full * ratio;
    this.customerPatienceBar.width = 84 * ratio;

    const color = ratio < 0.3 ? 0xd95a4d : ratio < 0.6 ? 0xddad49 : 0x77c06f;
    this.patienceBar.fillColor = color;
    this.customerPatienceBar.fillColor = color;
  }
}
