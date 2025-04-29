let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let playerXName = '';
let playerOName = '';
let scoreX = 0;
let scoreO = 0;
let isComputerOpponent = false;
let difficulty = 'easy';

// Sounds
const clickSound = new Audio('sounds/button-key-press-gfx-sounds-5-5-00-00.mp3');
const winSound = new Audio('sounds/audience-cheering-clapping-short-fascinatedsound-1-00-06.mp3');
const drawSound = new Audio('sounds/game-over-31-179699.mp3');
const resetSound = new Audio('sounds/whip-whoosh-epic-stock-media-1-00-00.mp3');

const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('resetBtn');
const startGameBtn = document.getElementById('startGame');
const message = document.getElementById('message');
const scoreXElem = document.getElementById('scoreX');
const scoreOElem = document.getElementById('scoreO');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const computerToggle = document.getElementById('computerToggle');
const difficultySelect = document.getElementById('difficulty');

const checkWinner = (player) => {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] === player && boardState[b] === player && boardState[c] === player) {
            return true;
        }
    }
    return false;
};

const getAvailableCells = () => {
    return boardState.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);
};

const computerMove = () => {
    const availableCells = getAvailableCells();

    let move;
    if (difficulty === 'easy') {
        move = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficulty === 'medium') {
        move = mediumAI(availableCells);
    } else if (difficulty === 'hard') {
        move = hardAI();
    }

    boardState[move] = 'O';
    cells[move].textContent = 'O';
    clickSound.play();

    if (checkWinner('O')) {
        message.textContent = `${playerOName} wins!`;
        gameActive = false;
        updateScore();
        winSound.play();
    } else if (!boardState.includes('')) {
        message.textContent = 'It\'s a draw!';
        gameActive = false;
        drawSound.play();
    } else {
        currentPlayer = 'X';
        message.textContent = `${playerXName}'s turn!`;
    }
};

const mediumAI = (availableCells) => {
    const priorityMoves = [4, 0, 2, 6, 8];
    for (let move of priorityMoves) {
        if (availableCells.includes(move)) return move;
    }
    return availableCells[Math.floor(Math.random() * availableCells.length)];
};

const hardAI = () => {
    return minimax(boardState, 'O').index;
};

const minimax = (newBoard, player) => {
    const availableCells = getAvailableCells();

    // Check terminal states
    if (checkWinner('X')) {
        return { score: -10 };
    } else if (checkWinner('O')) {
        return { score: 10 };
    } else if (availableCells.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    // Loop through available cells
    for (let i = 0; i < availableCells.length; i++) {
        const move = {};
        move.index = availableCells[i];
        newBoard[availableCells[i]] = player;

        if (player === 'O') {
            move.score = minimax(newBoard, 'X').score;
        } else {
            move.score = minimax(newBoard, 'O').score;
        }

        newBoard[availableCells[i]] = ''; // Undo move
        moves.push(move);
    }

    // Find best move
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
};

const handleCellClick = (event) => {
    const cellId = event.target.id;
    if (boardState[cellId] === '' && gameActive) {
        boardState[cellId] = currentPlayer;
        event.target.textContent = currentPlayer;
        clickSound.play();

        if (checkWinner(currentPlayer)) {
            message.textContent = `${currentPlayer === 'X' ? playerXName : playerOName} wins!`;
            gameActive = false;
            updateScore();
            winSound.play();
        } else if (!boardState.includes('')) {
            message.textContent = 'It\'s a draw!';
            gameActive = false;
            drawSound.play();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (isComputerOpponent && currentPlayer === 'O') {
                setTimeout(computerMove, 500);
            } else {
                message.textContent = `${currentPlayer === 'X' ? playerXName : playerOName}'s turn!`;
            }
        }
    }
};

const updateScore = () => {
    if (currentPlayer === 'X') {
        scoreX++;
        scoreXElem.textContent = `X: ${scoreX}`;
    } else {
        scoreO++;
        scoreOElem.textContent = `O: ${scoreO}`;
    }
};

const resetGame = () => {
    boardState = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => cell.textContent = '');
    message.textContent = '';
    currentPlayer = 'X';
    gameActive = true;
    playerXName = playerXInput.value || 'Player X';
    playerOName = isComputerOpponent ? 'Computer' : (playerOInput.value || 'Player O');
    difficulty = difficultySelect.value;
    message.textContent = `${playerXName}'s turn!`;
    resetSound.play();
};

startGameBtn.addEventListener('click', () => {
    isComputerOpponent = computerToggle.checked;
    playerXName = playerXInput.value || 'Player X';
    playerOName = isComputerOpponent ? 'Computer' : (playerOInput.value || 'Player O');
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
