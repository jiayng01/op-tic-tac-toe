(function () {
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

  /**
   * Factory function that mimics some Set functions for quick
   * manipulation of array
   * @param {Number} len - length of inner array
   */
  function createArrayOfArrays(len) {
    const contents = [];

    function _findIndex(item) {
      const idx = contents.findIndex((arr) => {
        let matches = 0;
        for (let i = 0; i < len; i++) {
          if (arr[i] === item[i]) matches++;
        }
        return matches === len;
      });
      return idx;
    }

    function getContents() {
      return contents;
    }

    function add(item) {
      if (_findIndex(item) < 0) contents.push(item);
      contents.sort();
    }

    function remove(item) {
      const idx = _findIndex(item);
      if (idx < 0) return false;

      contents.splice(idx, 1);
      return true;
    }

    function clear() {
      for (let i = 0; i < contents.length; i++) {
        contents.pop();
      }
    }

    return {
      getContents,
      add,
      remove,
      clear,
    };
  }

  /**
   * @typedef {Object} GameBoard
   * @property {Function} getGrid,
   * @property {Function} getDisplayGrid,
   * @property {Function} getEmptyCells,
   * @property {Function} getCellSymbol,
   * @property {Function} build,
   * @property {Function} destroy,
   * @property {Function} place,
   * @property {Function} unPlace,
   * @property {Function} threeInRow,
   */

  /**
   * Module that manages the game board
   * @returns {GameBoard}
   */
  function gameBoard(rows, cols) {
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

    const emptyCells = createArrayOfArrays(2);

    function _isCellValid(x, y) {
      return (
        x >= 0 && x < rows && y >= 0 && y < cols && getCellSymbol(x, y) === "-"
      );
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
      for (let y = 0; y < cols; y++) {
        sum += grid[x][y];
      }
      return sum;
    }

    function _sumDown(y) {
      let sum = 0;
      for (let x = 0; x < rows; x++) {
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

    /**
     * Set cell content as its corresponding numeric value, given a symbol
     * @param {Number} x
     * @param {Number} y
     * @param {String} symbol
     */
    function _setCell(x, y, symbol) {
      grid[x][y] = values[symbol];
    }

    /**
     * Get cell content in terms of symbols
     * @param {number} x
     * @param {number} y
     * @returns {string} symbol
     */
    function getCellSymbol(x, y) {
      return _getKeyOf(grid[x][y]);
    }

    /**
     * Get numeric grid
     * @returns {Array[]} grid
     */
    function getGrid() {
      return grid;
    }

    function getEmptyCells() {
      return emptyCells.getContents();
    }

    /**
     * Get symbolic grid
     * @returns displayGrid
     */
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

    function build() {
      for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < cols; j++) {
          _setCell(i, j, "-");
          emptyCells.add([i, j]);
        }
      }
    }

    function destroy() {
      if (grid.length > 0) {
        for (let i = 0; i < rows; i++) {
          grid.pop();
        }
      }
      // build();
      emptyCells.clear();
      _updateLastMove();
    }

    function place(x, y, symbol) {
      if (_isCellValid(x, y)) {
        _setCell(x, y, symbol);
        _updateLastMove(x, y, symbol);
        emptyCells.remove([x, y]);
        return true;
      } else {
        return false;
      }
    }

    function unPlace(x, y) {
      _setCell(x, y, "-");
      emptyCells.add([x, y]);
    }

    function threeInRow(
      x = lastMove.x,
      y = lastMove.y,
      symbol = lastMove.symbol
    ) {
      const targetSum = 3 * values[symbol];
      const winningRow = [];

      switch (targetSum) {
        case _sumAcross(x):
          for (let i = 0; i < rows; i++) {
            winningRow.push([x, i]);
          }
          break;
        case _sumDown(y):
          for (let i = 0; i < cols; i++) {
            winningRow.push([i, y]);
          }
          break;
        case _sumDiagonalLR():
          for (let i = 0; i < rows; i++) {
            winningRow.push([i, i]);
          }
          break;
        case _sumDiagonalRL():
          for (let i = 0; i < rows; i++) {
            winningRow.push([cols - (i + 1), i]);
          }
          break;
      }
      return winningRow;
    }

    return {
      getGrid,
      getDisplayGrid,
      getEmptyCells,
      getCellSymbol,
      build,
      destroy,
      place,
      unPlace,
      threeInRow,
    };
  }

  /**
   * Factory function to create Player objects
   * @param {string} symbol - 'o' or 'x'
   */
  function createPlayer(name, type = "Human", symbol, activeState) {
    let isActive = activeState;

    function getName() {
      return name;
    }

    function getType() {
      return type;
    }

    function getSymbol() {
      return symbol;
    }

    function toggleActiveState() {
      isActive = isActive ? false : true;
    }

    function getActiveState() {
      return isActive;
    }

    return {
      getName,
      getType,
      getSymbol,
      toggleActiveState,
      getActiveState,
    };
  }

  /**
   * Factory function that returns a BotPlayer
   * @param {string} symbol
   * @param {GameBoard} board
   * @param {Boolean} activeState
   */
  function createBotPlayer(name, symbol, board, activeState) {
    const playerParent = createPlayer(name, "Bot", symbol, activeState);

    const mySymbol = playerParent.getSymbol();
    const oppSymbol = mySymbol === "o" ? "x" : "o";
    let currBoard = board;

    function _getNextMoves() {
      if (currBoard.threeInRow().length > 0) return [];
      return currBoard.getEmptyCells();
    }

    /**
     * Calculates the value of each line in a certain terminating state
     * using the heuristics function:
     * +100, +10, +1 for 3-, 2-, 1-in-a-line for computer.
     * -100, -10, -1 for 3-, 2-, 1-in-a-line for opponent.
     * 0 otherwise
     * @param  {...Array} args
     */
    function _evaluateLine(...args) {
      let myCount = 0;
      let oppCount = 0;
      for (let [x, y] of args) {
        const cellSymbol = currBoard.getCellSymbol(x, y);

        if (cellSymbol === mySymbol) {
          myCount++;
        } else if (cellSymbol === oppSymbol) {
          oppCount++;
        }
      }

      if (myCount + oppCount === 0 || (myCount > 0 && oppCount > 0)) return 0; // empty or both players in line

      // only bot in line
      switch (myCount) {
        case 1:
          return 1;
        case 2:
          return 10;
        case 3:
          return 100 * currBoard.getEmptyCells().length;
        // return 100;
      }

      // only opponent in line
      switch (oppCount) {
        case 1:
          return -1;
        case 2:
          return -10;
        case 3:
          return -100 * currBoard.getEmptyCells().length;
        // return -100;
      }
      return 0;
    }

    /**
     * Calculates the value of each line in a certain terminating state
     * using the heuristics function:
     * bot wins: +10
     * bot loses: -10
     * 0 otherwise
     * @param  {...Array} args
     */
    function _evaluateLine10s(...args) {
      let myCount = 0;
      let oppCount = 0;
      for (let [x, y] of args) {
        const cellSymbol = currBoard.getCellSymbol(x, y);

        if (cellSymbol === mySymbol) {
          myCount++;
        } else if (cellSymbol === oppSymbol) {
          oppCount++;
        }
      }

      if (myCount === 3 && oppCount < 3) return 10;
      if (oppCount === 3 && myCount < 3) return -10;
      return 0;
    }

    function _evaluate(type = "discrete") {
      let score = 0;

      if (type !== "discrete") {
        // rows
        score += _evaluateLine([0, 0], [0, 1], [0, 2]);
        score += _evaluateLine([1, 0], [1, 1], [1, 2]);
        score += _evaluateLine([2, 0], [2, 1], [2, 2]);

        // cols
        score += _evaluateLine([0, 0], [1, 0], [2, 0]);
        score += _evaluateLine([0, 1], [1, 1], [2, 1]);
        score += _evaluateLine([0, 2], [1, 2], [2, 2]);

        // diagonals
        score += _evaluateLine([0, 0], [1, 1], [2, 2]);
        score += _evaluateLine([0, 2], [1, 1], [2, 0]);
      } else {
        // rows
        score += _evaluateLine10s([0, 0], [0, 1], [0, 2]);
        score += _evaluateLine10s([1, 0], [1, 1], [1, 2]);
        score += _evaluateLine10s([2, 0], [2, 1], [2, 2]);

        // cols
        score += _evaluateLine10s([0, 0], [1, 0], [2, 0]);
        score += _evaluateLine10s([0, 1], [1, 1], [2, 1]);
        score += _evaluateLine10s([0, 2], [1, 2], [2, 2]);

        // diagonals
        score += _evaluateLine10s([0, 0], [1, 1], [2, 2]);
        score += _evaluateLine10s([0, 2], [1, 1], [2, 0]);
      }

      return score;
    }

    /**
     * Plain minmax algorithm
     * that uses the evaluation function that returns discrete values
     * of +10 / 10 / 0
     * @param {number} height
     * @param {string} maximizing
     * @returns
     */
    function minmax(height, maximizing) {
      const possibleMoves = _getNextMoves();
      let bestMove = [-1, -1];
      let bestScore =
        maximizing === mySymbol
          ? Number.NEGATIVE_INFINITY
          : Number.POSITIVE_INFINITY;
      let currScore;

      if (height === 0 || possibleMoves.length === 0) {
        bestScore = _evaluate();
      } else {
        for (let [x, y] of possibleMoves) {
          currBoard.place(x, y, maximizing);

          if (maximizing === mySymbol) {
            currScore = minmax(height - 1, oppSymbol).bestScore;
            if (currScore > bestScore) {
              bestScore = currScore;
              bestMove = [x, y];
            }
          } else {
            currScore = minmax(height - 1, mySymbol).bestScore;
            if (currScore < bestScore) {
              bestScore = currScore;
              bestMove = [x, y];
            }
          }
          currBoard.unPlace(x, y, "-");
        }
      }
      return { bestMove, bestScore };
    }

    /**
     * Minmax with Alpha-Beta Pruning
     * @param {Number} height
     * @param {String} maximizing
     * @param {Number} alpha
     * @param {Number} beta
     * @returns
     */
    function minmaxPruned(height, maximizing, alpha, beta) {
      const possibleMoves = _getNextMoves();
      let bestMove = [-1, -1];
      let score;

      if (height === 0 || possibleMoves.length === 0) {
        return { bestMove, bestScore: _evaluate("continuous") };
      }

      for (let [x, y] of possibleMoves) {
        currBoard.place(x, y, maximizing);

        if (maximizing === mySymbol) {
          score = minmaxPruned(height - 1, oppSymbol, alpha, beta).bestScore;
          if (score > alpha) {
            alpha = score;
            bestMove = [x, y];
          }
        } else {
          score = minmaxPruned(height - 1, mySymbol, alpha, beta).bestScore;
          if (score < beta) {
            beta = score;
            bestMove = [x, y];
          }
        }
        currBoard.unPlace(x, y, "-");
        // cut-off
        if (alpha >= beta) break;
      }

      const bestScore = maximizing === mySymbol ? alpha : beta;
      return { bestMove, bestScore };
    }

    function getMove() {
      const pruning = true;

      let result;
      let start;
      let end;
      let msg;

      if (pruning) {
        start = performance.now();
        result = minmaxPruned(
          9,
          mySymbol,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY
        ).bestMove;
        end = performance.now();
        msg = "With Pruning";
      } else {
        start = performance.now();
        result = minmax(9, mySymbol).bestMove;
        end = performance.now();
        msg = "No Pruning";
      }
      // console.log(`${msg} execution time: ${end - start}`);
      return result;
    }

    return Object.assign({}, playerParent, { getMove });
  }

  /**
   * @typedef playerObj
   * @property {String} name
   * @property {string} type
   * @property {string} symbol
   */

  /**
   * Module that manages flow of the game
   * @param {playerObj} playerObj1
   * @param {playerObj} playerObj2
   * @returns
   */
  function gameController(playerObj1, playerObj2) {
    const board = gameBoard(3, 3);
    const gameOver = {
      state: false,
      winner: "none",
      winningRow: [],
    };

    let player1 = {};
    let player2 = {};
    let turn = 0;

    if (playerObj1.type === "Bot") {
      player1 = createBotPlayer(
        playerObj1.name,
        playerObj1.symbol,
        board,
        true
      );
    } else {
      player1 = createPlayer(
        playerObj1.name,
        playerObj1.type,
        playerObj1.symbol,
        true
      );
    }

    if (playerObj2.type === "Bot") {
      player2 = createBotPlayer(
        playerObj2.name,
        playerObj2.symbol,
        board,
        false
      );
    } else {
      player2 = createPlayer(
        playerObj2.name,
        playerObj2.type,
        playerObj2.symbol,
        false
      );
    }

    function _getPrompt() {
      return `${getCurrPlayer().getName()}'S TURN`;
    }

    function _switchCurrPlayer() {
      player1.toggleActiveState();
      player2.toggleActiveState();
    }

    function _nextTurn() {
      turn++;
      _switchCurrPlayer();
      pubSub.emit("showMessage", _getPrompt());
      _playing();
    }

    function _checkGameOver() {
      const threeInRow = board.threeInRow();
      const allFilled = board.getEmptyCells().length === 0;

      if (!(threeInRow.length > 0 || allFilled)) {
        return;
      }

      gameOver.state = true;
      if (threeInRow.length > 0) {
        gameOver.winner = getCurrPlayer();
        gameOver.winningRow = threeInRow;
      } else if (allFilled) {
        gameOver.winner = "none";
      }
    }

    async function _playing() {
      if (!gameOver.state) {
        const currPlayer = getCurrPlayer();
        const type = currPlayer.getType();
        if (type === "Human") {
          pubSub.emit("humansTurn", true);
        } else {
          pubSub.emit("humansTurn", false);
          const [x, y] = currPlayer.getMove(turn);
          await delay(500);
          playTurn(x, y);
        }
      } else {
        pubSub.emit("gameOver");
      }
    }

    function endGame() {
      board.destroy();
      turn = 0;
      player1 = {};
      player2 = {};
    }

    function delay(ms) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("resolved");
        }, ms);
      });
    }

    function getCurrPlayer() {
      if (player1.getActiveState()) {
        return player1;
      } else {
        return player2;
      }
    }

    function getPlayers() {
      return { player1, player2 };
    }

    function getWinner() {
      return gameOver.winner;
    }

    function getWinningRow() {
      return gameOver.winningRow;
    }

    function startGame() {
      board.build();
      gameOver.state = false;
      gameOver.winner = "none";
      gameOver.winningRow = [];
      pubSub.emit("showMessage", _getPrompt());
      _playing();
    }

    /**
     * Add's player's move to the board and checks for winning condition
     * @param {Number} x
     * @param {Number} y
     */
    function playTurn(x, y) {
      const symbol = getCurrPlayer().getSymbol();
      const placed = board.place(x, y, symbol);

      if (placed) {
        pubSub.emit("markCell", [x, y, symbol]);
        _checkGameOver();
        _nextTurn();
      } else {
        pubSub.emit("showMessage", `Invalid move on ${x}, ${y}. Try again.`);
      }
    }

    return {
      start: startGame,
      end: endGame,
      playTurn,
      getCurrPlayer,
      getPlayers,
      getWinner,
      getWinningRow,
      delay,
    };
  }

  function displayController() {
    const players = [
      {
        name: "PLAYER 1",
        type: "Human",
        symbol: "o",
      },
      { name: "PLAYER 2", type: "Bot", symbol: "x" },
    ];

    const images = {
      Human: "./images/human-avatar.svg",
      Bot: "./images/bot-avatar.svg",
      o: "./images/o.svg",
      x: "./images/x.svg",
    };

    const playerTypeBtns = document.querySelectorAll(
      "#start-screen button.player-type"
    );
    const playerSymbolBtns = document.querySelectorAll(
      "#start-screen button.player-symbol"
    );
    const startBtn = document.querySelector("#start-screen button#start");

    let game;
    let isHumansTurn = false;

    pubSub.on("gameOver", () => {
      _endGameScreen().then(() => {
        _removeGameListeners();
        game.end();
      });
    });
    pubSub.on("humansTurn", _setHumansTurn);
    pubSub.on("showMessage", _showStatusMessage);
    pubSub.on("markCell", _markCell);

    /**
     * Toggles isHumansTurn
     * If true, the human can click on a cell to play their turn.
     * If false, clicking on a cell does nothing.
     * @param {Boolean} bool
     */
    function _setHumansTurn(bool) {
      isHumansTurn = bool;
    }

    function _highlightCurrPlayer() {
      const player = game.getCurrPlayer();
      const symbol = player.getSymbol();
      const otherSymbol = symbol === "o" ? "x" : "o";
      const pill = document.querySelector(`.pill[data-symbol="${symbol}"]`);
      const otherPill = document.querySelector(
        `.pill[data-symbol="${otherSymbol}"]`
      );

      pill.classList.remove("faded");
      otherPill.classList.add("faded");
    }

    function _showStatusMessage(msg) {
      const message = document.querySelector(".status .message");
      message.textContent = msg;

      _highlightCurrPlayer();
    }

    function _markCell([x, y, symbol]) {
      const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      const img = document.createElement("img");

      img.src = images[symbol];
      img.alt = symbol === "o" ? "nought" : "cross";
      cell.appendChild(img);
      cell.dataset.symbol = symbol;
    }

    /**
     * Send coordinates of cell clicked to game
     * @param {MouseEvent} event
     */
    function _handleCellClick(event) {
      if (!isHumansTurn) return;
      const cell = event.target;
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      game.playTurn(x, y);
    }

    /**
     * Change type property of the player's object in the array of players
     * and update the DOM element
     * @param {HTMLParagraphElement} textEl
     * @param {HTMLButtonElement} avatarEl
     * @param {Number} idx
     * @param {String} type
     */
    function _changePlayerType(textEl, avatarEl, idx, type) {
      players[idx].type = type;
      textEl.textContent = type.toUpperCase();

      avatarEl.value = type;
      const img = avatarEl.querySelector("img");
      img.src = images[type];
    }

    /**
     * Change symbol property of the player's object in the array of players
     * and update the DOM element
     * @param {HTMLButtonElement} element
     * @param {Number} idx
     * @param {String} symbol
     */
    function _changePlayerSymbol(element, idx, symbol) {
      players[idx].symbol = symbol;
      element.value = symbol;

      const img = element.querySelector("img");
      img.src = images[symbol];

      _changeColor(idx, symbol);
    }

    function _changeColor(idx, symbol) {
      const btns = document.querySelectorAll(
        `button[data-player-idx="${idx}"]`
      );
      btns.forEach((btn) => {
        if (symbol === "o") {
          btn.classList.add("o-color");
        } else {
          btn.classList.remove("o-color");
        }
      });
    }

    /**
     * Toggle between 'Human' and 'Bot' as player's type
     * @param {MouseEvent} event
     */
    function _handleTypeClick(event) {
      const btn = event.target;
      const text = btn.parentElement.lastElementChild;
      const idx = parseInt(btn.dataset.playerIdx);
      const value = btn.value;
      const type = value === "Human" ? "Bot" : "Human";

      _changePlayerType(text, btn, idx, type);
    }

    /**
     * Toggle between 'x' and 'o' as player's symbol and
     * switches the other player's symbol accordingly
     * @param {MouseEvent} event
     */
    function _handleSymbolClick(event) {
      const btn = event.target;
      const idx = parseInt(btn.dataset.playerIdx);
      const otherIdx = idx === 0 ? 1 : 0;
      const otherBtn = document.querySelector(
        `#start-screen button.player-symbol[data-player-idx="${otherIdx}"]`
      );

      const symbol = btn.value;
      const otherSymbol = otherBtn.value;

      _changePlayerSymbol(btn, idx, otherSymbol);
      _changePlayerSymbol(otherBtn, otherIdx, symbol);
    }

    function _handleStartClick() {
      game = gameController(...players);
      _initGameScreen();
      _clearStartScreen();
      game.start();
    }

    function _handleReplayClick() {
      _clearGameScreen();
      initStartScreen();
    }

    function _removeStartListeners() {
      playerTypeBtns.forEach((btn) => {
        btn.removeEventListener("click", _handleSymbolClick);
      });
      playerSymbolBtns.forEach((btn) => {
        btn.removeEventListener("click", _handleSymbolClick);
      });
      startBtn.removeEventListener("click", _handleStartClick);
    }

    function _removeGameListeners() {
      const cells = document.querySelectorAll(".cell");
      cells.forEach((cell) => {
        cell.removeEventListener("click", _handleCellClick);
      });
    }

    function _removeReplayListener() {
      const btn = document.querySelector("#game-screen button#replay");
      btn.removeEventListener("click", _handleReplayClick());
    }

    function _initTypeSelection() {
      playerTypeBtns.forEach((btn) => {
        btn.addEventListener("click", _handleTypeClick);
      });
    }

    function _initSymbolSelection() {
      playerSymbolBtns.forEach((btn) => {
        btn.addEventListener("click", _handleSymbolClick);
      });
    }

    function _buildPlayers() {
      const playersDisp = document.querySelector("#game-screen .players");
      for (let i = 0; i < 2; i++) {
        const pill = document.createElement("div");
        const playerName = document.createElement("div");
        const playerSymbol = document.createElement("img");
        const symbol = players[i].symbol;

        pill.classList.add("pill", `${symbol}-color`);
        pill.dataset.symbol = symbol;
        playerName.classList.add("top", "player-name");
        playerSymbol.classList.add("bottom", "player-symbol");

        playerName.textContent = players[i].name;

        playerSymbol.src = images[symbol];

        pill.append(playerSymbol, playerName);
        playersDisp.appendChild(pill);
      }
    }

    function _buildBoard() {
      const board = document.querySelector("#game-screen .board");

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

    function _highlightWinningRow(cells) {
      for ([x, y] of cells) {
        const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        cell.classList.add("highlight");
      }
    }

    function _initGameScreen() {
      _buildPlayers();
      _buildBoard();

      const replay = document.querySelector("#game-screen button#replay");
      replay.addEventListener("click", _handleReplayClick);
    }

    async function _endGameScreen() {
      const winner = game.getWinner();
      _highlightWinningRow(game.getWinningRow());
      _showStatusMessage("");

      await game.delay(500);

      const gameOverDisp = document.querySelector(
        "#game-screen .board .game-over"
      );
      const avatar = gameOverDisp.querySelector(".avatar");
      const msg = gameOverDisp.querySelector(".message");
      const img1 = document.createElement("img");
      let img2;

      if (winner === "none") {
        img2 = document.createElement("img");
        const { player1, player2 } = game.getPlayers();

        img1.src = images[player1.getType()];
        img1.classList.add(`${player1.getSymbol()}-color`);
        img2.src = images[player2.getType()];
        img2.classList.add(`${player2.getSymbol()}-color`);

        msg.textContent = "IT'S A DRAW";
      } else {
        img1.src = images[winner.getType()];
        img1.classList.add(`${winner.getSymbol()}-color`);

        msg.textContent = `${winner.getName()} WINS!`;
      }

      avatar.appendChild(img1);
      if (img2) avatar.appendChild(img2);
      gameOverDisp.append(avatar, msg);
      gameOverDisp.style.display = "grid";
    }

    function _clearGameScreen() {
      const gameScreen = document.querySelector("#game-screen");
      const players = gameScreen.querySelector(".players");
      const cells = gameScreen.querySelectorAll(".board .cell");
      const messages = gameScreen.querySelectorAll(".message");
      const gameOver = gameScreen.querySelector(".board .game-over");
      const avatar = gameOver.querySelector(".avatar");

      players.replaceChildren();
      cells.forEach((cell) => cell.remove());
      messages.forEach((msg) => (msg.textContent = ""));
      avatar.replaceChildren();
      gameOver.style.display = "none";
    }

    function initStartScreen() {
      const screen = document.getElementById("start-screen");
      screen.style.display = "block";
      screen.classList.remove("fade-out");
      _initTypeSelection();
      _initSymbolSelection();
      startBtn.addEventListener("click", _handleStartClick);
    }

    function _clearStartScreen() {
      const screen = document.getElementById("start-screen");
      screen.classList.add("fade-out");
      setTimeout(() => {
        const playerTypesAvatar = document.querySelectorAll(
          "#start-screen button.player-type.avatar"
        );
        const playerTypesText = document.querySelectorAll(
          "#start-screen p.player-type.text"
        );
        const playerSymbols = document.querySelectorAll(
          "#start-screen button.player-symbol"
        );

        for (let i = 0; i < playerTypesText.length; i++) {
          const newType = i === 0 ? "Human" : "Bot";
          _changePlayerType(
            playerTypesText[i],
            playerTypesAvatar[i],
            i,
            newType
          );
          console.log("change player type");
        }

        for (let j = 0; j < playerSymbols.length; j++) {
          const newSymbol = j === 0 ? "o" : "x";
          _changePlayerSymbol(playerSymbols[j], j, newSymbol);
          console.log("change player symbol");
        }
        screen.style.display = "none";
      }, 500);
      _removeStartListeners();
    }

    return {
      init: initStartScreen,
    };
  }

  const display = displayController();
  display.init();
})();
