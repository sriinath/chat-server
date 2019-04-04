import { Server } from "http"
import io = require('socket.io')
import { SocketController } from './controllers/socket'

const redull = require('redull')

// server instance is sent after starting the server
module.exports = (server: Server) => {
    const socketIO = io(server)
    socketIO.on('connection', async socket => {
        let userName = redull.getVal(socket, 'handshake.query.userName') || 'Anonymous'
        console.log(`new user connected ${userName}`)
        socket.on('get_chat_list', () => new SocketController(socketIO, socket, userName).getChatList())
    })
}
