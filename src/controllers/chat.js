const chatModel = require('../models/chat')
const chatController = {
    getUserChatList(userName) {
        if(userName) {
            return chatModel.getUserChatList(userName)
        }
        else {
            return 'UserName is mandatory'
        }
    },
    addUserChat(chatData) {
        const { chatId } = chatData
        if(chatId) {
            return chatModel.addUserChat(chatData)
        }
        else {
            return 'ChatId is mandatory'
        }
    }
}

module.exports = chatController