const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const expect = chai.expect

chai.use(chaiHttp)

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const faker = require('faker')

const {TEST_DATABASE_URL} = require('../config')
const {app, runServer, closeServer} = require("../server.js")
const {Users} = require('../models')


function seedUserData(){
	console.info('creating test database of users with journal entries')
	const seedData = []

	for (let i = 1; i <= 10; i++){
		seedData.push(generateUserData())
	}

	return Users.insertMany(seedData)
}

function generateUserData(){
	return {
		user: {firstName: generateFirstName(),
				lastName: generateLastName()
			},
		email: generateEmail(),
		password: generatePassword(),
		joinDate: generateDate(),
		journalId: generateJournalId(),
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
	return faker.date.recent()
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

	afterEach(() => {
		return tearDownDb()
	})

	after(() => {
		return closeServer()
	})

	describe('Get endpoint', () => {

		it('should return all existing users', () => {
			let res;
			return chai.request(app)
				.get('/users')
				.then(_res => {
					res = _res;
					
					let users = res.body.users

					res.should.have.status(200)
					res.body.should.be.an('object')
					res.body.users.should.have.length.of.at.least(1)
					

					users.forEach((user) => {
						let entries = user.entries

						user.id.should.be.a('string')
						user.user.should.be.a('string')
						user.email.should.be.a('string')
						user.joinDate.should.be.a('string')
						user.journalId.should.be.a('string')
						user.priorityExpiry.should.be.a('object')
						user.priorityExpiry.should.include.keys('high', 'medium', 'low')

						// entries.forEach((entry) =>{

						// 	entry.id.should.be.a('string')
						// 	entry.title.should.be.a('string')
						// 	entry.link.should.be.a('string')
						// 	entry.name.should.be.a('string')
						// 	entry.priority.should.be.a('string')
						// 	expect(['high', 'medium', 'low']).to.include(entry.priority)
						// 	entry.date.should.be.a('string')
						// 	entry.expiry.should.be.a('string')

						// 	let expiryDate = new Date(entry.expiry)
						// 	let createdDate = new Date(entry.date)

						// 	if (entry.priority == 'high'){
						// 		(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.high)
						// 	}
						// 	else if (entry.priority == 'medium'){
						// 		(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.medium)
						// 	}
						// 	else if (entry.priority == 'low'){
						// 		(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.low)
						// 	}
						// })
					})

					return Users.count()
				})
				.then(count => {
					res.body.users.should.have.length.of.at.most(count)
					res.body.users.should.have.length.of.at.least(count)
				})
		}) //this is just a test, will not be in production
	})

	describe('POST endpoint', () => {
		it('should add new user on POST to /users', () => {
			let date = new Date(Date.now()).toString()
			const newUser = {
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName(), 
				email: generateEmail(),
				password: generatePassword(),
				journalId: generateJournalId(),
				joinDate: date
			}

			return chai.request(app)
				.post('/users')
				.send(newUser)
				.then(function(res){
					console.log(newUser.joinDate)
					res.should.have.status(201)
					res.should.be.json
					res.body.should.be.a('object')
					res.body.should.include.keys('user', 'email', 'id', 'journalId', 'joinDate')
					res.body.id.should.not.be.null
					res.body.should.eql({user: newUser.firstName + " " + newUser.lastName, email: newUser.email, journalId: newUser.journalId, id: res.body.id, joinDate: newUser.joinDate})
				})
		})
	})

	describe('PUT endpoint', () => {
		it('should update user fields on PUT', ()=> {
			const updateUser = {
				'user': {'firstName': 'Matt',
				'lastName': 'Peebles'},
				'email': 'testemail1@test.com',
				'password': 'pseudorandompassword'
			}
			return chai.request(app)
				.get('/users')
				.then((res)=>{
					updateUser.id = res.body.users[0].id
					return chai.request(app)
						.put(`/users/${updateUser.id}`)
						.send(updateUser)
				})
				.then((res)=>{
					res.should.have.status(201)
					res.body.should.be.a('object')
					res.body.should.deep.equal({id: updateUser.id, user: updateUser.user.firstName + " " + updateUser.user.lastName, email: updateUser.email, joinDate: res.body.joinDate, journalId: res.body.journalId, priorityExpiry: res.body.priorityExpiry})
				})
		})
	})
})