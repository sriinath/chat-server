import mongoDB = require('mongodb')
const mongoClient = mongoDB.MongoClient
const config = require('./config')
const { dbURL, dbName } = config

const dbUtils = {
    dbConnect() {
        return mongoClient.connect(dbURL, {
            useNewUrlParser : true
        })
    },
    getCollection(collectionName: string) {
        return this.dbConnect(dbURL)
        .then((db: mongoDB.MongoClient) => {
            return db.db(dbName).collection(collectionName)
        })
        .catch((err: mongoDB.MongoError) => {
            return err
        })
    },
    connectDBCollection(collectionName: string, callback: Function) {
        return this.getCollection(collectionName)
        .then((collection: any) => {
            if(collection && collection.code && collection.code == 'ECONNREFUSED') {
                return 'Database cannot be connected'
            }
            else {
                return callback(collection)
            }
        })
        .catch((err: mongoDB.MongoError) => {
            console.log('An error occured while connecting to database')
            console.log(err)
            return err
        })
    },
    findData(collection: mongoDB.Collection, query: Object) {
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
    getData(collectionName: string, toFind: Object) {
        // find data is a callback method
        const findData = (collection: mongoDB.Collection) => {
            return this.findData(collection, toFind)
        }
        return this.connectDBCollection(collectionName, findData)
    }
}

export {
    dbUtils
}