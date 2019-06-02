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
        if(collectionName) {
            return dbUtils.dbConnect()
            .then((db: mongoDB.MongoClient) => {
                return db.db(dbName).collection(collectionName)
            })
            .catch((err: mongoDB.MongoError) => {
                return err
            })    
        }
    },
    connectDBCollection(collectionName: string, callback: Function) {
        if(collectionName) {
            return dbUtils.getCollection(collectionName)
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
        }
        else {
            return Promise.resolve('Colllection name is not valid string')
        }
    },
    findData(collection: mongoDB.Collection, query: Object) {
        return collection.find(query, { fields: {_id: 0} } ).toArray()
        .then(data => {
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
            return dbUtils.findData(collection, toFind)
        }
        return dbUtils.connectDBCollection(collectionName, findData)
    }
}

export {
    dbUtils
}