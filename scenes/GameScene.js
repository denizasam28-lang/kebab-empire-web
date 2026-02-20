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
    this.patienceRemaining = 0;
    this.lastActionTime = 0;
    this.basePatienceSeconds = 24;
    this.matchRule = 'exact-sequence';
    this.ingredientButtons = [];
  }

  create() {
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
      })
      .setOrigin(0.5);

    this.patienceBarBg = this.add.rectangle(width / 2, 154, width * 0.56, 18, 0xffffff).setStrokeStyle(2, 0xd3a46e);
    this.patienceBar = this.add.rectangle(width / 2 - width * 0.28, 154, width * 0.56, 18, 0x77c06f).setOrigin(0, 0.5);

    this.stackText = this.add
      .text(width / 2, height * 0.46, 'Current Stack: (empty)', {
        fontSize: '26px',
        color: '#6c4828',
        align: 'center',
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(width / 2, height * 0.54, '', {
        fontSize: '30px',
        color: '#3b8f43',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
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

      const label = this.add
        .text(x, y, ingredient, {
          fontSize: '20px',
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
    const now = this.time.now;
    const cooldown = 210 / this.character.prepMultiplier;
    if (now - this.lastActionTime < cooldown) {
      return;
    }
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

    if (this.completedOrders % 3 === 0) {
      this.level += 1;
    }

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
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 36,
      alpha: 0,
      duration: 650,
      onComplete: () => text.destroy(),
    });
  }

  showFeedback(message, color) {
    this.feedbackText.setText(message).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 900, delay: 300 });
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
    if (!this.activeOrder) {
      return;
    }

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
    this.patienceBar.width = fullWidth * ratio;

    if (ratio < 0.3) {
      this.patienceBar.fillColor = 0xd95a4d;
    } else if (ratio < 0.6) {
      this.patienceBar.fillColor = 0xddad49;
    } else {
      this.patienceBar.fillColor = 0x77c06f;
    }
  }
}
