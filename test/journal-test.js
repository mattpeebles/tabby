const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const expect = chai.expect()

chai.use(chaiHttp)

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const faker = require('faker')

const {TEST_DATABASE_URL} = require('../config')
const {app, runServer, closeServer} = require('../server')
const {Users, Entry} = require('../models')


let journalIdArray = [] //array is filled with ids from user Database
 
let priorityExpiryArray = []


	//creates User Database
//*********************************//
	function seedUserData(){
		console.info('creating test database of users')
		const seedData = []

		for (let i = 1; i <= 10; i++){
			seedData.push(generateUserData())
		}

		return Users.insertMany(seedData)
	}

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
			priorityExpiry: priorityExpiry
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
		return {high: Math.floor(Math.random() * (5 - 1 + 1)) + 1, medium: Math.floor(Math.random() * (9 - 4 + 1)) + 4, low: Math.floor(Math.random() * (10 - 7 + 1)) + 7}
	}
//*********************************//


	//creates Entry Database
//*********************************//
	function seedEntryData(){
		console.info('creating test database of entries')
		const seedData = []
		for (let i = 1; i <= 30; i++){
			seedData.push(generateEntry())
		}
		return Entry.insertMany(seedData)
	}

	function generateEntry(){
		let priorityArray = ['high', 'medium', 'low']
		let randIndex = Math.floor((Math.random()*(8-0)) + 0)

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

		let priority = priorityArray[Math.floor(Math.random() * priorityArray.length)]

		let priorityExpiry = priorityExpiryArray[randIndex]

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
			journalId: journalIdArray[randIndex],
			title: faker.random.words(),
			link: faker.internet.url(),
			entryId: faker.random.uuid().toString(),
			priority: priority,
			addDate: addDate,
			expiry: expiry,
		}

		return entries
	}
//*********************************//


function tearDownDb(){
	return new Promise((resolve, reject) => {
		console.warn('Delete test database')
		return mongoose.connection.dropDatabase()
		.then(result => resolve(result))
		.catch(err => reject(err))
	})
}

	describe('Entry API resource', () => {
		before(() => {
			console.info(`Opening test database at ${TEST_DATABASE_URL}`)
			return runServer(TEST_DATABASE_URL)
		})
		beforeEach(() => {
			return seedUserData()
		})
		beforeEach(() => {
			return seedEntryData()

		})
		afterEach(() => {
			return tearDownDb()
		})
		after(() => {
			console.info('Closing test database')
			return closeServer()
		})

		describe('Get resource', () => {
			it('should return a list of all entries in database on GET', ()=> {
				let res;
				return chai.request(app)
					.get('/entry')
					.then(_res => {
						res = _res
						res.should.have.status(200)
						res.body.entries.should.have.length.of.at.least(1)
					})
			})

			it('should return a list of entries specific to user', () =>{
				let randIndex = Math.floor((Math.random()*8-0) + 0)
				let journalId = journalIdArray[randIndex]
				let priorityExpiry = priorityExpiryArray[randIndex]
				let res;
				return chai.request(app)
					.get(`/entry/${journalId}`)
					.then(_res => {
						res = _res
						let entries = res.body.entries
						res.should.have.status(200)
						res.should.be.json
						entries.should.be.a('array')
					
						entries.forEach(entry => {
							console.log(entry)
							entry.journalId.should.be.equal(journalId)
							entry.entryId.should.be.a('string')
							entry.link.should.be.a('string')
							entry.title.should.be.a('string')
							entry.priority.should.be.a('string')
							entry.addDate.should.be.a('string')
							entry.expiry.should.be.a('string')

							let expiryDate = new Date(entry.expiry)
							let addDate = new Date(entry.addDate)

							if (entry.priority == 'high'){
								(Math.round((expiryDate.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(priorityExpiry.high)
							}
							else if (entry.priority == 'medium'){
								(Math.round((expiryDate.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(priorityExpiry.medium)
							}
							else if (entry.priority == 'low'){
								(Math.round((expiryDate.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))).should.equal(priorityExpiry.low)
							}
						})
					})
			})

			it('should return a json message for a new user', () => {
				let journalId = journalIdArray[9]
				let priorityExpiry = priorityExpiryArray[9]
					return chai.request(app)
						.get(`/entry/${journalId}`)
						.then(res => {
							res.should.have.status(200)
							res.should.be.json
							res.body.message.should.be.equal('You have no links saved')
						})
			})
		})
	})