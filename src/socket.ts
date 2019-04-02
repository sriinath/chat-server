import { Server } from "http"
import io = require('socket.io')
import { UserList } from "./typings";
//controller imports
const chatController = require('./controllers/chat')

// server instance is sent after starting the server
module.exports = (server: Server) => {
    const socketIO = io(server)
    socketIO.on('connection', socket => {
        let userName = socket && socket.handshake && socket.handshake.query && socket.handshake.query.userName || 'Anonymous'
        console.log(`new user connected ${userName}`)
        
        // get all the chats of a particular user
        socket.on('get_chat_list', () => {
            if(userName) {
                chatController.getUserChatList(userName)
                .then((data: UserList) => {
                    console.log(data)
                })
                .catch((err: Error) => {
                    console.log('error logged')
                    console.log(err)
                })
            }
        })
    
        // when user adds a new chat
        socket.on('add_chat', ({ chatId }) => {
        })
    
        // when user enters the chat with another user or in group 
        socket.on('enter_chat', ({ chatId }) => {
            socket.join(`${chatId}`)
        })
    
        socket.on('change_username', (data) => {
            console.log("change_username", data)
            userName = data.userName;
        })
    
        socket.on('message', (data) => {
            console.log("message", data)
            const { chatId, message, userName } = data
            if(chatId) {
                chatController.addUserChat(data)
                .then((data: any) => {
                    if(data && data.code && data.code == 'ECONNREFUSED') {
                        console.log('Database cannot be connected')
                    }
                    else {
                        console.log(data)
                        socketIO.sockets.in(chatId).emit('new_message', {message: message, username: userName})
                    }
                })
                .catch((err: Error) => {
                    console.log('error logged')
                    console.log(err)
                })
            }
            //io.to(`${data.id}`).emit('new_message', {message: data.message, username: socket.username});
        })
    })
}
