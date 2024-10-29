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
const colorLightGlobal = "light";
const colorAlternateGlobal = "alternate";

// Colors of figure
const colorWhite = "white";
const colorBlack = "black";

// Additional global constants
const boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
const pawnDataIsFirstMove = "data-is-first-move";

// Custom method to capitalize string
String.prototype.toCapitalize = function () {
  if (this.length === 0) return "";
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

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
      { type: figureRook.toCapitalize(), position: 0 },
      { type: figureKnight.toCapitalize(), position: 1 },
      { type: figureBishop.toCapitalize(), position: 2 },
      { type: figureQueen.toCapitalize(), position: 3 },
      { type: figureKing.toCapitalize(), position: 4 },
      { type: figureBishop.toCapitalize(), position: 5 },
      { type: figureKnight.toCapitalize(), position: 6 },
      { type: figureRook.toCapitalize(), position: 7 },
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
           url("./images/figures/${color}/${
              pieces[currCell].type
            }-${color.toCapitalize()}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure);
            currentCell.classList.add(classCurrentFigure);
            currentCell.classList.add(color);
            currentCell.classList.add(
              `${pieces[
                currCell
              ].type.toLowerCase()}-${color.toLowerCase()}`
            );
            currentCell.style.cursor = "pointer";
          }

          // Pawns - add class, styles and bg image
          else if (currRow === 1 || currRow === 3) {
            const color = currRow === 1 ? colorBlack : colorWhite;
            const classCurrentFigure = figurePawn;
            const dataIsFirstMove = "yes";

            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/Pawn-${color.toCapitalize()}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure);
            currentCell.classList.add(classCurrentFigure);
            currentCell.classList.add(color);
            currentCell.classList.add(
              `${figurePawn}-${color.toLowerCase()}`
            );
            currentCell.style.cursor = "pointer";

            currentCell.setAttribute(pawnDataIsFirstMove, dataIsFirstMove);
          }
        }
      }
    }
  }
}

class UI {
  constructor() {
    this.previousCell = null;
    this.previousValidMoves = []; // Array to remove green circles of valid moves
    this.selectedCells = []; // Array of selected and moved figures cells
  }

  // This function !!!highlights and removes!!! highlighted cells
  highlightSelectedCell(e) {
    const selectedCell = e.target;

    // If it's cell with figure highlight it and save previousCell
    if (
      selectedCell.classList.contains(classBoardCell) &&
      selectedCell.classList.contains(classFigure)
    ) {
      selectedCell.classList.add(classSelected);

      // Add selected cell to array
      if (
        selectedCell.id !==
        this.selectedCells[this.selectedCells.length - 1]
      ) {
        this.selectedCells.push(selectedCell.id);
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

  getValidMoves(e, highlightAttackMoves = false) {
    // Check if it's cell with figure return
    if (!e.target.classList.contains(classFigure)) {
      return;
    }

    // !!!DON'T CHANGE ORDER OF CLASSES!!!
    const figureInfo = e.target.classList;
    const figureType = figureInfo[2];
    const figureColor =
      figureInfo[3] === colorWhite ? colorWhite : colorBlack;
    const figurePosition = e.target.id;
    let pawnIsFirstMove =
      e.target.getAttribute(pawnDataIsFirstMove) === "yes";

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
      : piece.calculateValidMoves();
  }

  renderMoves(e, highlightAttackMoves = false) {
    // If we have already rendered valid moves (green circles) go to function
    // that have logic to move figure
    if (e.target.classList.contains(classValidMove) ||
        e.target.classList.contains(classUnderAttack)) {
      return this.makeValidMove(
        e,
        this.selectedCells[this.selectedCells.length - 1]
      );
    }

    // If it's cell with figure highlight it
    this.highlightSelectedCell(e);

    // Remove highlight (green circles) if click on empty cell
    if (!e.target.classList.contains(classFigure)) {
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
      this.highlightValidMoves(commonMoves, true);
    }
    if (attackMoves) {
      this.highlightValidMoves(attackMoves, false);
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
            const gElement = cell.querySelectorAll('g')[1];
            console.log(gElement);
            console.log('cell', cell)
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
    let initialCell = document.getElementById(initialPosition);
    let finalCell = document.getElementById(positionToMove);

    const isPawn = initialCell.classList.contains(figurePawn);
    if (isPawn) {
      finalCell.dataset.isFirstMove = "no";
    }

    // Remove highlighted cells
    this.removeHighlightedCells();

    // Save initial cell color
    initialCell.classList.remove(classSelected);
    const initialCellColor = initialCell.style.backgroundColor;

    // Copy all classes and styles to final cell
    finalCell.classList = initialCell.classList;
    const excludeStyle = "background-color";

    // Copy all styles from initial cell to final cell
    for (let style of initialCell.style) {
      if (style !== excludeStyle) {
        finalCell.style[style] = initialCell.style[style];
      }
    }

    // Reset all styles of initial cell
    initialCell.removeAttribute("style");

    // Remove classes and restore cell color for initial cell
    initialCell.style.backgroundColor = initialCellColor;
    initialCell.classList = initialCell.classList[0];
    initialCell.classList.add(classEmpty);

    // Delete pawn-data-attributes from initial cell
    Object.keys(initialCell.dataset).forEach((key) => {
      if (key === "isFirstMove") {
        delete initialCell.dataset[key];
      }
    });
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
      const nextMove =
        currPosition[0] + (parseInt(currPosition[1]) + direction);

      if (
        document.getElementById(nextMove)?.classList?.contains(classEmpty)
      ) {
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
    const reverseColor =
      this.color === colorWhite ? colorBlack : colorWhite;
    const directions = {
      right: [direction, 1], // bottom or up depends of the color
      left: [direction, -1], // bottom or up depends of the color
    };

    function getValidCellsToAttack(startRow, startCol) {
      // function to get valid moves by direction
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        // index of col to move
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        // cell to move, ex. a5
        const finalCell = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );

        if (
          finalCell?.classList?.contains(reverseColor) &&
          !finalCell?.classList?.contains(figureKing)
        ) {
          validCellsToAttack.push(
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
          );
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
}

class Rook extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    // row = number from board
    const initialRow = this.position[1];
    // col = letter from board
    const initialCol = this.position[0];
    const validMoves = [];

    function getValidMovesByRow(startRow, startCol) {
      // function to get valid moves by direction in row
      function getValidMovesInDirection(direction) {
        let nextRow = parseInt(startRow);
        let nextValidMove = null;

        while (true) {
          nextRow += direction;
          nextValidMove = `${startCol}${nextRow}`;

          const cellInBrowser = document.getElementById(nextValidMove);

          if (cellInBrowser?.classList?.contains(classEmpty)) {
            validMoves.push(nextValidMove);
          } else {
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

          if (cellInBrowser?.classList?.contains(classEmpty)) {
            validMoves.push(nextValidMove);
          } else {
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
    const validCellsToAttack = [];

    return validCellsToAttack;
  }
}

class Knight extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
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

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        const finalCell = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );

        if (finalCell?.classList?.contains(classEmpty)) {
          validMoves.push(
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
          );
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
    const validCellsToAttack = [];

    return validCellsToAttack;
  }
}

class Bishop extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    const initialRow = this.position[1];
    const initialCol = this.position[0];
    const validMoves = [];
    const directions = {
      topRight: [1, 1],
      topLeft: [1, -1],
      bottomRight: [-1, 1],
      bottomLeft: [-1, -1],
    };

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(startRow, startCol, direction) {
        while (true) {
          let finalRow = parseInt(startRow) + direction[0];
          let finalCol =
            boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
          let finalCell = document.getElementById(
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
          );

          if (finalCell?.classList?.contains(classEmpty)) {
            validMoves.push(
              `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
            );
            startRow = finalRow;
            startCol = boardLetters[finalCol];
          } else {
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
    const validCellsToAttack = [];

    return validCellsToAttack;
  }
}

class Queen extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    const initialRow = this.position[1];
    const initialCol = this.position[0];
    const color = this.color;
    const type = this.type;
    const position = this.position;
    const validMoves = [];

    function getValidMoves(startRow, startCol) {
      const bishopMoves = new Bishop(
        type,
        color,
        position
      ).calculateValidMoves();
      const rookMoves = new Rook(
        type,
        color,
        position
      ).calculateValidMoves();

      validMoves.push(...bishopMoves, ...rookMoves);
    }

    getValidMoves(initialRow, initialCol);

    return validMoves;
  }

  calculateAttackMoves() {
    const validCellsToAttack = [];

    return validCellsToAttack;
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

    function getValidMoves(startRow, startCol) {
      function getValidMoveByDirection(direction) {
        const finalRow = parseInt(startRow) + direction[0];
        const finalCol =
          boardLetters.indexOf(startCol.toUpperCase()) + direction[1];
        const finalCell = document.getElementById(
          `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
        );

        if (finalCell?.classList?.contains(classEmpty)) {
          validMoves.push(
            `${boardLetters[finalCol]}${finalRow}`.toLowerCase()
          );
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
    const validCellsToAttack = [];

    return validCellsToAttack;
  }
}

function main() {
  const chessBoard = new Board(ROWS, COLS); // Class for chess board
  const figure = new Figure(); // Common class for every type of figure
  const ui = new UI(); // Class to highlight and render valid moves

  chessBoard.initialRenderChessBoard(); // Show in browser initial chess board
  figure.initialRenderFigures(); // Show in browser initial position of every figure on chess board

  // Add event listener to every cell of chess board
  // ui.renderValidMoves() this method processes all logic
  BOARD.addEventListener("click", (e) => ui.renderValidMoves()(e));

  return 0;
}

main();
