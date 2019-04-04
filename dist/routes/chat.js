"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const chatRouter = express.Router();
const uuidv1 = require('uuid/v1');
const dbUtils_1 = require("../dbUtils");
const config = require('../config');
const { ChatListCollection, UserListCollection } = config;
const addChatId = () => {
    const chatId = uuidv1();
    return dbUtils_1.dbUtils.getCollection(ChatListCollection)
        .then((collection) => {
        return collection.insertOne({ chatId })
            .then(data => {
            return chatId;
        })
            .catch(err => {
            console.log(err);
            return null;
        });
    })
        .catch(err => {
        console.log(err);
        return null;
    });
};
const getSingleUserData = (user) => __awaiter(this, void 0, void 0, function* () {
    const { userName, userMail } = user;
    if (userName) {
        const chatId = yield addChatId();
        if (chatId) {
            return {
                userName,
                chats: [{
                        chatId,
                        recipientUserName: userName
                    }],
                userMail: userMail || ''
            };
        }
    }
    return null;
});
chatRouter.post('/addUser', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { body } = req;
    const { userList } = body;
    let ConstructedUserData = [];
    if (userList && Array.isArray(userList) && userList.length) {
        for (let user of userList) {
            let data = yield getSingleUserData(user);
            ConstructedUserData.push(data);
        }
        // ConstructedUserData = userList.map(await getSingleUserData)
    }
    else if (userList) {
        ConstructedUserData.push(yield getSingleUserData(userList));
    }
    if (ConstructedUserData.length) {
        dbUtils_1.dbUtils.getCollection(UserListCollection)
            .then((collection) => {
            collection.insertMany(ConstructedUserData)
                .then(data => {
                if (data.insertedCount > 0) {
                    res.send('Successfull Added the user list');
                }
                else {
                    res.send('There was no new data inserted');
                }
            })
                .catch(err => {
                console.log(err);
                res.send(err);
            });
        })
            .catch(err => {
            console.log(err);
            res.send(err);
        });
    }
}));
module.exports = chatRouter;
//# sourceMappingURL=chat.js.map