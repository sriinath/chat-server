import {
    UserChatType,
    ChatType
} from '../typings'
import { ChatModel } from '../models/chat'

class ChatControllerObject {
    // get all the user chat list / friends list for a user
    getUserChatList(userName: string) {
        if(userName) {
            return ChatModel.getUserChatList(userName)
        }
        return Promise.resolve('UserName is mandatory')
    }
    // get all the chats f that user in a particular group / with a particular person
    getUserChats(chatId: string) {
        if(chatId) {
            return ChatModel.getUserChats(chatId)
        }
        return Promise.resolve('ChatId is mandatory')
    }
    checkUserAvailability(userName: string) {
        if(userName) {
            return ChatModel.checkUserAvailability(null, userName)
        }
        return Promise.resolve('User Name is mandatory')
    }
    addRecipient(userName: string, { recipientUserName, chatId }: ChatType) {
        if(userName && recipientUserName && chatId) {
            return ChatModel.addRecipient(userName, { recipientUserName, chatId })
        }
        else {
            return Promise.resolve('userName & recipientUserName & chatId are mandatory')
        }
    }
    // add a user chat after adding user as friend
    addUserChat(chatData : UserChatType) {
        const { chatId } = chatData
        if(chatId) {
            return ChatModel.addUserChat(chatData)
        }
        return Promise.resolve('ChatId is mandatory')
    }
    addFavouritesChat({ userName, recipientUserName, isFavorites }: { userName: string, recipientUserName: string, isFavorites: string }) {
        if(userName && recipientUserName && isFavorites) {
            return ChatModel.addFavouritesChat({ userName, recipientUserName, isFavorites } )
        }
        else {
            return Promise.resolve('username, recipient username and isfavorites is mandatory')
        }
    }
}
const ChatController = new ChatControllerObject()
export {
    ChatController
}
// module.exports = new chatController()