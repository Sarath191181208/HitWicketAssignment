import { useEffect, useState } from "react";

import { getMoves, getPath, inBounds } from "game/src";
import { Move, Piece, PlayerType } from "game/src/board/board";
import { socket } from "@/app/socket";


interface HistoryItem {
  move: string;
  removedPieces: Piece[];
}

export function useBoardState(){
  const [winner, setWinner] = useState<PlayerType | null>(null);
  const [boardState, setBoardState] = useState([]);
  const [player, setPlayer] = useState("");
  //const [log, setLog] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

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
      //setLog((prev) => `${prev}<div>Error: ${message}</div>`);
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

    //socket.on("moveLog", (message) => {
    //  setLog((prev) => `${prev}<div>${message}</div>`);
    //});

    return () => {
      socket.off("gameState");
      socket.off("error");
      socket.off("player");
      //socket.off("moveLog");
    };
  }, []);

  const handleMove = (move: Move) => {
    const piece = boardState[selectedPiece.x][selectedPiece.y];
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
    const piece = boardState[x] && boardState[x][y];
    if (!piece) {
      return;
    }

    if (piece.player !== player) {
      setMoves([]);
      return;
    }

    setSelectedPiece({ x, y });
    const resMoves: Move[] = getMoves(piece.type);

    // move to path dict
    //let pathDict:{string: [number, number]}= {};
    let pathDict: { [key: string]: [number, number][] } = {};
    for (let i = 0; i < resMoves.length; i++) {
      const key = resMoves[i];
      pathDict[key] = getPath(player, piece.type, y, x, key);
    }

    // filter out invalid moves
    let validMoves: Move[] = [];
    for (let i = 0; i < resMoves.length; i++) {
      const key = resMoves[i];
      const path = pathDict[key];
      let isValid = true;
      // check if path is valid and if no piece is blocking
      for (let j = 0; j < path.length; j++) {
        const [x, y] = path[j];
        if (!inBounds(x, y)) {
          isValid = false;
          break;
        }

        if (!piece.type != "H2") {
          const _otherPiece = boardState[y][x];
          if (_otherPiece && _otherPiece.player === player) {
            isValid = false;
            break;
          }
        }
      }
      if (isValid) {
        validMoves.push(key);
      }
    }

    // set highlighted squares
    let highlightedSquares: { x: number; y: number }[] = [];
    for (let i = 0; i < validMoves.length; i++) {
      const key = validMoves[i];
      const path = pathDict[key];
      path.forEach((pos) => {
        highlightedSquares.push({ x: pos[1], y: pos[0] });
      });
    }

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
  }
}
