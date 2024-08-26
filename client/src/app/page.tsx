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
      <div className="font-sans text-center p-4">
        <h2 className="text-xl mb-4">Winner: {winner}</h2>
        <button onClick={joinGame} className="bg-green-500 text-white p-2">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans text-center p-4">
      {player &&
        <h2 className="text-xl mb-4">Player: {player}</h2>}
      {boardState.length > 0 && (
        <div
          className="grid grid-cols-5 gap-1 mx-auto mb-4"
          style={{ maxWidth: "260px" }}
        >
          {Array.from({ length: 25 }).map((_, index) => {
            let x = Math.floor(index / 5);
            let y = index % 5;
            if (player == "B") {
              x = 4 - x;
              y = 4 - y;
            }
            const piece = boardState[x] && boardState[x][y];
            return (
              <div
                key={index}
                onClick={() => getPieceMoves(x, y)}
                className={`w-12 h-12 bg-gray-200 border border-gray-300 
                flex items-center justify-center cursor-pointer ${getBgColor(x, y)
                  }`}
                style={{
                  border: selectedPiece.x === x && selectedPiece.y === y
                    ? "2px solid red"
                    : "1px solid #ccc",
                }}
              >
                {piece ? `${piece.player}${piece.type}` : ""}
              </div>
            );
          })}
        </div>
      )}
      <MovesList
        moves={moves}
        validMoves={validMoves}
        onMoveClick={handleMove}
      />
      {player === "" &&
        (
          <button onClick={joinGame} className="bg-green-500 text-white p-2">
            Join Game
          </button>
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
    <div>
      {moves && moves.length > 0
        ? (
          <div className="text-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {moves.map((move, index) => (
                <button
                  disabled={!isValidMove(move)}
                  key={index}
                  onClick={() => onMoveClick(move)}
                  className={`py-2 px-4 w-16 ${!isValidMove(move)
                      ? "bg-gray-900"
                      : "bg-gray-800 hover:bg-gray-600"
                    } text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75`}
                >
                  {move}
                </button>
              ))}
            </div>
          </div>
        )
        : <></>}
    </div>
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

export default ChessGame;
