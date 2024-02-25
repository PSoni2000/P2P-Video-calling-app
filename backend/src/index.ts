import { Socket } from "socket.io";
import http from "http";

const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket: Socket) => {
	console.log("A user Connected");
});

server.listen(3000, () => {
	console.log("Server running at port 3000");
});
