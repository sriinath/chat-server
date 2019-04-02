"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require('../dbUtils');
const chatModel = {
    getUserChatList(userName) {
        const toFind = { userName };
        return utils.getData('UserList', toFind);
    },
    getUserChats(chatId) {
        const toFind = { chatId };
        return utils.getData('UserChats', toFind);
    },
    addUserChat({ chatId, sender, message, date, time }) {
        const chatData = {
            sender,
            message,
            date,
            time
        };
        const toFind = { chatId };
        const toUpdate = { $push: { "chats": chatData } };
        if (chatId) {
            const updateData = (collection) => {
                return collection.findOneAndUpdate(toFind, toUpdate)
                    .then(data => {
                    if (data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                        console.log(data);
                        return data;
                    }
                    return 'There is no record for chatId provided ';
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            };
            return utils.connectDBCollection('UserChats', updateData);
        }
        return Promise.resolve('Chat Id is mandatory');
    }
};
module.exports = chatModel;
//# sourceMappingURL=chat.js.map