export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.bgDots = [];
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#f7eddc');

    this.add
      .text(width / 2, height * 0.22, 'Kebab Empire', {
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#8f3f1f',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.34, 'Fast-paced kebab service showdown', {
        fontSize: '24px',
        color: '#5f4b37',
      })
      .setOrigin(0.5);

    this.createAnimatedBackground();

    const playButton = this.createButton(width / 2, height * 0.62, 'Play');
    playButton.on('pointerdown', () => {
      this.scene.start('CharacterScene');
    });
  }

  createAnimatedBackground() {
    const { width, height } = this.scale;
    for (let i = 0; i < 18; i += 1) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(12, 42),
        0xffcb74,
        Phaser.Math.FloatBetween(0.08, 0.25)
      );

      dot.speedY = Phaser.Math.FloatBetween(0.3, 1.5);
      dot.wobble = Phaser.Math.FloatBetween(0.001, 0.005);
      dot.offset = Phaser.Math.FloatBetween(0, 1000);
      this.bgDots.push(dot);
    }
  }

  update(time) {
    const { width, height } = this.scale;
    this.bgDots.forEach((dot) => {
      dot.y -= dot.speedY;
      dot.x += Math.sin(time * dot.wobble + dot.offset) * 0.4;
      if (dot.y < -50) {
        dot.y = height + 40;
        dot.x = Phaser.Math.Between(0, width);
      }
    });
  }

  createButton(x, y, label) {
    const container = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, 240, 72, 0xe27d2f)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, {
        fontSize: '30px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, text]);

    bg.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.06, duration: 120 });
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 120 });
    });

    container.on = bg.on.bind(bg);
    return container;
  }
}
