const express = require('express')
const app = express()
app.use(express.static('public'))

app.listen(process.env.PORT || 3030, () => {
	console.log(`Your app is listening on port 3030`)
})