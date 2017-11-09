var game = new Phaser.Game(800, 800, Phaser.CANVAS, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');
