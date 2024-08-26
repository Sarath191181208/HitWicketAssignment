import {
  NO_PIECE_FOUND,
  OUT_OF_BOUNDS,
  WRONG_MOVE_PIECE_ERROR,
} from "./errors";

export type PieceType = "P1" | "P2" | "H1" | "H2" | "P3";
export type Move = "L" | "R" | "F" | "B" | "FL" | "FR" | "BL" | "BR";
export type PlayerType = "A" | "B";

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < 5 && y >= 0 && y < 5;
}

export function getMoves(piece: PieceType): Move[] {
  if (piece === "P1" || piece === "P2" || piece === "P3" || piece === "H1") {
    return ["L", "R", "F", "B"];
  } else if (piece === "H2") {
    return ["FL", "FR", "BL", "BR"];
  }
  throw new Error(NO_PIECE_FOUND);
}

export function getPath(
  currentPlayer: PlayerType,
  piece: PieceType,
  x: number,
  y: number,
  move: Move,
): [number, number][] {
  // A and B are reversed because the board is flipped
  const diff = currentPlayer === "A" ? 1 : -1;
  switch (move) {
    case "L":
      if (piece === "P1" || piece === "P2" || piece === "P3") {
        return [[x - diff, y]];
      } else if (piece === "H1") {
        return [[x - diff, y], [x - 2 * diff, y]];
      }
    case "R":
      if (piece === "P1" || piece === "P2" || piece === "P3") {
        return [[x + diff, y]];
      } else if (piece === "H1") {
        return [[x + diff, y], [x + 2 * diff, y]];
      }
    case "F":
      if (piece === "P1" || piece === "P2" || piece === "P3") {
        return [[x, y - diff]];
      } else if (piece === "H1") {
        return [[x, y - diff], [x, y - 2 * diff]];
      }
    case "B":
      if (piece === "P1" || piece === "P2" || piece === "P3") {
        return [[x, y + diff]];
      } else if (piece === "H1") {
        return [[x, y + diff], [x, y + 2 * diff]];
      }
    case "FL":
      return [[x, y - diff], [x - diff, y - diff]];
    case "FR":
      return [[x, y - diff], [x + diff, y - diff]];
    case "BL":
      return [[x, y + diff], [x - diff, y + diff]];
    case "BR":
      return [[x, y + diff], [x + diff, y + diff]];
  }
}

export interface Piece {
  player: PlayerType;
  type: PieceType;
}

export class Board {
  private board: (Piece | null)[][] = Array.from(
    { length: 5 },
    () => Array(5).fill(null),
  );
  private currentPlayer: ("A" | "B") | null = null;

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getBoard() {
    return this.board;
  }

  movePiece(
    player: PlayerType,
    piece: PieceType,
    move: Move,
  ): { error: string } | { sucess: { removedPieces: Piece[] } } {
    const piecePos = this.getPiece(player, piece);

    // check if piece exists
    if (!piecePos) {
      return { "error": NO_PIECE_FOUND };
    }

    // check out of bounds
    const [x, y] = [piecePos.x, piecePos.y];

    const path = this.getPath(x, y, move, piece);
    const [newX, newY] = path[path.length - 1];

    if (!inBounds(newX, newY)) {
      return { "error": OUT_OF_BOUNDS };
    }

    // go through the path and find any friednly pieces
    for (const [x, y] of path) {
      // get the piece at the current position
      const otherPiece = this.board[y][x];

      // if the other piece is the player's piece, return invalid move
      if (otherPiece && otherPiece.player === player) {
        return { "error": WRONG_MOVE_PIECE_ERROR };
      }
    }

    const removedPieces: Piece[] = [];
    // go through the path and remove any enemy pieces
    for (const [x, y] of path) {
      // get the piece at the current position
      const otherPiece = this.board[y][x];

      // if there is a piece and it's not the player's piece, remove it
      if (otherPiece && otherPiece.player !== player) {
        removedPieces.push(otherPiece);
        this.board[y][x] = null;
      }
    }

    // move the piece
    const temp = this.board[y][x];
    this.board[y][x] = null;
    this.board[newY][newX] = temp;

    // switch player
    this.switchPlayer();

    // return removed pieces
    return { "sucess": { removedPieces } };
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "A" ? "B" : "A";
  }

  getPath(
    x: number,
    y: number,
    move: Move,
    piece: PieceType,
  ): [number, number][] {
    if (this.currentPlayer == null) {
      return [];
    }
    return getPath(this.currentPlayer, piece, x, y, move);
  }

  getPiece(
    player: PlayerType,
    piece: PieceType,
  ): { x: number; y: number } | void {
    const res = this.board.flatMap((row, y) => row.map((p, x) => ({ p, x, y })))
      .find(({ p }) => p?.player === player && p?.type === piece);
    if (!res) {
      return;
    }
    return { x: res.x, y: res.y };
  }

  isPlayerWinner(): PlayerType | void {
    const isAPieces = this.board.flatMap((row) =>
      row.filter((p) => p?.player === "A")
    );
    const isBPieces = this.board.flatMap((row) =>
      row.filter((p) => p?.player === "B")
    );

    if (isAPieces.length === 0) {
      return "B";
    } else if (isBPieces.length === 0) {
      return "A";
    }
  }

  resetBoard() {
    this.currentPlayer = "A";
    const ARow: (Piece | null)[] = [
      { player: "A", type: "P1" },
      { player: "A", type: "P2" },
      { player: "A", type: "H1" },
      { player: "A", type: "H2" },
      { player: "A", type: "P3" },
    ];
    const BRow: (Piece | null)[] = [
      { player: "B", type: "P1" },
      { player: "B", type: "P2" },
      { player: "B", type: "H1" },
      { player: "B", type: "H2" },
      { player: "B", type: "P3" },
    ];
    this.board = [
      BRow,
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      ARow,
    ];
  }
}
