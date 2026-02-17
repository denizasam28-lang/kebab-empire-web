const INGREDIENTS = ['Bread', 'Meat', 'Sauce', 'Salad', 'Wrap'];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.combo = 1;
    this.level = 1;
    this.completedOrders = 0;
    this.activeOrder = null;
    this.playerStack = [];
    this.patienceRemaining = 0;
    this.lastActionTime = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#f7ead7');

    this.character = this.registry.get('selectedCharacter');

    this.add.rectangle(width / 2, height * 0.48, width - 64, height * 0.4, 0xf1dcc2).setStrokeStyle(2, 0xe0b07e);
    this.add.rectangle(width / 2, height * 0.78, width - 64, 132, 0xedd2b1).setStrokeStyle(2, 0xe0b07e);

    this.orderText = this.add
      .text(width / 2, 52, '', {
        fontSize: '26px',
        color: '#4e2f19',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5);

    this.patienceBarBg = this.add.rectangle(width / 2, 96, width * 0.46, 18, 0xffffff).setStrokeStyle(2, 0xd3a46e);
    this.patienceBar = this.add.rectangle(width / 2 - width * 0.23, 96, width * 0.46, 18, 0x77c06f).setOrigin(0, 0.5);

    this.stackText = this.add
      .text(width / 2, height * 0.45, 'Current Stack: (empty)', {
        fontSize: '24px',
        color: '#6c4828',
        align: 'center',
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(width / 2, height * 0.57, '', {
        fontSize: '28px',
        color: '#3b8f43',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.createIngredientButtons();
    this.generateOrder();

    this.events.emit('ui-update', {
      score: this.score,
      combo: this.combo,
      level: this.level,
      character: this.character,
      timeLeft: this.patienceRemaining,
      timeTotal: this.activeOrder.timeLimit,
    });
  }

  createIngredientButtons() {
    const { width, height } = this.scale;
    const gap = 12;
    const btnWidth = Math.min(160, (width - 64 - gap * 4) / 5);
    const startX = 32 + btnWidth / 2;

    INGREDIENTS.forEach((ingredient, idx) => {
      const x = startX + idx * (btnWidth + gap);
      const y = height * 0.78;
      const button = this.add
        .rectangle(x, y, btnWidth, 76, 0xd97a2f)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xfff5ea)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(x, y, ingredient, {
          fontSize: '20px',
          color: '#fff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      button.on('pointerdown', () => {
        this.handleIngredientPick(ingredient);
      });

      button.on('pointerover', () => {
        this.tweens.add({ targets: [button, label], scale: 1.06, duration: 110 });
      });
      button.on('pointerout', () => {
        this.tweens.add({ targets: [button, label], scale: 1, duration: 110 });
      });
    });
  }

  handleIngredientPick(ingredient) {
    const now = this.time.now;
    const cooldown = 240 / this.character.prepMultiplier;
    if (now - this.lastActionTime < cooldown) {
      return;
    }
    this.lastActionTime = now;

    this.playerStack.push(ingredient);
    this.stackText.setText(`Current Stack: ${this.playerStack.join(' + ')}`);

    const currentIndex = this.playerStack.length - 1;
    const expected = this.activeOrder.ingredients[currentIndex];

    if (ingredient !== expected) {
      this.applyOrderFailure('Wrong order! Customer angry.');
      return;
    }

    if (this.playerStack.length === this.activeOrder.ingredients.length) {
      this.applyOrderSuccess();
    }
  }

  applyOrderSuccess() {
    const gained = Math.floor((120 + this.activeOrder.ingredients.length * 25) * this.combo);
    this.score += gained;
    this.completedOrders += 1;
    this.combo = Math.min(this.combo + 0.25, 5);

    if (this.completedOrders % 3 === 0) {
      this.level += 1;
    }

    this.showFloatingMoney(`+$${gained}`);
    this.showFeedback('Order Complete!', '#3b8f43');

    this.generateOrder();
  }

  applyOrderFailure(message) {
    const penalty = Math.floor(50 * this.character.mistakePenaltyMultiplier + this.level * 5);
    this.score = Math.max(0, this.score - penalty);
    this.combo = 1;

    this.showFeedback(message, '#b84433');
    this.generateOrder();
  }

  showFloatingMoney(label) {
    const text = this.add
      .text(this.scale.width / 2, this.scale.height * 0.62, label, {
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

  generateOrder() {
    const ingredientCount = Phaser.Math.Clamp(3 + Math.floor(this.level / 2), 3, 5);
    const ingredients = [];

    for (let i = 0; i < ingredientCount; i += 1) {
      ingredients.push(INGREDIENTS[Phaser.Math.Between(0, INGREDIENTS.length - 1)]);
    }

    const baseTime = 15 - Math.min(this.level, 7);
    const rushFactor = this.level >= 5 ? 0.88 : 1;
    const timeLimit = Math.max(7, Math.floor(baseTime * this.character.patienceMultiplier * rushFactor));

    this.activeOrder = {
      ingredients,
      timeLimit,
    };

    this.playerStack = [];
    this.patienceRemaining = timeLimit;
    this.stackText.setText('Current Stack: (empty)');
    this.orderText.setText(`Order: ${ingredients.join(' + ')}`);

    this.events.emit('ui-update', {
      score: this.score,
      combo: this.combo,
      level: this.level,
      character: this.character,
      timeLeft: this.patienceRemaining,
      timeTotal: this.activeOrder.timeLimit,
    });
  }

  update(_, delta) {
    if (!this.activeOrder) {
      return;
    }

    const speedFactor = this.level >= 5 ? 1.2 : 1;
    this.patienceRemaining -= (delta / 1000) * speedFactor;
    if (this.patienceRemaining <= 0) {
      this.applyOrderFailure('Customer left! Too slow.');
      return;
    }

    this.updatePatienceBar();
    this.events.emit('ui-update', {
      score: this.score,
      combo: this.combo,
      level: this.level,
      character: this.character,
      timeLeft: this.patienceRemaining,
      timeTotal: this.activeOrder.timeLimit,
    });
  }

  updatePatienceBar() {
    const fullWidth = this.scale.width * 0.46;
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
