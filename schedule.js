const {DATABASE_URL, PORT} = require('./config')
const {Users, Entry} = require('./models')
const schedule = require('node-schedule')

let deleteExpiredPosts = schedule.scheduleJob('20 * * * *', function(){
	let currentDate = nowDate()

	Entry
		.find({expiry: {$lte: currentDate}})
		.exec()
		.then(entries => {
			entries.forEach(entry => {
				let id = entry.id
				Entry
					.findByIdAndRemove(id)
					.exec()
					.then(() => {
						console.log(`${entry.title} deleted`)
					})
			})
		})
		.then(() => {
			console.log('All expired entries have been deleted')
		})
})