const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let isPaused = false;
let isCountingDown = false;
let computerPaddleSpeed = 4; 
const pressedKeys = {}; 

let playerScore = 0;
let computerScore = 0;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    dx: 5,
    dy: 5
};

const paddleWidth = 10;
const paddleHeight = 100;
const playerPaddle = {
    x: 2,  
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};
const computerPaddle = {
    x: canvas.width - paddleWidth - 2,  
    y: (canvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: computerPaddleSpeed
};

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = "#fff";
    context.fill();
    context.closePath();
}

function drawPaddle(x, y, width, height) {
    context.fillStyle = "#fff";
    context.fillRect(x, y, width, height);
}

function drawCenterLine() {
    context.beginPath();
    context.setLineDash([10, 15]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = "#fff";
    context.stroke();
    context.closePath();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    drawPaddle(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);
    drawCenterLine();
}

function updateBall() {
    if (!isPaused && !isCountingDown) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }

        if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width && 
            ball.y > playerPaddle.y && 
            ball.y < playerPaddle.y + playerPaddle.height) {
            ball.dx *= -1;
        }

        if (ball.x + ball.radius > computerPaddle.x && 
            ball.y > computerPaddle.y && 
            ball.y < computerPaddle.y + computerPaddle.height) {
            ball.dx *= -1;
        }

        if (ball.x + ball.radius > canvas.width) {
            playerScore++;
            updateScore();
            startCountdown();
        } else if (ball.x - ball.radius < 0) {
            computerScore++;
            updateScore();
            startCountdown();
        }

        if (playerScore >= 10) {
            displayMessage('You Win!');
            resetGame();
        } else if (computerScore >= 10) {
            displayMessage('You Lose!');
            resetGame();
        }
    }
}

function updatePaddles() {
    if (pressedKeys['ArrowUp']) {
        playerPaddle.dy = -8;
    } else if (pressedKeys['ArrowDown']) {
        playerPaddle.dy = 8;
    } else {
        playerPaddle.dy = 0;
    }

    playerPaddle.y += playerPaddle.dy;

    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    } else if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }

    if (ball.y < computerPaddle.y) {
        computerPaddle.y -= computerPaddleSpeed;
    } else if (ball.y > computerPaddle.y + computerPaddle.height) {
        computerPaddle.y += computerPaddleSpeed;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function startCountdown() {
    isCountingDown = true;
    resetBall();
    let countdownElement = document.getElementById('countdown');
    let countdown = 3;

    countdownElement.textContent = countdown;
    countdownElement.style.display = 'block';

    let interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.textContent = countdown;
        } else {
            countdownElement.style.display = 'none';
            isCountingDown = false;
            clearInterval(interval);
        }
    }, 1000);
}

function displayMessage(message) {
    let messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 3000); 
}

function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
    isPaused = false;
    document.getElementById('pauseButton').textContent = 'Pause';
}

 function gameLoop() {
    updateBall();
    updatePaddles();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame(difficulty) {
    const difficultyMenu = document.getElementById('difficultyMenu');
    difficultyMenu.style.display = 'none';

    if (difficulty === 'easy') {
        computerPaddleSpeed = 5;  
    } else if (difficulty === 'medium') {
        computerPaddleSpeed = 8;  
    } else if (difficulty === 'hard') {
        computerPaddleSpeed = 11;  
    }

    gameLoop();
}

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', () => {
        const difficulty = button.getAttribute('data-difficulty');
        startGame(difficulty);
    });
});

document.getElementById('pauseButton').addEventListener('click', togglePause);

document.getElementById('resetButton').addEventListener('click', resetGame);

window.addEventListener('keydown', (event) => {
    pressedKeys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    delete pressedKeys[event.key];
});
