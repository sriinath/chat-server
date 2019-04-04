import express = require('express')
const chatRouter = express.Router()
import { UserList } from '../typings'
const uuidv1 = require('uuid/v1')
import mongoDB = require('mongodb')
import { dbUtils as utils } from '../dbUtils'
const config = require('../config')
const { ChatListCollection, UserListCollection } = config

const addChatId = () => {
    const chatId = uuidv1()
    return utils.getCollection(ChatListCollection)
    .then((collection: mongoDB.Collection) => {
        return collection.insertOne({ chatId })
        .then(data => {
            return chatId
        })
        .catch(err => {
            console.log(err)
            return null
        })
    })
    .catch(err => {
        console.log(err)
        return null
    })
}

const getSingleUserData = async (user: UserList) => {
    const { userName, userMail } = user
    if(userName) {
        const chatId = await addChatId()
        if(chatId) {
            return {
                userName,
                chats: [{
                    chatId,
                    recipientUserName: userName
                }],
                userMail: userMail || ''
            }
        }
    }
    return null
}

chatRouter.post('/addUser', async (req, res)=> {
    const { body } = req
    const { userList } = body
    let ConstructedUserData: any = []
    if(userList && Array.isArray(userList) && userList.length) {
        for( let user of userList) {
            let data = await getSingleUserData(user)
            ConstructedUserData.push(data)
        }
        // ConstructedUserData = userList.map(await getSingleUserData)
    }
    else if(userList) {
        ConstructedUserData.push(await getSingleUserData(userList))
    }
    if(ConstructedUserData.length) {
        utils.getCollection(UserListCollection)
        .then((collection: mongoDB.Collection) => {
            collection.insertMany(ConstructedUserData)
            .then(data => {
                if(data.insertedCount > 0) {
                    res.send('Successfull Added the user list')
                }
                else {
                    res.send('There was no new data inserted')
                }
            })
            .catch(err => {
                console.log(err)
                res.send(err)
            })
        })
        .catch(err => {
            console.log(err)
            res.send(err)
        })    
    }
})

module.exports = chatRouter