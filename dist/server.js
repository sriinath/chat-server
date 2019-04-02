"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require('body-parser');
const url = require('url');
const jwt = require('jsonwebtoken');
const path = require('path');
const morgan = require('morgan');
const app = express();
const defaultPath = "/src/";
// socket import
const socketInit = require('./socket');
// router imports
//const chatRouter = require('./routes/chat')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(morgan('dev'));
app.use(express.static(defaultPath));
// call router for each specific router path
// app.use('/chat/', chatRouter)
app.use("/", function (req, res) {
    // const path = req.originalUrl;
    console.log(__dirname);
    res.sendFile(__dirname + '/index.html');
});
const server = app.listen(3000, () => {
    console.log('app started');
});
// open socket connection
socketInit(server);
//# sourceMappingURL=server.js.map