class Game {

    /** @constant */
    static fixedUpdateTime = 17;

    static asteroidRespawnMaxTime = 1000;
    static asteroidRespawnMinTime = 50;

    static asteroidMaxSpeed = 100;
    static asteroidMinSpeed = 40;

    static asteroidMaxRadius = 100;
    static asteroidMinRadius = 30;

    static asteroidLife = 20000;

    static asteroidDamage = 10;

    /** @constant */
    static asteroidDirectionError = Math.PI / 20;

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

        this.asteroidRespawnTime = 1000;

        this.isPaused = false;
    }

    mainDrawLoop() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.ctx.restore();

        for (let i = 0; i < Bullet.BulletArray.length; i++) {
            Bullet.BulletArray[i].draw(this.ctx, this.player.x, this.player.y);
        }

        for (let i = 0; i < Asteroid.AsteroidList.length; i++) {
            Asteroid.AsteroidList[i].draw(this.ctx, this.player.x, this.player.y);
        }

        this.player.draw(this.ctx, 0, 0);

        this.ctx.save();

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.ctx.fillStyle = '#ffffdd';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.font = '100px Times New Roman';
        this.ctx.fillText(`Score: ${this.player.killed * 100}`, 0, 0);
        this.ctx.restore();

        window.requestAnimationFrame(() => { this.mainDrawLoop() });
    }

    makeAsteroid() {


        this.asteroidRespawnTime = (Math.random() * (Game.asteroidRespawnMaxTime - Game.asteroidRespawnMinTime)) + Game.asteroidRespawnMinTime;

        let x = (randomSign() * randomNumberInRange(this.ctx.canvas.width / 2, this.ctx.canvas.width));
        let y = (randomSign() * randomNumberInRange(this.ctx.canvas.height / 2, this.ctx.canvas.height));

        let speed = -randomNumberInRange(Game.asteroidMinSpeed, Game.asteroidMaxSpeed);
        let direction = Math.atan2(y, x) + randomNumberInRange(-Game.asteroidDirectionError, Game.asteroidDirectionError);

        let radius = randomNumberInRange(Game.asteroidMinRadius, Game.asteroidMaxRadius);

        x += this.player.x;
        y += this.player.y;

        console.log(new Asteroid(x, y, speed, direction, radius, Game.asteroidLife));
    }

    /**
     * 
     * @param {number} time 
     */
    mainUpdateLoop(time) {
        if (!this.isPaused) {
            this.asteroidRespawnTime -= time;

            if (this.asteroidRespawnTime <= 0) {
                this.makeAsteroid();
            }

            this.player.update(time, Game.mousePosition);

            for (let i = 0; i < Bullet.BulletArray.length; i++) {
                Bullet.BulletArray[i].update(time);
            }

            for (let i = 0; i < Asteroid.AsteroidList.length; i++) {
                Asteroid.AsteroidList[i].update(time, this.player);
            }

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
        } else if (ev.key === 'p' && isDown) {
            this.isPaused = !this.isPaused;
        }
    }

}

class Player {

    /** @constant */
    static maxPlayerHealth = 100;

    static invisTimeAfterDamage = 100;

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

        this.invinsibiltyFor = 0;

        this.killed = 0;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx, frameX, frameY) {
        ctx.save();

        ctx.fillStyle = this.getColor();

        ctx.translate(-frameX, -frameY);
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
        //this.facing = Math.atan2(mousePosition.y - this.y, mousePosition.x - this.x);
        this.facing = Math.atan2(mousePosition.y, mousePosition.x);
    }

    controlFiring() {
        if (this.reloadTimer <= 0) {
            new Bullet(this.x, this.y, this.facing, this.bulletSpeed, this.bulletLife, this);
            this.reloadTimer = this.reloadTime;
        }
    }

    damage() {
        if (this.invinsibiltyFor > 0) {
            return;
        }

        this.invinsibiltyFor = Player.invisTimeAfterDamage;

        this.health -= Game.asteroidDamage;
    }

    update(time, mousePosition) {
        this.invinsibiltyFor -= time;
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

    /**
     * 
     * @param {number} x
     * @param {number} y 
     * @param {number} direction 
     * @param {number} speed 
     * @param {number} life 
     * @param {Player} firedBy 
     */
    constructor(x, y, direction, speed, life, firedBy) {
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

        this.firedBy = firedBy;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx, frameX, frameY) {
        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;

        ctx.translate(this.x - frameX, this.y - frameY);
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
            return;
        }

        this.x += this.speedX * time / 100;
        this.y += this.speedY * time / 100;

        for (let i = 0; i < Asteroid.AsteroidList.length; i++) {
            const asteroid = Asteroid.AsteroidList[i];

            if (this.isCollidingWith(asteroid)) {
                Bullet.BulletArray.splice(Bullet.BulletArray.indexOf(this), 1);
                Asteroid.AsteroidList.splice(i, 1);

                this.firedBy.killed++;
            }

        }
    }

    get headX() {
        return this.x + (this.length * Math.cos(this.direction));
    }

    get headY() {
        return this.y + (this.length * Math.sin(this.direction));
    }

    /**
     * 
     * @param {Asteroid} asteroid 
     */

    isCollidingWith(asteroid) {

        let distanceFromHead = Math.sqrt(Math.pow(this.headX - asteroid.x, 2) + Math.pow(this.headY - asteroid.y, 2));
        if (distanceFromHead < asteroid.radius) {
            return true;
        }

        let distanceFromTail = Math.sqrt(Math.pow(this.x - asteroid.x, 2) + Math.pow(this.y - asteroid.y, 2));
        if (distanceFromTail < asteroid.radius) {
            return true;
        }

        return false;
    }

}

class Asteroid {

    /** @type {Asteroid[]} */
    static AsteroidList = [];

    constructor(x, y, speed, direction, radius, life) {

        Asteroid.AsteroidList.push(this);

        this.x = x;
        this.y = y;
        this.speedX = speed * Math.cos(direction);
        this.speedY = speed * Math.sin(direction);

        this.radius = radius;
        this.color = '#b62323';

        this.life = life;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx, frameX, frameY) {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(-frameX, -frameY);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 
     * @param {Player} player
     * @returns {boolean} 
     */
    isCollidingWith(player) {
        let distance = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
        return distance < player.radius + this.radius;
    }

    /**
     * 
     * @param {number} time 
     * @param {Player} player 
     */

    update(time, player) {
        this.life -= time;
        if (this.life <= 0) {
            Asteroid.AsteroidList.splice(Asteroid.AsteroidList.indexOf(this), 1);
            return;
        }

        if (this.isCollidingWith(player)) {
            player.damage();
        }

        this.x += this.speedX * time / 100;
        this.y += this.speedY * time / 100;
    }

}