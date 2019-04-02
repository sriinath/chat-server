
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
    addRecipient(userName: string, { recipientUserName, chatId }: ChatType) {
        if(userName && recipientUserName && chatId) {
            const recipientInfo = { userName: recipientUserName }
            const toFind = { userName, 'chats.recipientUserName': { $nin: [ recipientUserName ] } }
            const toUpdate = { $push: { 'chats': { recipientUserName, chatId } } }
            return utils.getCollection('UserList')
            .then((collection: mongoDB.Collection) => {
                return collection.find(recipientInfo).toArray()
                .then(data => {
                    console.log('recipient')
                    console.log(data)
                    if(data && data.length > 0) {
                        return collection.findOneAndUpdate(toFind, toUpdate)
                        .then(data => {
                            if(data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                                return data
                            }
                            return 'The recipient is already added'
                        })
                        .catch(err => {
                            console.log(err)
                            return 'An error occured while fetching collection results'
                        })        
                    }
                    return 'Cannot find any record for the recipient user name provided'
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
    addUserChat({ chatId, sender, message, date, time }: UserChatType) {
        const chatData = {
            sender,
            message,
            date,
            time
        }
        const toFind = { chatId }
        const toUpdate = {$push: { "chats":  chatData }}
        if(chatId) {
            const updateData = (collection: mongoDB.Collection) => {
                return collection.findOneAndUpdate(toFind, toUpdate)
                .then(data => {
                    if(data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                        console.log(data)
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