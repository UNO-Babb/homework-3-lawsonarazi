let currentPlayer = 0;
const players = ["Player 1", "Player 2", "Player 3", "Player 4"];
let gameBoard = []; // 10x10 grid
let impassableSquares = [];
let playerPositions = Array(4).fill(0); // All players start at position 0
let currentLevel = 'Easy'; // Initialize the game with 'Easy' difficulty

// Set up the board based on the current level (number of impassable squares)
function setupGame(level) {
    currentLevel = level; // Set the level to the selected one
    impassableSquares = generateImpassableSquares(level);
    gameBoard = generateGameBoard(impassableSquares);
    renderBoard();
}

// Generate a new grid based on the impassable squares
function generateGameBoard(impassableSquares) {
    const board = [];
    for (let i = 0; i < 100; i++) {
        board.push(impassableSquares.includes(i) ? -1 : 0); // -1 for impassable, 0 for passable
    }
    return board;
}

// Generate random impassable squares based on the selected difficulty
function generateImpassableSquares(level) {
    let numImpassable = 0;
    if (level === 'Easy') numImpassable = 15;
    else if (level === 'Medium') numImpassable = 30;
    else if (level === 'Hard') numImpassable = 50;
    else if (level === 'Expert') numImpassable = 75;

    const impassable = [];
    while (impassable.length < numImpassable) {
        let rand = Math.floor(Math.random() * 100);
        if (!impassable.includes(rand)) {
            impassable.push(rand);
        }
    }
    return impassable;
}

// Render the game board
function renderBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = ''; // Clear the board

    for (let i = 0; i < 100; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.setAttribute("data-id", i);

        if (gameBoard[i] === -1) {
            square.classList.add("impassable"); // Mark impassable squares
        } else {
            square.classList.add("passable"); // Mark passable squares
        }

        square.addEventListener("click", () => handleSquareClick(i));
        boardElement.appendChild(square);
    }

    highlightAdjacentSquares(); // Highlight the adjacent squares to the current player's position
    updatePlayerInfo(); // Update player information on the screen
}

// Update player info on the screen
function updatePlayerInfo() {
    document.getElementById("player-text").textContent = `Player: ${currentPlayer + 1}`;
    document.getElementById("level-text").textContent = `Level: ${currentLevel}`;
}

// Handle player click on a square
function handleSquareClick(squareId) {
    const currentSquare = document.querySelector(`.square[data-id='${squareId}']`);

    if (gameBoard[squareId] === -1) {
        // If the square is impassable
        currentSquare.classList.add("red"); // Temporarily mark it red
        setTimeout(() => {
            currentSquare.classList.remove("red"); // Reset after 1 second
            nextPlayer(); // Move to the next player after impassable square
        }, 1000);
    } else {
        // If the square is passable
        currentSquare.classList.add("green"); // Mark it green
        setTimeout(() => {
            currentSquare.classList.remove("green"); // Reset after 1 second
        }, 1000);

        // Update the player's position
        playerPositions[currentPlayer] = squareId;

        // If player reaches or exceeds position 90 (near the end), they win
        if (playerPositions[currentPlayer] >= 90) {
            alert(`${players[currentPlayer]} Wins!`);
            resetGame();
        }
    }
}

// Highlight adjacent squares (blue) around the player's green position
function highlightAdjacentSquares() {
    const currentPosition = playerPositions[currentPlayer];
    const adjacentSquares = getAdjacentSquares(currentPosition);

    // Remove the blue class from all squares before re-highlighting adjacent squares
    document.querySelectorAll(".square").forEach(square => {
        square.classList.remove("blue");
    });

    // Highlight the adjacent squares (only if passable)
    adjacentSquares.forEach(squareId => {
        const adjacentSquare = document.querySelector(`.square[data-id='${squareId}']`);
        if (adjacentSquare && gameBoard[squareId] !== -1) {
            adjacentSquare.classList.add("blue");
        }
    });
}

// Get adjacent squares (left, right, top, bottom) for a given position
function getAdjacentSquares(position) {
    const adjacent = [];
    const row = Math.floor(position / 10);
    const col = position % 10;

    // Check left
    if (col > 0) adjacent.push(position - 1);

    // Check right
    if (col < 9) adjacent.push(position + 1);

    // Check up
    if (row > 0) adjacent.push(position - 10);

    // Check down
    if (row < 9) adjacent.push(position + 10);

    return adjacent;
}

// Move to the next player (rotate)
function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % 4;
    renderBoard();
}

// Reset the game after someone wins
function resetGame() {
    playerPositions = Array(4).fill(0); // Reset positions
    setupGame(currentLevel); // Restart with the current level
}

// Initial game setup
setupGame(currentLevel);
