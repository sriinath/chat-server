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
const dbUtils_1 = require("../dbUtils");
const config = require('../config');
const { ChatListCollection, UserListCollection } = config;
class ChatModelEvents {
    getUserChatList(userName) {
        const toFind = { userName };
        return dbUtils_1.dbUtils.getData(UserListCollection, toFind);
    }
    getUserChats(chatId) {
        const toFind = { chatId };
        return dbUtils_1.dbUtils.getData(ChatListCollection, toFind);
    }
    checkUserAvailability(collection, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            const toFind = { userName };
            const userAvailability = (collection) => {
                return collection.find(toFind).toArray()
                    .then(data => {
                    if (data && data.length > 0) {
                        return 'true';
                    }
                    return 'Cannot find any record for the user name provided';
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            };
            if (collection) {
                return userAvailability(collection);
            }
            else {
                dbUtils_1.dbUtils.getCollection(UserListCollection)
                    .then((collection) => {
                    return userAvailability(collection);
                });
            }
        });
    }
    addRecipient(userName, { recipientUserName, chatId }) {
        if (userName && recipientUserName && chatId) {
            // const recipientInfo = { userName: recipientUserName }
            const toFindSender = { userName, 'chats.recipientUserName': { $nin: [recipientUserName] } };
            const toUpdateSender = { $push: { 'chats': { recipientUserName, chatId } } };
            const toFindRecipient = { userName: recipientUserName, 'chats.recipientUserName': { $nin: [userName] } };
            const toUpdateRecipient = { $push: { 'chats': { recipientUserName: userName, chatId } } };
            const chatInsert = { chatId };
            return Promise.all([
                dbUtils_1.dbUtils.getCollection(UserListCollection),
                dbUtils_1.dbUtils.getCollection(ChatListCollection)
            ])
                .then((collection) => {
                const userListCollection = collection[0];
                const userChatCollection = collection[1];
                return this.checkUserAvailability(userListCollection, recipientUserName)
                    .then((data) => {
                    if (data === 'true') {
                        return Promise.all([
                            userListCollection.findOneAndUpdate(toFindSender, toUpdateSender),
                            userListCollection.findOneAndUpdate(toFindRecipient, toUpdateRecipient),
                            userChatCollection.insertOne(chatInsert)
                        ])
                            .then(data => {
                            if (data && data[0] && data[1] && data[0].lastErrorObject && data[0].lastErrorObject.n > 0 && data[1].lastErrorObject && data[1].lastErrorObject.n > 0) {
                                return 'true';
                            }
                            return 'The recipient is already added';
                        })
                            .catch(err => {
                            console.log(err);
                            return 'An error occured while fetching collection results';
                        });
                    }
                    return data;
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
        return Promise.resolve('userName & recipientUserName & chatId are mandatory');
    }
    addUserChat({ chatId, recipientUserName, message, date }) {
        const chatData = {
            recipientUserName,
            message,
            date
        };
        const toFind = { chatId };
        const toUpdate = { $push: { "chats": chatData } };
        if (chatId) {
            const updateData = (collection) => {
                return collection.findOneAndUpdate(toFind, toUpdate)
                    .then(data => {
                    if (data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                        return data;
                    }
                    return 'There is no record for chatId provided ';
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            };
            return dbUtils_1.dbUtils.connectDBCollection(ChatListCollection, updateData);
        }
        return Promise.resolve('Chat Id is mandatory');
    }
    addFavouritesChat({ userName, recipientUserName, isFavorites }) {
        if (userName && recipientUserName && isFavorites) {
            const toFind = { userName, 'chats.recipientUserName': recipientUserName };
            const toUpdate = { $set: { 'chats.$.starred': isFavorites } };
            const collectionName = UserListCollection;
            if (collectionName) {
                return dbUtils_1.dbUtils.getCollection(collectionName)
                    .then((collection) => {
                    return collection.findOneAndUpdate(toFind, toUpdate)
                        .then(data => {
                        if (data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                            return data;
                        }
                        return 'There is no record for chatId provided ';
                    })
                        .catch(err => {
                        console.log(err);
                        return 'An error occured while fetching favorites chat data results';
                    });
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            }
            else {
                return Promise.resolve('collection name is not valid string');
            }
        }
        return Promise.resolve('User Name and Recipient User Name are mandatory');
    }
    addGrpMemberChats(recipientUserName, userName, groupName) {
        console.log('recipientUserName ' + recipientUserName + ' addGrpMember ' + userName + 'groupName ' + groupName);
        if (recipientUserName && userName && groupName) {
            const chatId = "15468";
            const toFindSender = { userName, 'groups.groupName': { $nin: [recipientUserName] } };
            const toUpdateSender = { $push: { 'groups': { groupName } } };
            const toFindRecipient = { userName: recipientUserName, 'groups.recipientUserName': { $nin: [userName] } };
            const toUpdateRecipient = { $push: { 'groups': { recipientUserName: userName, chatId } } };
            const chatInsert = { chatId };
            console.log("entered models/chats");
            return Promise.all([
                dbUtils_1.dbUtils.getCollection(UserListCollection),
                dbUtils_1.dbUtils.getCollection(ChatListCollection)
            ])
                .then((collection) => {
                const userListCollection = collection[0];
                const userChatCollection = collection[1];
                return this.checkUserAvailability(userListCollection, recipientUserName)
                    .then((data) => {
                    if (data === 'true') {
                        return Promise.all([
                            userListCollection.findOneAndUpdate(toFindSender, toUpdateSender),
                            userListCollection.findOneAndUpdate(toFindRecipient, toUpdateRecipient),
                            userChatCollection.insertOne(chatInsert)
                        ])
                            .then(data => {
                            if (data && data[0] && data[1] && data[0].lastErrorObject && data[0].lastErrorObject.n > 0 && data[1].lastErrorObject && data[1].lastErrorObject.n > 0) {
                                return 'true';
                            }
                            return 'The recipient is already added';
                        })
                            .catch(err => {
                            console.log(err);
                            return 'An error occured while fetching collection results';
                        });
                    }
                    return data;
                })
                    .catch(err => {
                    console.log(err);
                    return 'An error occured while fetching collection results';
                });
            });
        }
    }
}
const ChatModel = new ChatModelEvents();
exports.ChatModel = ChatModel;
//# sourceMappingURL=chat.js.map