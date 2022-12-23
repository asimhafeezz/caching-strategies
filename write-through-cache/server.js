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

// add user to database and redis
app.post("/", async (req, res) => {
	try {
		await redisClient.hSet(req.body.username, req.body)
		const data = await addUser(req.body)
		res.send(responseFormat(true, "successfully created user", data))
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
