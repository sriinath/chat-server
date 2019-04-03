
import { dbUtils as utils } from '../dbUtils'
import mongoDB = require('mongodb')
import {
    UserChatType,
    ChatType
} from '../typings'
const chatModel = {
    getUserChatList(userName: string) {
        const toFind = { userName }
        return utils.getData('UserList', toFind)
    },
    getUserChats(chatId: string) {
        const toFind = { chatId }
        return utils.getData('UserChats', toFind)
    },
    async checkUserAvailability(collection: mongoDB.Collection, userName: string) {
        const toFind = { userName }
        const userAvailability = (collection: mongoDB.Collection) => {
            return collection.find(toFind).toArray()
            .then(data => {
                if(data && data.length > 0) {
                    return 'true'
                }
                return 'Cannot find any record for the user name provided'
            })
            .catch(err => {
                console.log(err)
                return 'An error occured while fetching collection results'
            })
        }
        if(collection) {
            return userAvailability(collection)
        }
        else {
            utils.getCollection('UserList')
            .then((collection: mongoDB.Collection) => {
                return userAvailability(collection)
            })
        }
    },
    addRecipient(userName: string, { recipientUserName, chatId }: ChatType) {
        if(userName && recipientUserName && chatId) {
            // const recipientInfo = { userName: recipientUserName }
            const toFindSender = { userName, 'chats.recipientUserName': { $nin: [ recipientUserName ] } }
            const toUpdateSender = { $push: { 'chats': { recipientUserName, chatId } } }
            const toFindRecipient = { userName: recipientUserName, 'chats.recipientUserName': { $nin: [ userName ] } }
            const toUpdateRecipient = { $push: { 'chats': { recipientUserName: userName, chatId } } }
            const chatInsert = { chatId }
            return Promise.all([
                utils.getCollection('UserList'),
                utils.getCollection('UserChats')
            ])
            .then((collection: [mongoDB.Collection, mongoDB.Collection]) => {
                const userListCollection = collection[0]
                const userChatCollection = collection[1]
                return chatModel.checkUserAvailability(userListCollection, recipientUserName)
                .then((data: any) => {
                    if(data === 'true') {
                        return Promise.all([
                            userListCollection.findOneAndUpdate(toFindSender, toUpdateSender),
                            userListCollection.findOneAndUpdate(toFindRecipient, toUpdateRecipient),
                            userChatCollection.insertOne(chatInsert)
                        ])
                        .then(data => {
                            if(data && data[0] && data[1] && data[0].lastErrorObject && data[0].lastErrorObject.n > 0 && data[1].lastErrorObject && data[1].lastErrorObject.n > 0) {
                                return 'true'
                            }
                            return 'The recipient is already added'
                        })
                        .catch(err => {
                            console.log(err)
                            return 'An error occured while fetching collection results'
                        })        
                    }
                    return data
                })
                .catch(err => {
                    console.log(err)
                    return 'An error occured while fetching collection results'
                })
            })
            .catch((err: mongoDB.MongoError) => {
                console.log(err)
                return 'An error occured while fetching collection'
            })
        }
        return 'userName & recipientUserName & chatId are mandatory'
    },
    addUserChat({ chatId, recipientUserName, message, date }: UserChatType) {
        const chatData = {
            recipientUserName,
            message,
            date
        }
        const toFind = { chatId }
        const toUpdate = {$push: { "chats":  chatData }}
        if(chatId) {
            const updateData = (collection: mongoDB.Collection) => {
                return collection.findOneAndUpdate(toFind, toUpdate)
                .then(data => {
                    if(data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                        return data
                    }
                    return 'There is no record for chatId provided '
                })
                .catch(err => {
                    console.log(err)
                    return 'An error occured while fetching collection results'
                })
            }
            return utils.connectDBCollection('UserChats', updateData)
        }
        return Promise.resolve('Chat Id is mandatory')
    }
}

export {
    chatModel
}