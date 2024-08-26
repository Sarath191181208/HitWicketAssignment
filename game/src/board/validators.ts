import { getMoves, Move, PieceType } from "./board";
import { WRONG_MOVE_PIECE_ERROR } from "./errors";

export function validateMove(piece: PieceType, move: Move) : {error: string} | void {
  // get the moves of the piece
  const allMoves = getMoves(piece);

  // Check if the move is valid for the character
  if (!allMoves.includes(move)) {
    return {
      error: WRONG_MOVE_PIECE_ERROR,
    };
  }
}
