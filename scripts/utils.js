/**
 * Resizes the canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} ratio 
 */
function resize(canvas, ratio) {
    let w = window.innerWidth;
    let h = window.innerHeight;

    if (w > h * ratio)
        w = Math.floor(h * ratio);
    else
        h = Math.floor(w / ratio);

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    canvas.style.margin = 'auto';
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */

function randomNumberInRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

function randomSign() {
    return Math.random() > 0.5 ? 1 : -1;
}