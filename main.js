var COLS = 10, ROWS = 20;
var board = [];
var lose;
var start = false;
var pause = false;
var score = 0;
var count = 0;
var db_update = false;
var interval;
var current; // current moving shape
var currentX, currentY; // position of current shape
var shapes = [
    [1, 1, 1, 1],
    [1, 1, 1, 0,
     1],
    [1, 1, 1, 0,
     0, 0, 1],
    [1, 1, 0, 0,
     1, 1],
    [1, 1, 0, 0,
     0, 1, 1],
    [0, 1, 1, 0,
     1, 1],
    [0, 1, 0, 0,
     1, 1, 1]
];

// creates a new 4x4 shape in global variable 'current'
// 4x4 so as to cover the size when the shape is rotated
function newShape() {
    count++;
    var id = Math.floor(Math.random() * shapes.length);
    var shape = shapes[id]; // maintain id for color filling

    current = [];
    for (var y = 0; y < 4; y++) {
        current[y] = [];
        for (var x = 0; x < 4; x++) {
            var i = 4 * y + x;
            if (typeof shape[i] != 'undefined' && shape[i]) {
                current[y][x] = id + 1;
            }
            else {
                current[y][x] = 0;
            }
        }
    }
    // position where the shape will evolve
    currentX = 4;
    currentY = 0;
}

// clears the board
function init() {
    for (var y = 0; y < ROWS; y++) {
        board[y] = [];
        for (var x = 0; x < COLS; x++) {
            board[y][x] = 0;
        }
    }
}

// keep the element moving down, creating new shapes and clearing lines
function move() {
    if (!pause) {
        if (valid(0, 1)) {
            currentY++;
        }
        // if the element settled
        else {
            freeze();
            clearLines();
            if (lose) {
                gameOver();
                return false;
            }
            newShape();
        }
    }
}

// stop shape at its position and fix it to board
function freeze() {
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            if (current[y][x]) {
                board[y + currentY][x + currentX] = current[y][x];
            }
        }
    }
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; y++) {
        newCurrent[y] = [];
        for (var x = 0; x < 4; x++) {
            newCurrent[y][x] = current[3 - x][y];
        }
    }

    return newCurrent;
}

// check if any lines are filled and clear them
function clearLines() {
    var line_clear = 0
    for (var y = ROWS - 1; y >= 0; y--) {
        var rowFilled = true;
        for (var x = 0; x < COLS; x++) {
            if (board[y][x] == 0) {
                rowFilled = false;
                break;
            }
        }
        if (rowFilled) {
            for (var yy = y; yy > 0; yy--) {
                for (var x = 0; x < COLS; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }
            y++;
            line_clear++;
            score = score + line_clear * 100;
        }
    }
}

function action(key) {
    switch (key) {
        case 'start':
            start = true;
            pause = false;
            newGame();
            break;
        case 'pause':
            if (!lose) {
                pause = !pause;
            }
            break;
        case 'end':
            if (start) {
                gameOver();
            }
            break;
            
        case 'left':
            if (valid(-1) && !pause) {
                currentX--;
            }
            break;
        case 'right':
            if (valid(1) && !pause) {
                currentX++;
            }
            break;
        case 'down':
            if (valid(0, 1) && !pause) {
                currentY++;
            }
            break;
        case 'rotate':
            if (!pause) {
                var rotated = rotate(current);
                if (valid(0, 0, rotated)) {
                    current = rotated;
                }
            }
            break;
    }
}

// checks if the resulting position of current shape will be feasible
function valid(offsetX, offsetY, newCurrent) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            if (newCurrent[y][x]) {
                if (typeof board[y + offsetY] == 'undefined'
                  || typeof board[y + offsetY][x + offsetX] == 'undefined'
                  || board[y + offsetY][x + offsetX]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS) {
                    if (offsetY == 1) {
                        lose = true; // lose if the current shape at the top row when checked
                    }
                    return false;
                }
            }
        }
    }
    return true;
}

function newGame() {
    score = 0;
    count = 0;
    clearInterval(interval);
    init();
    newShape();
    lose = false;
    interval = setInterval(move, 200);
}

function gameOver() {
    lose = true;
    start = false;
    pause = true;
    // var name = prompt("Please enter your name", "Player");
    // updateScore(name);
}
