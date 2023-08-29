const dotenv = require('dotenv')
const dotenvExpand = require( 'dotenv-expand')
const { Db } = require('mongodb')

var myEnv = dotenv.config() 
dotenvExpand.expand(myEnv)

const ENV = process.env.ENVIRONMENT
const DB_NAME= process.env.DB_NAME
const DB_COLL= ENV === 'PROD'? process.env.DB_COLLECTION : process.env.DB_TEST_COLLECTION 
const MONGODB_USERNAME = process.env.MONGODB_USERNAME
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD 
const MONGO_CLUSTER = process.env.MONGO_CLUSTER
const MONGO_URL = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;

module.exports = {ENV, DB_NAME, DB_COLL, MONGO_URL}

// async function updateElement(element){
//   const myColl = client.db(DB_NAME).collection(DB_COLL)
//   const result = await myColl.findOneAndUpdate(
//     {"nombre": element.nombre},
//     {"$push": {"historial": element.historial[0]}, "$set": {"lastUpdate": element.lastUpdate}},
//     {upsert: true}
//   )
// }
