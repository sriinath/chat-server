"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("../models/chat");
const chatController = {
    // get all the user chat list / friends list for a user
    getUserChatList(userName) {
        if (userName) {
            return chat_1.chatModel.getUserChatList(userName);
        }
        return 'UserName is mandatory';
    },
    // get all the chats f that user in a particular group / with a particular person
    getUserChats(chatId) {
        if (chatId) {
            return chat_1.chatModel.getUserChats(chatId);
        }
        return 'ChatId is mandatory';
    },
    addRecipient(userName, { recipientUserName, chatId }) {
        if (userName && recipientUserName && chatId) {
            return chat_1.chatModel.addRecipient(userName, { recipientUserName, chatId });
        }
        else {
            return 'userName & recipientUserName & chatId are mandatory';
        }
    },
    // add a user chat after adding user as friend
    addUserChat(chatData) {
        const { chatId } = chatData;
        if (chatId) {
            return chat_1.chatModel.addUserChat(chatData);
        }
        return 'ChatId is mandatory';
    }
};
exports.chatController = chatController;
module.exports = chatController;
//# sourceMappingURL=chat.js.map