"use strict";

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
    return `<div class="board__cell empty" ${
      row === 1 || row === 8
        ? `data-letter="${this.boardLetters[cell - 1]}"`
        : ""
    }></div>`;
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
  constructor(color, type, position) {
    this.color = color;
    this.type = type;
    this.position = position;
  }

  initialRenderFigure() {
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
            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/${pieces[currCell].type}-${color}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure); 
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
            currentCell.style.background = `${originalBackgroundColor} 
           url("./images/figures/${color}/Pawn-${color}.svg") no-repeat center / cover`;
            currentCell.classList.add(classFigure); 
            currentCell.classList.add(`pawn-${color.toLowerCase()}`);
            currentCell.style.cursor = "pointer";
          }
        }
      }
    }
  }
}

class King extends Figure {}

const rows = 8;
const cols = 8;
const chessBoard = new Board(rows, cols);
const figure = new Figure();
chessBoard.initialRenderChessBoard();
figure.initialRenderFigure();
