const express = require('express')
const app = express()
const faker = require('faker')

const {BasicStrategy} = require('passport-http')
const passport = require('passport')

const upInRouter = express.Router()

const {Users} = require('./models')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

upInRouter.use(jsonParser)

function generateJournalId(){
	return faker.random.word() + faker.random.word() + faker.random.word()
}

//strategy for encrypting user password and ensuring
//new user uses a unique email address when creating their profile
const basicStrategy = new BasicStrategy((email, password, callback) => {
	let user;
	Users
		.findOne({email: email})
		.exec()
		.then(_user => {
			user = _user
			if (!user){
				return callback(null, false)
			}
			return user.validatePassword(password)
		})
		.then(isValid => {
			if (!isValid){
				return callback(null, false)
			}
			else{
				return callback(null, user)
			}
		})
		.catch(err => callback(err))
})

passport.use(basicStrategy)
upInRouter.use(passport.initialize())


//grabs signed in user database information
//disallows a person from viewing info if they are
//not authenticated without the right Basic authorization header

upInRouter.get('/me', passport.authenticate('basic', {session: false}), (req, res) => {
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
	const updatedableFields = ['user', 'email', 'password']

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


//delete hook that deletes user
upInRouter.delete('/:id', (req, res) => {
	Users
		.findByIdAndRemove(req.params.id)
		.exec()
		.then(() => {
			console.log(`Deleted user ${req.params.id}`)
				res.status(204).end()
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}))
})

module.exports = upInRouter