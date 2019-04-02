
interface UserList {
    userId: string
    userMail?: string
    starredChats: [ChatType]
    groups: [GroupChatType]
}
interface ChatList {
    chatId: string
    chats: [UserChatType]
}
interface ChatType {
    chatId: string
    userName: string
}
interface UserChatType {
    chatId?: string
    sender: string
    message: string
    date: Date
    time: TimeRanges
}
interface GroupChatType extends ChatType {
    accepted: boolean
    owner: string
}
export {
    UserList,
    ChatList,
    ChatType,
    UserChatType,
    GroupChatType
}