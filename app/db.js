const { MongoClient } = require('mongodb');
const uri = 'mongodb://mongosrv';
let cachedDB;

module.exports = {
    connectToDb: async () => {
        if(cachedDB){
            console.log('Retrieving existing connection');
            return cachedDB;
        }
        try{
            console.log('New db connection');
            const client = await MongoClient.connect(uri);
            cachedDB = client.db('auctions_db');
            return cachedDB;
        } catch(err){
            console.err('Error');
            return null;
        }
    }
}