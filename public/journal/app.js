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


	// Get journal entries
// *********************************** //
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
// *********************************** //


	// Mock post journal entries
// *********************************** //
	function addJournalEntryForm(){
		let formTemplate = "<div id=\"newLinkFormDiv\">" +
								"<form id=\"newLinkform\">" +
									"<label>Title</label>" +
									"<input type=\"text\" name=\"title\" placeholder=\"Title\" id=\"linkTitle\"></input>" +
									"<label>Link</label>" +
									"<input type=\"text\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\"></input>" +
									"<label>Priority</label>" +
									"<select name=\"priority\" id=\"linkPriority\">" +
										"<option value=\"high\">High</option>" +
										"<option value=\"medium\">Medium</option>" +
										"<option value=\"low\">Low</option>" +
									"<input type=\"submit\" name=\"submit\" id=\"newLinkFormSubmit\"></input>" +
								"<form>" +
							"</div>";

		$('#newLink').on('click', () => {
			$('#linkSection').prepend(formTemplate)
		})
	}

	function postJournalEntry(){
		$("#linkSection").on('click', '#newLinkFormSubmit', (event) => {
			event.preventDefault();

			let title = $('#linkTitle').val()
			let url = $('#linkUrl').val()
			let priority = $('#linkPriority').val()
			let randId = Math.floor(100000 + Math.random() * 900000)

			let newLink = {
				'id': randId,
				'title': title,
				'priority': priority,
				'link': url,
				'user': 'john doe',
				'date': Date.now
			}


			MOCK_JOURNAL_ENTRIES["journalEntries"].push(newLink)

			getAndDisplayJournalEntries()

			$('#newLinkFormDiv').remove()


		})
	}
// *********************************** //




$(() => {
	getAndDisplayJournalEntries()
	addJournalEntryForm()
	postJournalEntry()
})