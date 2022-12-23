const redis = require("redis")

const REDIS_PORT = 6379
// redis client
const redisClient = redis.createClient(REDIS_PORT)

module.exports = redisClient
