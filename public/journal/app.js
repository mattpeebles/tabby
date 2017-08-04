// const isUrl = require('is-url') //validates url
const windowURL = window.location.origin

	// Get journal entries
// *********************************** //
	function getJournalEntries(callback){
		$.ajax({
			type: 'get',
			url: windowURL + '/entry/entries',
			success: function(data){
				callback(data)
			},
			error: function(err){
				window.location.href = windowURL + '/login'
			}
		})
	}

	
		//displays journal entries in correct location on DOM
		//depending on priority
	function displayJournalEntries(data){
			//if user has no entries in journal, it renders
			//a message saying such
		if (data.message){
			$('.priorityDiv').remove()
			$('#highPriority').remove()
			$('#medPriority').remove()
			$('#lowPriority').remove()
			let messageHTMl = 	'<div id=\"noEntryContainer\">' +
									'<div id=\'emptyMessage\'>' +
										'<p class=\"titleFont\">Tabby has a clean house</p>' +
									'</div>' +
									'<div id="linkButtonContainer">' +
										'<button type=\"button\" class=\"btn btn-variant btn-lg\" id=\'newLinkEmpty\'>Add An Entry</button>' +
									'</div>' +
								'</div>'


			$('#mediumSection').append(messageHTMl)
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
				let expiryDateFormat = countdown(new Date(Date.now()), new Date(entry.expiry), countdown.DAYS).toString()
				let expiryDate = (expiryDateFormat == '') ? "Expires in " + countdown(new Date(Date.now()), new Date(entry.expiry), countdown.HOURS).toString() : "Expires in " + expiryDateFormat
				
				if(Date.parse(new Date(entry.expiry))-Date.parse(new Date())<0){
					   expiryDate = 'Expires tonight'
				}

				let entryHtml = `<div class='postContainer col-xs-12 col-sm-6 col-lg-4 normal-font'>` + 
									'<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
										'<p class=\"linkTitle title-font\" value=\"' + entry.priority + '\">' + entry.title + '</p>' +
										`<a class="url" href='${entry.link}'><span class='linkSpan'></span></a>` +
										`<div class="postImage">` +
											`<img src='${entry.image}'></img>` +
										`</div>` +
										`<div class="infoRow row">` +
											`<div class="col-xs-6">` +
												`<p class='pull-left expiryDate'>${expiryDate}</p>` + 
											`</div>` +
											`<div class='manipGroup btn-group col-xs-6' role='group' aria-label='...'>` +
													'<span class=\"delete pull-right glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>' + 
													'<span class=\"edit pull-right glyphicon glyphicon-edit\" aria-hidden=\"true\"></span>' +
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
					highCounter = 1
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
	
	function formatError(){
		let elementArray = ['#linkUrl']

			elementArray.forEach(element => {
				if ($(element).hasClass('error')){
						let failureHtml =   
							  `<span class="glyphicon glyphicon-remove form-control-feedback feedback error" aria-hidden="true"></span>` +
							  `<span id="inputError2Status" class="sr-only feedback">(error)</span>`

						let parent = $(element).parent()
						$(element).removeClass('valid')
						$(parent).children('.feedback').remove()
						$(parent).removeClass('has-success').addClass('has-danger')
						$(parent).append(failureHtml)  
				}
			}) 
	}

	function displayError(){
		$('input').on('keydown', () => {
			setTimeout(formatError, 100)
		})
	}


	function validateForm(){
	

	$('#newLinkForm').validate({
		rules: {
			link: {
				required: true,
				url: true,
				normalizer: function(value){
					
						// determines if link has http:// or https://, if not, adds http:// for validation
					if(value.indexOf("http://") == -1 || value.indexOf("https://") == -1){
						value = 'http://' + value
						return value
					}
					else {
						return value
					}
				}
			}
		},

		// changes success messages
		success: function(label){
    		let successHtml =   
	    		`<span class="glyphicon glyphicon-ok form-control-feedback feedback" aria-hidden="true"></span>` +
	  			`<span id="inputSuccess2Status" class="sr-only feedback">(success)</span>`

	    		let parent = $(label).parent()
	    		$(parent).removeClass('has-danger').addClass('has-success')
	    		$(parent).children('.feedback').remove()
	    		$(parent).append(successHtml)
	    		$(label).remove()
       
		},
		// changes error messages
		messages: {
			link: "Please enter a valid url",
		}
	})	         
}

	function addJournalEntryForm(){
		$('body').on('click', '#newLink', () => {
			$('#newLinkFormDiv').removeClass('hidden')
			$('#newLinkFormDiv').animate({width: '+=400px'})
		})

		$('body').on('click', '#newLinkEmpty', () => {
			$('#newLinkFormDiv').removeClass('hidden')
			$('#newLinkFormDiv').animate({width: '+=400px'})
		})
	}

	function removeJournalEntryForm(){
		$('#cancelNewForm').on('click', () => {
			$('#newLinkFormDiv').animate({width: '-=400px'})
			setTimeout(() => $('#newLinkFormDiv').addClass('hidden'), 250)
		})
	}


	function postJournalEntry(){
		$("#linkSection").on('click', '#newLinkFormSubmit', (event) => {
			event.preventDefault()

			let url = $('#linkUrl').val()
			let priority = $('#linkPriority').val()


			let newLink = {
				'priority': priority,
				'link': url
			}

			$.ajax({
				type: 'POST',
				url: windowURL + '/entry',
				data: JSON.stringify(newLink),
				contentType: 'application/json',
				success: function(data){

					$('#newLinkFormDiv').empty().append(`<div id="approveDiv"><i class="material-icons">check_circle</i></div>`) 
					setTimeout(() => $('#newLinkFormDiv').animate({width: '-=400px'}), 1000)
					setTimeout(() => $('#newLinkFormDiv').addClass('hidden'), 1250)
					setTimeout(() => window.location.reload(true), 1250)
				},
				error: function (res, status, error) { 
					let parent = $('#linkUrl').parent()
					$('#linkUrl').val('').focus()
					$('#linkUrl').addClass('error')
					$(parent).append(`<label id="linkUrl-error" class="error" for="linkUrl">${res.responseJSON.message}</label>`)
					$('#linkUrl').removeClass('valid')
					$(parent).children('.feedback').remove()
					$(parent).removeClass('has-success').addClass('has-danger')
				}
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
			let title = $(parentDiv).children('.linkTitle').text()
			
			let formTemplate = "<div class=\"editForm\" id=\"editLinkFormDiv-" + linkID + "\">" +
						"<form class=\"normal-font\" id=\"editLinkForm\">" +
							`<button type="cancel" id="cancelEditForm" class="pull-right btn btn-danger btn-sm"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>` +
							"<label class=\"title-font\" id=\"editFormLabel\">Update Entry</label>" +
							"<div class=\'form-group\'>" +
								`<input type="text" name="putTitle" id="putTitle" placeholder="${title}"" class="form-control">` +
							"</div>" +
							"<div class=\'form-group\'>" +
								"<select name=\"priority\" id=\"linkPriority\" class=\"form-control\">" +
									"<option id=\"high\" value=\"high\">Gotta Read</option>" +
									"<option id=\"medium\"value=\"medium\">Will Read</option>" +
									"<option id=\"low\" value=\"low\">Interesting</option>" +
							"</div>" +
							"<div class=\'form-group\'>" +
								"<input type=\"submit\" name=\"submit\" id=\"editLinkFormSubmit\" class=\"btn btn-variant\"></input>" +
							"</div>"
						"<form>" +
					"</div>";

			let formParentDiv = "#editLinkFormDiv-" + linkID
			
				// prevents user from accidentally hitting edit multiple times
			if (!($(parentDiv).children(formParentDiv).length)){
				
					//removes any other edit forms if one already exists
				$('#linkSection').children().children().children().children().children(".editForm").remove()
				
				$(parentDiv).append(formTemplate)
				//this custom sets the selected option depending on the user's previous choice
				let priorityFormOption = formParentDiv + ' > #editLinkForm > .form-group > #linkPriority > ' + "#" + linkPriority

				$(priorityFormOption).attr("selected", 'selected')
			}
			
			updateEntryInDatabase()
		})
	}

	function updateEntryInDatabase(){
		$('#editLinkFormSubmit').on('click', function(event){
			event.preventDefault()
			
				// edit form has id of editLinkFormDiv-id,
				//splits the id on hyphen and returns database id
			let id = $(".editForm").attr('id').split('-')[1]

			let editEntry = {
				entryId: id,
				priority: $('#linkPriority').val(),
				link: $('#linkUrl').val()
			}

			if ($("#putTitle").val() !== "") {
				editEntry.title = $("#putTitle").val()
			}

			$.ajax({
				type: 'put',
				url: windowURL + '/entry/' + id,
				data: JSON.stringify(editEntry),
				contentType: 'application/json',
				success: function(){
					getAndDisplayJournalEntries()
				}
			})
		})
	}

	function cancelEditForm(){
		$('#linkSection').on('click', '#cancelEditForm', (event) => {
			event.preventDefault()
			$('.editForm').remove()
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
						url: windowURL + "/entry/" + entryId,
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
			$.ajax({
				type: 'get',
				url: windowURL + '/logout',
				success: function(data) {
					window.location.href = windowURL + data.redirect
				}
			})
		})
	}

// *********************************** //


function displayPopover(){
	$('#iconAdd').popover({content: "Add New Entry", trigger: "hover", placement: 'bottom', animation: true})
}


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
	removeJournalEntryForm()
	validateForm()
	postJournalEntry()
	addEditDeleteButtons()
	addUpdateEntriesForm()
	deleteEntryFromDataBase()
	signout()
	displayError()
	cancelEditForm()
	// displayPopover()
})
