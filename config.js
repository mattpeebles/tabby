exports.DATABASE_URL = process.env.DATABASE_URL ||
				global.DATABASE_URL ||
				'mongodb://localhost/sophon' //needs to match database name (obv)

exports.PORT = process.env.PORT || 3030