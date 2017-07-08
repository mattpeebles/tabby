const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const {app} = require('../server')

chai.use(chaiHttp)


describe('it should test journal page', () =>{
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