export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const characters = {
      speedChef: {
        name: 'Speed Chef',
        mode: 'Turbo Prep',
        description: 'Small and energetic. Fast prep, lower patience.',
        patienceMultiplier: 0.9,
        prepMultiplier: 1.35,
        mistakePenaltyMultiplier: 1.25,
        bodyColor: 0xff8f6b,
        hatColor: 0xffffff,
        size: 0.9,
      },
      balancedChef: {
        name: 'Balanced Chef',
        mode: 'Steady Service',
        description: 'Reliable all-round chef with balanced stats.',
        patienceMultiplier: 1,
        prepMultiplier: 1,
        mistakePenaltyMultiplier: 1,
        bodyColor: 0x7dc7a6,
        hatColor: 0xffffff,
        size: 1,
      },
      calmChef: {
        name: 'Calm Chef',
        mode: 'Chill Mastery',
        description: 'Bigger and calmer. More patience, slower prep.',
        patienceMultiplier: 1.25,
        prepMultiplier: 0.86,
        mistakePenaltyMultiplier: 0.9,
        bodyColor: 0x8fb5ff,
        hatColor: 0xffffff,
        size: 1.12,
      },
    };

    const palette = {
      wall: '#F9D9AE',
      wallShade: '#F3C489',
      counter: '#A95D3A',
      counterTop: '#CF7A4A',
      neon: '#FF5E57',
      neonGlow: '#FFA8A1',
      cream: '#FFF6E6',
      cocoa: '#5B2B1D',
      ink: '#2D1E16',
      olive: '#2E7D32',
      warmRed: '#D94B3D',
      warmOrange: '#E98A3A',
    };

    this.registry.set('palette', palette);
    this.registry.set('characters', characters);
    this.registry.set('selectedCharacter', characters.balancedChef);

    this.createMenuTextures();
    this.scene.start('MenuScene');
  }

  createMenuTextures() {
    const palette = this.registry.get('palette');
    const w = 700;
    const h = 1200;
    const bg = this.textures.createCanvas('menu-bg', w, h);
    const ctx = bg.getContext();

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, palette.wall);
    grad.addColorStop(1, '#FBE9CF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 32; i += 1) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 35 + Math.random() * 95;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
    }

    bg.refresh();
  }
}
