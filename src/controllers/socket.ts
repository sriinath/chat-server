import {
    UserList,
    UserChatType
} from "../typings";
import io = require('socket.io')

const chatController = require('./chat')

// sigle handler for bindng all the events
const socketChatEvents = (userData: UserList, socketIO: io.Server, socket: io.Socket, userName: string) => {
    // when user adds a new chat
    socket.on('new_chat', ({ recipientUserName }) => newChat(socket, userData, recipientUserName))
    socket.on('message', (data) => newMessage(socketIO, socket, userData, data, userName))
    // when user enters the chat with another user or in group 
    socket.on('enter_chat', ({ chatId }) => {
        socket.join(`${chatId}`)
    })
}

// get current users chat list 
const getChatList = (socketIO:io.Server, socket: io.Socket, userName: string) => {
    if(userName) {
        chatController.getUserChatList(userName)
        .then((data: [UserList]) => {
            if(data.length > 0) {
                console.log('chat events are bound')
                socketChatEvents(data[0], socketIO, socket, userName)
                socket.join(userName)
            }
            else {
                console.log('chat events are skipped')
            }
        })
        .catch((err: Error) => {
            console.log('error logged')
            console.log(err)
        })
    }
}

// when user opens a chat of a particular user
const newChat = (socket: io.Socket, userData: UserList, recipientUserName: string) => {
    const checkRecipient = userData && userData.chats && userData.chats.length > 0 ? userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : []
    if(checkRecipient.length) {
        // socket.join(recipientUserName)
        const chatId = checkRecipient[0].chatId
        chatController.getUserChats(chatId)
        .then((data: any) => {
            socket.emit('new_chat', data)
        })
        .catch((err: Error) => {
            console.log('error logged')
            console.log(err)
        })
    }
    else {
        socket.emit('new_chat', 'No previous record of chat')
    }
}

// when a new message is received
const newMessage = (SocketIO: io.Server, socket: io.Socket, userData: UserList, data: UserChatType, userName: string) => {
    const { recipientUserName } = data
    if(recipientUserName == userName) {
        socket.emit('new_chat', 'cannot send message to self at present')
        console.log('cannot send message to self at present')
        return
    }
    const checkRecipient = userData && userData.chats && userData.chats.length > 0 ? userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : []
    if(checkRecipient.length) {
        const chatId = checkRecipient[0].chatId
        data.chatId = chatId
        addUserMessage(SocketIO, data, userName)
    }
    else {
        const identifier = Math.floor((Math.random() * 100000) + 1)
        const chatId = identifier.toString()
        chatController.addRecipient(userName, { recipientUserName, chatId })
        .then((result: any) => {
            if(result === 'true') {
                // socket.join(recipientUserName)
                data.chatId = chatId
                addUserMessage(SocketIO, data, userName)
            }
            socket.emit('new_chat', result)
        })
        .catch((err: Error) => {
            console.log(err)
        })
    }
}

// this will be called from new message method
// add a users messsage to the db
const addUserMessage = (socketIO: io.Server, data: UserChatType, userName: string) => {
    const { message, recipientUserName } = data
    chatController.addUserChat(data)
    .then((data: any) => {
        if(data && data.code && data.code == 'ECONNREFUSED') {
            console.log('Database cannot be connected')
        }
        else {
            socketIO.sockets.in(recipientUserName).emit('new_message', {message: message, username: userName})
        }
    })
    .catch((err: Error) => {
        console.log('error logged')
        console.log(err)
    })
}

export { getChatList }