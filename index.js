"use strict";

//const letterMap = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
const boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
String.prototype.toCapitalize = function () {
  if (this.length === 0) return "";
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

class Board {
  constructor(rows, cols) {
    this.board = document.getElementById("chessBoard");
    //this.boardLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
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
    const currLetter = boardLetters[cell - 1];
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
    this.selectedCells = [];
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
        this.selectedCells.push(selectedCell.id);

        if (this.previousCell && this.previousCell !== selectedCell) {
          this.previousCell.classList.remove("selected");
        }

        this.previousCell = selectedCell;
      } else if (selectedCell) {
        if (this.previousCell) {
          this.previousCell.classList.remove("selected");
        }

        this.previousCell = selectedCell;
      }
    };
  }

  renderValidMoves() {
    return (e) => {
      if (e.target.classList.contains("valid-move")) {
        return this.makeValidMove(
          e,
          this.selectedCells[this.selectedCells.length - 1]
        );
      }

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
      }

      this.removeHighlightedCells();

      if (result) {
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
        cell.style.cursor = "pointer";
      }
    });
  }

  removeHighlightedCells() {
    if (this.previousValidMoves) {
      this.previousValidMoves.forEach((validMove) => {
        const cell = document.getElementById(validMove);
        if (cell) {
          cell.classList.remove("valid-move");
          cell.style.cursor = "default";
        }
      });

      this.previousValidMoves = [];
    }
  }

  makeValidMove(e, initialPosition) {
    const positionToMove = e.target.id;
    let initialCell = document.getElementById(initialPosition);
    let finalCell = document.getElementById(positionToMove);

    const isPawn = initialCell.classList.contains("pawn");
    if (isPawn) {
      finalCell.dataset.isFirstMove = "no";
    }

    this.removeHighlightedCells();

    // Save initial cell color
    initialCell.classList.remove("selected");
    const initialCellColor = initialCell.style.backgroundColor;

    // Copy all classes and styles to final cell
    finalCell.classList = initialCell.classList;
    const excludeStyle = "background-color";

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
    initialCell.classList.add("empty");

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
    const direction = this.color === "white" ? 1 : -1;
    const maxMoves = this.pawnIsFirstMove ? 2 : 1;

    // Recursive function to check if cell is valid
    function getValidCellsToMove(currPosition, maxMoves, direction) {
      if (maxMoves <= 0) return;
      const nextMove =
        currPosition[0] + (parseInt(currPosition[1]) + direction);

      if (document.getElementById(nextMove).classList.contains("empty")) {
        validCellsToMove.push(nextMove);
        getValidCellsToMove(nextMove, maxMoves - 1, direction);
      }
    }

    getValidCellsToMove(this.position, maxMoves, direction);
    return validCellsToMove;
  }
}

class Rook extends Figure {
  constructor(figureType, figureColor, figurePosition) {
    super(figureType, figureColor, figurePosition);
  }

  calculateValidMoves() {
    const initialRow = this.position[1];
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

          if (cellInBrowser && cellInBrowser.classList.contains("empty")) {
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

          if (cellInBrowser && cellInBrowser.classList.contains("empty")) {
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

        if (finalCell && finalCell.classList.contains("empty")) {
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

          if (finalCell && finalCell.classList.contains("empty")) {
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

function main() {
  const rows = 8;
  const cols = 8;
  const chessBoard = new Board(rows, cols);
  const figure = new Figure();
  const ui = new UI();
  chessBoard.initialRenderChessBoard();
  figure.initialRenderFigures();

  const board = document.getElementById("chessBoard");

  board.addEventListener("click", ui.handleCellClick);
  board.addEventListener("click", (e) => ui.renderValidMoves()(e));

  return 0;
}

main();
