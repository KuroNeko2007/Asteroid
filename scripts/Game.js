class Game {

    /** @constant */
    static fixedUpdateTime = 17;

    static mousePosition = { x: 0, y: 0 };

    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;

        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.scale(1, -1);

        this.player = new Player();
    }

    mainDrawLoop() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();

        this.player.draw(this.ctx);

        for (let i = 0; i < Bullet.BulletArray.length; i++) {
            Bullet.BulletArray[i].draw(this.ctx);
        }

        window.requestAnimationFrame(() => { this.mainDrawLoop() });
    }

    /**
     * 
     * @param {number} time 
     */
    mainUpdateLoop(time) {
        this.player.update(time, Game.mousePosition);

        for (let i = 0; i < Bullet.BulletArray.length; i++) {
            Bullet.BulletArray[i].update(time);
        }
    }

    run() {

        window.addEventListener('keydown', (ev) => {
            this.handleKey(ev, true);
        });
        window.addEventListener('keyup', (ev) => {
            this.handleKey(ev, false);
        })

        window.addEventListener('mousemove', (ev) => {
            let martix = this.ctx.getTransform();

            let x = ev.clientX;
            let y = ev.clientY;

            // External Factors

            x -= this.ctx.canvas.offsetLeft;
            y -= this.ctx.canvas.offsetTop;

            x *= this.ctx.canvas.width / parseFloat(this.ctx.canvas.style.width);
            y *= this.ctx.canvas.height / parseFloat(this.ctx.canvas.style.height);

            // Canvas Transformations

            x -= martix.e;
            y -= martix.f;

            x *= martix.a;
            y *= martix.d;

            Game.mousePosition.x = x;
            Game.mousePosition.y = y;
        })

        window.requestAnimationFrame(() => { this.mainDrawLoop() });

        window.setInterval(() => { this.mainUpdateLoop(Game.fixedUpdateTime) }, Game.fixedUpdateTime);
    }

    /**
     * 
     * @param {KeyboardEvent} ev 
     * @param {boolean} isDown
     */
    handleKey(ev, isDown) {
        if (ev.key === 'a') {
            this.player.controlStatus.left = isDown;
        } else if (ev.key === 'd') {
            this.player.controlStatus.right = isDown;
        } else if (ev.key === 'w') {
            this.player.controlStatus.up = isDown;
        } else if (ev.key === 's') {
            this.player.controlStatus.down = isDown;
        } else if (ev.key === 'q') {
            this.player.controlStatus.turningLeft = isDown;
        } else if (ev.key === 'e') {
            this.player.controlStatus.turningRight = isDown;
        } else if (ev.key === 'f' || ev.key === ' ') {
            this.player.controlStatus.firing = isDown;
        }
    }

}

class Player {

    /** @constant */
    static maxPlayerHealth = 100;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.facing = 0;
        this.health = Player.maxPlayerHealth;

        this.controlStatus = {
            up: false,
            down: false,
            right: false,
            left: false,

            firing: false
        };

        this.speed = 40;
        this.rotateSpeed = 1;

        this.bulletSpeed = 80;
        this.reloadTime = 100;
        this.reloadTimer = 0;
        this.bulletLife = 1000;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();

        ctx.fillStyle = this.getColor();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.facing - Math.PI / 2);

        ctx.beginPath();

        ctx.moveTo(0, -Math.sqrt(this.radius));
        ctx.lineTo(-this.radius, -this.radius);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(this.radius, -this.radius);

        ctx.fill();

        ctx.restore();
    }

    controlMovement(time) {
        if (this.controlStatus.left) {
            this.x -= this.speed * time / 100;
        }

        if (this.controlStatus.right) {
            this.x += this.speed * time / 100;
        }

        if (this.controlStatus.down) {
            this.y -= this.speed * time / 100;
        }

        if (this.controlStatus.up) {
            this.y += this.speed * time / 100;
        }
    }

    controlRotation(mousePosition) {
        this.facing = Math.atan2(mousePosition.y - this.y, mousePosition.x - this.x);
    }

    controlFiring() {
        if (this.reloadTimer <= 0) {
            new Bullet(this.x, this.y, this.facing, this.bulletSpeed, this.bulletLife);
            this.reloadTimer = this.reloadTime;
        }
    }

    update(time, mousePosition) {
        this.controlMovement(time);

        this.controlRotation(mousePosition);

        this.reloadTimer = this.reloadTimer - time;

        if (this.controlStatus.firing) {
            this.controlFiring();
        }

    }

    getColor() {
        if (this.health > Player.maxPlayerHealth) {
            return '#0f0';
        } else if (this.health > Player.maxPlayerHealth * 0.8) {
            return '#afa';
        } else if (this.health > Player.maxPlayerHealth * 0.5) {
            return '#ffa';
        } else if (this.health > Player.maxPlayerHealth * 0.2) {
            return '#faa';
        } else if (this.health > 0) {
            return '#944';
        } else {
            return '#444';
        }
    }
}

class Bullet {

    /** @type {Bullet[]} */
    static BulletArray = [];

    constructor(x, y, direction, speed, life) {
        Bullet.BulletArray.push(this);

        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speedX = speed * Math.cos(direction);
        this.speedY = speed * Math.sin(direction);

        this.color = '#ff5f1f';
        this.thickness = 2;
        this.length = 40;
        this.life = life;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 
     * @param {number} time 
     */
    update(time) {
        this.life -= time;

        if (this.life <= 0) {
            Bullet.BulletArray.splice(Bullet.BulletArray.indexOf(this), 1);
        }

        this.x += this.speedX * time / 100;
        this.y += this.speedY * time / 100;
    }
}