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

function getJournalEntries(callback){
	setTimeout(() => {callback(MOCK_JOURNAL_ENTRIES)}, 100)
}

function displayJournalEntries(data){
	for (index in data.journalEntries) {
		let entry = data.journalEntries[index]
		if (entry.priority == 'high'){
			$('#highPriority').append(
				'<p>' + '<a href=\"' + entry.link + '\">' + entry.title + '<a/></p>')
		}
		else if(entry.priority == 'medium'){
			$('#medPriority').append(
				'<p>' + '<a href=\"' + entry.link + '\">' + entry.title + '<a/></p>')
		}
		else if(entry.priority == 'low'){
			$('#lowPriority').append(
				'<p>' + '<a href=\"' + entry.link + '\">' + entry.title + '<a/></p>')
		}
	}
}

function getAndDisplayJournalEntries(){
	getJournalEntries(displayJournalEntries)
}

$(() => {
	getAndDisplayJournalEntries()
})