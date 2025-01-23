const { MongoClient } = require('mongodb');
const dbURL = process.env.ATLAS_URI;

let db;
async function connectToDB() {
  try {
    const client = new MongoClient(dbURL, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db("Project 3");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

function getCollection(collectionName) {
  if (!db) {
    throw new Error('Database connection not established. Call connectToDB first.');
  }
  return db.collection(collectionName);
}

module.exports = {
  connectToDB,
  getCollection,
};
