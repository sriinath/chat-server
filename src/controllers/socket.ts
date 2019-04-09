import {
    UserList,
    UserChatType,
    ChatType
} from "../typings";
import io = require('socket.io')

import { ChatController } from './chat'
const uuidv1 = require('uuid/v1')
class SocketController {
    private static socketIO: io.Server
    private socket: io.Socket
    private userName: string = 'Anonymous'
    private groupName: any = []
    private userData: UserList = {
        userName: this.userName
    }
    constructor(socketIO:io.Server, socket: io.Socket, userName: string) {
        SocketController.socketIO = socketIO
        this.socket = socket
        this.userName = userName
    }
    socketChatEvents = () => {
        // when user adds a new chat
        this.socket.on('new_chat', ({ recipientUserName }) => this.newChat(recipientUserName))
        this.socket.on('message', (data) => this.newMessage(data))
        this.socket.on('addFavorites', (recipientUserName, isFavorites) => this.addUserAsFavorites(recipientUserName, isFavorites))
        this.socket.on('userDataUpdate', (data) => this.updateUserData(data))
        // when user enters the chat with another user or in group 
        this.socket.on('enter_chat', ({ chatId }) => {
            this.socket.join(`${chatId}`)
        })
        this.socket.on('username', () => {
            console.log("Joined " +  this.userName);
            SocketController.socketIO.emit('is_online', '<i>' +  this.userName + ' join the chat..</i>');
        });
    
        this.socket.on('disconnect', () => {
            console.log("Left chat " + this.userName);
            SocketController.socketIO.emit('is_online', '<i>' + this.userName + ' left the chat..</i>');
        })
    
        this.socket.on('chat_message', (message) =>{
            console.log(this.userName + " message sent " + message );
            SocketController.socketIO.emit('chat_message', '<strong>' + this.userName + '</strong>: ' + message);
        });
		this.socket.on('create', (room) =>{
            if(this.groupName.indexOf(room) > -1) {
                console.log('GroupExists!!!', room + ' Group is taken! Try some other Group name.');
             } else {
                this.groupName.push(room);
                console.log(this.userName + " Created Group "+this.groupName); //groupname, groupOwner - who created group? - db store
                SocketController.socketIO.emit('add_grp', room);
             }
        });
        this.socket.on('send_invite', (addGrpMember) =>{
            SocketController.socketIO.sockets.in(addGrpMember).emit('got_invite', addGrpMember, this.groupName);
        })
        this.socket.on('add_user_to_grp', (recipientUserName, addGrpMember, groupName) => this.addUserToGrp(recipientUserName, addGrpMember, groupName))
    }
    updateUserData = (data: ChatType) => {
        if(!this.userData.chats) {
            this.userData.chats = [data]
        }
        else {
            this.userData.chats.push(data)
        }
    }
    // get current users chat list 
    getChatList = () => {
        console.log(' in get chat list')
        if(this.userName) {
            ChatController.getUserChatList(this.userName)
            .then((data: [UserList]) => {
                if(data.length > 0) {
                    console.log('chat events are bound')
                    this.userData = data[0]
                    this.socketChatEvents()
                    this.socket.join(this.userName)
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
    newChat = (recipientUserName: string) => {
        const checkRecipient = this.userData && this.userData.chats && this.userData.chats.length > 0 ? this.userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : []
        if(checkRecipient.length) {
            // socket.join(recipientUserName)
            const chatId = checkRecipient[0].chatId
            ChatController.getUserChats(chatId)
            .then((data: any) => {
                this.socket.emit('new_chat', data)
            })
            .catch((err: Error) => {
                console.log('error logged')
                console.log(err)
            })
        }
        else {
            this.socket.emit('new_chat', 'No previous record of chat')
        }
    }
    
    // when a new message is received
    newMessage = (data: UserChatType) => {
        const { recipientUserName } = data
        // if(recipientUserName == this.userName) {
        //     this.socket.emit('new_chat', 'cannot send message to self at present')
        //     console.log('cannot send message to self at present')
        //     return
        // }
        console.log(this.userData)
        const checkRecipient = this.userData && this.userData.chats && this.userData.chats.length > 0 ? this.userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : []
        if(checkRecipient.length) {
            const chatId = checkRecipient[0].chatId
            data.chatId = chatId
            this.addUserMessage(data)
        }
        else {
            console.log('in new message acc creation')
            // const identifier = Math.floor((Math.random() * 100000) + 1)
            const identifier = uuidv1()
            const chatId = identifier.toString()
            ChatController.addRecipient(this.userName, { recipientUserName, chatId })
            .then((result: any) => {
                if(result === 'true') {
                    // socket.join(recipientUserName)
                    data.chatId = chatId
                    this.updateUserData({ recipientUserName, chatId })
                    SocketController.socketIO.sockets.in(recipientUserName).emit('userDataUpdate', chatId)
                    console.log('user data updated')
                    this.addUserMessage(data)
                }
                this.socket.emit('new_chat', result)
            })
            .catch((err: Error) => {
                console.log(err)
            })
        }
    }
    
    // this will be called from new message method
    // add a users messsage to the db
    addUserMessage = (data: UserChatType) => {
        const { message, recipientUserName } = data
        ChatController.addUserChat(data)
        .then((data: any) => {
            if(data && data.code && data.code == 'ECONNREFUSED') {
                console.log('Database cannot be connected')
            }
            else {
                if(recipientUserName == this.userName) {
                    this.socket.emit('new_message', { message: message, username: this.userName })
                }
                else {
                    SocketController.socketIO.sockets.in(recipientUserName).emit('new_message', {message: message, username: this.userName})
                }
            }
        })
        .catch((err: Error) => {
            console.log('error logged')
            console.log(err)
        })
    }
    
    addUserAsFavorites = (recipientUserName: string, isFavorites: string) => {
        if(this.userName && recipientUserName && isFavorites) {
            ChatController.addFavouritesChat({ userName: this.userName, recipientUserName, isFavorites })
            .then((data: any) => {
                console.log(data)
            })
            .catch((err: Error) => {
                console.log('error logged')
                console.log(err)
            })    
        }
    }
    
    addUserToGrp = (recipientUserName: string, addGrpMember: string, groupName: string) => {
        if(addGrpMember && groupName) {
            ChatController.addGrpMemberChats({ recipientUserName, addGrpMember, groupName})
            .then((data: any) => {
                console.log(data)
            })
            .catch((err: Error) => {
                console.log('error logged')
                console.log(err)
            })    
        }
    }
}

export { SocketController }