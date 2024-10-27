"use strict";

String.prototype.toCapitalize = function() {
  if (this.length === 0) return '';
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

class Board {
  constructor(rows, cols) {
    this.board = document.getElementById("chessBoard");
    this.boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    this.rows = rows;
    this.cols = cols;

    // Get computed styles
    this.sheets = document.styleSheets;
    this.root = document.documentElement;
    this.computedStyle = getComputedStyle(this.root);
  }

  colorOneCell(row) {
    // Determine color of the first cell
    const isFirstCellLight = row.dataset.startColor === "light";
    const cells = row.querySelectorAll(".board__cell");
    const colorLight = this.computedStyle
      .getPropertyValue("--color-light")
      .trim();
    const colorAlternate = this.computedStyle
      .getPropertyValue("--color-alternate")
      .trim();

    // Color cells in row depending on the color of the first cell
    const firstColor = isFirstCellLight ? colorLight : colorAlternate;
    const secondColor = isFirstCellLight ? colorAlternate : colorLight;

    cells.forEach((cell, i) => {
      cell.style.backgroundColor = i % 2 === 0 ? firstColor : secondColor;
    });
  }

  colorCurrRow(currRow) {
    // Color current (last) row
    currRow = document.querySelectorAll(".board__row:last-of-type");
    currRow.forEach((row) => {
      this.colorOneCell(row);
    });
  }

  getRowTemplate(row) {
    return `<div class="board__row" data-start-color=${
      row % 2 === 1 ? "light" : "alternate"
    } data-digit="${this.rows - row + 1}"></div>`;
  }

  getCellTemplate(row, cell) {
    const currLetter = this.boardLetters[cell - 1];
    return `<div class="board__cell empty" ${
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
      { type: "Rook", position: 0 },
      { type: "Knight", position: 1 },
      { type: "Bishop", position: 2 },
      { type: "Queen", position: 3 },
      { type: "King", position: 4 },
      { type: "Bishop", position: 5 },
      { type: "Knight", position: 6 },
      { type: "Rook", position: 7 },
    ];
    const board = [...document.querySelectorAll(".board__row")];
    const rowsWithFigures = board
      .slice(0, 2)
      .concat(board.slice(-2).reverse());
    const n = rowsWithFigures.length;
    const classEmpty = "empty";
    const classFigure = "figure";

    for (let currRow = 0; currRow < n; ++currRow) {
      const cellsWithFigures =
        rowsWithFigures[currRow].querySelectorAll(".board__cell");
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
            const color = currRow === 0 ? "black" : "white";
            const classCurrentFigure = `${pieces[
              currCell
            ].type.toLowerCase()}`;

            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/${pieces[currCell].type}-${color.toCapitalize()}.svg") no-repeat center / cover`;
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

          // Pawns and add class pawn
          else if (currRow === 1 || currRow === 3) {
            const color = currRow === 1 ? "black" : "white";
            const classCurrentFigure = "pawn";
            const dataIsFirstMove = "yes";

            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/Pawn-${color.toCapitalize()}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure);
            currentCell.classList.add(classCurrentFigure);
            currentCell.classList.add(color);
            currentCell.classList.add(`pawn-${color.toLowerCase()}`);
            currentCell.style.cursor = "pointer";

            currentCell.setAttribute(
              "data-is-first-move",
              dataIsFirstMove
            );
          }
        }
      }
    }
  }
}

class UI {
  constructor() {
    this.previousCell = null; // Store previousCell in the class instance
    this.previousValidMoves = [];
    this.handleCellClick = this.highlightSelectedCell(); // Initialize the event handler
  }

  highlightSelectedCell() {
    return (e) => {
      const selectedCell = e.target;

      if (
        selectedCell.classList.contains("board__cell") &&
        selectedCell.classList.contains("figure")
      ) {
        selectedCell.classList.add("selected");

        if (this.previousCell && this.previousCell !== selectedCell) {
          this.previousCell.classList.remove("selected");
        }

        this.previousCell = selectedCell;
      }
    };
  }

  renderValidMoves() {
    return (e) => {
      const figureInfo = e.target.classList;
      const figureType = figureInfo[2];
      const figureColor = figureInfo[3] === "white" ? "white" : "black";
      const figurePosition = e.target.id;
      let pawnIsFirstMove =
        e.target.getAttribute("data-is-first-move") === "yes";

      let result;

      switch (figureType) {
        case "pawn":
          result = new Pawn(
            figureType,
            figureColor,
            figurePosition,
            pawnIsFirstMove
          ).calculateValidMoves();
          break;
        case "rook":
          result = new Rook(
            figureType,
            figureColor,
            figurePosition
          ).calculateValidMoves();
          break;
        case "knight":
          result = new Knight(
            figureType,
            figureColor,
            figurePosition
          ).calculateValidMoves();
          break;
        case "bishop":
          result = new Bishop(
            figureType,
            figureColor,
            figurePosition
          ).calculateValidMoves();
          break;
        case "queen":
          result = new Queen(
            figureType,
            figureColor,
            figurePosition
          ).calculateValidMoves();
          break;
        case "king":
          result = new King(
            figureType,
            figureColor,
            figurePosition
          ).calculateValidMoves();
          break;
        default:
          console.log("Неизвестный тип фигуры");
      }

      if (result) {
        if (this.previousValidMoves) {
          this.previousValidMoves.forEach((validMove) => {
            const cell = document.getElementById(validMove);
            cell.classList.remove("valid-move");
          });
          this.previousValidMoves = [];
        }

        result.forEach((validMove) => {
          this.previousValidMoves.push(validMove);
        });

        this.highlightValidMoves(result);
      }
    };
  }

  highlightValidMoves(validMoves) {
    validMoves.forEach((validMove) => {
      const cell = document.getElementById(validMove);
      if (cell) {
        cell.classList.add("valid-move");
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
    const direction = this.color === "white" ? 1 : -1;
    const maxMoves = this.pawnIsFirstMove ? 2 : 1;

    // Recursive function to check if cell is valid
    function IsValidCellToMove(currPosition, maxMoves, direction) {
      if (maxMoves <= 0) return;
      const nextMove =
        currPosition[0] + (parseInt(currPosition[1]) + direction);

      if (document.getElementById(nextMove).classList.contains("empty")) {
        validCellsToMove.push(nextMove);
        IsValidCellToMove(nextMove, maxMoves - 1, direction);
      }
    }

    IsValidCellToMove(this.position, maxMoves, direction);
    return validCellsToMove;
  }
}

class Rook extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    console.log(this.type);
  }
}

class Knight extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    console.log(this.type);
  }
}

class Bishop extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    console.log(this.type);
  }
}

class Queen extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    console.log(this.type);
  }
}

class King extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    console.log(this.type);
  }
}

const rows = 8;
const cols = 8;
const chessBoard = new Board(rows, cols);
const figure = new Figure();
const ui = new UI();
chessBoard.initialRenderChessBoard();
figure.initialRenderFigures();

const board = document.getElementById("chessBoard");

board.addEventListener("click", ui.handleCellClick);
board.addEventListener("click", ui.renderValidMoves());
