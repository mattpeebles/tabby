const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const expect = chai.expect

const btoa = require('btoa') //used to generate proper authorization header format is Basic email:unhashedpassword

chai.use(chaiHttp)

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const faker = require('faker')

const {TEST_DATABASE_URL} = require('../config')
const {app, runServer, closeServer} = require('../server.js')
const {Users, Entry} = require('../models')

const {addDays, nowDate} = require('../resources/date-module')

let journalIdArray = []
let priorityExpiryArray = []


//fills test database with 10 fake users
function seedUserData(){
	console.info('creating test database of users')
	const seedData = []

	for (let i = 1; i <= 10; i++){
		seedData.push(generateUserData())
	}

	return Users.insertMany(seedData)
}

	//creates faked data to be used
	//in seedUserData function
//*********************************//
	function generateUserData(){

		let journalId = generateJournalId()
		journalIdArray.push(journalId)

		let priorityExpiry = generatePriorityExpiry()
		priorityExpiryArray.push(priorityExpiry)

		return {
			user: {firstName: generateFirstName(),
					lastName: generateLastName()
				},
			email: generateEmail(),
			password: generatePassword(),
			joinDate: generateDate(),
			journalId: journalId,
			priorityExpiry: generatePriorityExpiry()
		}
	}

	function generateFirstName(){
		return faker.name.firstName()
	}

	function generateLastName(){
		return faker.name.lastName()
	}

	function generateEmail(){
		return faker.internet.email()
	}

	function generateDate(){
		return nowDate()
	}

	function generatePassword(){
		return faker.internet.password()
	}

	function generateJournalId(){
		return faker.random.word() + faker.random.word() + faker.random.word()
	}

	function generatePriorityExpiry(){
		return {high: faker.random.number(), medium: faker.random.number(), low: faker.random.number()}
	}
//*********************************//

	//creates Entry Database
//*********************************//
	function seedEntryData(){
		console.info('creating test database of entries')
		const seedData = []
		
		for (let i = 0; i < 20; i++){
			seedData.push(generateEntry())
		}

		return Entry.insertMany(seedData)
	}

	function generateEntry(){

		let addDate = generateDate()
		let priorityExpiry = priorityExpiryArray[0]
		let priority = generatePriority()
		
		let expiry;

		let entries = {
			journalId: journalIdArray[0],
			title: generateTitle(),
			link: generateLink(),
			entryId: faker.random.uuid().toString(),
			priority: priority,
			addDate: addDate,
			expiry: generateExpiry(priority, addDate, priorityExpiry),
		}

		return entries
	}


	function generateTitle(){
		return faker.random.words()
	}

	function generateLink(){
		return faker.internet.url()
	}

	function generatePriority(){
		let priorityArray = ['high', 'medium', 'low']
		let priority = priorityArray[Math.floor(Math.random() * priorityArray.length)]
		return priority
	}

	function generateExpiry(priority, addDate, priorityExpiry){
		let expiry;

		let highExpiry = addDays(addDate, priorityExpiry.high)
		let medExpiry = addDays(addDate, priorityExpiry.medium)
		let lowExpiry = addDays(addDate, priorityExpiry.low)

		if (priority == 'high'){
			expiry = highExpiry
		}
		else if(priority == "medium"){
			expiry = medExpiry
		}
		else if(priority == 'low'){
			expiry = lowExpiry
		}

		return expiry
	}
//*********************************//


	//deletes test database 
function tearDownDb(){
	return new Promise((resolve, reject) => {
		console.warn('Deleting test database')
		return mongoose.connection.dropDatabase()
			.then(result => resolve(result))
			.catch(err => reject(err))
	})
}

describe('Users API resource', () => {
	before(() => {
		console.info(`Opening test server at ${TEST_DATABASE_URL}`)
		return runServer(TEST_DATABASE_URL)
	})

	beforeEach(() => {
		return seedUserData()
	})

	beforeEach(() => {
		return seedEntryData()
	})

	afterEach(() => {
		journalIdArray = []
		priorityExpiryArray = []
		return tearDownDb()
	})

	after(() => {
		return closeServer()
	})

	describe('Get endpoint', () => {

		it('should return authorized user on GET', () => {
				// this variable is required in order to make an authorized get request on users/me
			let joinDate = nowDate

			const newUser = {
						user: {
							firstName: 'Matt',
							lastName: 'Peebles'
						}, 
						email: 'testemail@test.com',
						password: 'yolo',
						journalId: generateJournalId(),
						joinDate: joinDate,
						priorityExpiry: {'high': 2, 'medium': 4, 'low': 7}
					}
			let res;

			let agent = chai.request.agent(app)

			return chai.request(app)
				// posts newUser to users
				.post('/users')
				.send(newUser)
				.then((res) => {
					return agent.post('/login')
						.send({email: newUser.email, password: newUser.password})
						.then(res => {
							return agent.get('/users/me')
								.then(_res => {
									res = _res
									let user = res.body.user
				
									res.should.have.status(200)
									res.should.be.json
									user.id.should.be.a('string')
									user.user.should.be.a('string')
									user.user.should.be.equal(`${newUser.user.firstName} ${newUser.user.lastName}`)
									user.email.should.be.a('string')
									user.email.should.be.equal(`${newUser.email}`)
									user.joinDate.should.be.a('string')
									user.journalId.should.be.a('string')
									user.journalId.should.be.equal(`${newUser.journalId}`)
									user.priorityExpiry.should.be.a('object')
									user.priorityExpiry.should.include.keys('high', 'medium', 'low')
									user.priorityExpiry.should.deep.equal(newUser.priorityExpiry)
								})
						})
					
					return chai.request(app)
						//tests ensures that get users/me properly validates authorization header
						//and provides user data
						.get('/users/me')
						.set('Authorization', BasicAuthToken)					
						.then(_res => {
							res = _res
							let user = res.body.user
							res.should.have.status(200)
							res.should.be.json
							user.id.should.be.a('string')
							user.user.should.be.a('string')
							user.email.should.be.a('string')
							user.joinDate.should.be.a('string')
							user.journalId.should.be.a('string')
							user.priorityExpiry.should.be.a('object')
							user.priorityExpiry.should.include.keys('high', 'medium', 'low')
						})
				})
		});
	})

	it('should reject unauthorized user on GET', () => {
			//ensures bad request returns unauthorized status
		return chai.request(app)
			.get('/users/me')
			.then(res => {
				return res
			})
			.catch(err => {
				err.should.have.status(403)
				err.message.should.be.equal('Forbidden')
			})
	})


	describe('POST endpoint', () => {
		it('should add new user on POST', () => {
			let date = new Date(Date.now()).toString()
			const newUser = {
				user: {
					firstName: generateFirstName(),
					lastName: generateLastName()
				}, 
				email: generateEmail(),
				password: generatePassword(),
				journalId: generateJournalId(),
				joinDate: date,
				priorityExpiry: generatePriorityExpiry()
			}

			return chai.request(app)
				.post('/users')
				.send(newUser)
				.then(function(res){
					res.should.have.status(201)
					res.should.be.json
					res.body.should.be.a('object')
					res.body.should.include.keys('user', 'email', 'id', 'journalId', 'joinDate', 'priorityExpiry')
					res.body.id.should.not.be.null
					res.body.should.eql({user: newUser.user.firstName + ' ' + newUser.user.lastName, email: newUser.email, journalId: newUser.journalId, id: res.body.id, joinDate: newUser.joinDate, priorityExpiry: newUser.priorityExpiry})
				})
		})
	})

	describe('PUT endpoint', () => {
		it('should update user fields on PUT', ()=> {
			const updateUser = {
				'user': {
							'firstName': 'Matt',
							'lastName': 'Peebles'
						},
				'email': 'testemail1@test.com',
				'password': 'pseudorandompassword',
				'priorityExpiry': {'high': 3, 'medium': 7, 'low': 11}
			}
			return Users
					.findOne()
					.exec()
					.then((res)=>{
						updateUser.id = res.id
						return chai.request(app)
							.put(`/users/${updateUser.id}`)
							.send(updateUser)
					})
					.then((res)=>{
						res.should.have.status(200)
						res.body.should.be.a('object')
						res.body.should.deep.equal({id: updateUser.id, user: updateUser.user.firstName + ' ' + updateUser.user.lastName, email: updateUser.email, joinDate: res.body.joinDate, journalId: res.body.journalId, priorityExpiry: res.body.priorityExpiry})
					})
		});

		it('should update priorityExpiry and all user entries expiry on PUT', () => {
			const updateUser = {
				'priorityExpiry': {'high': 2, 'medium': 5, 'low': 7}
			}

			return Users
				.find({journalId: journalIdArray[0]})
				.exec()
				.then((res) => {
					let journalId = res[0].journalId
					updateUser.id = res[0].id
						return chai.request(app)
							.put(`/users/${updateUser.id}`)
							.send(updateUser)
				})
				.then(res => {
					let journalId = res.body.journalId
						return Entry
							.find({journalId: journalId})
							.exec()
							.then(res => {
								res.forEach(entry => {
									entry.journalId.should.be.a('string')
									entry.entryId.should.be.a('string')
									entry.title.should.be.a('string')
									entry.priority.should.be.a('string')

									
									let priorityExpiry = priorityExpiryArray[0]
									let expiryDate = new Date(entry.expiry)
									let addDate = new Date(entry.addDate)
									let dateDiff = Math.round((expiryDate.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))

									switch(entry.priority){
										case 'high': 
											(dateDiff).should.equal(priorityExpiry.high) 
											break;
										case 'medium': 
											(dateDiff).should.equal(priorityExpiry.medium) 
											break;
										case 'low': 
											(dateDiff).should.equal(priorityExpiry.low) 
											break;
									}
								})
							})
				})
		})
	})

	describe('DELETE endpoint', ()=> {
		it('should delete user and associated journal on DELETE', () => {
			let journalId;
			
			return Users
					.findOne()
					.exec()
					.then((res) => {
						let deleteUserId = res.id
						journalId = res.journalId
						return chai.request(app)
							.delete(`/users/${deleteUserId}`)
					})
					.then((res) => {
						res.should.have.status(204)
					})
		})
	})
})