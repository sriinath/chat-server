interface UserList {
    userName: string
    userMail?: string
    chats?: [ChatType]
    groups?: [GroupChatType]
}
interface ChatList {
    owner: string
	name: string
    chatId: string
    chats: [UserChatType]
}
interface ChatType {
    chatId: string
    recipientUserName: string
    starred?: 'true' | 'false'
}
interface UserChatType {
    chatId?: string
    recipientUserName: string
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