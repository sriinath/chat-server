const chatModel = require('../models/chat')
const chatController = {
    // get all the user chat list / friends list for a user
    getUserChatList(userName) {
        if(userName) {
            return chatModel.getUserChatList(userName)
        }
        return 'UserName is mandatory'
    },
    // get all the chats f that user in a particular group / with a particular person
    getUserChats(chatId) {
        if(chatId) {
            return chatModel.getUserChats(chatId)
        }
        return 'ChatId is mandatory'
    },
    // add a user chat after adding user as friend
    addUserChat(chatData) {
        const { chatId } = chatData
        if(chatId) {
            return chatModel.addUserChat(chatData)
        }
        return 'ChatId is mandatory'
    }
}

module.exports = chatController