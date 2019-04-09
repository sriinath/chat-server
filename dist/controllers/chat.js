"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("../models/chat");
class ChatControllerObject {
    // get all the user chat list / friends list for a user
    getUserChatList(userName) {
        if (userName) {
            return chat_1.ChatModel.getUserChatList(userName);
        }
        return Promise.resolve('UserName is mandatory');
    }
    // get all the chats f that user in a particular group / with a particular person
    getUserChats(chatId) {
        if (chatId) {
            return chat_1.ChatModel.getUserChats(chatId);
        }
        return Promise.resolve('ChatId is mandatory');
    }
    checkUserAvailability(userName) {
        if (userName) {
            return chat_1.ChatModel.checkUserAvailability(null, userName);
        }
        return Promise.resolve('User Name is mandatory');
    }
    addRecipient(userName, { recipientUserName, chatId }) {
        if (userName && recipientUserName && chatId) {
            return chat_1.ChatModel.addRecipient(userName, { recipientUserName, chatId });
        }
        else {
            return Promise.resolve('userName & recipientUserName & chatId are mandatory');
        }
    }
    // add a user chat after adding user as friend
    addUserChat(chatData) {
        const { chatId } = chatData;
        if (chatId) {
            return chat_1.ChatModel.addUserChat(chatData);
        }
        return Promise.resolve('ChatId is mandatory');
    }
    addFavouritesChat({ userName, recipientUserName, isFavorites }) {
        if (userName && recipientUserName && isFavorites) {
            return chat_1.ChatModel.addFavouritesChat({ userName, recipientUserName, isFavorites });
        }
        else {
            return Promise.resolve('username, recipient username and isfavorites is mandatory');
        }
    }
}
const ChatController = new ChatControllerObject();
exports.ChatController = ChatController;
// module.exports = new chatController()
//# sourceMappingURL=chat.js.map