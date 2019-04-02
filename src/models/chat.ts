
const utils = require('../dbUtils')
import mongoDB = require('mongodb')
import { UserChatType } from '../typings'
const chatModel = {
    getUserChatList(userName: string) {
        const toFind = { userName }
        return utils.getData('UserList', toFind)
    },
    getUserChats(chatId: string) {
        const toFind = { chatId }
        return utils.getData('UserChats', toFind)
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

module.exports = chatModel