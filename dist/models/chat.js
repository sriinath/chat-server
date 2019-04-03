"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtils_1 = require("../dbUtils");
const chatModel = {
    getUserChatList(userName) {
        const toFind = { userName };
        return dbUtils_1.dbUtils.getData('UserList', toFind);
    },
    getUserChats(chatId) {
        const toFind = { chatId };
        return dbUtils_1.dbUtils.getData('UserChats', toFind);
    },
    addRecipient(userName, { recipientUserName, chatId }) {
        if (userName && recipientUserName && chatId) {
            const recipientInfo = { userName: recipientUserName };
            const toFind = { userName, 'chats.recipientUserName': { $nin: [recipientUserName] } };
            const toUpdate = { $push: { 'chats': { recipientUserName, chatId } } };
            return dbUtils_1.dbUtils.getCollection('UserList')
                .then((collection) => {
                return collection.find(recipientInfo).toArray()
                    .then(data => {
                    console.log('recipient');
                    console.log(data);
                    if (data && data.length > 0) {
                        return collection.findOneAndUpdate(toFind, toUpdate)
                            .then(data => {
                            if (data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                                return data;
                            }
                            return 'The recipient is already added';
                        })
                            .catch(err => {
                            console.log(err);
                            return 'An error occured while fetching collection results';
                        });
                    }
                    return 'Cannot find any record for the recipient user name provided';
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            })
                .catch((err) => {
                console.log(err);
                return 'An error occured while fetching collection';
            });
        }
        return 'userName & recipientUserName & chatId are mandatory';
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
            return dbUtils_1.dbUtils.connectDBCollection('UserChats', updateData);
        }
        return Promise.resolve('Chat Id is mandatory');
    }
};
exports.chatModel = chatModel;
//# sourceMappingURL=chat.js.map