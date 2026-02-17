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
        mistakePenaltyMultiplier: 1,
      },
      rookie: {
        name: 'Rookie Chef',
        mode: 'Risk Mode',
        description: 'Fast prep but mistakes cost much more.',
        patienceMultiplier: 1,
        prepMultiplier: 1.25,
        mistakePenaltyMultiplier: 1.6,
      },
    };

    this.registry.set('characters', characters);
    this.registry.set('selectedCharacter', characters.deniz);

    this.scene.start('MenuScene');
  }
}
