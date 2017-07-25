const isUrl = require('is-url')

const DATABASE_URL = 'http://localhost:3030'

MOCK_JOURNAL_ENTRIES =[]

	// Get journal entries
// *********************************** //
	function getJournalEntries(callback){
		$.getJSON(DATABASE_URL + '/entry/entries', callback)
	}

	function displayJournalEntries(data){
		if (data.message){
			$('#linkSection').empty()
			let messageHTMl = '<div class=\'postDiv\'>' +
									'<p>' + data.message + '</p>' +
								'</div>';

			$('#linkSection').append(messageHTMl)
		}

		for (index in data.entries) {
			let entry = data.entries[index]
			let entryHTML = '<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
								'<p class=\"linkTitle\" value=\"' + entry.priority + '\"><a class=\"url\" href=\"' + entry.link + '\">' + entry.title + '</a></p>' +
								'<div class=\"editDiv\">' +
									'<button class=\"edit udButton hidden\">Edit</button>' +
								'</div>' +
								'<div class=\"deleteDiv\">' + 
									'<button class=\"delete udButton hidden\">Delete</button>' + 
								'</div>' +
							'</div>'


			if (entry.priority == 'high'){
				$('#highPriority').append(entryHTML)
			}
			else if(entry.priority == 'medium'){
				$('#medPriority').append(entryHTML)
			}
			else if(entry.priority == 'low'){
				$('#lowPriority').append(entryHTML)
			}
		}
	}

	function getAndDisplayJournalEntries(){
		getJournalEntries(displayJournalEntries)
	}
// *********************************** //


	// Post journal entries
// *********************************** //
	function addJournalEntryForm(){
		let formTemplate = "<div id=\"newLinkFormDiv\">" +
								"<form id=\"newLinkForm\">" +
									"<label>Title</label>" +
									"<input type=\"text\" name=\"title\" placeholder=\"Title\" id=\"linkTitle\"></input>" +
									"<label>Link</label>" +
									"<input type=\"text\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\"></input>" +
									"<label>Priority</label>" +
									"<select name=\"priority\" id=\"linkPriority\">" +
										"<option value=\"high\">High</option>" +
										"<option value=\"medium\" selected>Medium</option>" +
										"<option value=\"low\">Low</option>" +
									"<input type=\"submit\" name=\"submit\" id=\"newLinkFormSubmit\"></input>" +
									"<button type=\"cancel\">Cancel</button>" +
								"<form>" +
							"</div>";

		$('#newLink').on('click', () => {
			if(!($('#newLinkForm').length)){
				$('#linkSection').prepend(formTemplate)
			}
		})
	}


	function postJournalEntry(){
		$("#linkSection").on('click', '#newLinkFormSubmit', (event) => {

			let title = $('#linkTitle').val()
			let url =  (isUrl($('#linkUrl').val()) == true) ? $('#linkUrl').val() : "http://" + $('#linkUrl').val()
			let priority = $('#linkPriority').val()

			if (title.search(/[a-zA-Z0-9]/g) == -1){
				alert('please enter a title for your entry')
				$('#linkTitle').focus()
				return 
			}

			let newLink = {
				'title': title,
				'priority': priority,
				'link': url
			}

			$.ajax({
				type: 'POST',
				url: DATABASE_URL + '/entry',
				data: JSON.stringify(newLink),
				contentType: 'application/json'
			})

			$(".postDiv").remove()

			getAndDisplayJournalEntries()

			$('#newLinkFormDiv').remove()

			location.reload()
		})
	}

// *********************************** //

	// Put journal entries
// *********************************** //
	function addUpdateEntriesForm(){
		$("#linkSection").on('click', ".edit", function(){
			let parentDiv = $(this).parent().parent()
			let linkURL = $(parentDiv).children('.linkTitle').children('.url').attr('href')
			let linkTitle = $(parentDiv).children('.linkTitle').text()
			let linkPriority = $(parentDiv).children('.linkTitle').attr('value')
			let linkID = $(parentDiv).attr('id')

			let formTemplate = "<div class=\"editForm\" id=\"editLinkFormDiv-" + linkID + "\">" +
						"<form id=\"editLinkForm\">" +
							"<label>Title</label>" +
							"<input type=\"text\" name=\"title\" placeholder=\"Title\" id=\"linkTitle\" value=\"" + linkTitle + "\"></input>" +
							"<label>Link</label>" +
							"<input type=\"text\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\" value=\"" + linkURL + "\"></input>" +
							"<label>Priority</label>" +
							"<select name=\"priority\" id=\"linkPriority\">" +
								"<option id=\"high\" value=\"high\">High</option>" +
								"<option id=\"medium\"value=\"medium\">Medium</option>" +
								"<option id=\"low\" value=\"low\">Low</option>" +
							"<input type=\"submit\" name=\"submit\" id=\"editLinkFormSubmit\"></input>" +
							"<button type=\'cancel\' id=\'cancelEditForm\'>Cancel</button>"
						"<form>" +
					"</div>";

			let formParentDiv = "#editLinkFormDiv-" + linkID
			
				// prevents user from accidentally hitting edit multiple times
			if (!($(parentDiv).children(formParentDiv).length)){
				
					//removes any other edit forms
				$('#linkSection').children().children().children(".editForm").remove()
				
				$(parentDiv).prepend(formTemplate)
				
				//this custom sets the selected option depending on the user's previous choice
				let priorityFormOption = formParentDiv + ' > #editLinkForm > #linkPriority > ' + "#" + linkPriority
				$(priorityFormOption).attr("selected", 'selected')
			}
			
			updateEntryInDatabase()
		})
	}

	function updateEntryInDatabase(){
		$('#editLinkFormSubmit').on('click', function(event){
			
			let id = $(".editForm").attr('id').split('-')[1]

			let editEntry = {
				entryId: id,
				title: $("#linkTitle").val(),
				priority: $('#linkPriority').val(),
				link: $('#linkUrl').val()
			}

			$.ajax({
				type: 'put',
				url: DATABASE_URL + '/entry/' + id,
				data: JSON.stringify(editEntry),
				contentType: 'application/json'
			})


			$('.editForm').remove()
			removeEditDeleteButtons()

			$(".postDiv").remove()

			getAndDisplayJournalEntries()

		})
	}
// *********************************** //

	// Delete journal entries
// *********************************** //
	function deleteEntry(data){
		$('#linkSection').on('click', '.delete', function(){
			let parentDiv = $(this).parent().parent()
			let entryId = $(parentDiv).attr('id')


			$.ajax({
				type: 'delete',
				url: DATABASE_URL + "/entry/" + entryId
			})



			removeEditDeleteButtons()
			$(".postDiv").remove()
			getAndDisplayJournalEntries()

		})
	}

	function deleteEntryFromDataBase(){
		deleteEntry(MOCK_JOURNAL_ENTRIES)
	}
// *********************************** //

	// Signout
// *********************************** //
	function signout(){
		$('#logOut').click((event) => {
			if(confirm('Log out?')){
				$.ajax({
					type: 'get',
					url: DATABASE_URL + '/logout',
					success: function(data) {
						alert(data.message)
						window.location.href = data.redirect
					}
				})
			}
		})
	}

// *********************************** //



	//Add and remove edit features
// *********************************** //
	function addEditDeleteButtons(){
		$("#editLink").on('click', () => {
			$('.udButton').removeClass('hidden')
		})
	}

	function removeEditDeleteButtons(){
		$('.udButton').addClass('hidden')
	}
// *********************************** //
 
$(() => {
	getAndDisplayJournalEntries()
	addJournalEntryForm()
	postJournalEntry()
	addEditDeleteButtons()
	addUpdateEntriesForm()
	deleteEntryFromDataBase()
	signout()
})
