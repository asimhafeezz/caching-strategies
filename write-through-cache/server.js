const express = require("express")
const redis = require("redis")
const { fetchUser, addUser } = require("./API")
const app = express()

//middleware
app.use(express.json())

const PORT = 8080
const REDIS_PORT = 6379

// redis client
const redisClient = redis.createClient(REDIS_PORT)

// cache middleware to read data from redis
async function checkCache(req, res, next) {
	const { username } = req.params

	const data = await redisClient.hGetAll(username)
	if (Object.keys(data).length > 0) {
		return res.send({
			source: "cache",
			data: data,
		})
	} else {
		next()
	}
}

// get user by username
app.get("/:username", checkCache, async (req, res) => {
	try {
		const { username } = req.params

		const data = await fetchUser(username)
		await redisClient.hSet(username, data)

		res.send({
			source: "api",
			data,
		})
	} catch (err) {
		res.status(404).send({
			success: false,
			error: err,
		})
	}
})

// add user to database and redis
app.post("/", async (req, res) => {
	try {
		await redisClient.hSet(req.body.username, req.body)
		const data = await addUser(req.body)
		res.send({
			success: true,
			data,
		})
	} catch (err) {
		res.status(404).send({
			success: false,
			error: err,
		})
	}
})

//connect to redis
;(async () => {
	await redisClient.connect()
	console.log("Redis connected")
})()

// start server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
})
