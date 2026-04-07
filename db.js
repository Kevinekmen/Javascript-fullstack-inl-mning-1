const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db('wordle');
  console.log('Ansluten till MongoDB');
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };