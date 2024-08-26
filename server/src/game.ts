import { Board, parseMove, PlayerType, validateMove } from "game/src";
import { Move, Piece} from "game/src/board/board";

type UserId = string;

interface Players {
  A: UserId | null;
  B: UserId | null;
}

interface HistoryItem {
  move: string;
  removedPieces: Piece[];
}

export class Game {
  private players: Players = { A: null, B: null };
  private board: Board = new Board();
  private history: HistoryItem[] = [];

  startGame() {
    this.board.resetBoard();
    this.history = [];
  }

  addPlayer(playerId: UserId): PlayerType | void {
    if (this.players.A === null) {
      this.players.A = playerId;
      return "A";
    } else if (this.players.B === null) {
      this.players.B = playerId;
      return "B";
    }
  }

  playersReady() {
    return this.players.A !== null && this.players.B !== null;
  }

  moveCharacter(
    playerId: UserId,
    encodedMove: string,
  ): { error: string } | void {
    const parsedMove = parseMove(encodedMove);

    if ("error" in parsedMove) {
      return { error: parsedMove.error };
    }

    const { player, piece, move } = parsedMove;

    // check if it's the player's turn
    if (player !== this.board.getCurrentPlayer()) {
      return { error: "Not your turn" };
    }

    // check if the player is valid
    if (playerId !== this.players[player]) {
      return { error: "Invalid player" };
    }

    // check if the piece's move is valid
    let err = validateMove(piece, move);
    if (err && "error" in err) {
      return err;
    }

    const result = this.board.movePiece(player, piece, move);

    if (result && "error" in result) {
      return result;
    }

    const removedPieces = result.sucess.removedPieces;

    this.history.push({
      move: encodedMove, 
      removedPieces
    })
  }

  check() {
    this.board.resetBoard();
    return this.board.getPiece("A", "P1");
  }

  getGameState() {
    return {
      isPlayerWinner: this.board.isPlayerWinner(),
      board: this.board.getBoard(),
      currentPlayer: this.board.getCurrentPlayer(),
    };
  }

  getGameHistory(){
    return this.history;
  }

  removePlayer(playerId: UserId) {
    if (this.players.A === playerId) {
      this.players.A = null;
    } else if (this.players.B === playerId) {
      this.players.B = null;
    }
  }
}
