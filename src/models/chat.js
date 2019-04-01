const utils = require('../utils')
// const dbURL = 'mongodb://localhost:27017'
const dbURL = `mongodb+srv://srinath:Srikripa@3@cluster0-oqygq.mongodb.net/test?retryWrites=true`
const dbName = 'chit-chatty'
const dbInfo = {
    dbURL,
    dbName
}

const chatModel = {
    getUserChatList(userName) {
        dbInfo.collectionName = 'UserChatList'
        const findData = collection => {
            return collection.find({ userName }).toArray()
            .then(data => {
                console.log(data)
                return data
            })
            .catch(err => {
                console.log(err)
                return 'An error occured while fetching collection results'
            })
        }
        return utils.connectDBCollection(dbInfo, findData)
        // return utils.getCollection(dbInfo)
        // .then(collection => {
        //     if(collection && collection.code && collection.code == 'ECONNREFUSED') {
        //         return Promise.resolve('Database cannot be connected')
        //     }
        //     else {
        //         return collection.find({ userName }).toArray()
        //         .then(data => {
        //             console.log(data)
        //             return data
        //         })
        //         .catch(err => {
        //             console.log(err)
        //             return 'An error occured while fetching collection results'
        //         })
        //     }
        // })
        // .catch(err => {
        //     console.log('An error occured while connecting to database')
        //     console.log(err)
        //     return err
        // })
    },

    addUserChat({ chatId, sender, recipient, message, time }) {
        dbInfo.collectionName = 'UserChats'
        const chatData = {
            sender,
            recipient,
            message,
            time
        }
        const toFind = { chatId }
        const toUpdate = {$push: { "chats":  chatData }}
        if(chatId) {
            return utils.getCollection(dbInfo)
            .then(collection => {
                if(collection && collection.code && collection.code == 'ECONNREFUSED') {
                    return Promise.resolve('Database cannot be connected')
                }
                else {
                    return collection.findOneAndUpdate(toFind, toUpdate)
                    .then(data => {
                        if(data && data.lastErrorObject && data.lastErrorObject.n > 0) {
                            console.log(data)
                            return data
                        }
                        return 'There is no recoird for chatId provided '
                    })
                    .catch(err => {
                        console.log(err)
                        return 'An error occured while fetching collection results'
                    })
                }
            })
            .catch(err => {
                console.log('An error occured while connecting to database')
                console.log(err)
                return err
            })
        }
        return Promise.resolve('Chat Id is mandatory')
    }
}

module.exports = chatModel