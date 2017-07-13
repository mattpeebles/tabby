const express = require('express')
const app = express()

const upInRouter = express.Router()

const {Users} = require('./models')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()


upInRouter.get("/", (req, res) => {
	Users
		.find()
		.exec()
		.then(users => {
			res.json({
				users: users.map(
					(user) => user.userRepr())
			});
		})
		.catch(
			err => {
				console.error(err)
				res.status(500).json({message: 'Internal server error'})
			})
})

module.exports = upInRouter