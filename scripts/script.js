// (function () {
/**
 * pubSub snippet source:
 * https://gist.github.com/learncodeacademy/777349747d8382bfb722#file-pubsub-js
 */
const pubSub = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function (eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn) {
        fn(data);
      });
    }
  },
};

function gameBoard() {
  const grid = [];
  const values = {
    o: 1,
    x: -1,
    "-": 0,
  };
  const lastMove = {
    x: 0,
    y: 0,
    symbol: "",
  };
  let emptyCellCount = 9;

  function _isCellValid(x, y) {
    return x >= 0 && x < 3 && y >= 0 && y < 3 && getCell(x, y) === values["-"];
  }

  function _setCell(x, y, value) {
    grid[x][y] = value;
  }

  function _getKeyOf(value) {
    switch (value) {
      case 0:
        return "-";
      case 1:
        return "o";
      case -1:
        return "x";
      default:
        return "INVALID";
    }
  }

  function _sumAcross(x) {
    let sum = 0;
    for (let y = 0; y < 3; y++) {
      sum += grid[x][y];
    }
    return sum;
  }

  function _sumDown(y) {
    let sum = 0;
    for (let x = 0; x < 3; x++) {
      sum += grid[x][y];
    }
    return sum;
  }

  function _sumDiagonalLR() {
    return grid[0][0] + grid[1][1] + grid[2][2];
  }

  function _sumDiagonalRL() {
    return grid[0][2] + grid[1][1] + grid[2][0];
  }

  function _updateLastMove(x = 0, y = 0, symbol = "") {
    lastMove.x = x;
    lastMove.y = y;
    lastMove.symbol = symbol;
  }

  function getCell(x, y) {
    return grid[x][y];
  }

  function getGrid() {
    return grid;
  }

  function getDisplayGrid() {
    const displayGrid = grid.reduce((accumulator, row) => {
      const mappedRow = row.map((cell) => {
        return _getKeyOf(cell);
      });
      accumulator.push(mappedRow);
      return accumulator;
    }, []);
    return displayGrid;
  }

  function getEmptyCellCount() {
    return emptyCellCount;
  }

  function build() {
    for (let i = 0; i < 3; i++) {
      grid[i] = [];
      for (let j = 0; j < 3; j++) {
        _setCell(i, j, values["-"]);
      }
    }
  }

  function reset() {
    if (grid.length > 0) {
      for (let i = 0; i < 3; i++) {
        grid.pop();
      }
    }
    build();
    emptyCellCount = 9;
    _updateLastMove();
  }

  function place(x, y, symbol) {
    if (_isCellValid(x, y)) {
      _setCell(x, y, values[symbol]);
      _updateLastMove(x, y, symbol);
      emptyCellCount--;
      return true;
    } else {
      return false;
    }
  }

  function threeInRow(
    x = lastMove.x,
    y = lastMove.y,
    symbol = lastMove.symbol
  ) {
    const targetSum = 3 * values[symbol];
    return (
      _sumAcross(x) == targetSum ||
      _sumDown(y) == targetSum ||
      _sumDiagonalLR == targetSum ||
      _sumDiagonalRL == targetSum
    );
  }

  return {
    getGrid,
    getDisplayGrid,
    getEmptyCellCount,
    build,
    reset,
    place,
    threeInRow,
  };
}

/**
 * Factory function to create Player objects
 * @param {string} symbol - 'o' or 'x'
 */
function createPlayer(symbol) {
  function getSymbol() {
    return symbol;
  }

  function getNextMove() {
    const coords = prompt(`${symbol}'s turn`);
    if (coords) return coords.split(" ");
    else return [-1, -1];
  }

  return {
    getSymbol,
    getNextMove,
  };
}

function gameController() {
  const board = gameBoard();
  const player1 = createPlayer("o");
  const player2 = createPlayer("x");
  let turn = 1;
  let currPlayer = player1;
  let gameOver = false;

  function _showBoard() {
    console.table(board.getDisplayGrid());
  }

  function _showPrompt() {
    return `${currPlayer.getSymbol()}'s turn`;
  }

  function _nextTurn() {
    turn++;
    currPlayer = currPlayer === player1 ? player2 : player1;
  }

  function _checkGameOver() {
    if (turn < 4) {
      _nextTurn();
      _showBoard();
      return _showPrompt();
    }

    const threeInRow = board.threeInRow();
    const allFilled = board.getEmptyCellCount === 0;

    if (!(threeInRow || allFilled)) {
      _nextTurn();
      _showBoard();
      return _showPrompt();
    }

    _showBoard();
    gameOver = true;
    if (threeInRow) {
      return `${currPlayer.getSymbol()} WINS`;
    } else if (allFilled) {
      return "IT'S A DRAW";
    }
    // _destroyGame();
  }

  function getCurrPlayer() {
    return currPlayer;
  }

  function startGame() {
    board.reset();
    turn = 1;
    currPlayer = player1;
    gameOver = false;
    _showBoard();

    return _showPrompt();
  }

  function playTurn(x, y) {
    const symbol = currPlayer.getSymbol();
    const placed = board.place(x, y, symbol);

    if (placed) {
      const msg = _checkGameOver();
      if (gameOver) {
        pubSub.emit("gameOver");
      }
      return msg;
    } else {
      console.log(`Invalid move on ${x}, ${y}. Try again:`);
    }
  }

  return {
    start: startGame,
    playTurn,
    getCurrPlayer,
  };
}

function displayController() {
  const game = gameController();

  pubSub.on("gameOver", _removeListeners);

  function _showStatusMessage(msg) {
    const message = document.querySelector(".status .message");
    message.textContent = msg;
  }

  /**
   * Send coordinates of cell clicked to game
   * @param {MouseEvent} event
   */
  function _handleCellClick(event) {
    const cell = event.target;
    const x = cell.dataset.x;
    const y = cell.dataset.y;
    const symbol = game.getCurrPlayer().getSymbol();
    const msg = game.playTurn(x, y);

    cell.textContent = symbol;
    cell.disabled = true;

    _showStatusMessage(msg);
  }

  function _removeListeners() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.removeEventListener("click", _handleCellClick);
    });
  }

  function _build() {
    const board = document.querySelector(".board");

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cellBtn = document.createElement("button");
        cellBtn.type = "button";
        cellBtn.classList.add("cell");
        cellBtn.dataset.x = i;
        cellBtn.dataset.y = j;
        cellBtn.addEventListener("click", _handleCellClick);
        board.appendChild(cellBtn);
      }
    }
  }
  function init() {
    _build();
    game.start();
  }

  function destroy() {}

  return {
    init,
  };
}

const display = displayController();
display.init();

// })();
