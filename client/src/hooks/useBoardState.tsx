import { useEffect, useState } from "react";

import { getMoves, getPath, inBounds } from "game/src";
import { Move, Piece, PlayerType } from "game/src/board/board";
import { socket } from "@/app/socket";

interface HistoryItem {
  move: string;
  removedPieces: Piece[];
}

export function useBoardState() {
  const [winner, setWinner] = useState<PlayerType | null>(null);
  const [boardState, setBoardState] = useState([]);
  const [player, setPlayer] = useState("");
  const [_, setErrors] = useState<string[]>([]);

  const [selectedPiece, setSelectedPiece] = useState({ x: -1, y: -1 });
  const [highlightedSquares, setHighlightedSquares] = useState<
    { x: number; y: number }[]
  >([]);

  const [moves, setMoves] = useState<Move[]>([]);
  const [validMoves, setValidMoves] = useState<Move[]>([]);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    socket.connect();
    socket.on("gameState", (data) => {
      console.log("gameState", data);
      setWinner(data.isPlayerWinner);
      setBoardState(data.board);
    });

    socket.on("error", (message) => {
      setErrors((prev) => [...prev, message]);
      alert(message);
      console.error(message);
    });

    socket.on("player", (message) => {
      setPlayer(message);
    });

    socket.on("gameHistory", (data) => {
      setHistory(data);
    });

    return () => {
      socket.off("gameState");
      socket.off("error");
      socket.off("player");
      socket.off("gameHistory");
    };
  }, []);

  const handleMove = (move: Move) => {
    const piece: Piece = boardState[selectedPiece.x][selectedPiece.y];
    const encodedMove = `${player}-${piece.type}:${move}`;
    socket.emit("move", encodedMove);
    setHighlightedSquares([]);
    setMoves([]);
    setValidMoves([]);
    setSelectedPiece({ x: -1, y: -1 });
  };

  const joinGame = () => {
    socket.emit("join-game");
  };

  const getPieceMoves = (x: number, y: number) => {
    const piece: Piece = boardState[x] && boardState[x][y];
    if (!piece) {
      return;
    }

    if (piece.player !== player) {
      setMoves([]);
      return;
    }

    const resMoves: Move[] = getMoves(piece.type);

    type SingleMovePath = [number, number][];
    type CordinateDict = { [key: string]: SingleMovePath };
    let pathDict: CordinateDict = resMoves.reduce(
      (dict, key) => {
        dict[key] = getPath(player, piece.type, y, x, key);
        return dict;
      },
      {} as CordinateDict,
    );
    // filter out invalid moves
    let validMoves: Move[] = resMoves.filter((nextMove) => {
      const path = pathDict[nextMove];
      return isPathValid(player, path, boardState);
    });

    // set highlighted squares
    let highlightedSquares: { x: number; y: number }[] = validMoves.flatMap(
      (key) => pathDict[key].map(([y, x]) => ({ x, y }))
    );

    // set updated state
    setSelectedPiece({ x, y });
    setHighlightedSquares(highlightedSquares);
    setValidMoves(validMoves);
    setMoves(resMoves);
  };

  return {
    player,
    winner,
    selectedPiece,
    highlightedSquares,
    boardState,
    moves,
    validMoves,
    history,
    handleMove,
    joinGame,
    getPieceMoves,
  };
}

function isPathValid(
  player: PlayerType,
  path: [number, number][],
  boardState: Piece[][],
): boolean {
  for (let j = 0; j < path.length; j++) {
    const [x, y] = path[j];
    if (!inBounds(x, y)) {
      return false;
    }

    const _otherPiece: Piece = boardState[y][x];
    if (_otherPiece && _otherPiece.player === player) {
      return false;
    }
  }
  return true;
}
