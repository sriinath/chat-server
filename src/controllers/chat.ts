import {
    UserChatType,
    ChatType
} from '../typings'
import { chatModel } from '../models/chat'

const chatController = {
    // get all the user chat list / friends list for a user
    getUserChatList(userName: string) {
        if(userName) {
            return chatModel.getUserChatList(userName)
        }
        return 'UserName is mandatory'
    },
    // get all the chats f that user in a particular group / with a particular person
    getUserChats(chatId: string) {
        if(chatId) {
            return chatModel.getUserChats(chatId)
        }
        return 'ChatId is mandatory'
    },
    checkUserAvailability(userName: string) {
        if(userName) {
            return chatModel.checkUserAvailability(null, userName)
        }
        return 'User Name is mandatory'
    },
    addRecipient(userName: string, { recipientUserName, chatId }: ChatType) {
        if(userName && recipientUserName && chatId) {
            return chatModel.addRecipient(userName, { recipientUserName, chatId })
        }
        else {
            return 'userName & recipientUserName & chatId are mandatory'
        }
    },
    // add a user chat after adding user as friend
    addUserChat(chatData : UserChatType) {
        const { chatId } = chatData
        if(chatId) {
            return chatModel.addUserChat(chatData)
        }
        return Promise.resolve('ChatId is mandatory')
    }
}
module.exports = chatController