const mongoClient = require('mongodb').MongoClient

const utils = {
    dbConnect(dbURL) {
        return mongoClient.connect(dbURL, {
            useNewUrlParser : true
        });
    },
    getCollection({ dbURL, dbName, collectionName }) {
        return this.dbConnect(dbURL)
        .then(db => {
            return db.db(dbName).collection(collectionName)
        })
        .catch(err => {
            return err
        })
    },
    connectDBCollection(dbInfo, callback) {
        return this.getCollection(dbInfo)
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
    }
}

module.exports = utils