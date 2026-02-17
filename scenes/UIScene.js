export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const { width } = this.scale;

    this.topBar = this.add.rectangle(width / 2, 26, width - 20, 50, 0xfff5e8, 0.95).setStrokeStyle(2, 0xd6ac7c).setDepth(5);

    this.scoreText = this.add.text(24, 12, 'Score: 0', { fontSize: '20px', color: '#4e2f19', fontStyle: 'bold' }).setDepth(6);
    this.comboText = this.add.text(180, 12, 'Combo: x1.00', { fontSize: '20px', color: '#4e2f19', fontStyle: 'bold' }).setDepth(6);
    this.levelText = this.add.text(360, 12, 'Level: 1', { fontSize: '20px', color: '#4e2f19', fontStyle: 'bold' }).setDepth(6);
    this.timerText = this.add.text(width - 20, 12, 'Time: 0s', { fontSize: '20px', color: '#775436', fontStyle: 'bold' }).setOrigin(1, 0).setDepth(6);

    this.bottomPanel = this.add.rectangle(width - 150, 130, 270, 150, 0xfff8ec, 0.95).setStrokeStyle(2, 0xd7b18b).setDepth(6);
    this.revenueText = this.add.text(width - 272, 76, 'Revenue: $0.00', { fontSize: '16px', color: '#5b3c25', fontStyle: 'bold' }).setDepth(7);
    this.profitText = this.add.text(width - 272, 98, 'Profit: $0.00', { fontSize: '16px', color: '#2e934a', fontStyle: 'bold' }).setDepth(7);
    this.orderProfitText = this.add.text(width - 272, 120, 'Order P/L: $0.00', { fontSize: '16px', color: '#6f4c31' }).setDepth(7);
    this.customerText = this.add.text(width - 272, 142, 'Customer: -', { fontSize: '15px', color: '#6f4c31' }).setDepth(7);
    this.dailyText = this.add.text(width - 272, 164, 'Daily: $0.00', { fontSize: '16px', color: '#a1532f', fontStyle: 'bold' }).setDepth(7);

    this.orderItemText = this.add.text(24, 44, 'Now Serving: -', { fontSize: '16px', color: '#775436' }).setDepth(6);

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('ui-update', this.handleUiUpdate, this);
    this.events.once('shutdown', () => gameScene.events.off('ui-update', this.handleUiUpdate, this));
  }

  handleUiUpdate(payload) {
    this.scoreText.setText(`Score: ${payload.score}`);
    this.comboText.setText(`Combo: x${payload.combo.toFixed(2)}`);
    this.levelText.setText(`Level: ${payload.level}`);
    this.timerText.setText(`Time: ${Math.max(0, Math.ceil(payload.timeLeft))}s`);
    this.revenueText.setText(`Revenue: $${payload.totalRevenue.toFixed(2)}`);
    this.profitText.setText(`Profit: $${payload.totalProfit.toFixed(2)}`);
    this.orderProfitText.setText(`Order P/L: $${payload.profitPerOrder.toFixed(2)}`);
    this.dailyText.setText(`Daily: $${payload.dailyEarnings.toFixed(2)}`);
    this.customerText.setText(`Customer: ${payload.customerType}`);
    this.orderItemText.setText(`Now Serving: ${payload.itemName}`);
  }
}
