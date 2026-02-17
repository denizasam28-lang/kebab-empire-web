import { INGREDIENTS } from '../data/ingredients.js';
import { MENU_ITEMS } from '../data/menuData.js';
import { CUSTOMER_TYPES } from '../data/customers.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const characters = {
      deniz: {
        name: 'Deniz',
        mode: 'Balanced Mode',
        description: 'Normal speed and balanced penalties.',
        patienceMultiplier: 1,
        prepMultiplier: 1,
        mistakePenaltyMultiplier: 1,
      },
      kazim: {
        name: 'Kazim',
        mode: 'Strategic Mode',
        description: '+20% customer patience, slightly slower prep.',
        patienceMultiplier: 1.2,
        prepMultiplier: 0.9,
        mistakePenaltyMultiplier: 0.9,
      },
      rookie: {
        name: 'Rookie Chef',
        mode: 'Risk Mode',
        description: 'Fast prep but mistakes cost much more.',
        patienceMultiplier: 1,
        prepMultiplier: 1.3,
        mistakePenaltyMultiplier: 1.6,
      },
    };

    this.generateUiTextures();
    this.generateIngredientTextures();
    this.generateMenuTextures();
    this.generateCustomerTextures();

    this.registry.set('characters', characters);
    this.registry.set('selectedCharacter', characters.deniz);
    this.registry.set('menuItems', MENU_ITEMS);
    this.registry.set('ingredients', INGREDIENTS);
    this.registry.set('customerTypes', CUSTOMER_TYPES);

    this.scene.start('MenuScene');
  }

  generateIngredientTextures() {
    Object.entries(INGREDIENTS).forEach(([name, data]) => {
      const key = data.imageKey;
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 56, 56, 14);
      g.lineStyle(2, 0xe3d6c4, 1).strokeRoundedRect(0, 0, 56, 56, 14);
      g.fillStyle(data.color, 1).fillCircle(28, 26, 15);
      g.fillStyle(0xffffff, 0.2).fillCircle(23, 21, 6);
      g.generateTexture(key, 56, 56);
      g.destroy();

      const labelKey = `${key}-label`;
      if (!this.textures.exists(labelKey)) {
        const t = this.make.text({ x: 0, y: 0, text: name.slice(0, 2).toUpperCase(), style: { fontSize: '18px', color: '#4a2e1d', fontStyle: 'bold' } }, false);
        t.setPadding(8, 16, 8, 8);
        t.setBackgroundColor('#ffffffbb');
        t.generateTexture(labelKey, 56, 56);
        t.destroy();
      }
    });
  }

  generateMenuTextures() {
    MENU_ITEMS.forEach((item) => {
      if (this.textures.exists(item.imageKey)) return;
      const g = this.add.graphics();
      g.fillStyle(0xfff7ec, 1).fillRoundedRect(0, 0, 72, 72, 14);
      g.lineStyle(2, 0xddb783, 1).strokeRoundedRect(0, 0, 72, 72, 14);
      g.fillStyle(0xd68445, 1).fillRoundedRect(14, 16, 44, 40, 10);
      g.fillStyle(0xffffff, 0.18).fillRoundedRect(18, 20, 18, 14, 6);
      g.generateTexture(item.imageKey, 72, 72);
      g.destroy();
    });
  }

  generateCustomerTextures() {
    CUSTOMER_TYPES.forEach((customer) => {
      if (this.textures.exists(customer.avatarKey)) return;
      const g = this.add.graphics();
      g.fillStyle(0xfff7ec, 1).fillCircle(30, 30, 30);
      g.fillStyle(customer.color, 1).fillCircle(30, 24, 14);
      g.fillStyle(0x5f3a28, 1).fillRoundedRect(18, 36, 24, 14, 6);
      g.lineStyle(2, 0xd9be9f, 1).strokeCircle(30, 30, 29);
      g.generateTexture(customer.avatarKey, 60, 60);
      g.destroy();
    });
  }

  generateUiTextures() {
    if (!this.textures.exists('wood')) {
      const g = this.add.graphics();
      g.fillStyle(0x9a6238, 1).fillRect(0, 0, 128, 64);
      g.fillStyle(0x85542f, 0.45);
      for (let i = 0; i < 7; i += 1) g.fillRect(0, i * 10, 128, 4);
      g.generateTexture('wood', 128, 64);
      g.destroy();
    }
  }
}
