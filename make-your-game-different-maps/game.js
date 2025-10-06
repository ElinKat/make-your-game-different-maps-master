let lastTime = performance.now();
let countFrame = 0;

let score = 0;
let combo = 0;
let lives = 3;
let startGame = false;
let gameOver = false;
let isPaused = false;
let moveLeft = false;
let moveRight = false;


// Player
let moveSpeed = 6;
let playerWidth = 10, playerHeight = 15;
let playerX; // horizontal position

//Ball
let ballWidth = 10;
let ballHeight = 10;
let ballMoveX = 2;
let ballMoveY = 2;

let ball = {
    width: ballWidth,
    height: ballHeight,
    moveX: ballMoveX,
    moveY: ballMoveY,
}

//Bricks
let bricks = [];
let brickRow = 5;
let brickCol = 4;
let brickWidth = 100;
let brickHeight = 20;
let brickPadding = 10;
let brickBreakCount = 0

//DOM elements 
let board = document.getElementById('board');
let playerElement = document.getElementById('player');
let ballElement = document.getElementById('ball');
let boardWidth = board.clientWidth;
let boardHeight = board.clientHeight;
playerWidth = playerElement.clientWidth;


// Add variables for timer
let startTime;
let timerInterval;
let elapsedTime = 0;

//sound
let breakSound = new Audio("assets/pop2.wav");
let clickSound = new Audio("assets/pop4.wav");
let gameOverSound = new Audio("assets/game_over_1.mp3");

// Function to start the timer
function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000); // Update the timer every second
}

// Function to update the timer display
function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    document.getElementById('timer').textContent = Math.floor(elapsedTime / 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

//Starts the movement of paddle, when key is pressed
function movePlayer(e) {
    if (e.key === 'ArrowLeft') moveLeft = true;
    if (e.key === 'ArrowRight') moveRight = true;
}

function stopPlayer(e) {
    if (e.key === 'ArrowLeft') moveLeft = false;
    if (e.key === 'ArrowRight') moveRight = false;
}

function playerPosition() {
    if (moveLeft) {
        playerElement.style.left = Math.max(0, playerElement.offsetLeft - moveSpeed) + 'px';
    } else if (moveRight) {
        playerElement.style.left = Math.min(boardWidth - playerWidth, playerElement.offsetLeft + moveSpeed) + 'px';
    }
}

let isGameRunning = false;

window.onload = function () {
    document.addEventListener('keydown', movePlayer);
    document.addEventListener('keyup', stopPlayer);
    document.getElementById('gameOver').style.display = 'none';

    var allBricks = document.getElementById('allBricks');
    allBricks.innerHTML = '';
    getBricks();
    ballPosition();
    playerPosition();
    handleCollision();
    checkCollision();

    document.getElementById('startPauseBtn').addEventListener('click', function() {
        if (gameOver) {
            resetGame(); // Reset the game if it's over
        } else if (!gameOver || !startGame){
            toggleGame(); // Start the game
        }
    });

    // Add event listener for the spacebar key
    document.addEventListener('keydown', function (e) {
        if ((e.key === 32 || e.key === 'Spacebar' || e.key === 'Space' || e.key === ' ') && (!gameOver || !startGame)) { // Check if the pressed key is the spacebar
            toggleGame();
        }
    });
    // Event listener for the spacebar key to reset the game
    document.addEventListener('keydown', function (e) {
        if ((e.key === 32 || e.key === 'Spacebar' || e.key === 'Space' || e.key === ' ') && gameOver) { // Check if the pressed key is the spacebar and the game is over
            resetGame();
        }
    });

    function toggleGame() {
        if (!isGameRunning) {
            startGame = true;
            gameOver = false;
            isGameRunning = true;
            document.getElementById('startPauseBtn').textContent = 'Pause';
            startTimer();
        } else {
            isPaused = !isPaused;

            if (isPaused) {
                stopTimer();
            } else {
                startTimer();
            }

            document.getElementById('startPauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
            if (!isPaused) {
                requestAnimationFrame(update); // Only resume the update loop if unpausing
            }
        }
    }
};

function getBricks() {
    const allBricks = document.getElementById('allBricks');
    for (let i = 0; i < brickRow; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickCol; j++) {

            let offset = i % 2 === 0 ? 0 : brickWidth / 2;
            let brickX = j * (brickWidth + brickPadding) + offset;
            let brickY = i * (brickHeight + brickPadding);
            bricks[i][j] = {x: brickX, y: brickY};

            let brickElement = document.createElement('div');
            brickElement.id = `brick-${i}-${j}`;
            brickElement.className = 'brick'; // Add class for styling
            brickElement.style.width = brickWidth + 'px';
            brickElement.style.height = brickHeight + 'px';
            brickElement.style.position = 'absolute';
            brickElement.style.left = brickX + 'px';
            brickElement.style.top = brickY + 'px';
            brickElement.style.backgroundColor = 'green';
            allBricks.appendChild(brickElement);

            bricks[i][j] = {x: brickX, y: brickY, break: false};
        }
    }
}

// Center the ball
ball.x = boardWidth / 2 - ballWidth / 2;
ball.y = boardHeight / 2 - ballHeight / 2;

// Set the styles for the ball
ballElement.style.width = ball.width + 'px';
ballElement.style.height = ball.height + 'px';
ballElement.style.left = ball.x + 'px';
ballElement.style.top = ball.y + 'px';

function ballPosition() {
    ball.x += ball.moveX;
    ball.y += ball.moveY;

    // Bounce off the top and bottom walls
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.moveY *= -1;
    }
    // Bounce off the left and right walls
    if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
        ball.moveX *= -1;
    }
    // check if game over 
    if (ball.y + ball.height >= boardHeight) {
        // Reduce lives when the ball touches the ground
        lives--;
        document.getElementById('livesLeft').textContent = lives;

        if (lives <= 0) {
            // Game over if no lives left
            gameOver = true;
            stopTimer(); // Stop the timer
            gameOverSound = new Audio('assets/game_over_1.mp3');
            gameOverSound.play();
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('startPauseBtn').textContent = 'Play again';
            document.getElementById("scoreFormContainer").style.display = "block";
            showScoreForm();

        } else {
            // Reset ball and paddle positions
            resetBallAndPaddle();
            isPaused = true;
            document.getElementById('startPauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
            stopTimer();
        }
    }
    ballElement.style.left = ball.x + 'px';
    ballElement.style.top = ball.y + 'px';
}

function resetBallAndPaddle() {
    // Reset ball position to the center
    ball.x = boardWidth / 2 - ballWidth / 2;
    ball.y = boardHeight / 2 - ballHeight / 2;

    // Reset the paddle position
    playerElement.style.left = boardWidth / 2 - playerWidth / 2 + 'px';

    // Update the ball element position
    ballElement.style.left = ball.x + 'px';
    ballElement.style.top = ball.y + 'px';
}

//--------------------------FPS-----------------------------//

function logFPS(fps) {
    console.log(`Current FPS: ${fps.toFixed(2)}`);
document.getElementById('fpsValue').textContent = fps.toFixed(1);

}

function update(timestamp) {
    //calculating FPS
    countFrame++;
    const currentTime = timestamp || performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) { // Update every second
        const fps = countFrame / (deltaTime / 1000);
        logFPS(fps);
        countFrame = 0;
        lastTime = currentTime;
    }

    if (!gameOver && startGame && !isPaused) {
        playerPosition();
        ballPosition();
        checkCollision();
    }
    if (!isPaused || !isGameRunning) {
        requestAnimationFrame(update);
    }

}

//--------------------------Collision-----------------------------//

//check collision using axis-aligned bounding boxes
function bounce(a, b) {
    return a.x < b.x + brickWidth &&
        a.x + a.width > b.x &&
        a.y < b.y + brickHeight &&
        a.y + a.height > b.y;
}


function collisionDirection(ball, brick) {
    if (!bounce(ball, brick)) {
        return null;
    }

    const ballBottom = ball.y + ball.height;
    const ballTop = ball.y;
    const brickBottom = brick.y + brick.height;
    const brickTop = brick.y;

    // Check vertical collision first for optimization
    if (ball.moveY > 0 && ballBottom - ball.moveY <= brickTop) {
        return 'top';
    }
    if (ball.moveY < 0 && ballTop - ball.moveY >= brickBottom) {
        return 'bottom';
    }

    //horizontal
    const brickRight = brick.x + brick.width;
    const brickLeft = brick.x;
    const ballRight = ball.x + ball.width;
    const ballLeft = ball.x;

    if (ball.moveX < 0 && ballLeft - ball.moveX >= brickRight) return 'right';
    if (ball.moveX > 0 && ballRight - ball.moveX <= brickLeft) return 'left';

    return null;
}


function checkCollision() {

    // Check for collisions with bricks
    for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < bricks[i].length; j++) {
            let brick = bricks[i][j];
            if (brick && !brick.break && bounce(ball, brick)) {
                combo++;
                handleCollision(0, 'brick', i, j);
                brickBreakCount++;
                if (brickBreakCount === brickCol * brickRow) {
                    gameOverWon();
                }
                return;
            }
        }
    }


    // Check for collision ball with the paddle
    let paddle = {x: playerElement.offsetLeft, y: playerElement.offsetTop, width: playerWidth, height: playerHeight};
    let direction = collisionDirection(ball, paddle);
    if (direction !== null) {
        combo = 0;
        handleCollision(direction, 'paddle');
        clickSound = new Audio("assets/pop4.wav");
        clickSound.play();
    }
}


function gameOverWon() {
    stopTimer();
    gameOver = true
    document.getElementById('startPauseBtn').textContent = 'Play again';
    showScoreForm();
}

// Function to update the score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

function showScoreForm() {
    document.getElementById("scoreFormContainer").style.display = "block";
    // Set the score and time values in the form fields
    document.getElementById("scoreInput").value = score;
    document.getElementById("timeInput").value = Math.floor(elapsedTime / 1000);
}

function handleCollision(direction, type, i, j) {
     let speedIncrease = 0.3;
     let newSpeedX = Math.min(Math.abs(ball.moveX) + speedIncrease, 10); // Ensure new speed doesn't exceed maxSpeed
     let newSpeedY = Math.min(Math.abs(ball.moveY) + speedIncrease, 10);

     // Apply the speed adjustment based on the collision direction
     switch (direction) {
         case 'left':
         case 'right':
             ball.moveX = (direction === 'left' ? -1 : 1) * newSpeedX;
             break;
         case 'top':
         case 'bottom':
             ball.moveY = (direction === 'top' ? -1 : 1) * newSpeedY;
             break;
     }

     // Handle different types of collisions
     if (type === 'brick') {
         ball.moveY = -ball.moveY;

         // Remove the brick from display and possibly from the bricks array
         let brickElement = document.getElementById(`brick-${i}-${j}`);

         if (brickElement) {

             brickElement.style.display = 'none'; // Hide the brick element
             bricks[i][j].break = true; // Mark the brick as broken
             score += (100 * combo);
             //sound 
             breakSound = new Audio("assets/pop2.wav")
             breakSound.play();
             updateScore(); // Update the score display
         }
     } else if (type === 'paddle') {

         ball.moveY = -Math.abs(ball.moveY);
     }
 }


// Function to reset all the bricks
function resetBricks() {
    for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < bricks[i].length; j++) {
            let brick = bricks[i][j];
            brick.break = false; // Reset the brick state
            let brickElement = document.getElementById(`brick-${i}-${j}`);
            if (brickElement) {
                brickElement.style.display = 'block'; // Display the brick again
            }
        }
    }
}

// Function to reset the game
function resetGame() {
    // Reset the game variables
    gameOver = false;
    lives = 3;
    score = 0;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('livesLeft').textContent = lives;
    document.getElementById('score').textContent = score;
    resetBricks(); // Reset all the bricks
    resetBallAndPaddle(); // Reset the ball and paddle positions
    startGame = false;
    isPaused = false;
    isGameRunning = false;
    document.getElementById('startPauseBtn').textContent = 'Start';
    stopTimer(); // Stop the timer if it's running
}

//--------------------------Tiles-----------------------------//


// Function to handle the selection of a tile
function selectTile(tileId) {
    // Perform actions based on the clicked tile ID
    switch (tileId) {
        case 'bodyBackground1':
            document.body.style.backgroundImage  = 'url("assets/bodyBackground1.png")';
            break;
        case 'bodyBackground2':
            document.body.style.backgroundImage  = 'url("assets/bodyBackground2.png")';
            break;
        case 'bodyBackground3':
            document.body.style.backgroundImage = 'url("assets/bodyBackground3.png")';
            break;
        case 'background1':
            document.getElementById('board').style.backgroundImage = 'url("assets/background1.png")';
            break;
        case 'background2':
            document.getElementById('board').style.backgroundImage = 'url("assets/background2.png")';
            break;
        case 'background3':
            document.getElementById('board').style.backgroundImage = 'url("assets/background3.png")';
            break;
        case 'paddle1':
            document.getElementById('player').style.backgroundImage = 'url("assets/paddle1.png")';
            break;
        case 'paddle2':
            document.getElementById('player').style.backgroundImage = 'url("assets/paddle2.png")';
            break;
        case 'paddle3':
            document.getElementById('player').style.backgroundImage = 'url("assets/paddle3.png")';
            break;
        case 'ball1':
            document.getElementById('ball').style.backgroundImage = 'url("assets/ball1.png")';
            break;
        case 'ball2':
            document.getElementById('ball').style.backgroundImage = 'url("assets/ball2.png")';
            break;
        case 'ball3':
            document.getElementById('ball').style.backgroundImage = 'url("assets/ball3.png")';
            break;
        case 'brick1':
            updateBrickAppearance('brick1');
            break;
        case 'brick2':
            updateBrickAppearance('brick2');
            break;
        case 'brick3':
            updateBrickAppearance('brick3');
            break;
        case 'reset':
            updateBrickAppearance('brick4');
            document.getElementById('body').style.backgroundImage  = 'url("assets/bodyBackground4.png")';
            document.getElementById('board').style.backgroundImage = 'url("assets/background4.png")';
            document.getElementById('player').style.backgroundImage = 'url("assets/paddle4.png")';
            document.getElementById('ball').style.backgroundImage = 'url("assets/ball4.png")';
        default:
            break;
    }
}

// Function to update the appearance of bricks based on the selected tile
function updateBrickAppearance(brickType) {
    // Get all brick elements and update their appearance
    let bricks = document.getElementsByClassName('brick');
    for (let i = 0; i < bricks.length; i++) {
        bricks[i].style.backgroundImage = `url("assets/${brickType}.png")`;
    }
}

//---------------------------Change Ball Speed----------------------------//
  

// Add event listeners to radio buttons to change ball speed
document.querySelectorAll('input[name="ballSpeed"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
        switch(this.value) {
            case 'slow':
                setBallSpeed(1);
                break;
            case 'medium':
                setBallSpeed(2);
                break;
            case 'fast':
                setBallSpeed(3);
                break;
            default:
                break;
        }
    });
});

// Define variables to store the current ball direction
let currentDirectionX = Math.sign(ball.moveX);
let currentDirectionY = Math.sign(ball.moveY);

// Function to set the ball's movement speed
function setBallSpeed(speed) {
    // Store the current direction of the ball
    let newDirectionX = currentDirectionX;
    let newDirectionY = currentDirectionY;

    // Update the ball's speed with the new magnitude
    ball.moveX = newDirectionX * speed;
    ball.moveY = newDirectionY * speed;
}


//---------------------------Score Board----------------------------//


const scoreboardContainer = document.getElementById('scoreboard');

fetch('http://localhost:8081/scoreboard')
    .then(response => response.json())
    .then(data => {
        // Clear previous scoreboard content
        scoreboardContainer.innerHTML = '';
        
        // Display scoreboard data
        data.forEach((entry, index) => {
            const row = document.createElement('div');
            row.textContent = `${index + 1}. ${entry.name} - Score: ${entry.score}`;
            scoreboardContainer.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching scoreboard data:', error));


    const scoreForm = document.getElementById('scoreForm');

    scoreForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(scoreForm);
    const scoreData = {
        name: formData.get('name'),
        score: parseInt(formData.get('score')),
        time: parseInt(formData.get('time'))
    };

    fetch('http://localhost:8081/scoreboard')
    .then(response => response.json())
    .then(scoreboardData => {
        const rank = getRank(scoreboardData, scoreData.score);
        const percentile = getPositionPercentile(scoreboardData, scoreData.score);
        alert(`Congrats ${scoreData.name}, you are in the top ${percentile}%, your rank is: ${rank}.`);

        // Start the second fetch inside this `then` block
        return fetch('http://localhost:8081/scoreboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });
    })
    .then(response => {
        if (response.ok) {
            alert(`Score submitted`);
            // Refresh the page after 1 second
            setTimeout(function() {
                window.location.reload(); // Reload the page
            }, 500);
        } else {
            throw new Error('Failed to submit score');
        }
    })
    .catch(error => console.error('Error:', error));

});

// Function to get the rank of the submitted score
function getRank(scoreboardData, submittedScore) {
    // Sort scoreboard data by score in descending order
    scoreboardData.sort((a, b) => b.score - a.score);
    
    // Find the index where the submitted score fits in the sorted scoreboard data
    let rank = 1;
    for (const entry of scoreboardData) {
        if (submittedScore <= entry.score) {
            rank++;
        } else {
            break;
        }
    }
    
    return rank;
}

// Function to calculate the position percentile of the submitted score
function getPositionPercentile(scoreboardData, submittedScore) {
    // Sort scoreboard data by score in descending order
    scoreboardData.sort((a, b) => b.score - a.score);
    
    // Calculate the number of scores lower than the submitted score
    let lowerScoresCount = 0;
    for (const entry of scoreboardData) {
        if (submittedScore > entry.score) {
            lowerScoresCount++;
        }
    }
    
    // Calculate the position percentile
    const totalScores = scoreboardData.length;
    const percentile = 100 - ((lowerScoresCount / totalScores) * 100);
    
    return percentile.toFixed(2); // Round to 2 decimal places
}

// Function to populate the scoreboard with data
function populateScoreboard(data) {
    const scoreboardContainer = document.getElementById('scoreboard');
    scoreboardContainer.innerHTML = ''; // Clear previous content

    // Sort the data by score in descending order
    data.sort((a, b) => b.score - a.score);

    // Display only the top five highest scores
    const topFive = data.slice(0, 5);

    // Create a table to display the scoreboard
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    const headers = ['Rank', 'Name', 'Score', 'Time'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });

    // Populate the table rows with scoreboard data
    topFive.forEach((entry, index) => {
        const row = table.insertRow();
        const rankCell = row.insertCell();
        rankCell.textContent = index + 1 + '.'; // Rank
        const nameCell = row.insertCell();
        nameCell.textContent = entry.name; // Name
        const scoreCell = row.insertCell();
        scoreCell.textContent = entry.score; // Score
        const timeCell = row.insertCell();
        timeCell.textContent = formatTime(entry.time); // Game Time
    });

    // Append the table to the scoreboard container
    scoreboardContainer.appendChild(table);
}

// Function to format game time (in seconds)
function formatTime(seconds) {
    return `${seconds} sec`;
}

// Function to fetch scoreboard data from the server
function fetchScoreboardData() {
    fetch('http://localhost:8081/scoreboard')
        .then(response => response.json())
        .then(data => {
            populateScoreboard(data); // Call the function to populate scoreboard with fetched data
        })
        .catch(error => {
            console.error('Error fetching scoreboard data:', error);
        });
}


// const canvas = document.getElementById("game");
// const ctx = canvas.getContext("2d");
// const tileSize = 16;

// const tileMap = new TileMap(tileSize);

// canvas.height = tileMap.map.length * tileSize;
// canvas.width = tileMap.map[0].length * tileSize;

// function gameLoop() {
//     tileMap.draw(canvas, ctx);
// }

// setInterval(gameLoop, 1000 / 60);




// Call the fetchScoreboardData function to fetch and populate the scoreboard initially
fetchScoreboardData();
requestAnimationFrame(update);



