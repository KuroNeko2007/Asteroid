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