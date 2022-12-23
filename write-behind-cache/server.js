const express = require("express")
const { fetchUser, addUser, responseFormat } = require("./common")
const { checkCache } = require("./middleware")
const redisClient = require("./config")
const app = express()

//middleware
app.use(express.json())

// get user by username
app.get("/:username", checkCache, async (req, res) => {
	try {
		const { username } = req.params
		const data = await fetchUser(username)
		await redisClient.hSet(username, data)
		res.send(responseFormat(true, "successfully fetched user", data))
	} catch (err) {
		res.status(404).send(responseFormat(false, err))
	}
})

// Write-behind/Write-back Cache Strategy
// add user to database and redis
app.post("/", async (req, res) => {
	try {
		const oldUser = await redisClient.hGet(req.body.username, "username")
		if (oldUser) {
			return res.status(404).send(responseFormat(false, "User already exists"))
		} else {
			await redisClient.hSet(req.body.username, req.body)
			// store data to database asynchronously but instead messaging queue like Redis, RabbitMQ or Kafka can be used for data consistency.
			addUser(req.body)
			//return data to client
			res.send(responseFormat(true, "successfully created user", req.body))
		}
	} catch (err) {
		res.status(404).send(responseFormat(false, err))
	}
})

//connect to redis
;(async () => {
	await redisClient.connect()
	console.log("Redis connected")
})()

//PORT
const PORT = 8080

// start server
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
})
