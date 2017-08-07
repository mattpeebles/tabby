const express = require('express')
const app = express()
const faker = require('faker')

const userRouter = express.Router()

const {Entry, Users} = require('./models')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const {addDays, nowDate} = require('./resources/date-module')

const {passport, authorize} = require('./auth')

userRouter.use(jsonParser)
userRouter.use(require('cookie-parser')())
userRouter.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { secure : false, maxAge : (4 * 60 * 60 * 1000)} }))
userRouter.use(passport.initialize())
userRouter.use(passport.session())

function generateJournalId(){
	return faker.random.word() + faker.random.word() + faker.random.word()
}


//grabs signed in user database information
//disallows a person from viewing info if they are

userRouter.get('/me', authorize, (req, res) => {
	res.json({user: req.user.userRepr()})
})

userRouter.post('/email', (req, res) => {
	let {email} = req.body
	return Users
		.find({email})
		.count()
		.exec()
		.then(count => {
			if (count > 0){
				return res.json({message: 'Email has already been used to create an account'})
			}
			else {
				return res.json({message: 'Valid email'})
			}
		})
})

//this api hook allows a new user to be posted to the user collection in the database
userRouter.post('/', (req, res) => {
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
			return res.status(201).json({redirect: '/login/index.html', user: user.userRepr()})
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'})
		})
})


//put hook that allows for user object to be updated
//only email, password, first name, last name, and priority expiration settings can be updated
userRouter.put('/:id', (req, res) => {
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

		// updates all expiration dates for entries when user updates priority expiry 
	if(toUpdate.priorityExpiry !== undefined){
		Users
			.findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
			.exec()
			.then(res => {
				return res.journalId
			})
			.then(journalId => {
				Entry
					.find({journalId: journalId})
					.exec()
					.then(res => {
						let journalId = res[0].journalId
						res.forEach(entry => {
							let priority = entry.priority
							let entryId = entry._id
							let addDate = new Date(entry.addDate)
							
							let priorityExpiry = toUpdate.priorityExpiry[priority]
							
							let expiry = addDays(addDate, priorityExpiry)

							toUpdate.expiry = new Date(expiry)

							Entry
								.findByIdAndUpdate(entryId, {$set: toUpdate}, {new: true})
								.exec()
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
userRouter.delete('/:id', authorize, (req, res) => {
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
				.exec()
		})
		.then(() => {
			console.log(`Deleted user ${req.params.id}`)
				res.status(204).end()
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}))
})

module.exports = userRouter