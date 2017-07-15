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
const {Users} = require('../models')


//fills test database with 10 fake users
function seedUserData(){
	console.info('creating test database of users with journal entries')
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

	afterEach(() => {
		return tearDownDb()
	})

	after(() => {
		return closeServer()
	})

	describe('Get endpoint', () => {

		it('should return authorized user on GET', () => {
				// this variable is required in order to make an authorized get request on users/me
			const newUser = {
						user: {
							firstName: 'Matt',
							lastName: 'Peebles'
						}, 
						email: 'testemail@test.com',
						password: 'yolo',
						journalId: generateJournalId(),
						joinDate: new Date(Date.now()),
						priorityExpiry: {'high': 2, 'medium': 4, 'low': 7}
					}
			let res;
			let BasicAuthToken = 'Basic ' + btoa(newUser.email + ':' + newUser.password) //authorization header value

			return chai.request(app)
				// posts newUser to users
				.post('/users')
				.send(newUser)
				.then((res) => {
					//these tests ensures new user was properly posted
					res.should.have.status(201)
					res.should.be.a('object')
					res.body.id.should.not.be.null
					res.body.email.should.be.equal('testemail@test.com')
					
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
				err.should.have.status(401)
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
			return chai.request(app)
				Users
					.findOne()
					.exec()
					.then((res)=>{
						updateUser.id = res.body.users[0].id
						return chai.request(app)
							.put(`/users/${updateUser.id}`)
							.send(updateUser)
					})
					.then((res)=>{
						res.should.have.status(201)
						res.body.should.be.a('object')
						res.body.should.deep.equal({id: updateUser.id, user: updateUser.user.firstName + ' ' + updateUser.user.lastName, email: updateUser.email, joinDate: res.body.joinDate, journalId: res.body.journalId, priorityExpiry: updateUser.priorityExpiry})
					})
		})
	})

	describe('DELETE endpoint', ()=> {
		it('should delete user on DELETE', () => {
			return chai.request(app)
				Users
					.findOne()
					.exec()
					.then((res) => {
						let deleteUserId = res.body.users[0].id
						return chai.request(app)
							.delete(`/users/${deleteUserId}`)
					})
					.then((res) => {
						res.should.have.status(204)
					})
		})
	})
})