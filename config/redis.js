// config/redis.js

const redis = require('redis');
const client = redis.createClient();  // Create the client

client.on('error', (err) => console.log('Redis error: ', err));

module.exports = client;
