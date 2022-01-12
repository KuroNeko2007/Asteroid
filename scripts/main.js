let game;

window.addEventListener('load', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameScreen';

    document.body.appendChild(canvas);

    const w = canvas.width = 1600;
    const h = canvas.height = 1200;

    window.addEventListener('resize', function() {
        resize(canvas, w / h);
    });
    window.dispatchEvent(new Event('resize'));

    game = new Game(canvas.getContext('2d'));
    game.run();
});