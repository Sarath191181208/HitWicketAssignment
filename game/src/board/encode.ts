import { Move, PieceType, PlayerType } from "./board";
import {
  CHARACTER_FORMAT_ERROR,
  MOVE_COMMAND_FORMAT_ERROR,
  MOVE_FORMAT_ERROR,
  PLAYER_FORMAT_ERROR,
} from "./errors";

interface ParsedMove {
  player: PlayerType;
  piece: PieceType;
  move: Move;
}

export function parseMove(encodedMove: string): ParsedMove | { error: string } {
  // The encoded move is of format "A-P2:F"
  const regex = /^(A|B)-(P1|P2|P3|H1|H2):(L|R|F|B|FL|FR|BL|BR)$/;

  // Match the input string against the regular expression
  const match = encodedMove.match(regex);

  if (!match) {
    return {
      error: MOVE_FORMAT_ERROR,
    };
  }

  // get the matched groups
  const [, player, piece, move] = match;

  // Validate the player identifier
  if (!/^[A-Z]$/.test(player)) {
    return {
      error: PLAYER_FORMAT_ERROR,
    };
  }

  // Validate the character name
  if (!/^P[1-3]$|^H1$|^H2$/.test(piece)) {
    return { error: CHARACTER_FORMAT_ERROR };
  }

  // Validate the move command
  const validMoves = ["L", "R", "F", "B", "FL", "FR", "BL", "BR"];
  if (!validMoves.includes(move)) {
    return {
      error: MOVE_COMMAND_FORMAT_ERROR,
    };
  }

  return {
    player: player as PlayerType,
    piece: piece as PieceType,
    move: move as Move,
  };
}
