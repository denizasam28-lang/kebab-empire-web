export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.bgDots = [];
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#f4dec0');

    this.add.rectangle(width / 2, height / 2, width, height, 0xf4dec0);
    this.add.rectangle(width / 2, height * 0.8, width, height * 0.45, 0x8f5b34, 0.2);

    this.createAnimatedBackground();

    this.add
      .text(width / 2, height * 0.2, 'Kebab Empire', {
        fontSize: '68px',
        fontStyle: 'bold',
        color: '#8f3f1f',
        stroke: '#fff6e9',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setShadow(0, 8, '#572b17', 18, false, true);

    this.add
      .text(width / 2, height * 0.32, 'Cooking Fever in a vibrant Turkish kebab shop', {
        fontSize: '24px',
        color: '#5f4b37',
      })
      .setOrigin(0.5);

    const playButton = this.createButton(width / 2, height * 0.64, 'Start Service');
    playButton.on('pointerdown', () => this.scene.start('CharacterScene'));
  }

  createAnimatedBackground() {
    const { width, height } = this.scale;
    for (let i = 0; i < 22; i += 1) {
      const dot = this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(10, 40), 0xffcb74, Phaser.Math.FloatBetween(0.09, 0.22));
      dot.speedY = Phaser.Math.FloatBetween(0.3, 1.4);
      dot.wobble = Phaser.Math.FloatBetween(0.001, 0.005);
      dot.offset = Phaser.Math.FloatBetween(0, 1000);
      this.bgDots.push(dot);
    }
  }

  update(time) {
    const { width, height } = this.scale;
    this.bgDots.forEach((dot) => {
      dot.y -= dot.speedY;
      dot.x += Math.sin(time * dot.wobble + dot.offset) * 0.35;
      if (dot.y < -50) {
        dot.y = height + 42;
        dot.x = Phaser.Math.Between(0, width);
      }
    });
  }

  createButton(x, y, label) {
    const container = this.add.container(x, y);
    const glow = this.add.ellipse(0, 10, 260, 40, 0x000000, 0.2);
    const bg = this.add.rectangle(0, 0, 260, 78, 0xe27d2f).setStrokeStyle(3, 0xfff0dc, 1).setInteractive({ useHandCursor: true });
    const gloss = this.add.rectangle(0, -16, 226, 22, 0xffffff, 0.2);
    const text = this.add.text(0, 0, label, { fontSize: '29px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    container.add([glow, bg, gloss, text]);

    bg.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.05, duration: 130 }));
    bg.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 130 }));

    container.on = bg.on.bind(bg);
    return container;
  }
}
