const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const {app} = require("../server.js")

chai.use(chaiHttp)


describe('Initial test of server', () => {
	it('should provide 200 status code and html', () => {
		return chai.request(app)
			.get('/')
			.then(_res => {
				res = _res;
				res.should.have.status(200)
				res.should.be.html
			})
	})
})