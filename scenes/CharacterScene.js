export default class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
  }

  create() {
    const { width, height } = this.scale;
    const palette = this.registry.get('palette');
    this.cameras.main.setBackgroundColor(palette.wall);

    this.add
      .text(width / 2, 74, 'Choose Your Chef', {
        fontSize: '46px',
        color: palette.cocoa,
        fontStyle: 'bold',
        stroke: '#fff8e8',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const characters = Object.values(this.registry.get('characters'));
    const cardWidth = Math.min(420, width - 56);
    const cardHeight = 250;
    const gap = 26;

    characters.forEach((character, index) => {
      const y = 210 + index * (cardHeight + gap);
      this.renderCharacterCard(width / 2, y, cardWidth, cardHeight, character, palette);
    });
  }

  renderCharacterCard(x, y, width, height, character, palette) {
    const card = this.add.container(x, y);

    const shadow = this.add.rectangle(0, 8, width, height, 0x000000, 0.15).setOrigin(0.5).setStrokeStyle(0, 0x000000);
    const bg = this.add.rectangle(0, 0, width, height, 0xfff6e8).setOrigin(0.5).setStrokeStyle(5, 0x9d5533);

    const avatar = this.createChefAvatar(-width * 0.34, 8, character);

    const name = this.add
      .text(-20, -58, character.name, {
        fontSize: '36px',
        color: palette.cocoa,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const mode = this.add
      .text(-20, -16, character.mode, {
        fontSize: '24px',
        color: '#7f4f36',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const description = this.add
      .text(-20, 36, character.description, {
        fontSize: '20px',
        color: '#624331',
        wordWrap: { width: width * 0.55 },
      })
      .setOrigin(0, 0.5);

    const btn = this.add
      .rectangle(width * 0.31, 0, 118, 72, 0xe4763f)
      .setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(width * 0.31, 0, 'Pick', {
        fontSize: '28px',
        color: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.registry.set('selectedCharacter', character);
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });

    btn.on('pointerover', () => this.tweens.add({ targets: [btn, btnText], scale: 1.06, duration: 100 }));
    btn.on('pointerout', () => this.tweens.add({ targets: [btn, btnText], scale: 1, duration: 100 }));

    card.add([shadow, bg, avatar.container, name, mode, description, btn, btnText]);

    this.tweens.add({
      targets: avatar.container,
      y: avatar.container.y - 8,
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  createChefAvatar(x, y, character) {
    const c = this.add.container(x, y);
    const scale = character.size;

    const body = this.add.circle(0, 28, 44 * scale, character.bodyColor).setStrokeStyle(4, 0x5b2b1d);
    const head = this.add.circle(0, -36, 34 * scale, 0xffd0a6).setStrokeStyle(4, 0x5b2b1d);
    const hatBase = this.add.ellipse(0, -75, 70 * scale, 24 * scale, character.hatColor).setStrokeStyle(4, 0x5b2b1d);
    const hatTop = this.add.circle(0, -100, 30 * scale, character.hatColor).setStrokeStyle(4, 0x5b2b1d);

    c.add([body, head, hatBase, hatTop]);
    return { container: c };
  }
}
