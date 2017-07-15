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

const MOCK_USER_DATA = {
	"users": [
				{
					'firstName': "Isabella",
					"lastName": "Johannason",
					"email": "testemail@email.com",
					"password": "pseudohashedpassword",
					"journalEntries": MOCK_JOURNAL_ENTRIES.journalEntries
				},
				{
					'firstName': "Heather",
					"lastName": "Gray",
					"email": "testemail1@email.com",
					"password": "pseudohashedpassword",
					"journalEntries": MOCK_JOURNAL_ENTRIES.journalEntries
				},
				{
					'firstName': "Geoffrey",
					"lastName": "Lucas",
					"email": "testemail2@email.com",
					"password": "pseudohashedpassword",
					"journalEntries": MOCK_JOURNAL_ENTRIES.journalEntries
				},
				{
					'firstName': "Ezra",
					"lastName": "Wild",
					"email": "testemail3@email.com",
					"password": "pseudohashedpassword",
					"journalEntries": MOCK_JOURNAL_ENTRIES.journalEntries
				},
			]
		};



function signIn(){
	$('#logIn').on('click', (event) => {
		event.preventDefault()

		let data = $('#signInForm').serializeArray().reduce((obj, item) => {
				obj[item.name] = item.value

			return obj
		}, {})

		let userData; 

		MOCK_USER_DATA["users"].forEach((user) => {
			if (data.email === user.email){
				if(data.password === user.password){
					userData = {
						'firstName': user.firstName,
						'lastName': user.lastName,
						'email': user.email,
						'journalEntries': user.journalEntries
					}
				}
			}
		})

		if (userData !== undefined){
			console.log(userData)
		}
		else{
			console.log('Sorry, we could not match the information provided')
		}
	})
}


$(() => {
	signIn()
})