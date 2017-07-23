const express = require('express')
const app = express()
const faker = require('faker')

const {BasicStrategy} = require('passport-http')
const passport = require('passport')

const upInRouter = express.Router()

const {Entry, Users} = require('./models')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const {addDays, nowDate} = require('./resources/date-module')

upInRouter.use(jsonParser)

function generateJournalId(){
	return faker.random.word() + faker.random.word() + faker.random.word()
}


//grabs signed in user database information
//disallows a person from viewing info if they are
//not authenticated without the right Basic authorization header

upInRouter.get('/me', passport.authenticate('basic', {session: true}), (req, res) => {
	res.json({user: req.user.userRepr()})
})

//this api hook allows a new user to be posted to the user collection in the database
upInRouter.post('/', (req, res) => {
	
	//control logic to ensure request body exists, possess a non-empty string for email and password
	if (!req.body){
		return res.status(400).json({message: 'No request body'})
	}
	
	if (!('email' in req.body)){
		return res.status(400).json({message: 'Missing field: email'})
	}

	let {user, email, password, joinDate, journalId, priorityExpiry} = req.body
	let {firstName, lastName} = req.body.user

	if (typeof email !== 'string'){
		return res.status(422).json({message: 'Incorrect field type: email'})
	}

	if (!(password)){
		return res.status(422).json({message: 'Missing field: password'})
	}

	if (typeof password !== 'string'){
		return res.status(422).json({message: 'Incorrect field type: password'})
	}


	password = password.trim()

	if (password === ''){
				return res.status(422).json({message: 'Incorrect field length: password'})
	}

	//ensures email is unique
	return Users
		.find({email})
		.count()
		.exec()
		.then(count => {
			if (count > 0){
				return res.status(422).json({message: 'Email has already been used to create an account'})
			}

			return Users.hashPassword(password)
		})
		//hashes password and actually creates the new user
		.then(hash => {
			return Users
				.create({
					user: {	firstName: firstName,
							lastName: lastName
						},
					email: email,
					password: hash,
					joinDate: joinDate || Date.now(),
					journalId: journalId || generateJournalId(), //the first option shouldn't be called except for testing
					priorityExpiry: priorityExpiry || {'high': 2, 'medium': 4, 'low': 7} //default is likely to change
				})
		})
		.then(user => {
			return res.status(201).json(user.userRepr())
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'})
		})
})


//put hook that allows for user object to be updated
//only email, password, first name, last name, and priority expiration settings can be updated
upInRouter.put('/:id', (req, res) => {
	if (!(req.params.id === req.body.id)){
		const message = (
		  `Request path id (${req.params.id}) and request body id ` +
		  `(${req.body.id}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}
	const toUpdate = {}
	const updatedableFields = ['user', 'email', 'password', "priorityExpiry"]

	updatedableFields.forEach(field =>{
		if (field in req.body){
			toUpdate[field] = req.body[field]
		}
	})

	if(toUpdate.password !== undefined){
		return Users
			.findById(req.params.id)
			.exec()
			.then((user) => {
				return Users.hashPassword(toUpdate.password)
			})
			//hashes password and actually creates the new user
			.then(hash => {
				toUpdate["password"] = hash
				console.log(hash)
				console.log(toUpdate)
				return toUpdate
			})
			.then(() => {
				Users
					.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
					.exec()
					.then(updatedUser => res.status(200).json(updatedUser.userRepr()))
					.catch(err => res.status(500).json({message: 'Internal server'}))
			})
	}

	if(toUpdate.priorityExpiry !== undefined){
		Users
			.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
			.exec()
			.then(res => {
				return res
			})
			.then(res => {
				return res.journalId
			})
			.then(journalId => {
				Entry
					.find({journalId: journalId})
					.exec()
					.then(res => {
						journalId = res[0].journalId
						res.forEach(entry => {
							let priority = entry.priority
							let entryId = entry._id
							Users
								.find({journalId: journalId})
								.exec()
								.then(res => {
									let priorityExpiryObject = res[0].priorityExpiry
									return priorityExpiryObject
								})
								.then(object => {
									let priorityExpiry = object[priority]
									return priorityExpiry
								})
								.then(priorityExpiry => {
									Entry
										.find({entryId: entryId})
										.exec()
										.then(res => {
											addDate = nowDate()
											expiry = addDays(addDate, priorityExpiry)
											
											return expiry 
										})
										.then(expiry => {
											toUpdate.expiry = expiry
											Entry
												.findByIdAndUpdate(entryId, {$set: toUpdate}, {new: true})
												.exec()
										})
								})
						})
					})
			})
			.then(() => {
				Users
					.findById(req.params.id)
					.exec()
					.then(updatedUser => res.status(200).json(updatedUser.userRepr()))
					.catch(err => res.status(500).json({message: 'Internal server'}))
			})
			.catch(err => res.status(500).json({message: 'Internal server error'}))
	}

	else{
		Users
			.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
			.exec()
			.then(updatedUser => {
				res.status(201).json(updatedUser.userRepr())})
			.catch(err => res.status(500).json({message: 'Internal server error'}))
	}
})


//delete hook that deletes user
upInRouter.delete('/:id', (req, res) => {
	Users
		.findById(req.params.id)
		.exec()
		.then(res => {
			return res.journalId
		})
		.then(journalId => {
				console.log(`Delete journal ${journalId}`)
				Entry
					.find({journalId: journalId})
					.remove()
					.exec()
		})
		.then(() => {
			Users
				.findByIdAndRemove(req.params.id)
		})
		.then(() => {
			console.log(`Deleted user ${req.params.id}`)
				res.status(204).end()
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}))
})

module.exports = upInRouter