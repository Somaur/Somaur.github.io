function Snake(size = 10, canvasOptions) {
    this.position = { x: 0, y: 0 };
    this.speed = { x: size * 1, y: 0 };
    this.direction = 'Right';
    this.targetNum = 0;
    this.tails = [];
    this.size = size;
    this.canvasOptions = canvasOptions;
}

Snake.prototype.init = function() {
    this.position = { x: 0, y: 0 };
    this.speed = { x: size * 1, y: 0 };
    this.direction = 'Right';
    this.targetNum = 0;
    this.tails = [];
}

Snake.prototype.draw = function() {
    const { ctx } = this.canvasOptions;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < this.tails.length; i++) {
        const { x, y } = this.tails[i];
        ctx.fillRect(x, y, this.size, this.size);
    }
    ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
}

Snake.prototype.update = function() {
    for (let i = 0; i < this.tails.length - 1; i++) {
        this.tails[i] = this.tails[i + 1];
    }

    if (this.targetNum > 0) {
        this.tails[this.targetNum - 1] = { x: this.position.x, y: this.position.y };
    }

    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    const { width, height } = this.canvasOptions.canvas;
    if (this.position.x > width - size) {
        this.position.x = 0;
    }
    if (this.position.y > height - size) {
        this.position.y = 0;
    }
    if (this.position.x < 0) {
        this.position.x = width - size;
    }
    if (this.position.y < 0) {
        this.position.y = height - size;
    }
}

Snake.prototype.directionCooler = false;
Snake.prototype.changeDirection = function(direction) {
    if (this.directionCooler) return;
    switch (direction) {
        case 'Up':
            if (this.direction === 'Down') return;
            this.speed.x = 0;
            this.speed.y = -1 * size;
            break;
        case 'Down':
            if (this.direction === 'Up') return;
            this.speed.x = 0;
            this.speed.y = 1 * size;
            break;
        case 'Left':
            if (this.direction === 'Right') return;
            this.speed.x = -1 * size;
            this.speed.y = 0;
            break;
        case 'Right':
            if (this.direction === 'Left') return;
            this.speed.x = 1 * size;
            this.speed.y = 0;
            break;
        default:
            return;
    }
    this.direction = direction;
    this.directionCooler = true;
    setTimeout(() => {
        this.directionCooler = false;
    }, cycleTime - 30)
}

Snake.prototype.eatTarget = function(target) {
    if (this.position.x === target.x && this.position.y === target.y) {
        this.targetNum++;
        return true;
    }
    return false;
}

Snake.prototype.checkCollision = function() {
    for (let i = 0; i < this.tails.length; i++) {
        if (this.position.x === this.tails[i].x && this.position.y === this.tails[i].y) {
            ctx.fillStyle = '#e83333';
            ctx.fillRect(this.tails[i].x, this.tails[i].y, this.size, this.size);
            return true;
        }
    }
    return false;
}