"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io");
const socket_1 = require("./controllers/socket");
const redull = require('redull');
// server instance is sent after starting the server
module.exports = (server) => {
    const socketIO = io(server);
    socketIO.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        let userName = redull.getVal(socket, 'handshake.query.userName') || 'Anonymous';
        console.log(`new user connected ${userName}`);
        socket.on('get_chat_list', () => new socket_1.SocketController(socketIO, socket, userName).getChatList());
    }));
};
//# sourceMappingURL=socket.js.map