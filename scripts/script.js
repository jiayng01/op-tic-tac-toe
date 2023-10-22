// (function () {
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

  function _showBoard() {
    console.table(board.getDisplayGrid());
  }

  function _getCurrPlayer() {
    if (turn % 2 === 0) {
      return player2;
    } else {
      return player1;
    }
  }

  function _showPrompt() {
    console.log(`${_getCurrPlayer().getSymbol()}'s turn:`);
  }

  function _destroyGame() {
    board.reset();
    turn = 1;
  }

  function _checkGameOver() {
    if (turn < 4) {
      turn++;
      _showBoard();
      _showPrompt();
      return;
    }

    const threeInRow = board.threeInRow();
    const allFilled = board.getEmptyCellCount === 0;

    if (!(threeInRow || allFilled)) {
      turn++;
      _showBoard();
      _showPrompt();
      return;
    }

    _showBoard();
    if (threeInRow) {
      console.log(`${_getCurrPlayer().getSymbol()} WINS`);
    } else if (allFilled) {
      console.log("IT'S A DRAW");
    }
    _destroyGame();
  }

  function startGame() {
    board.reset();
    _showBoard();
    _showPrompt();
  }

  function playTurn(x, y) {
    const currPlr = _getCurrPlayer();
    // const [x, y] = currPlr.getNextMove();
    const symbol = currPlr.getSymbol();
    const placed = board.place(x, y, symbol);

    if (placed) {
      _checkGameOver();
    } else {
      console.log(`Invalid move on ${x}, ${y}. Try again:`);
    }
  }

  return {
    start: startGame,
    playTurn,
  };
}

const game = gameController();
game.start();
// })();
