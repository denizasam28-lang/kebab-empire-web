export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const characters = {
      deniz: {
        name: "Deniz",
        mode: "Balanced Mode",
        description: "Normal speed and balanced penalties.",
        patienceMultiplier: 1,
        prepMultiplier: 1,
        mistakePenaltyMultiplier: 1,
      },
      kazim: {
        name: "Kazim",
        mode: "Strategic Mode",
        description: "+20% customer patience, slightly slower prep.",
        patienceMultiplier: 1.2,
        prepMultiplier: 0.9,
        mistakePenaltyMultiplier: 1,
      },
      rookie: {
        name: "Rookie Chef",
        mode: "Risk Mode",
        description: "Fast prep but mistakes cost much more.",
        patienceMultiplier: 1,
        prepMultiplier: 1.25,
        mistakePenaltyMultiplier: 1.6,
      },
    };

    // Brand palette (menu + UI için tek kaynak)
    const palette = {
      bgA: "#FFB55A",
      bgB: "#FFF1D6",
      cocoa: "#5B2B1D",
      spice: "#E27D2F",
      cream: "#FFF6E6",
      olive: "#2E7D32",
      ink: "#2a1f1a",
    };

    this.registry.set("palette", palette);
    this.registry.set("characters", characters);
    this.registry.set("selectedCharacter", characters.deniz);

    // ✅ Procedural textures (asset indirmeden)
    this.createMenuTextures();

    this.scene.start("MenuScene");
  }

  createMenuTextures() {
    const palette = this.registry.get("palette");

    // --- 1) Gradient background canvas texture ---
    const w = 1024;
    const h = 576;
    const bg = this.textures.createCanvas("menu-bg", w, h);
    const ctx = bg.getContext();

    // Gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, palette.bgA);
    grad.addColorStop(1, palette.bgB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Soft bokeh circles
    for (let i = 0; i < 40; i += 1) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 20 + Math.random() * 90;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fill();
    }

    // Subtle vignette
    const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.15, w * 0.5, h * 0.5, h * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    bg.refresh();

    // --- 2) Wood sign texture (simple) ---
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.clear();

    // shadow
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(10, 10, 620, 160, 26);

    // plank base
    g.fillStyle(0x8b5a2b, 1);
    g.fillRoundedRect(0, 0, 620, 160, 26);

    // highlight
    g.fillStyle(0xffffff, 0.10);
    g.fillRoundedRect(18, 18, 584, 56, 20);

    // wood stripes
    g.lineStyle(2, 0x6e3f1f, 0.35);
    for (let i = 0; i < 10; i += 1) {
      const y = 22 + i * 14;
      g.beginPath();
      g.moveTo(22, y);
      g.lineTo(598, y + Phaser.Math.Between(-2, 2));
      g.strokePath();
    }

    // border
    g.lineStyle(4, 0xf7eddc, 0.9);
    g.strokeRoundedRect(0, 0, 620, 160, 26);

    g.generateTexture("menu-sign", 640, 180);
    g.destroy();

    // --- 3) Simple kebab icon ---
    const k = this.make.graphics({ x: 0, y: 0, add: false });
    k.clear();

    // skewer
    k.fillStyle(0x8d6e63, 1);
    k.fillRoundedRect(110, 20, 14, 130, 7);

    // meat stack
    const colors = [0xe26a2c, 0xd9531e, 0xb63d18];
    for (let i = 0; i < 6; i += 1) {
      const y = 26 + i * 18;
      const c = colors[i % colors.length];
      k.fillStyle(c, 1);
      k.fillRoundedRect(50, y, 130, 16, 8);
      k.fillStyle(0xffffff, 0.10);
      k.fillRoundedRect(56, y + 3, 110, 5, 3);
    }

    // lettuce bits
    k.fillStyle(0x2e7d32, 1);
    k.fillCircle(60, 140, 10);
    k.fillCircle(170, 140, 10);

    // glow outline
    k.lineStyle(4, 0xffffff, 0.25);
    k.strokeRoundedRect(40, 16, 160, 150, 20);

    k.generateTexture("menu-kebab", 240, 200);
    k.destroy();
  }
}
