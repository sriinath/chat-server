"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("./chat");
class SocketController {
    constructor(socketIO, socket, userName) {
        this.userName = 'Anonymous';
        this.userData = {
            userName: this.userName
        };
        this.socketChatEvents = () => {
            // when user adds a new chat
            this.socket.on('new_chat', ({ recipientUserName }) => this.newChat(recipientUserName));
            this.socket.on('message', (data) => this.newMessage(data));
            this.socket.on('addFavorites', (recipientUserName, isFavorites) => this.addUserAsFavorites(recipientUserName, isFavorites));
            this.socket.on('userDataUpdate', (data) => this.updateUserData(data));
            // when user enters the chat with another user or in group 
            this.socket.on('enter_chat', ({ chatId }) => {
                this.socket.join(`${chatId}`);
            });
        };
        this.updateUserData = (data) => {
            if (!this.userData.chats) {
                this.userData.chats = [data];
            }
            else {
                this.userData.chats.push(data);
            }
        };
        // get current users chat list 
        this.getChatList = () => {
            if (this.userName) {
                chat_1.ChatController.getUserChatList(this.userName)
                    .then((data) => {
                    if (data.length > 0) {
                        console.log('chat events are bound');
                        this.socketChatEvents();
                        this.socket.join(this.userName);
                    }
                    else {
                        console.log('chat events are skipped');
                    }
                })
                    .catch((err) => {
                    console.log('error logged');
                    console.log(err);
                });
            }
        };
        // when user opens a chat of a particular user
        this.newChat = (recipientUserName) => {
            const checkRecipient = this.userData && this.userData.chats && this.userData.chats.length > 0 ? this.userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : [];
            if (checkRecipient.length) {
                // socket.join(recipientUserName)
                const chatId = checkRecipient[0].chatId;
                chat_1.ChatController.getUserChats(chatId)
                    .then((data) => {
                    this.socket.emit('new_chat', data);
                })
                    .catch((err) => {
                    console.log('error logged');
                    console.log(err);
                });
            }
            else {
                this.socket.emit('new_chat', 'No previous record of chat');
            }
        };
        // when a new message is received
        this.newMessage = (data) => {
            const { recipientUserName } = data;
            if (recipientUserName == this.userName) {
                this.socket.emit('new_chat', 'cannot send message to self at present');
                console.log('cannot send message to self at present');
                return;
            }
            const checkRecipient = this.userData && this.userData.chats && this.userData.chats.length > 0 ? this.userData.chats.filter(chat => chat.recipientUserName === recipientUserName) : [];
            if (checkRecipient.length) {
                const chatId = checkRecipient[0].chatId;
                data.chatId = chatId;
                this.addUserMessage(data);
            }
            else {
                console.log('in new message acc creation');
                const identifier = Math.floor((Math.random() * 100000) + 1);
                const chatId = identifier.toString();
                chat_1.ChatController.addRecipient(this.userName, { recipientUserName, chatId })
                    .then((result) => {
                    if (result === 'true') {
                        // socket.join(recipientUserName)
                        data.chatId = chatId;
                        this.updateUserData({ recipientUserName, chatId });
                        SocketController.socketIO.sockets.in(recipientUserName).emit('userDataUpdate', chatId);
                        console.log('user data updated');
                        this.addUserMessage(data);
                    }
                    this.socket.emit('new_chat', result);
                })
                    .catch((err) => {
                    console.log(err);
                });
            }
        };
        // this will be called from new message method
        // add a users messsage to the db
        this.addUserMessage = (data) => {
            const { message, recipientUserName } = data;
            chat_1.ChatController.addUserChat(data)
                .then((data) => {
                if (data && data.code && data.code == 'ECONNREFUSED') {
                    console.log('Database cannot be connected');
                }
                else {
                    SocketController.socketIO.sockets.in(recipientUserName).emit('new_message', { message: message, username: this.userName });
                }
            })
                .catch((err) => {
                console.log('error logged');
                console.log(err);
            });
        };
        this.addUserAsFavorites = (recipientUserName, isFavorites) => {
            if (this.userName && recipientUserName && isFavorites) {
                chat_1.ChatController.addFavouritesChat({ userName: this.userName, recipientUserName, isFavorites })
                    .then((data) => {
                    console.log(data);
                })
                    .catch((err) => {
                    console.log('error logged');
                    console.log(err);
                });
            }
        };
        SocketController.socketIO = socketIO;
        this.socket = socket;
        this.userName = userName;
    }
}
exports.SocketController = SocketController;
//# sourceMappingURL=socket.js.map