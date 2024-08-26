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
    return (x + y) % 2 === 0 ? "bg-gray-900" : "bg-gray-950";
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
    <div className="p-4 flex flex-wrap justify-center items-center pt-12">
      <div className="w-full grid place-items-center max-w-md">
        {player && PlayerText}
        {boardState.length > 0 && (
          <div className="max-w-lg flex justify-center items-center w-full ">
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
          <div className="flex flex-wrap gap-2 max-w-lg justify-center mb-5">
            <MovesList
              moves={moves}
              validMoves={validMoves}
              onMoveClick={handleMove}
            />
          </div>
        )}
      </div>

      <HistoryTable history={history} />
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
          className={`py-2 px-4 w-16 ${!isValidMove(move) ? "bg-gray-950/30" : "bg-gray-800 hover:bg-gray-600"
            } text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75`}
        >
          {move}
        </button>
      ))}
    </>
  );
};

function HistoryTable({ history }: { history: HistoryItem[] }) {
  return (
    <div className="ml-12 border border-gray-900/60 rounded-lg p-8 max-w-lg w-full overflow-y-scroll max-h-[500px]">
      <h2 className="text-2xl mb-4 font-bold">History Table</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-900/20 text-gray-700">
            <th className="px-4 py-3 text-left font-medium">S.No</th>
            <th className="px-4 py-3 text-left font-medium">Move</th>
            <th className="px-4 py-3 text-left font-medium">Captured</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr
              key={index}
              className={`${(index % 2 == 1) ? "bg-gray-900/30" : ""}`}
            >
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3">{item.move}</td>
              <td className="px-4 py-3 text-sm text-red-900">
                {item.removedPieces.map((p) => p.player + "-" + p.type).join(
                  ", ",
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
                : "",
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
    <div
      className={`max-w-12 max-h-12 p-5 flex items-center justify-center rounded-full ${playerColor} ${pieceStyle} shadow-lg`}
    >
      <span className="text-md font-bold">
        {piece.type}
      </span>
    </div>
  );
}

export default ChessGame;
