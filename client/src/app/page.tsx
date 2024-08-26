"use client";

import React from "react";
import { Move, Piece } from "game/src/board/board";
import { useBoardState } from "@/hooks/useBoardState";

interface HistoryItem {
  move: string;
  removedPieces: Piece[];
}

const ChessGame = () => {
  const {
    player,
    winner,
    moves,
    validMoves,
    handleMove,
    boardState,
    selectedPiece,
    highlightedSquares,
    history,
    joinGame,
    getPieceMoves,
  } = useBoardState();

  const getBgColor = (x: number, y: number) => {
    if (highlightedSquares.some((pos) => pos.x === x && pos.y === y)) {
      return "bg-red-900";
    }
    return (x + y) % 2 === 0 ? "bg-gray-500" : "bg-gray-400";
  };

  if (winner) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl mb-4">Winner: {winner}</h2>
        <button onClick={joinGame} className="bg-green-500 text-white p-2">
          Play Again
        </button>
      </div>
    );
  }

  if (player === "") {
    return (
      <div className="text-center p-4 min-h-48 flex items-center justify-center">
        <button onClick={joinGame} className="bg-green-500 text-white p-2">
          Join Game
        </button>
      </div>
    );
  }

  const PlayerText = <h2 className="text-xl mb-4">Player: {player}</h2>;

  return (
    <div className="p-4 grid place-items-center">
      {player && PlayerText}
      {boardState.length > 0 && (
        <div className="max-w-lg flex  justify-center items-center w-full ">
        <BoardView
          player={player}
          maxWidth={"400px"}
          boardState={boardState}
          selectedPiece={selectedPiece}
          getPieceMoves={getPieceMoves}
          getBgColor={getBgColor}
        />
        </div>
      )}
      {(moves && moves.length > 0) && (
        <div className="flex flex-wrap gap-2 max-w-lg justify-center">
          <MovesList
            moves={moves}
            validMoves={validMoves}
            onMoveClick={handleMove}
          />
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl mb-4">History</h2>
          <HistoryList history={history} />
        </div>
      )}
    </div>
  );
};

interface MovesListProps {
  moves: Move[];
  validMoves: Move[];
  onMoveClick: (move: Move) => void;
}

const MovesList: React.FC<MovesListProps> = (
  { moves, onMoveClick, validMoves },
) => {
  const isValidMove = (move: Move) => validMoves.includes(move);
  return (
    <>
      {moves.map((move, index) => (
        <button
          disabled={!isValidMove(move)}
          key={index}
          onClick={() => onMoveClick(move)}
          className={`py-2 px-4 w-16 ${!isValidMove(move) ? "bg-gray-900" : "bg-gray-800 hover:bg-gray-600"
            } text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75`}
        >
          {move}
        </button>
      ))}
    </>
  );
};

function HistoryList({ history }: { history: HistoryItem[] }) {
  return (
    <div>
      {history.map((item, index) => (
        <div key={index} className="flex items-center justify-center">
          <div className="flex items-center">
            <div>{item.move}</div>
            {(item.removedPieces.length > 0) && (
              <div className="ml-2 text-red-900">
                Removed: {item.removedPieces.map((p) =>
                  p.player + p.type
                ).join(", ")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface BoardViewProps {
  player: string;
  maxWidth: string;
  boardState: Piece[][];
  selectedPiece: { x: number; y: number };
  getPieceMoves: (x: number, y: number) => void;
  getBgColor: (x: number, y: number) => string;
}

function BoardView(
  { player, maxWidth, boardState, selectedPiece, getPieceMoves, getBgColor }:
    BoardViewProps,
) {
  return (
    <div
      className="grid grid-cols-5 mb-4 w-full max-w-lg"
      style={{ maxWidth: maxWidth }}
    >
      {Array.from({ length: 25 }).map((_, index) => {
        let x = Math.floor(index / 5);
        let y = index % 5;
        if (player == "B") {
          x = 4 - x;
          y = 4 - y;
        }
        const piece: Piece = boardState[x] && boardState[x][y];
        return (
          <div
            key={index}
            onClick={() => getPieceMoves(x, y)}
            className={`bg-gray-200 min-w-12 min-h-12 aspect-square 
                flex items-center justify-center cursor-pointer ${getBgColor(x, y)
              }`}
            style={{
              border: selectedPiece.x === x && selectedPiece.y === y
                ? "2px solid red"
                : "1px solid #ccc",
            }}
          >
            {piece && <PieceView piece={piece} />}
          </div>
        );
      })}
    </div>
  );
}

function PieceView({ piece }: { piece: Piece }) {
  const playerColor = piece.player === "A" ? "bg-white" : "bg-black";
  const pieceStyle = piece.player === "A" ? "text-black" : "text-white";
  
  return (
    <div className={`max-w-12 max-h-12 p-5 flex items-center justify-center rounded-full ${playerColor} ${pieceStyle} shadow-lg`}>
      <span className="text-md font-bold">
        {piece.type}
      </span>
    </div>
  );
}

export default ChessGame;
