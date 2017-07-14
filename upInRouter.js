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

upInRouter.post("/", jsonParser, (req, res) => {
	const requiredKeys = ['firstName', 'lastName', 'email', 'password']
	requiredKeys.forEach(key => {
		if (!(key in req.body)){
			const message = `Missing ${key} in request body`
			console.error(message)
			return res.status(400).send(message)
		}
	})
	
	Users
		.create({
			user: {	firstName: req.body.firstName,
					lastName: req.body.lastName
				},
			email: req.body.email,
			password: req.body.password,
			joinDate: req.body.joinDate || Date.now(),
			entries: [],
		})
		.then(
			user => res.status(201).json(user.userRepr()))
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})

module.exports = upInRouter