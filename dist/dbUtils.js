"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoDB = require("mongodb");
const mongoClient = mongoDB.MongoClient;
const config = require('./config');
const { dbURL, dbName } = config;
const dbUtils = {
    dbConnect() {
        return mongoClient.connect(dbURL, {
            useNewUrlParser: true
        });
    },
    getCollection(collectionName) {
        if (collectionName) {
            return dbUtils.dbConnect()
                .then((db) => {
                return db.db(dbName).collection(collectionName);
            })
                .catch((err) => {
                return err;
            });
        }
    },
    connectDBCollection(collectionName, callback) {
        if (collectionName) {
            return dbUtils.getCollection(collectionName)
                .then((collection) => {
                if (collection && collection.code && collection.code == 'ECONNREFUSED') {
                    return 'Database cannot be connected';
                }
                else {
                    return callback(collection);
                }
            })
                .catch((err) => {
                console.log('An error occured while connecting to database');
                console.log(err);
                return err;
            });
        }
        else {
            return Promise.resolve('Colllection name is not valid string');
        }
    },
    findData(collection, query, limit, offset) {
        return collection.find(query, { fields: { _id: 0 } })
            .limit(limit)
            .skip(offset)
            .toArray()
            .then(data => {
            return data;
        })
            .catch(err => {
            console.log(err);
            return 'An error occured while fetching collection results';
        });
    },
    getData(collectionName, toFind, limit, offset) {
        const limitValue = limit || 20;
        const skip = offset || 0;
        // find data is a callback method
        const findData = (collection) => {
            return dbUtils.findData(collection, toFind, limitValue, skip);
        };
        return dbUtils.connectDBCollection(collectionName, findData);
    }
};
exports.dbUtils = dbUtils;
//# sourceMappingURL=dbUtils.js.map