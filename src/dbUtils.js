const mongoClient = require('mongodb').MongoClient
const config = require('./config')
const { dbURL, dbName } = config
const utils = {
    dbConnect() {
        return mongoClient.connect(dbURL, {
            useNewUrlParser : true
        });
    },
    getCollection(collectionName) {
        return this.dbConnect(dbURL)
        .then(db => {
            return db.db(dbName).collection(collectionName)
        })
        .catch(err => {
            return err
        })
    },
    connectDBCollection(collectionName, callback) {
        return this.getCollection(collectionName)
        .then(collection => {
            if(collection && collection.code && collection.code == 'ECONNREFUSED') {
                return 'Database cannot be connected'
            }
            else {
                return callback(collection)
            }
        })
        .catch(err => {
            console.log('An error occured while connecting to database')
            console.log(err)
            return err
        })
    },
    findData(collection, query) {
        return collection.find(query).toArray()
        .then(data => {
            console.log(data)
            return data
        })
        .catch(err => {
            console.log(err)
            return 'An error occured while fetching collection results'
        })
    },
    getData(collectionName, toFind) {
        // find data is a callback method
        const findData = collection => {
            return this.findData(collection, toFind)
        }
        return this.connectDBCollection(collectionName, findData)
    }
}

module.exports = utils