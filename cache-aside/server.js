const express = require("express")
const redis = require("redis")
const axios = require("axios")
const app = express()

const PORT = 8080
const REDIS_PORT = 6379

const redisClient = redis.createClient(REDIS_PORT)

//middleware
app.use(express.json())

async function checkCache(req, res, next) {
	const { username } = req.params

	const data = await redisClient.hGetAll(username)
	if (Object.keys(data).length > 0) {
		return res.send({
			source: "cache",
			data: data,
		})
	} else {
		console.log("next")
		next()
	}
}

app.get("/data/:username", checkCache, (req, res) => {
	try {
		const { username } = req.params

		axios.get(`https://api.github.com/users/${username}`).then(async response => {
			const data = response.data
			const userData = {
				name: data.name,
				bio: data.bio,
				public_repos: data.public_repos,
				following: data.following,
				followers: data.followers,
			}
			//set data to redis
			await redisClient.hSet(username, userData)

			res.send({
				source: "api",
				data: userData,
			})
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Server Error")
	}
})

//connect to redis
;(async () => {
	await redisClient.connect()
	console.log("Redis connected")
})()

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
})
