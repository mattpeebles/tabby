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
	let name = generateName()

	return {
		user: name,
		email: generateEmail(),
		password: generatePassword(),
		date: generateDate(),
		journalEntries: generateJournalEntries(name)
	}
}

function generateName(){
	return {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
	}
}

function generateEmail(){
	return faker.internet.email()
}

function generateDate(){
	return faker.date.recent()
}

function generateJournalEntries(name){
	let priorityArray = ['high', 'medium', 'low']

	function addDays(startDate, numberOfDays){
		var returnDate = new Date(
								startDate.getFullYear(),
								startDate.getMonth(),
								startDate.getDate() + numberOfDays,
								startDate.getHours(),
								startDate.getMinutes(),
								startDate.getSeconds());
		return returnDate;
	}

	let addDate = generateDate()

	let priority = priorityArray[Math.floor(Math.random()*priorityArray.length)]

	let priorityExpiry = {high: faker.random.number(), medium: faker.random.number(), low: faker.random.number()}

	let highExpiry = addDays(addDate, priorityExpiry.high)
	let medExpiry = addDays(addDate, priorityExpiry.medium)
	let lowExpiry = addDays(addDate, priorityExpiry.low)

	let expiry;

	if (priority == 'high'){
		expiry = highExpiry
	}
	else if(priority == "medium"){
		expiry = medExpiry
	}
	else if(priority == 'low'){
		expiry = lowExpiry
	}

	let entries = {
		id: faker.random.uuid().toString(),
		title: faker.random.words(),
		link: faker.internet.url(),
		name: name.firstName + " " + name.lastName,
		priority: priority,
		date: addDate,
		expiry: expiry,
		priorityExpiry: priorityExpiry
	}

	return entries
}

function generatePassword(){
	return faker.internet.password()
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
						user.date.should.be.a('string')

						entries.forEach((entry) =>{

							entry.id.should.be.a('string')
							entry.title.should.be.a('string')
							entry.link.should.be.a('string')
							entry.name.should.be.a('string')
							entry.priority.should.be.a('string')
							expect(['high', 'medium', 'low']).to.include(entry.priority)
							entry.date.should.be.a('string')
							entry.expiry.should.be.a('string')
							entry.priorityExpiry.should.be.a('object')
							entry.priorityExpiry.should.include.keys('high', 'medium', 'low')

							let expiryDate = new Date(entry.expiry)
							let createdDate = new Date(entry.date)

							if (entry.priority == 'high'){
								(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.high)
							}
							else if (entry.priority == 'medium'){
								(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.medium)
							}
							else if (entry.priority == 'low'){
								(Math.round((expiryDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(entry.priorityExpiry.low)
							}
						})
					})

					return Users.count()
				})
				.then(count => {
					res.body.users.should.have.length.of.at.most(count)
					res.body.users.should.have.length.of.at.least(count)
				})
		}) //this is just a test, will not be in production
	})
})