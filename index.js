"use strict";

// Global constants
const ROWS = 8;
const COLS = 8;
const BOARDID = "chessBoard";
const BOARD = document.getElementById(BOARDID);

// Figures
const figurePawn = "pawn";
const figureRook = "rook";
const figureKnight = "knight";
const figureBishop = "bishop";
const figureQueen = "queen";
const figureKing = "king";

// CSS classes
const classEmpty = "empty";
const classFigure = "figure";
const classBoardCell = "board__cell";
const classBoardRow = "board__row";
const classSelected = "selected";
const classValidMove = "valid-move";
const classUnderAttack = "under-attack";

// CSS colors
const cssColorLight = "--color-light";
const cssColorAlternate = "--color-alternate";
const colorLightGlobal = "light"; // cell color
const colorAlternateGlobal = "alternate"; // cell color

// Colors of figure
const colorWhite = "white";
const colorBlack = "black";

// Additional global constants
const boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
const pawnDataIsFirstMove = "data-is-first-move";
const pawnDataEnPassant = "data-en-passant";

class Board {
  constructor(rows, cols) {
    this.board = document.getElementById(BOARDID);
    this.rows = rows;
    this.cols = cols;

    // Get computed styles to color cells
    this.sheets = document.styleSheets;
    this.root = document.documentElement;
    this.computedStyle = getComputedStyle(this.root);
  }

  colorOneCell(row) {
    // Determine color of the first cell
    const isFirstCellLight = row.dataset.startColor === colorLightGlobal;
    const cells = row.querySelectorAll(`.${classBoardCell}`);
    const colorLight = this.computedStyle
      .getPropertyValue(cssColorLight)
      .trim();
    const colorAlternate = this.computedStyle
      .getPropertyValue(cssColorAlternate)
      .trim();

    // Color cells in row depending on the color of the first cell
    const firstColor = isFirstCellLight ? colorLight : colorAlternate;
    const secondColor = isFirstCellLight ? colorAlternate : colorLight;

    // Color cells
    cells.forEach((cell, i) => {
      cell.style.backgroundColor = i % 2 === 0 ? firstColor : secondColor;
    });
  }

  colorCurrRow(currRow) {
    // Color current (last) row
    currRow = document.querySelectorAll(`.${classBoardRow}:last-of-type`);
    currRow.forEach((row) => {
      this.colorOneCell(row);
    });
  }

  getRowTemplate(row) {
    return `<div class="${classBoardRow}" data-start-color=${
      row % 2 === 1 ? `${colorLightGlobal}` : `${colorAlternateGlobal}`
    } data-digit="${this.rows - row + 1}"></div>`;
  }

  getCellTemplate(row, cell) {
    const currLetter = boardLetters[cell - 1];
    return `<div class="${classBoardCell} ${classEmpty}" ${
      row === 1 || row === 8 ? `data-letter="${currLetter}"` : ""
    } id="${currLetter.toLowerCase()}${this.rows - row + 1}"></div>`;
  }

  // Show in browser chess board
  initialRenderChessBoard() {
    for (let row = 1; row <= this.rows; ++row) {
      this.board.insertAdjacentHTML("beforeend", this.getRowTemplate(row));
      const lastRow = this.board.lastElementChild;
      // Render every cell
      for (let col = 1; col <= this.cols; ++col) {
        lastRow.insertAdjacentHTML(
          "beforeend",
          this.getCellTemplate(row, col)
        );
      }
      // Color last row in browser
      this.colorCurrRow(lastRow);
    }
  }
}

class Figure {
  constructor(type, color, position) {
    this.type = type;
    this.color = color;
    this.position = position;
  }

  initialRenderFigures() {
    const pieces = [
      // position - cell index
      { type: figureRook, position: 0 },
      { type: figureKnight, position: 1 },
      { type: figureBishop, position: 2 },
      { type: figureQueen, position: 3 },
      { type: figureKing, position: 4 },
      { type: figureBishop, position: 5 },
      { type: figureKnight, position: 6 },
      { type: figureRook, position: 7 },
    ];
    const board = [...document.querySelectorAll(`.${classBoardRow}`)];
    const rowsWithFigures = board
      .slice(0, 2)
      .concat(board.slice(-2).reverse());
    const n = rowsWithFigures.length;

    for (let currRow = 0; currRow < n; ++currRow) {
      const cellsWithFigures = rowsWithFigures[currRow].querySelectorAll(
        `.${classBoardCell}`
      );
      for (let currCell = 0; currCell < 8; ++currCell) {
        // Save initial styles of cell
        const currentCell = cellsWithFigures[currCell];
        const computedStyle = getComputedStyle(currentCell);
        const originalBackgroundColor = computedStyle.backgroundColor;
        const dataIsFirstMove = "yes";

        // Render figures depend on their position
        if (pieces) {
          // Remove class empty
          currentCell.classList.remove(classEmpty);

          // Figures from pieces and add class current figure
          if (currRow === 0 || currRow === 2) {
            const color = currRow === 0 ? colorBlack : colorWhite;
            const classCurrentFigure = `${pieces[
              currCell
            ].type.toLowerCase()}`;

            // Add class, styles and bg image for figure
            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/${pieces[currCell].type}-${color}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure);
            currentCell.classList.add(classCurrentFigure);
            currentCell.classList.add(color);
            currentCell.classList.add(
              `${pieces[
                currCell
              ].type.toLowerCase()}-${color.toLowerCase()}`
            );
            currentCell.style.cursor = "pointer";

            currentCell.setAttribute(pawnDataIsFirstMove, dataIsFirstMove);
          }

          // Pawns - add class, styles and bg image
          else if (currRow === 1 || currRow === 3) {
            const color = currRow === 1 ? colorBlack : colorWhite;
            const classCurrentFigure = figurePawn;
            const dataEnPassant = "no";

            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/${figurePawn}-${color}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure);
            currentCell.classList.add(classCurrentFigure);
            currentCell.classList.add(color);
            currentCell.classList.add(
              `${figurePawn}-${color.toLowerCase()}`
            );
            currentCell.style.cursor = "pointer";

            currentCell.setAttribute(pawnDataIsFirstMove, dataIsFirstMove);
            currentCell.setAttribute(pawnDataEnPassant, dataEnPassant);
          }
        }
      }
    }
  }
}

class Game {
  constructor() {
    this.currentTurn = colorWhite; // Starting with white's turn
    this.movesHistory = []; // History about every move ex. w: a2 -> a4
    this.opponentMoves = [];
  }

  switchTurn() {
    // Toggle currentTurn between white and black

    this.currentTurn =
      this.currentTurn === colorWhite ? colorBlack : colorWhite;
  }

  calculateEveryOpponentMove() {
    this.opponentMoves = [];

    // Calculate every opponent's move
    for (let row = 1; row <= ROWS; ++row) {
      for (let col = 1; col <= COLS; ++col) {
        const targetCell = document.getElementById(
          `${boardLetters[col - 1].toLowerCase()}${row}`
        );
        const opponentColor =
          this.currentTurn === colorWhite ? colorBlack : colorWhite;
        const isEmpty = targetCell.classList.contains(classEmpty);
        const isOpponentPiece =
          targetCell.classList.contains(opponentColor);

        if (!isEmpty && isOpponentPiece) {
          // !!!DON'T CHANGE ORDER OF CLASSES!!!
          const figureInfo = targetCell.classList;
          const figureType = figureInfo[2];
          const figureColor = opponentColor;
          const figurePosition = targetCell.id;
          let pawnIsFirstMove =
            targetCell.getAttribute(pawnDataIsFirstMove) === "yes";

          // Get valid moves for every figure
          let piece = null;
          switch (figureType) {
            case figurePawn:
              piece = new Pawn(
                figureType,
                figureColor,
                figurePosition,
                pawnIsFirstMove
              );
              break;
            case figureRook:
              piece = new Rook(figureType, figureColor, figurePosition);
              break;
            case figureKnight:
              piece = new Knight(figureType, figureColor, figurePosition);
              break;
            case figureBishop:
              piece = new Bishop(figureType, figureColor, figurePosition);
              break;
            case figureQueen:
              piece = new Queen(figureType, figureColor, figurePosition);
              break;
            case figureKing:
              piece = new King(figureType, figureColor, figurePosition);
              break;
          }

          this.opponentMoves.push(...piece.calculateAttackMoves());
        }
      }
    }

    return this.opponentMoves;
  }
}

class UI {
  constructor(game) {
    this.previousCell = null;
    this.previousValidMoves = []; // Array to remove green circles of valid moves
    this.selectedCells = []; // Array of selected figure's cell
    this.game = game;
  }

  // This function !!!highlights and removes!!! highlighted cells
  highlightSelectedCell(e) {
    const selectedCell = e.target;
    const coordinates = selectedCell.id;
    const isBoardCell = selectedCell.classList.contains(classBoardCell);
    const isFigure = selectedCell.classList.contains(classFigure);
    const lastIndex = this.selectedCells.length - 1;

    // If it's cell with figure highlight it and save previousCell
    if (isBoardCell && isFigure) {
      selectedCell.classList.add(classSelected);

      // Add selected cell to array
      if (
        coordinates !== this.selectedCells[lastIndex] // If it's not the same cell
      ) {
        this.selectedCells.push(coordinates);
      }

      // Remove classSelected from previous selected cell
      if (this.previousCell && this.previousCell !== selectedCell) {
        this.previousCell.classList.remove(classSelected);
      }

      // Save previous cell
      this.previousCell = selectedCell;
    } else if (selectedCell) {
      // if clicked the same cell remove classSelected
      if (this.previousCell) {
        this.previousCell.classList.remove(classSelected);
      }

      // Save previous cell
      this.previousCell = selectedCell;
    }
  }

  getValidMoves(e, highlightAttackMoves = false, selectedCell = e.target) {
    // !!!DON'T CHANGE ORDER OF CLASSES!!!
    const figureInfo = selectedCell.classList;
    const figureType = figureInfo[2];
    const figureColor =
      figureInfo[3] === colorWhite ? colorWhite : colorBlack;
    const figurePosition = selectedCell.id;
    let pawnIsFirstMove =
      selectedCell.getAttribute(pawnDataIsFirstMove) === "yes";

    // Check if it's cell with figure return
    if (!selectedCell.classList.contains(classFigure)) {
      return;
    }

    const opponentMoves = this.game.calculateEveryOpponentMove();
    const kingPosition = new King().getKingPosition(figureColor);
    console.log(opponentMoves);

    if (opponentMoves.some(move => move === kingPosition)) {
      return console.log('gdfjnklgfdhkljgfdkl;jnhfd');
    }

    // Get valid moves for every figure
    let piece = null;
    switch (figureType) {
      case figurePawn:
        piece = new Pawn(
          figureType,
          figureColor,
          figurePosition,
          pawnIsFirstMove
        );
        break;
      case figureRook:
        piece = new Rook(figureType, figureColor, figurePosition);
        break;
      case figureKnight:
        piece = new Knight(figureType, figureColor, figurePosition);
        break;
      case figureBishop:
        piece = new Bishop(figureType, figureColor, figurePosition);
        break;
      case figureQueen:
        piece = new Queen(figureType, figureColor, figurePosition);
        break;
      case figureKing:
        piece = new King(figureType, figureColor, figurePosition);
        break;
    }

    // highlightAttackMoves optional variable to highlight attack moves or valid moves
    // by default it's both
    return highlightAttackMoves
      ? piece.calculateAttackMoves()
      : piece.calculateValidMoves(false);
  }

  isValidTurn(targetCell) {
    const isCurrentPlayerWhite = this.game.currentTurn === colorWhite;
    const isWhiteCell = targetCell.classList.contains(colorWhite);
    const isBlackCell = targetCell.classList.contains(colorBlack);
    const isUnderAttack = targetCell.classList.contains(classUnderAttack);
    const isValidMove = targetCell.classList.contains(classValidMove);

    // Check for the opponent's piece and its compliance with the current move
    if (
      (isBlackCell && isCurrentPlayerWhite) ||
      (isWhiteCell && !isCurrentPlayerWhite)
    ) {
      // Check if the cell is not under attack and is not a valid move
      if (!isUnderAttack && !isValidMove) {
        return false; // Not your turn
      }
    }
    return true;
  }

  renderMoves(e, highlightAttackMoves = false) {
    const targetCell = e.target;
    const isUnderAttack = targetCell.classList.contains(classUnderAttack);
    const isValidMove = targetCell.classList.contains(classValidMove);
    const lastIndex = this.selectedCells.length - 1;
    const isFigure = targetCell.classList.contains(classFigure);

    // Check who's turn
    if (!this.isValidTurn(targetCell)) {
      return;
    }

    // If we have already rendered valid moves (green circles) go to function
    // that have logic to move figure
    if (isValidMove || isUnderAttack) {
      return this.makeValidMove(e, this.selectedCells[lastIndex]);
    }

    // If it's cell with figure highlight it
    this.highlightSelectedCell(e);

    // Remove highlight (green circles) if click on empty cell
    if (!isFigure) {
      return this.removeHighlightedCells();
    }

    // Get valid and attack moves
    const commonMoves = this.getValidMoves(e, highlightAttackMoves);
    const attackMoves = this.getValidMoves(e, !highlightAttackMoves);

    const moves = [...commonMoves, ...attackMoves];

    // Removing highlighted (green circles) and valid moves
    this.removeHighlightedCells();

    // Highlight (green circles) valid and attack moves
    if (commonMoves) {
      this.highlightValidMoves(commonMoves, true); // isCommonMoves = true (green circles)
    }

    if (attackMoves) {
      this.highlightValidMoves(attackMoves, false); // isCommonMoves = false
    }

    moves.forEach((move) => this.previousValidMoves.push(move));
  }

  renderValidMoves() {
    return (e) => this.renderMoves(e);
  }

  renderValidMovesToAttack() {
    return (e) => this.renderMoves(e, true);
  }

  highlightValidMoves(validMoves, isCommonMoves = true) {
    validMoves.forEach((validMove) => {
      const cell = document.getElementById(validMove);
      if (cell) {
        if (isCommonMoves) {
          cell.classList.add(classValidMove);
        } else {
          cell.classList.add(classUnderAttack);
        }
        cell.style.cursor = "pointer";
      }
    });
  }

  removeHighlightedCells() {
    if (this.previousValidMoves) {
      this.previousValidMoves.forEach((validMove) => {
        const cell = document.getElementById(validMove);
        if (cell) {
          cell?.classList?.remove(classValidMove);
          cell?.classList?.remove(classUnderAttack);
          cell.style.cursor = cell.classList.contains(classFigure)
            ? "pointer"
            : "default";
        }
      });

      this.previousValidMoves = [];
    }
  }

  makeValidMove(e, initialPosition) {
    const positionToMove = e.target.id;
    const pawn = new Pawn(figurePawn, colorWhite, initialPosition); // color doesn't matter
    const direction = initialPosition[1] < positionToMove[1] ? -1 : 1;
    const figureColor = document
      .getElementById(initialPosition)
      .classList.contains(colorWhite)
      ? colorWhite
      : colorBlack;
    const reverseColor =
      figureColor === colorWhite ? colorBlack : colorWhite;
    const prevCell =
      positionToMove[0] + (parseInt(positionToMove[1]) + direction);
    const len = this.game.movesHistory.length;
    let initialCell = [document.getElementById(initialPosition)];
    let finalCell = document.getElementById(positionToMove);
    let isEnPassant = false;
    const isPawn = initialCell[0].classList.contains(figurePawn);

    const leftCell = document.getElementById(
      boardLetters[
        boardLetters?.indexOf(initialPosition[0]?.toUpperCase()) - 1
      ]?.toLowerCase() + initialPosition[1]
    );
    const rightCell = document.getElementById(
      boardLetters[
        boardLetters?.indexOf(initialPosition[0]?.toUpperCase()) + 1
      ]?.toLowerCase() + initialPosition[1]
    );

    if (isPawn) {
      finalCell.dataset.isFirstMove = "no";
      if (pawn.canCaptureEnPassant(initialPosition, positionToMove)) {
        isEnPassant = true;
      }

      // Check en-passant for left and right cells
      if (
        leftCell?.hasAttribute(pawnDataEnPassant) &&
        leftCell.dataset.enPassant !== "expired" &&
        leftCell.dataset.enPassant !== "no" &&
        leftCell?.classList?.contains(reverseColor) &&
        leftCell?.classList?.contains(figurePawn) &&
        document
          .getElementById(positionToMove)
          ?.classList?.contains(classUnderAttack)
      ) {
        initialCell.push(document.getElementById(leftCell.id));
      } else if (
        rightCell?.hasAttribute(pawnDataEnPassant) &&
        rightCell.dataset.enPassant !== "expired" &&
        rightCell.dataset.enPassant !== "no" &&
        rightCell?.classList?.contains(reverseColor) &&
        rightCell?.classList?.contains(figurePawn) &&
        document
          .getElementById(positionToMove)
          ?.classList?.contains(classUnderAttack)
      ) {
        initialCell.push(document.getElementById(rightCell.id));
      }
    }

    // Remove highlighted cells
    this.removeHighlightedCells();

    // Save initial cell color'
    initialCell.forEach((initialCell, i) => {
      initialCell.classList.remove(classSelected);
      const initialCellColor = initialCell.style.backgroundColor;

      if (i === 0) {
        // Copy all classes and styles to final cell
        finalCell.classList = initialCell.classList;
        const excludeStyle = "background-color";

        // Copy all styles from initial cell to final cell
        for (let style of initialCell.style) {
          if (style !== excludeStyle) {
            finalCell.style[style] = initialCell.style[style];
          }
        }
      }

      // Reset all styles of initial cell
      initialCell.removeAttribute("style");

      // Remove classes and restore cell color for initial cell
      initialCell.style.backgroundColor = initialCellColor;
      initialCell.classList = initialCell.classList[0];
      initialCell.classList.add(classEmpty);

      // Delete pawn-data-isFirstMove from initial cell
      // and Add enPassant-data to final cell if so
      Object.keys(initialCell.dataset).forEach((key) => {
        if (key === "enPassant" && isEnPassant) {
          finalCell.dataset.enPassant = prevCell;
        }
        if (key === "isFirstMove" || key === "enPassant") {
          delete initialCell.dataset[key];
        }
      });
    });

    // Switch turn and save move history
    this.game.switchTurn();
    this.game.movesHistory.push(
      `${figureColor[0]}: ${initialPosition} -> ${positionToMove}`
    );

    // Delete enPassant-data from final cell
    if (len + 1 >= 2) {
      const cellInBrowser = document.getElementById(
        this.game.movesHistory[len - 1].slice(-2)
      );
      if (isPawn && cellInBrowser.dataset.enPassant) {
        cellInBrowser.dataset.enPassant = "expired";
      }
    }

    this.renderPawnPromotion(e); // if it's ready for promotion show modal
    this.renderCurrentTurn();
  }

  renderCurrentTurn() {
    const currentTurn = this.game.currentTurn;
    const currentTurnText = document.getElementById("generalInfoText");
    const currentTurnColorImg =
      document.getElementById("generalInfoColor");

    const path = currentTurnColorImg.querySelector("path");

    const isCurrentPlayerWhite = currentTurn === colorWhite;
    const turnWhiteText = "White's turn!";
    const turnBlackText = "Black's turn!";

    const colorWhiteLocal = "#FFF";
    const colorBlackLocal = "#000";

    // Set the text of the current turn
    currentTurnText.textContent = isCurrentPlayerWhite
      ? turnWhiteText
      : turnBlackText;

    // Set the text of the current turn
    path.setAttribute(
      "fill",
      isCurrentPlayerWhite ? colorWhiteLocal : colorBlackLocal
    );
  }

  renderPawnPromotion(e) {
    const currentCell = document.getElementById(e.target.id);
    const color = e.target.classList.contains(colorWhite)
      ? colorWhite
      : colorBlack;
    const pawn = new Pawn(figurePawn, color, e.target.id);

    if (
      pawn.isReadyForPromotion() &&
      e.target.classList.contains(figurePawn)
    ) {
      const rect = currentCell.getBoundingClientRect();
      const promotionModal = document.getElementById("promotionModal");
      const promotionModalImg = promotionModal.querySelectorAll(
        ".promotion-modal-img"
      );

      if (color === colorBlack) {
        promotionModalImg.forEach((img) => {
          img.src = img.src.replace(
            new RegExp(colorWhite, "gi"),
            colorBlack
          );
        });
      }

      promotionModal.style.display = "flex";
      promotionModal.style.position = "fixed";
      promotionModal.style.left = `${Math.max(
        0,
        rect.left +
          window.scrollX +
          rect.width / 2 -
          promotionModal.offsetWidth / 2
      )}px`;
      promotionModal.style.top = `${Math.max(
        0,
        rect.top + window.scrollY - promotionModal.offsetHeight
      )}px`;

      promotionModalImg.forEach((img) => {
        img.addEventListener("click", () => {
          // replace image
          const styleProperty = "backgroundImage";
          const currentCellStyle = currentCell.style[styleProperty];
          const figureToChange = img.classList[1];
          if (styleProperty) {
            currentCell.style[styleProperty] = currentCellStyle.replace(
              new RegExp(figurePawn, "gi"),
              figureToChange
            );
          }

          // change classes
          const classes = Array.from(currentCell.classList);
          const newClass = figureToChange;
          const newClass_2 = `${figureToChange}-${color}`;
          const indexToInsert = 2;
          const indexToInsert_2 = 4;
          classes[indexToInsert] = newClass;
          classes[indexToInsert_2] = newClass_2;

          currentCell.className = classes.join(" ");

          // close modal
          promotionModal.style.display = "none";
        });
      });
    }
  }
}

class Pawn extends Figure {
  constructor(figureType, figureColor, figurePosition, pawnIsFirstMove) {
    super(figureType, figureColor, figurePosition);
    this.pawnIsFirstMove = pawnIsFirstMove;
  }

  calculateValidMoves() {
    const validCellsToMove = [];
    const direction = this.color === colorWhite ? 1 : -1;
    const maxMoves = this.pawnIsFirstMove ? 2 : 1;

    // Recursive function to check if cell is valid
    function getValidCellsToMove(currPosition, maxMoves, direction) {
      if (maxMoves <= 0) return;
      //coordinates to add
      const nextMove =
        currPosition[0] + (parseInt(currPosition[1]) + direction);

      // cell in browser
      const isCellEmpty = document
        .getElementById(nextMove)
        ?.classList?.contains(classEmpty);

      // check for default moves (green circles)
      if (isCellEmpty) {
        validCellsToMove.push(nextMove);
        getValidCellsToMove(nextMove, maxMoves - 1, direction);
      }
    }

    getValidCellsToMove(this.position, maxMoves, direction);
    return validCellsToMove;
  }

  calculateAttackMoves() {
    const validCellsToAttack = [];
    // row = number from board
    const initialRow = parseInt(this.position[1]);
    // col = letter from board
    const initialCol = this.position[0].toLowerCase();
    const direction = this.color === colorWhite ? 1 : -1;
    const directions = {
      rightDiagonal: [direction, 1], // bottom or up depends of the color
      leftDiagonal: [direction, -1], // bottom or up depends of the color
      right: [0, 1], // en passant
      left: [0, -1], // en passant
    };

    const self = this;

    function getValidCellsToAttack(startRow, startCol) {
      // function to get valid moves by direction
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        // index of col to move
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        // cell to move in browser, ex. a5
        const cellInBrowser = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );
        // cell to add as coordinates
        const validCell =
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase();

        const reverseColor =
          self.color === colorWhite ? colorBlack : colorWhite;

        const isOpponentPiece =
          cellInBrowser?.classList?.contains(reverseColor);
        const isKing = cellInBrowser?.classList?.contains(figureKing);
        const isPawn = cellInBrowser?.classList?.contains(figurePawn);
        const isEnPassant =
          cellInBrowser?.dataset?.enPassant !== "expired" &&
          cellInBrowser?.dataset?.enPassant !== "no";

        // check for attack move
        if (isOpponentPiece && !isKing && direction[0] !== 0) {
          validCellsToAttack.push(validCell);
        }
        if (
          isPawn &&
          isEnPassant &&
          isOpponentPiece &&
          direction[0] === 0
        ) {
          validCellsToAttack.push(cellInBrowser.dataset.enPassant);
        }
      }

      // for every direction calculate move
      Object.values(directions).forEach((direction) => {
        getValidMoveByDirection(direction);
      });
    }

    getValidCellsToAttack(initialRow, initialCol);
    return validCellsToAttack;
  }

  canCaptureEnPassant(initialCell, finalCell) {
    const difference = Math.abs(
      Number(finalCell[1]) - Number(initialCell[1])
    );
    return difference === 2 ? true : false;
  }

  isReadyForPromotion() {
    const rowToPromotion = this.color === colorWhite ? "8" : "1";
    const currentRow = this.position[1];

    if (rowToPromotion !== currentRow) {
      return false;
    }

    return true;
  }
}

class Rook extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves(isAttackMoves = true) {
    // row = number from board
    const initialRow = this.position[1];
    // col = letter from board
    const initialCol = this.position[0];
    const validMoves = [];

    const self = this;

    function getValidMovesByRow(startRow, startCol) {
      // function to get valid moves by direction in row
      function getValidMovesInDirection(direction) {
        let nextRow = parseInt(startRow);
        let nextValidMove = null;

        while (true) {
          nextRow += direction;
          // cell coordinates ex. a5
          nextValidMove = `${startCol}${nextRow}`;

          const cellInBrowser = document.getElementById(nextValidMove);
          const reverseColor =
            self.color === colorWhite ? colorBlack : colorWhite;

          const isCellEmpty =
            cellInBrowser?.classList?.contains(classEmpty);
          const isOpponentPiece =
            cellInBrowser?.classList?.contains(reverseColor);
          const isKing = cellInBrowser?.classList?.contains(figureKing);

          // check for default (green circles) moves
          if (isCellEmpty && !isAttackMoves) {
            validMoves.push(nextValidMove);
          } else if (!isAttackMoves) {
            break;
          }

          // check for attack moves
          if ((isCellEmpty || isOpponentPiece) && isAttackMoves) {
            if (isOpponentPiece && !isKing) {
              validMoves.push(nextValidMove);
              break;
            }
            if (isKing) {
              break;
            }
          } else if (!isCellEmpty) {
            break;
          }
        }
      }

      // valid moves by row up and down
      getValidMovesInDirection(1); // up
      getValidMovesInDirection(-1); // down
    }

    function getValidMovesByCol(startRow, startCol) {
      // function to get valid moves by direction in column
      function getValidMovesInDirection(direction) {
        let nextCol = startCol;
        let nextValidMove = null;

        while (true) {
          let initialColIndex = boardLetters.indexOf(
            nextCol.toUpperCase()
          );
          nextCol = boardLetters[initialColIndex + direction];
          nextValidMove = `${nextCol}${startRow}`.toLowerCase();

          const cellInBrowser = document.getElementById(nextValidMove);
          const reverseColor =
            self.color === colorWhite ? colorBlack : colorWhite;

          const isCellEmpty =
            cellInBrowser?.classList?.contains(classEmpty);
          const isOpponentPiece =
            cellInBrowser?.classList?.contains(reverseColor);
          const isKing = cellInBrowser?.classList?.contains(figureKing);

          // check for default moves (green circles)
          if (isCellEmpty && !isAttackMoves) {
            validMoves.push(nextValidMove);
          } else if (!isAttackMoves) {
            break;
          }

          // check for attack moves
          if ((isCellEmpty || isOpponentPiece) && isAttackMoves) {
            if (isOpponentPiece && !isKing) {
              validMoves.push(nextValidMove);
              break;
            }
            if (isKing) {
              break;
            }
          } else if (!isCellEmpty) {
            break;
          }
        }
      }

      // valid moves by column left and right
      getValidMovesInDirection(1); // right
      getValidMovesInDirection(-1); // left
    }

    getValidMovesByRow(initialRow, initialCol);
    getValidMovesByCol(initialRow, initialCol);

    return validMoves;
  }

  calculateAttackMoves() {
    return this.calculateValidMoves(true); // isAttackMoves = true
  }
}

class Knight extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves(isAttackMoves = true) {
    const initialRow = this.position[1];
    const initialCol = this.position[0];
    const validMoves = [];
    const directions = {
      topLeft: [2, -1],
      topRight: [2, 1],
      bottomLeft: [-2, -1],
      bottomRight: [-2, 1],
      leftTop: [-1, 2],
      leftBottom: [-1, -2],
      rightTop: [1, 2],
      rightBottom: [1, -2],
    };

    const self = this;

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        const cellInBrowser = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );

        const reverseColor =
          self.color === colorWhite ? colorBlack : colorWhite;
        const isCellEmpty = cellInBrowser?.classList?.contains(classEmpty);
        const isOpponentPiece =
          cellInBrowser?.classList?.contains(reverseColor);
        const isKing = cellInBrowser?.classList?.contains(figureKing);
        const validMove =
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase();

        // check for default moves (green circles)
        if (!isAttackMoves && isCellEmpty) {
          validMoves.push(validMove);
        } // check for attack moves
        else if (isAttackMoves && isOpponentPiece && !isKing) {
          validMoves.push(validMove);
        }
      }

      Object.values(directions).forEach((direction) => {
        getValidMoveByDirection(direction);
      });
    }

    getValidMoves(initialRow, initialCol);

    return validMoves;
  }

  calculateAttackMoves() {
    return this.calculateValidMoves(true);
  }
}

class Bishop extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves(isAttackMoves = true) {
    const initialRow = this.position[1];
    const initialCol = this.position[0];
    const validMoves = [];
    const directions = {
      topRight: [1, 1],
      topLeft: [1, -1],
      bottomRight: [-1, 1],
      bottomLeft: [-1, -1],
    };

    const self = this;

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(startRow, startCol, direction) {
        while (true) {
          let finalRow = parseInt(startRow) + direction[0];
          let finalCol =
            boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
          let finalCell = document.getElementById(
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
          );
          const finalCoordinates =
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase();
          const reverseColor =
            self.color === colorWhite ? colorBlack : colorWhite;

          const isCellEmpty = finalCell?.classList?.contains(classEmpty);
          const isOpponentPiece =
            finalCell?.classList?.contains(reverseColor);
          const isKing = finalCell?.classList?.contains(figureKing);

          // check for default moves (green circles)
          if (isCellEmpty && !isAttackMoves) {
            validMoves.push(finalCoordinates);
            startRow = finalRow;
            startCol = boardLetters[finalCol];
          } else if (!isAttackMoves) {
            break;
          }

          // check for attack moves
          if ((isCellEmpty || isOpponentPiece) && isAttackMoves) {
            if (isOpponentPiece && !isKing) {
              validMoves.push(finalCoordinates);
              break;
            }
            if (isKing) {
              break;
            }
            startRow = finalRow;
            startCol = boardLetters[finalCol];
          } else if (isAttackMoves) {
            break;
          }
        }
      }

      Object.values(directions).forEach((direction) => {
        getValidMoveByDirection(startRow, startCol, direction);
      });
    }

    getValidMoves(initialRow, initialCol);

    return validMoves;
  }

  calculateAttackMoves() {
    return this.calculateValidMoves(true); // isAttackMoves = true
  }
}

class Queen extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves(isAttackMoves = true) {
    const color = this.color;
    const type = this.type;
    const position = this.position;
    const validMoves = [];

    function getValidMoves() {
      const bishopMoves = new Bishop(
        type,
        color,
        position
      ).calculateValidMoves(isAttackMoves);
      const rookMoves = new Rook(
        type,
        color,
        position
      ).calculateValidMoves(isAttackMoves);

      validMoves.push(...bishopMoves, ...rookMoves);
    }

    getValidMoves();

    return validMoves;
  }

  calculateAttackMoves() {
    return this.calculateValidMoves(true);
  }
}

class King extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    const initialRow = this.position[1];
    const initialCol = this.position[0];
    const validMoves = [];
    const directions = {
      top: [0, 1],
      bottom: [0, -1],
      left: [-1, 0],
      right: [1, 0],
      topRight: [1, 1],
      topLeft: [1, -1],
      bottomRight: [-1, 1],
      bottomLeft: [-1, -1],
    };

    //const self = this;

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        const finalCell = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );
        const validMove =
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase();

        //const reverseColor =
        //self.color === colorWhite ? colorBlack : colorWhite;

        const isCellEmpty = finalCell?.classList?.contains(classEmpty);
        //const isOpponentPiece =
        //finalCell?.classList?.contains(reverseColor);
        //const isKing = finalCell?.classList?.contains(figureKing);

        if (isCellEmpty) {
          validMoves.push(validMove);
        }
      }

      Object.values(directions).forEach((direction) => {
        getValidMoveByDirection(direction);
      });
    }

    getValidMoves(initialRow, initialCol);

    return validMoves;
  }

  getKingPosition(color) {
    for (let row = 1; row <= ROWS; ++row) {
      for (let col = 1; col <= COLS; ++col) {
        const targetCell = document.getElementById(
          `${boardLetters[col - 1].toLowerCase()}${row}`
        );
        const isKing = targetCell?.classList?.contains(figureKing);
        const cellColor = targetCell?.classList?.contains(color)
          ? colorWhite
          : colorBlack;

        if (isKing && color === cellColor) {
          return targetCell.id;
        }
      }
    }
  }

  calculateAttackMoves() {
    return [];
  }

  isCastlingAllowed() {
    return null;
  }
}

function main() {
  const chessBoard = new Board(ROWS, COLS); // Class for chess board
  const figure = new Figure(); // Common class for every type of figure
  const game = new Game();
  const ui = new UI(game); // Class to highlight and render valid moves

  chessBoard.initialRenderChessBoard(); // Show in browser initial chess board
  figure.initialRenderFigures(); // Show in browser initial position of every figure on chess board

  // Add event listener to every cell of chess board
  // ui.renderValidMoves() this method processes all logic
  BOARD.addEventListener("click", (e) => ui.renderValidMoves()(e));

  return 0;
}

main();
