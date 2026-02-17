export default class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#fff8ec');

    this.add
      .text(width / 2, 54, 'Choose Your Chef', {
        fontSize: '44px',
        color: '#8f3f1f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const characters = Object.values(this.registry.get('characters'));
    const cardWidth = Math.min(250, width * 0.28);
    const gap = 20;
    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (width - totalWidth) / 2 + cardWidth / 2;

    characters.forEach((character, index) => {
      this.renderCharacterCard(startX + index * (cardWidth + gap), height * 0.55, cardWidth, character);
    });
  }

  renderCharacterCard(x, y, width, character) {
    const card = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, width, 320, 0xffffff)
      .setStrokeStyle(2, 0xebae61)
      .setOrigin(0.5);

    const avatarColor = character.name === 'Deniz' ? 0xffb05f : character.name === 'Kazim' ? 0xa2c889 : 0xf48686;

    const avatar = this.add.circle(0, -95, 42, avatarColor);

    const name = this.add
      .text(0, -34, character.name, {
        fontSize: '28px',
        color: '#59361f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const mode = this.add
      .text(0, -2, character.mode, {
        fontSize: '18px',
        color: '#8b5e34',
      })
      .setOrigin(0.5);

    const description = this.add
      .text(0, 48, character.description, {
        fontSize: '15px',
        color: '#5f4b37',
        align: 'center',
        wordWrap: { width: width - 28 },
      })
      .setOrigin(0.5);

    const btnBg = this.add
      .rectangle(0, 120, width - 40, 48, 0xe27d2f)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const btnLabel = this.add
      .text(0, 120, 'Select', {
        fontSize: '22px',
        color: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.registry.set('selectedCharacter', character);
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });

    btnBg.on('pointerover', () => {
      this.tweens.add({ targets: card, scale: 1.03, duration: 120 });
    });

    btnBg.on('pointerout', () => {
      this.tweens.add({ targets: card, scale: 1, duration: 120 });
    });

    card.add([bg, avatar, name, mode, description, btnBg, btnLabel]);
  }
}
