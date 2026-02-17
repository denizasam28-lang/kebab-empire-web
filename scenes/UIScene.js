export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const { width } = this.scale;
    this.scoreText = this.add
      .text(20, 12, 'Score: 0', {
        fontSize: '22px',
        color: '#4e2f19',
        fontStyle: 'bold',
      })
      .setDepth(5);

    this.comboText = this.add
      .text(width / 2, 12, 'Combo: x1', {
        fontSize: '22px',
        color: '#4e2f19',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    this.levelText = this.add
      .text(width - 20, 12, 'Level: 1', {
        fontSize: '22px',
        color: '#4e2f19',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setDepth(5);

    this.characterText = this.add
      .text(20, 44, '', {
        fontSize: '16px',
        color: '#775436',
      })
      .setDepth(5);

    this.timerText = this.add
      .text(width - 20, 44, 'Time: 0s', {
        fontSize: '18px',
        color: '#775436',
      })
      .setOrigin(1, 0)
      .setDepth(5);

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('ui-update', this.handleUiUpdate, this);

    this.events.once('shutdown', () => {
      gameScene.events.off('ui-update', this.handleUiUpdate, this);
    });
  }

  handleUiUpdate(payload) {
    this.scoreText.setText(`Score: ${payload.score}`);
    this.comboText.setText(`Combo: x${payload.combo.toFixed(2)}`);
    this.levelText.setText(`Level: ${payload.level}`);
    this.characterText.setText(`Chef: ${payload.character.name} (${payload.character.mode})`);
    this.timerText.setText(`Time: ${Math.ceil(payload.timeLeft)}s`);
  }
}
