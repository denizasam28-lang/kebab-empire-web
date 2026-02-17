export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.resetState();
  }

  resetState() {
    this.score = 0;
    this.combo = 1;
    this.level = 1;
    this.ordersServed = 0;
    this.activeOrder = null;
    this.playerStack = [];
    this.patienceRemaining = 0;
    this.lastActionTime = 0;
    this.totalRevenue = 0;
    this.totalProfit = 0;
    this.dailyEarnings = 0;
    this.currentOrderProfit = 0;
  }

  create() {
    this.resetState();
    const { width, height } = this.scale;
    this.character = this.registry.get('selectedCharacter');
    this.menuItems = this.registry.get('menuItems');
    this.ingredientsData = this.registry.get('ingredients');
    this.customerTypes = this.registry.get('customerTypes');

    this.cameras.main.setBackgroundColor('#f1e1cb');
    this.createKitchenBackground(width, height);
    this.createTopOrderPanel(width);
    this.createPrepArea(width, height);
    this.createIngredientTrayArea(width, height);
    this.createAmbientEffects(width, height);

    this.generateOrder();
    this.emitUiUpdate();
  }

  createKitchenBackground(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0xf5e7d1);
    for (let i = 0; i < 4; i += 1) {
      this.add.rectangle(160 + i * 220, 144, 180, 22, 0x6f4a32, 0.26);
    }

    const grillGlow = this.add.ellipse(width * 0.8, height * 0.4, 240, 80, 0xff7f3f, 0.15);
    this.tweens.add({ targets: grillGlow, alpha: { from: 0.08, to: 0.2 }, yoyo: true, repeat: -1, duration: 1200 });

    const woodTop = this.add.tileSprite(width / 2, height * 0.52, width - 60, 120, 'wood').setAlpha(0.9);
    woodTop.setTint(0x9a6238);
    this.add.rectangle(width / 2, height * 0.52, width - 60, 120, 0x6f3f25, 0.18).setStrokeStyle(2, 0xe3b07f);

    this.add.rectangle(width / 2, height * 0.89, width - 40, 120, 0xc98245).setStrokeStyle(3, 0xf8d8b2);
  }

  createTopOrderPanel(width) {
    this.receiptPanel = this.add.container(width * 0.36, 104);
    const shadow = this.add.rectangle(3, 6, 470, 146, 0x000000, 0.2);
    const paper = this.add.rectangle(0, 0, 470, 146, 0xfff8ec).setStrokeStyle(2, 0xd8ba8f);

    for (let i = -220; i <= 220; i += 22) {
      this.add.circle(i, -73, 5, 0xe5ceb1).setDepth(1).setParentContainer(this.receiptPanel);
    }

    this.orderTitleText = this.add.text(-220, -52, 'ORDER', { fontSize: '22px', color: '#714324', fontStyle: 'bold' });
    this.orderNameText = this.add.text(-220, -24, '', { fontSize: '20px', color: '#4e2f19', fontStyle: 'bold' });
    this.orderCategoryText = this.add.text(-220, 2, '', { fontSize: '16px', color: '#82593a' });
    this.orderPriceText = this.add.text(160, -52, '', { fontSize: '24px', color: '#1f8f4a', fontStyle: 'bold' }).setOrigin(1, 0);
    this.customerTypeText = this.add.text(160, -24, '', { fontSize: '16px', color: '#7d5332' }).setOrigin(1, 0);

    this.timerBarBg = this.add.rectangle(-222, 56, 444, 14, 0xe6d7c4).setOrigin(0, 0.5).setStrokeStyle(2, 0xcaa574);
    this.timerBar = this.add.rectangle(-222, 56, 444, 14, 0x7cc473).setOrigin(0, 0.5);

    this.orderIconsContainer = this.add.container(-220, 22);
    this.receiptPanel.add([
      shadow,
      paper,
      this.orderTitleText,
      this.orderNameText,
      this.orderCategoryText,
      this.orderPriceText,
      this.customerTypeText,
      this.orderIconsContainer,
      this.timerBarBg,
      this.timerBar,
    ]);

    this.customerBubble = this.add.container(width * 0.78, 104);
    const bubbleShadow = this.add.ellipse(0, 12, 160, 84, 0x000000, 0.14);
    const bubble = this.add.ellipse(0, 0, 150, 80, 0xfff8ee).setStrokeStyle(2, 0xd5ad76);
    this.customerAvatar = this.add.image(-40, 0, 'customer-office').setDisplaySize(52, 52);
    this.customerMood = this.add.text(20, -6, '🙂', { fontSize: '32px' }).setOrigin(0.5);
    this.customerBubble.add([bubbleShadow, bubble, this.customerAvatar, this.customerMood]);
  }

  createPrepArea(width, height) {
    this.add.text(width / 2, height * 0.42, 'Preparation Board', { fontSize: '24px', color: '#4a2e1d', fontStyle: 'bold' }).setOrigin(0.5);
    this.prepBoard = this.add.rectangle(width / 2, height * 0.55, 350, 120, 0xf7ebd6).setStrokeStyle(2, 0xd8b489);
    this.stackContainer = this.add.container(width / 2, height * 0.58);
    this.feedbackText = this.add.text(width / 2, height * 0.68, '', { fontSize: '28px', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);
  }

  createIngredientTrayArea(width, height) {
    this.trayContainer = this.add.container(0, 0);
    this.add.text(28, height * 0.78 - 52, 'Ingredient Trays', { fontSize: '22px', color: '#4a2e1d', fontStyle: 'bold' });
    this.trayY = height * 0.86;
    this.trayStartX = 30;
    this.trayWidth = width - 60;
  }

  createAmbientEffects(width, height) {
    const particles = this.add.particles(width * 0.8, height * 0.42, '__WHITE', {
      speedY: { min: -28, max: -12 },
      speedX: { min: -4, max: 4 },
      scale: { start: 0.14, end: 0 },
      alpha: { start: 0.18, end: 0 },
      lifespan: 1500,
      quantity: 1,
      frequency: 120,
      tint: [0xffffff, 0xf4e4d8],
    });
    particles.setDepth(3);
  }

  generateOrder() {
    const difficultyCap = Math.min(4, Math.floor((this.level + 1) / 2));
    const customer = Phaser.Utils.Array.GetRandom(this.customerTypes);

    const available = this.menuItems.filter((item) => item.difficulty <= Math.max(1, difficultyCap + customer.orderSizeBias));
    const item = Phaser.Utils.Array.GetRandom(available);

    const ingredientCost = item.ingredients.reduce((sum, ingredient) => sum + (this.ingredientsData[ingredient]?.cost || 0), 0);
    const sellingPrice = Number((item.basePrice * customer.payMultiplier).toFixed(2));
    const prepTime = Math.max(6, Math.floor(item.prepTime * this.character.patienceMultiplier * customer.patienceMultiplier));

    this.activeOrder = {
      customer,
      item,
      sellingPrice,
      ingredientCost,
      prepTime,
      perfectWindow: prepTime * 0.55,
      vipMultiplier: customer.vipMultiplier || 1,
    };

    this.playerStack = [];
    this.patienceRemaining = prepTime;
    this.renderOrderPanel();
    this.renderIngredientTrays();
    this.renderStack();
    this.emitUiUpdate();
  }

  renderOrderPanel() {
    const { item, customer, sellingPrice } = this.activeOrder;
    this.orderNameText.setText(item.name);
    this.orderCategoryText.setText(item.category);
    this.orderPriceText.setText(`$${sellingPrice.toFixed(2)}`);
    this.customerTypeText.setText(customer.name);
    this.customerAvatar.setTexture(customer.avatarKey);

    this.orderIconsContainer.removeAll(true);
    item.ingredients.forEach((ingredient, index) => {
      const sprite = this.add.image(index * 64, 0, this.ingredientsData[ingredient].imageKey).setDisplaySize(40, 40);
      this.orderIconsContainer.add(sprite);
    });
  }

  renderIngredientTrays() {
    const menuIngredients = [...new Set(this.activeOrder.item.ingredients)];
    const decoys = Phaser.Utils.Array.Shuffle(Object.keys(this.ingredientsData).filter((name) => !menuIngredients.includes(name))).slice(0, 5);
    const trayIngredients = Phaser.Utils.Array.Shuffle([...menuIngredients, ...decoys]);

    this.trayContainer.removeAll(true);
    const columns = 6;
    const slotW = this.trayWidth / columns;

    trayIngredients.forEach((ingredient, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = this.trayStartX + slotW * col + slotW / 2;
      const y = this.trayY + row * 68;

      const tray = this.add.container(x, y);
      const shadow = this.add.ellipse(0, 20, slotW * 0.68, 20, 0x000000, 0.2);
      const base = this.add.rectangle(0, 0, slotW * 0.68, 54, 0xe68d43).setStrokeStyle(2, 0xffe9d0).setInteractive({ useHandCursor: true });
      const gloss = this.add.rectangle(0, -12, slotW * 0.54, 14, 0xffffff, 0.18);
      const icon = this.add.image(0, -2, this.ingredientsData[ingredient].imageKey).setDisplaySize(30, 30);
      const label = this.add.text(0, 18, ingredient.split(' ')[0], { fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      tray.add([shadow, base, gloss, icon, label]);

      base.on('pointerover', () => this.tweens.add({ targets: tray, y: y - 6, duration: 100 }));
      base.on('pointerout', () => this.tweens.add({ targets: tray, y, duration: 100 }));
      base.on('pointerdown', () => {
        this.tweens.add({ targets: tray, scaleY: 0.9, yoyo: true, duration: 90 });
        this.handleIngredientPick(ingredient, { x, y: y - 15 });
      });

      this.trayContainer.add(tray);
    });
  }

  handleIngredientPick(ingredient, origin) {
    const now = this.time.now;
    const cooldown = 210 / this.character.prepMultiplier;
    if (now - this.lastActionTime < cooldown) return;
    this.lastActionTime = now;

    this.playIngredientSoundPlaceholder();
    const expected = this.activeOrder.item.ingredients[this.playerStack.length];

    const flying = this.add.image(origin.x, origin.y, this.ingredientsData[ingredient].imageKey).setDisplaySize(28, 28).setDepth(20);
    this.tweens.add({
      targets: flying,
      x: this.stackContainer.x,
      y: this.stackContainer.y - this.playerStack.length * 12,
      scale: 0.8,
      duration: 220,
      onComplete: () => flying.destroy(),
    });

    if (ingredient !== expected) {
      this.applyOrderFailure('Wrong ingredient! Customer upset.');
      return;
    }

    this.playerStack.push(ingredient);
    this.renderStack();

    if (this.playerStack.length === this.activeOrder.item.ingredients.length) {
      this.applyOrderSuccess();
    }
  }

  renderStack() {
    this.stackContainer.removeAll(true);

    if (!this.playerStack.length) {
      const hint = this.add.text(0, 0, 'Build order here', { fontSize: '22px', color: '#7e5b3e' }).setOrigin(0.5);
      this.stackContainer.add(hint);
      return;
    }

    this.playerStack.forEach((ingredient, index) => {
      const plate = this.add.rectangle(0, 16 - index * 18, 180 - index * 7, 16, this.ingredientsData[ingredient].color).setStrokeStyle(2, 0xffffff, 0.4);
      const text = this.add.text(0, 16 - index * 18, ingredient, { fontSize: '12px', color: '#3d2819', fontStyle: 'bold' }).setOrigin(0.5);
      this.stackContainer.add([plate, text]);
    });
  }

  applyOrderSuccess() {
    const elapsed = this.activeOrder.prepTime - this.patienceRemaining;
    const speedBonus = elapsed < this.activeOrder.perfectWindow ? 1.2 : 1;
    const perfectBonus = this.playerStack.length === this.activeOrder.item.ingredients.length && elapsed < this.activeOrder.perfectWindow ? 20 : 0;
    const vipBonus = this.activeOrder.vipMultiplier;

    const revenue = this.activeOrder.sellingPrice * vipBonus;
    const profit = Math.max(0, revenue - this.activeOrder.ingredientCost);
    const scoreGain = Math.floor((80 + profit * 10 + perfectBonus) * this.combo * speedBonus);

    this.score += scoreGain;
    this.combo = Math.min(this.combo + 0.3, 5);
    this.ordersServed += 1;
    this.level = 1 + Math.floor(this.ordersServed / 3);

    this.totalRevenue += revenue;
    this.totalProfit += profit;
    this.dailyEarnings += revenue;
    this.currentOrderProfit = profit;

    this.showFeedback(`Great service! +$${profit.toFixed(2)}`, '#2e934a');
    this.showMoneyPopup(`+${scoreGain} pts`, '#2e934a');

    this.generateOrder();
  }

  applyOrderFailure(message) {
    const penalty = Math.floor((35 + this.level * 8) * this.character.mistakePenaltyMultiplier);
    this.score = Math.max(0, this.score - penalty);
    this.combo = 1;
    this.currentOrderProfit = -this.activeOrder.ingredientCost * 0.2;
    this.totalProfit += this.currentOrderProfit;

    this.showFeedback(message, '#b84433');
    this.showMoneyPopup(`-${penalty} pts`, '#b84433');

    this.generateOrder();
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 900, delay: 450 });
  }

  showMoneyPopup(text, color) {
    const label = this.add.text(this.scale.width * 0.69, this.scale.height * 0.48, text, { fontSize: '28px', color, fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: label, y: label.y - 36, alpha: 0, duration: 700, onComplete: () => label.destroy() });
  }

  playIngredientSoundPlaceholder() {
    // Placeholder hook for future SFX pipeline.
  }

  update(_, delta) {
    if (!this.activeOrder) return;

    const rushFactor = this.level >= 4 ? 1.18 : 1;
    this.patienceRemaining -= (delta / 1000) * rushFactor;

    if (this.patienceRemaining <= 0) {
      this.customerMood.setText('😤');
      this.applyOrderFailure('Customer left angry!');
      return;
    }

    const ratio = Phaser.Math.Clamp(this.patienceRemaining / this.activeOrder.prepTime, 0, 1);
    this.timerBar.width = 444 * ratio;
    this.timerBar.fillColor = ratio < 0.3 ? 0xd95a4d : ratio < 0.6 ? 0xddad49 : 0x7cc473;
    this.customerMood.setText(ratio < 0.25 ? '😠' : ratio < 0.55 ? '😐' : '🙂');

    this.emitUiUpdate();
  }

  emitUiUpdate() {
    this.events.emit('ui-update', {
      score: this.score,
      combo: this.combo,
      level: this.level,
      character: this.character,
      timeLeft: this.patienceRemaining,
      totalRevenue: this.totalRevenue,
      totalProfit: this.totalProfit,
      dailyEarnings: this.dailyEarnings,
      profitPerOrder: this.currentOrderProfit,
      customerType: this.activeOrder?.customer.name || '-',
      itemName: this.activeOrder?.item.name || '-',
    });
  }
}
