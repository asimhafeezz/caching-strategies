const fs = require("fs")

// fetch user from database
const fetchUser = username => {
	return new Promise((resolve, reject) => {
		fs.readFile("./data/database.json", "utf8", (err, data) => {
			if (err) reject({ error: "Database error" })
			const user = JSON.parse(data)?.find(user => user.username === username)
			setTimeout(() => {
				if (user !== undefined) {
					resolve(user)
				} else {
					reject("User not found")
				}
			}, 1000)
		})
	})
}

// add user to database
const addUser = user => {
	return new Promise((resolve, reject) => {
		fs.readFile("./data/database.json", "utf8", (err, data) => {
			if (err) reject({ error: "Database Read error" })
			const newData = JSON.parse(data)
			setTimeout(() => {
				const filterUser = newData.find(eUser => eUser.username === user.username)
				if (filterUser !== undefined) {
					reject("User already exists")
				} else {
					user.id = newData.length + 1
					newData.push(user)
					fs.writeFile("./data/database.json", JSON.stringify(newData, null, 2), err => {
						if (err) reject({ error: "Database Write error" })
						resolve(user)
					})
				}
			}, 1000)
		})
	})
}

// response format
const responseFormat = (success, message, data) => {
	if (data) {
		return {
			success,
			message,
			data,
		}
	}
	return {
		success,
		message,
	}
}

module.exports = {
	fetchUser,
	addUser,
	responseFormat,
}
