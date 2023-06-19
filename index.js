// Constants
const GRAVITY = 0.3
const JUMP_FORCE = -5
const BRICK_WIDTH = 80
const BRICK_GAP = 200
const BRICK_DISTANCE = 300
const MIN_BRICK_HEIGHT = 50;
const MAX_BRICK_HEIGHT = 350;
const CLOUDS = []

// Game Variables
let canvas, ctx
let bird, bricks
let gameInterval
let isGameOver
let justScored = false
let score
let requestId
/**
 * Bird Class
 * 
 */
class Bird {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.velocityY = 0
    }

    jump() {
        this.velocityY = JUMP_FORCE
    }

    update() {
        this.velocityY += GRAVITY
        this.y += this.velocityY
    }

    draw() {
        ctx.fillStyle = 'red'
        ctx.fillRect(this.x, this.y, 40, 30)
    }

    isColliding(brick) {
        return (
            this.x < brick.x + BRICK_WIDTH &&
            this.x + 40 > brick.x &&
            this.y < brick.y + brick.height &&
            this.y + 30 > brick.y
        )
    }

    isTouchingTopOrBottom() {
        return this.y < 0 || this.y + 30 > canvas.height
    }

    // Added score
    // addScore(passedBricks) {
    //     console.log("Adding score...")
    //     score += passedBricks
    // }

    updateScore() {
        let passedBricks = bricks.filter((brick) => this.x > brick.x + BRICK_WIDTH)
        if (passedBricks.length > 0 && !justScored) {
            score += 1
            justScored = true
        } else  if (passedBricks.length === 0 ) {
            justScored = false
        }
    }
}

/**
 * Brick Class
 * 
 */
class Brick {
    constructor(x, y, height) {
        this.x = x
        this.y = y
        this.height = height
    }

    draw() {
        ctx.fillStyle = '#2CB01A'
        ctx.fillRect(this.x, this.y, BRICK_WIDTH, this.height)
    }

    update() {
        this.x -= 2
    }
}


function handleKeyDown(e) {
    if (e.code === 'Space') {
        bird.jump()
    }
}

function handleMouseDown(e) {
    bird.jump()
}

function generateInitialClouds() {
    for (let i = 0; i < 30; i++) {
        const cloud = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 20 + 10,
            speed: Math.random() * 2 + 1
        }
        CLOUDS.push(cloud)
    }
}

function drawBackground() {
    ctx.fillStyle = '#70c5ce'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw cloud-like background
    ctx.fillStyle = 'yellow'
    for (let i = 0; i < CLOUDS.length; i++) {
        const cloud = CLOUDS[i]
        ctx.beginPath()
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2)
        ctx.fill()
    }
}

function moveClouds() {
    for (let i = 0; i < CLOUDS.length; i++) {
        const cloud = CLOUDS[i]
        cloud.x -= cloud.speed

        if (cloud.x + cloud.radius < 0) {
            cloud.x = canvas.width + cloud.radius
        }
    }
}


function updateGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGameOver || bird.isTouchingTopOrBottom()) {
        // clearInterval(gameInterval);
        gameOver();
        return;
    }

    drawBackground()
    bird.update();
    bird.draw();
    moveClouds()

    if (bricks.length === 0 || canvas.width - bricks[bricks.length - 1].x > BRICK_DISTANCE) {
        const brickX = canvas.width;
        const topBrickHeight = getRandomHeight();
        const bottomBrickHeight = canvas.height - topBrickHeight - BRICK_GAP;
        const brick = new Brick(brickX, 0, topBrickHeight);
        const bottomBrick = new Brick(brickX, canvas.height - bottomBrickHeight, bottomBrickHeight);
        bricks.push(brick, bottomBrick);
    }

    let bricksToRemove = [];

    for (let i = 0; i < bricks.length; i += 2) {
        const topBrick = bricks[i];
        const bottomBrick = bricks[i + 1];
        topBrick.update();
        topBrick.draw();
        bottomBrick.update();
        bottomBrick.draw();

        if (bird.isColliding(topBrick) || bird.isColliding(bottomBrick)) {
            isGameOver = true;
        }

        if (topBrick.x + BRICK_WIDTH < 0) {
            bricksToRemove.push(topBrick, bottomBrick);
        }
    }

    bricksToRemove.forEach(brick => {
        const index = bricks.indexOf(brick);
        if (index > -1) {
            bricks.splice(index, 1);
        }
    });

    bird.updateScore()

    ctx.font = '24px sans-serif'
    ctx.fillStyle = 'black'
    ctx.fillText(`Score: ${score}`, 10, 30)

    requestId = requestAnimationFrame(updateGame)
}

// Utility function to generate random height for bricks
function getRandomHeight() {
    return Math.floor(Math.random() * (MAX_BRICK_HEIGHT - MIN_BRICK_HEIGHT + 1) + MIN_BRICK_HEIGHT);
}

function gameOver() {

    // Add Game over text
    ctx.font = '48px sans-serif'
    ctx.fillStyle = 'black'
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 24)

    // Hide Restart button;
    // document.getElementById('restart-button').classList.remove('hidden');
}

function restartGame() {
    bird = new Bird(50, canvas.height / 2)
    bricks = []
    isGameOver = false

    // Set score to 0
    score = 0
    // document.getElementById('restart-button').classList.add('hidden')
    // startGame()
    requestAnimationFrame(updateGame)
}

function startGame() {
    canvas = document.getElementById('game-canvas')
    ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth
    canvas.height = window.innerHeight > 800 ? 800 : window.innerHeight

    generateInitialClouds()


    bird = new Bird(50, canvas.height / 2)
    bricks = []
    isGameOver = false

    // Set score to 0
    score = 0

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // gameInterval = setInterval(updateGame, 20)
    requestAnimationFrame(updateGame)
}

window.addEventListener('DOMContentLoaded', function (ev) {

    // New Game
    document.getElementById('start-button').addEventListener('click', function () {
        document.getElementById('start-container').style.display = 'none';
        startGame();
    });

    // Restart Game
    // document.getElementById('restart-button').addEventListener('click', restartGame)
})