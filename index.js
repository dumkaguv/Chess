"use strict";

class Board {
  constructor(rows, cols) {
    this.board = document.getElementById("chessBoard");
    this.boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    this.rows = rows;
    this.cols = cols;

    this.sheets = document.styleSheets;
    this.root = document.documentElement;
    this.computedStyle = getComputedStyle(this.root);
  }

  colorOneCell(row) {
    const isFirstCellLight = row.dataset.startColor === "light";
    const cells = row.querySelectorAll(".board__cell");
    const colorLight = this.computedStyle
      .getPropertyValue("--color-light")
      .trim();
    const colorAlternate = this.computedStyle
      .getPropertyValue("--color-alternate")
      .trim();

    const firstColor = isFirstCellLight ? colorLight : colorAlternate;
    const secondColor = isFirstCellLight ? colorAlternate : colorLight;

    cells.forEach((cell, i) => {
      cell.style.backgroundColor = i % 2 === 0 ? firstColor : secondColor;
    });
  }

  colorEveryCell(currRow) {
    currRow = document.querySelectorAll(".board__row:last-of-type");
    currRow.forEach((currCell) => {
      this.colorOneCell(currCell);
    });
  }

  getRowTemplate(row) {
    return `<div class="board__row" data-start-color=${
      row % 2 === 1 ? "light" : "alternate"
    } data-digit="${this.rows - row + 1}"></div>`;
  }

  getCellTemplate(row, cell) {
    return `<div class="board__cell" ${
      row === 1 || row === 8
        ? `data-letter="${this.boardLetters[cell - 1]}"`
        : ""
    }></div>`;
  }

  renderChessBoard() {
    for (let row = 1; row <= this.rows; ++row) {
      this.board.insertAdjacentHTML("beforeend", this.getRowTemplate(row));
      const lastRow = this.board.lastElementChild;
      for (let col = 1; col <= this.cols; ++col) {
        lastRow.insertAdjacentHTML(
          "beforeend",
          this.getCellTemplate(row, col)
        );
      }
      this.colorEveryCell(lastRow);
    }
  }
}

const rows = 8;
const cols = 8;
const chessBoard = new Board(rows, cols);
chessBoard.renderChessBoard();
