const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const size = 20;
const rows = canvas.height / size;
const columns = canvas.width / size;

const cycleTime = 200; // 200 milliseconds


const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');

let snake = new Snake(size, { canvas, ctx });
let target = new Target(size, { canvas, ctx, rows, columns });
let mainCycle = null;

function init() {
    target.genRandomLocation();
    target.draw();
    snake.draw();
}

init();

function startCycle() {
    if (mainCycle != null) return;
    document.getElementById('canvas').className = 'canvas';
    pauseButton.style.display = 'block';
    startButton.style.display = 'none';
    mainCycle = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        target.draw();
        snake.update();
        snake.draw();

        if (snake.eatTarget(target)) {
            target.genRandomLocation();
        }

        document.getElementById('score').innerText = snake.targetNum;

        if (snake.checkCollision()) {
            gameover();
            endCycle();
            snake.init();
        }
        // console.log("snake position: ")
        // console.log(snake.position);
        // console.log("snake speed: ")
        // console.log(snake.speed);
        // console.log("snake direction: ")
        // console.log(snake.direction);
        
    }, cycleTime);
}

function endCycle() {
    if (mainCycle == null) return;
    document.getElementById('canvas').className = 'canvas disabled-canvas';
    startButton.style.display = 'block';
    pauseButton.style.display = 'none';
    clearInterval(mainCycle);
    mainCycle = null;
}

function gameover() {
    document.getElementById('scoreDiv').style.display = 'none';
    document.getElementById('gameoverMsg').style.display = 'block';
    document.getElementById('finalscore').innerText = snake.targetNum;
    console.log('gameover');
    function hideMsg() {
        console.log('  >> running "hideMsg()"');
        document.getElementById('gameoverMsg').style.display = 'none';
        document.getElementById('scoreDiv').style.display = 'block';
        if (startButton.removeEventListener) {                   // // 所有浏览器，除了 IE 8 及更早IE版本
            startButton.removeEventListener("click", hideMsg);
        } else if (startButton.detachEvent) {                   // IE 8 及更早IE版本
            startButton.detachEvent("onclick", hideMsg);
        }
    }
    startButton.addEventListener('click', hideMsg);
}

startButton.addEventListener('click', () => {
    startCycle();
})
pauseButton.addEventListener('click', () => {
    endCycle();
})

window.addEventListener('keydown', (event) => {
    const direction = event.key.replace('Arrow', '');
    console.log('direction: ' + direction);
    snake.changeDirection(direction);
    // console.log('press key: [' + event.key + ']');
    // if (event.key === 'Q' || event.key === 'q') {
    //     snake.position.x = 0;
    //     snake.position.y = 0;
    //     snake.speed.x = 0;
    //     snake.speed.y = 0;
    // }
})