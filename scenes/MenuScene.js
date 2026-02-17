export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.bgDots = [];
  }

  create() {
    const { width, height } = this.scale;
    const palette = this.registry.get("palette");

    // Background image (procedural)
    const bg = this.add.image(width / 2, height / 2, "menu-bg");
    bg.setDisplaySize(width, height);

    // Floating dots (seninki kalsın ama rengi biraz daha canlı)
    this.createAnimatedBackground();

    // Sign board
    const sign = this.add.image(width / 2, height * 0.22, "menu-sign").setOrigin(0.5);
    sign.setScale(Math.min(width / 960, height / 540) * 0.95);

    // Title on sign
    const title = this.add
      .text(width / 2, height * 0.205, "Kebab Empire", {
        fontSize: "64px",
        fontStyle: "900",
        color: palette.cream,
        stroke: palette.cocoa,
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    // Subtitle
    const subtitle = this.add
      .text(width / 2, height * 0.295, "Fast-paced kebab service showdown", {
        fontSize: "22px",
        color: palette.ink,
        backgroundColor: "rgba(255,255,255,0.35)",
        padding: { left: 14, right: 14, top: 8, bottom: 8 },
      })
      .setOrigin(0.5);

    // Kebab icon (left of button area)
    const kebab = this.add.image(width * 0.28, height * 0.62, "menu-kebab").setOrigin(0.5);
    kebab.setScale(Math.min(width / 960, height / 540) * 0.7);
    this.tweens.add({
      targets: kebab,
      y: kebab.y - 8,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Play button
    const playButton = this.createButton(width / 2, height * 0.62, "Play");
    playButton.on("pointerdown", () => this.scene.start("CharacterScene"));

    // Button pulse (premium feel)
    this.tweens.add({
      targets: playButton,
      scale: 1.02,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Responsive re-layout
    this.scale.on("resize", (gameSize) => {
      const w = gameSize.width;
      const h = gameSize.height;

      bg.setPosition(w / 2, h / 2);
      bg.setDisplaySize(w, h);

      sign.setPosition(w / 2, h * 0.22);
      sign.setScale(Math.min(w / 960, h / 540) * 0.95);

      title.setPosition(w / 2, h * 0.205);
      subtitle.setPosition(w / 2, h * 0.295);

      kebab.setPosition(w * 0.28, h * 0.62);
      kebab.setScale(Math.min(w / 960, h / 540) * 0.7);

      playButton.setPosition(w / 2, h * 0.62);
    });
  }

  createAnimatedBackground() {
    const { width, height } = this.scale;

    // biraz daha fazla + daha canlı
    for (let i = 0; i < 26; i += 1) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(10, 52),
        0xffd08a,
        Phaser.Math.FloatBetween(0.07, 0.22)
      );

      dot.speedY = Phaser.Math.FloatBetween(0.25, 1.3);
      dot.wobble = Phaser.Math.FloatBetween(0.001, 0.006);
      dot.offset = Phaser.Math.FloatBetween(0, 1000);
      this.bgDots.push(dot);
    }
  }

  update(time) {
    const { width, height } = this.scale;
    this.bgDots.forEach((dot) => {
      dot.y -= dot.speedY;
      dot.x += Math.sin(time * dot.wobble + dot.offset) * 0.55;
      if (dot.y < -80) {
        dot.y = height + 60;
        dot.x = Phaser.Math.Between(0, width);
      }
    });
  }

  createButton(x, y, label) {
    const palette = this.registry.get("palette");
    const container = this.add.container(x, y);

    // glow layer
    const glow = this.add
      .rectangle(0, 0, 270, 88, 0xffffff, 0.18)
      .setOrigin(0.5);

    const bg = this.add
      .rectangle(0, 0, 250, 78, Phaser.Display.Color.HexStringToColor(palette.spice).color)
      .setStrokeStyle(3, 0xffffff, 0.85)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "900",
      })
      .setOrigin(0.5);

    container.add([glow, bg, text]);

    bg.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.06, duration: 120 });
      glow.setAlpha(0.28);
    });
    bg.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 120 });
      glow.setAlpha(0.18);
    });

    container.on = bg.on.bind(bg);
    return container;
  }
}
