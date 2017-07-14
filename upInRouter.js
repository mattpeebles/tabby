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
			journalId: req.body.journalId,
		})
		.then(
			user => res.status(201).json(user.userRepr()))
		.catch(err => {
			console.error(err)
			res.status(500).json({message: 'Internal server error'})
		})
})

upInRouter.put('/:id', jsonParser, (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)){
		const message = (
		  `Request path id (${req.params.id}) and request body id ` +
		  `(${req.body.id}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}
	const toUpdate = {}
	const updatedableFields = ['user', 'email', 'password']

	console.log(req.body)

	updatedableFields.forEach(field =>{
		if (field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	Users
		.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
		.exec()
		.then(updatedUser => res.status(201).json(updatedUser.userRepr()))
		.catch(err => res.status(500).json({message: 'Internal server error'}))
})
module.exports = upInRouter