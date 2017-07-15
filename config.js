exports.DATABASE_URL = process.env.DATABASE_URL ||
				global.DATABASE_URL ||
				'mongodb://localhost/sophon' //needs to match database name (obv)

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
							'mongodb://localhost/test-sophon'

exports.PORT = process.env.PORT || 3030