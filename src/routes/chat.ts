import express = require('express')
const chatRouter = express.Router()

chatRouter.post('/addMessages', (req, res)=> {
    const { body } = req
    res.send(body)
})

module.exports = chatRouter