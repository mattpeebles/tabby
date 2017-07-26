const isUrl = require('is-url') //validates url

const DATABASE_URL = 'http://localhost:3030'


	// Get journal entries
// *********************************** //
	function getJournalEntries(callback){
		$.getJSON(DATABASE_URL + '/entry/entries', callback)
	}

	
		//displays journal entries in correct location on DOM
		//depending on priority
	function displayJournalEntries(data){
		
			//if user has no entries in journal, it renders
			//a message saying such
		if (data.message){
			$('#linkSection').empty()
			let messageHTMl = '<div class=\'postDiv\'>' +
									'<p>' + data.message + '</p>' +
								'</div>';

			$('#linkSection').append(messageHTMl)
		}
		else {

			$('.postDiv').remove()

			let highCounter = 0
			let mediumCounter = 0
			let lowCounter = 0

			let highArray = [],
				mediumArray = [],
				lowArray = []

			let highHtml = '<div class=\"row\">'
			let mediumHtml = '<div class=\"row\">'
			let lowHtml = '<div class=\"row\">'


			for (index in data.entries) {
				let entry = data.entries[index]
				let expiryDate = countdown(new Date(Date.now()), new Date(entry.expiry), countdown.DAYS).toString()

				let entryHtml = '<div class=\'postContainer col-xs-12 col-sm-6 col-lg-4\'>' + 
									'<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
										'<p class=\"linkTitle\" value=\"' + entry.priority + '\"><a class=\"url\" href=\"' + entry.link + '\">' + entry.title + '</a></p>' +
										`<div class="postImage">` +
											`<img src='${entry.image}'></img>` +
										`</div>` +
										`<div class="infoRow row">` +
											`<div class="col-xs-6">` +
												`<p class='pull-left expiryDate'>Expires in ${expiryDate}</p>` + 
											`</div>` +
											`<div class='manipGroup btn-group col-xs-6' role='group' aria-label='...'>` +
													'<button class=\"delete pull-right udButton btn btn-default btn-xs\"><span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span></button>' + 
													'<button class=\"edit pull-right udButton btn btn-default btn-xs\"><span class=\"glyphicon glyphicon-edit\" aria-hidden=\"true\"></span></button>' +
											`</div>` +
										'</div>' +
									'</div>' +
								'</div>'


				switch(entry.priority){
					case "high": 
						highArray.push(entryHtml)

						break;
					case "medium": 
						mediumArray.push(entryHtml)

						break;
					case "low":
						lowArray.push(entryHtml)

						break;
				}
			}

			for (index in highArray){
					//finishes the div if there's less than three in the the row
				if (index == highArray.length - 1){
					highHtml += highArray[index] + "</div>"
					$('#highPriority').append(highHtml)
				}
				else if(highCounter < 3){
					highHtml += highArray[index]
					highCounter++
				}
				else if(highCounter == 3){
					highHtml += "</div>"
					$('#highPriority').append(highHtml)

					highHtml = '<div class=\"row\">'
					highHtml += highArray[index]
					highCounter = 2 //this is two because i've pushed an element right before.	
				}
			}

			for (index in mediumArray){
					//finishes the div if there's less than three in the the row
				if (index == mediumArray.length - 1){
					mediumHtml += mediumArray[index] + "</div>"
					$('#medPriority').append(mediumHtml)
				}
				else if(mediumCounter < 3){
					mediumHtml += mediumArray[index]
					mediumCounter++
				}
				else if(mediumCounter == 3){
					mediumHtml += "</div>"
					$('#medPriority').append(mediumHtml)

					mediumHtml = '<div class=\"row\">'
					mediumHtml += mediumArray[index]
					mediumCounter = 1 //this is two because i've pushed an element right before.	
				}
			}

			for (index in lowArray){
					//finishes the div if there's less than three in the the row
				if (index == lowArray.length - 1){
					lowHtml += lowArray[index] + "</div>"
					$('#lowPriority').append(lowHtml)
				}
				else if(lowCounter < 3){
					lowHtml += lowArray[index]
					lowCounter++
				}
				else if(lowCounter == 3){
					lowHtml += "</div>"
					$('#lowPriority').append(lowHtml)

					lowHtml = '<div class=\"row\">'
					lowHtml += lowArray[index]
					lowCounter = 2 //this is two because i've pushed an element right before.	
				}
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

			let url =  (isUrl($('#linkUrl').val()) == true) ? $('#linkUrl').val() : "http://" + $('#linkUrl').val() //ensures link is a url otherwise it appends http:// at the beginning
			let priority = $('#linkPriority').val()


			let newLink = {
				'priority': priority,
				'link': url
			}

			$.ajax({
				type: 'POST',
				url: DATABASE_URL + '/entry',
				data: JSON.stringify(newLink),
				contentType: 'application/json',
				success: function(data){		//not showing a successful posting, even though it does in postman and in tests
					alert('successfully posted')
					window.location.reload(true)
				},

			})
		})
	}

// *********************************** //

	// Put journal entries
// *********************************** //
	function addUpdateEntriesForm(){
		$("#linkSection").on('click', ".edit", function(){
			
			
				//grabs link information to add as placeholder in 
				//form to make editing easier for user
			let parentDiv = $(this).parent().parent().parent() //targets postDiv
			let linkPriority = $(parentDiv).children('.linkTitle').attr('value') //grabs priority of link
			let linkID = $(parentDiv).attr('id') //grabs id of link

			let formTemplate = "<div class=\"editForm\" id=\"editLinkFormDiv-" + linkID + "\">" +
						"<form id=\"editLinkForm\">" +
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
				
					//removes any other edit forms if one already exists
				$('#linkSection').children().children().children(".editForm").remove()
				
				$(parentDiv).append(formTemplate)
				
				//this custom sets the selected option depending on the user's previous choice
				let priorityFormOption = formParentDiv + ' > #editLinkForm > #linkPriority > ' + "#" + linkPriority
				$(priorityFormOption).attr("selected", 'selected')
			}
			
			updateEntryInDatabase()
		})
	}

	function updateEntryInDatabase(){
		$('#editLinkFormSubmit').on('click', function(event){
			
			
				// edit form has id of editLinkFormDiv-id,
				//splits the id on hyphen and returns database id
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
				contentType: 'application/json',
				success: function(){
					getAndDisplayJournalEntries()
					location.reload()
				}
			})
		})
	}
// *********************************** //

	// Delete journal entries
// *********************************** //
	function deleteEntry(){
		$('#linkSection').on('click', '.delete', function(){
			let parentDiv = $(this).parent().parent().parent() //targets postDiv
			let entryId = $(parentDiv).attr('id')
			let entryTitle = $(parentDiv).children('.linkTitle').text()

			if(confirm(`Are you sure you want to delete ${entryTitle}?`)){
					$.ajax({
						type: 'delete',
						url: DATABASE_URL + "/entry/" + entryId,
						success: function(){
							getAndDisplayJournalEntries()
						}
					})
			}
		})
	}

	function deleteEntryFromDataBase(){
		deleteEntry()
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
