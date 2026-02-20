export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    this.lastScore = 0;
  }

  create() {
    const { width } = this.scale;
    const textStyle = {
      fontSize: '30px',
      color: '#fff9ef',
      fontStyle: 'bold',
      stroke: '#5b2b1d',
      strokeThickness: 8,
    };

    this.scoreText = this.add.text(16, 16, 'Score: 0', textStyle).setDepth(20);
    this.comboText = this.add.text(width / 2, 16, 'Combo: x1.00', textStyle).setOrigin(0.5, 0).setDepth(20);
    this.levelText = this.add.text(width - 16, 16, 'Level: 1', textStyle).setOrigin(1, 0).setDepth(20);

    this.characterText = this.add
      .text(16, 64, '', {
        fontSize: '22px',
        color: '#fff5e8',
        fontStyle: 'bold',
        stroke: '#6e3a22',
        strokeThickness: 6,
      })
      .setDepth(20);

    this.timerText = this.add
      .text(width - 16, 64, 'Time: 0s', {
        fontSize: '24px',
        color: '#fff5e8',
        fontStyle: 'bold',
        stroke: '#6e3a22',
        strokeThickness: 6,
      })
      .setOrigin(1, 0)
      .setDepth(20);

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('ui-update', this.handleUiUpdate, this);
    this.events.once('shutdown', () => gameScene.events.off('ui-update', this.handleUiUpdate, this));
  }

  handleUiUpdate(payload) {
    this.scoreText.setText(`Score: ${payload.score}`);
    this.comboText.setText(`Combo: x${payload.combo.toFixed(2)}`);
    this.levelText.setText(`Level: ${payload.level}`);
    this.characterText.setText(`Chef: ${payload.character.name}`);
    this.timerText.setText(`Timer: ${Math.ceil(payload.timeLeft)}s`);

    if (payload.score > this.lastScore) {
      this.tweens.killTweensOf(this.scoreText);
      this.scoreText.setScale(1);
      this.tweens.add({ targets: this.scoreText, scale: 1.1, duration: 110, yoyo: true });
    }
    this.lastScore = payload.score;
  }
}
