const { responseFormat } = require("../common")
const redisClient = require("../config")

// cache middleware to read data from redis
async function checkCache(req, res, next) {
	const { username } = req.params

	const data = await redisClient.hGetAll(username)
	if (Object.keys(data).length > 0) {
		return res.send(responseFormat(true, "successfully fetched user", data))
	} else {
		next()
	}
}

module.exports = { checkCache }
