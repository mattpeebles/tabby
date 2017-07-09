const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const {app} = require('../server')

chai.use(chaiHttp)

const MOCK_JOURNAL_ENTRIES = {
	"journalEntries": [
		{
			'id': '111111',
			'title': 'cool page',
			'priority': 'high',
			'link': 'https://www.google.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '222222',
			'title': 'not so cool page',
			'priority': 'low',
			'link': 'https://www.bing.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '333333',
			'title': 'really really cool page',
			'priority': 'high',
			'link': 'https://www.yahoo.com',
			'user': 'john doe',
			'date': Date.now
		},
		{
			'id': '444444',
			'title': 'look at later',
			'priority': 'medium',
			'link': 'https://www.chess.com',
			'user': 'john doe',
			'date': Date.now
		},
	]
}

describe('Mock database of journal entries', () => {
	it('should return array of values', () => {
		MOCK_JOURNAL_ENTRIES.should.be.an('object')
		MOCK_JOURNAL_ENTRIES.journalEntries.should.be.an('array')
		MOCK_JOURNAL_ENTRIES.journalEntries.should.be.length(4)
		MOCK_JOURNAL_ENTRIES.journalEntries.forEach(item => {
			item.should.be.an('object')
			item.should.include.keys('id', 'title', 'priority', 'link', 'user', 'date')
			item.id.should.be.an('string')
			item.title.should.be.an('string')
			item.priority.should.be.an('string')
			item.link.should.be.a('string')
			item.user.should.be.a('string')
			item.date.should.be.a('function')
		})
	})
})

describe('Mock Get Request', () =>{
	it('should provide 200 status code and html', () => {
		chai.request(app)
			.get('/journal')
			.then(_res => {
				res = _res
				res.should.have.status(200)
				res.should.be.html
			})
	})
})

describe('Mock Post Request', () => {
	it('should add item to MOCK_JOURNAL_ENTRIES', () => {
		let mockPost = {
							"id": "324324",
							"title": "awesome vanity site",
							"priority": "high",
							"link": "https://www.vanity-cathedral.herokuapp.com",
							"user": "matt p",
							"date": Date.now

						}
		function postJournalEntry(){
			MOCK_JOURNAL_ENTRIES["journalEntries"].push(mockPost)
		}

		postJournalEntry()

		MOCK_JOURNAL_ENTRIES.should.be.an('object')
		MOCK_JOURNAL_ENTRIES.journalEntries.should.be.an('array')
		MOCK_JOURNAL_ENTRIES.journalEntries.should.be.length(5)
		MOCK_JOURNAL_ENTRIES.journalEntries.forEach(item => {
			item.should.be.an('object')
			item.should.include.keys('id', 'title', 'priority', 'link', 'user', 'date')
			item.id.should.be.an('string')
			item.title.should.be.an('string')
			item.priority.should.be.an('string')
			item.link.should.be.a('string')
			item.user.should.be.a('string')
			item.date.should.be.a('function')
		})
	})
})