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
		return {high: faker.random.number(), medium: faker.random.number(), low: faker.random.number()}
	}
//*********************************//


	//creates Entry Database
//*********************************//
	function seedEntryData(){
		console.info('creating test database of entries')
		const seedData = []
		for (let i = 1; i <= 10; i++){
			seedData.push(generateEntry())
		}
		return Entry.insertMany(seedData)
	}

	function generateEntry(){
		let randIndex = Math.floor((Math.random()*(8-0)) + 0)

		let addDate = generateDate()
		let priorityExpiry = priorityExpiryArray[randIndex]
		let priority = generatePriority()
		
		let expiry;

		let entries = {
			journalId: journalIdArray[randIndex],
			title: generateTitle(),
			link: generateLink(),
			entryId: faker.random.uuid().toString(),
			priority: priority,
			addDate: addDate,
			expiry: generateExpiry(priority, addDate, priorityExpiry),
		}

		return entries
	}

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

		describe('Get endpoint', () => {
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
				let randIndex = Math.floor(Math.random()*(9-0)) + 0
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
						
						if (res.body.entries === undefined){
							res.should.have.status(200)
							res.should.be.json
							res.body.message.should.be.equal('You have no links saved')			
						}
						else {
							entries.should.be.a('array')
						
							entries.forEach(entry => {
								entry.journalId.should.be.equal(journalId)
								entry.entryId.should.be.a('string')
								entry.link.should.be.a('string')
								entry.title.should.be.a('string')
								entry.priority.should.be.a('string')
								entry.addDate.should.be.a('string')
								entry.expiry.should.be.a('string')

								
								//need to determine a better way to test below

								//maybe -> let testExpiry = addDays(entry.addDate, entry.priority)

								let expiry = new Date(entry.expiry)
								let addDate = new Date(entry.addDate)

								let dateDiff = Math.round((expiry.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24))
							
								
								if (entry.priority == 'high'){
									(dateDiff).should.equal(priorityExpiry.high)
								}
								else if (entry.priority == 'medium'){
									(dateDiff).should.equal(priorityExpiry.medium)
								}
								else if (entry.priority == 'low'){
									(dateDiff).should.equal(priorityExpiry.low)
								}
							})
						}
					})
			})

			it('should return a json message for a user with no entries', () => {
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

		describe('POST endpoint', () => {
			it('should add entry on user\'s journal', () => {
				
				const newEntry = generateEntry()

				return chai.request(app)
					.post('/entry')
					.send(newEntry)
					.then(res => {
						console.log(typeof newEntry.addDate)
						res.should.have.status(201)
						res.body.journalId.should.be.a('string')
						res.body.journalId.should.be.equal(newEntry.journalId)
						res.body.entryId.should.be.a('string')
						res.body.title.should.be.a('string')
						res.body.title.should.be.equal(newEntry.title)
						res.body.priority.should.be.a('string')
						res.body.priority.should.be.equal(newEntry.priority)
						res.body.addDate.should.be.a('string')
						res.body.expiry.should.be.a('string')
			})
		})

	})
})