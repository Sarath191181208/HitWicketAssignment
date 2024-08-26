import { createServer } from "node:http";
import express from "express";
import * as socketio from "socket.io";
import { Game } from "./game";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const io = new socketio.Server(server, {
  cors: {
    origin: "*",
  },
});

const game = new Game();

const log = (message: string) => {
  console.log(message);
};

const SOCKET_URIS = {
  joinGame: "join-game",
  error: "error",
  player: "player",
  gameState: "gameState",
  waiting: "waiting",
  status: "status",
  move: "move",
  disconnected: "disconnect",
  gameHistory: "gameHistory"
};

io.on("connection", (socket) => {
  log(`User connected: ${socket.id}`);

  // End point to joing the game
  socket.on(SOCKET_URIS.joinGame, () => {
    joinGame(socket, io);
  });

  // End point to move the piece
  socket.on(SOCKET_URIS.move, (data) => {
    performMove(socket, io, data);
  });

  // on disconnect refresh the game state
  socket.on(SOCKET_URIS.disconnected, () => {
    log(`User disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
    io.emit(SOCKET_URIS.gameState, game.getGameState());
  });
});

function joinGame(socket: socketio.Socket, io: socketio.Server) {
  if (game.playersReady()) {
    socket.emit(SOCKET_URIS.error, "Game is full");
  }
  const player = game.addPlayer(socket.id);
  socket.emit(SOCKET_URIS.player, player);
  if (game.playersReady()) {
    log("Game is ready to start");
    game.startGame();
    io.emit(SOCKET_URIS.gameState, game.getGameState());
  } else {
    log("Waiting for other player to join");
    socket.emit(SOCKET_URIS.waiting, "Waiting for other player to join");
  }
}

function performMove(socket: socketio.Socket, io: socketio.Server, data: any) {
  log(`Player ${socket.id} moved: ${data}`);
  // check if the game is ready
  if (!game.playersReady()) {
    socket.emit(SOCKET_URIS.error, "Game is not ready");
    return;
  }

  // move the character
  let result = game.moveCharacter(socket.id, data);

  // if there is an error, send it to the player
  if (result && "error" in result) {
    socket.emit(SOCKET_URIS.error, result.error);
  }

  console.log(  game.getGameState() )

  // send the updated game state to all players
  io.emit(SOCKET_URIS.gameState, game.getGameState());
  io.emit(SOCKET_URIS.gameHistory, game.getGameHistory());
}

// return index.html on /
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
