(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `isUrl`.
 */

module.exports = isUrl;

/**
 * Matcher.
 */

var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isUrl(string){
  return matcher.test(string);
}

},{}],2:[function(require,module,exports){
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


			for (index in data.entries) {
				let entry = data.entries[index]
				let entryHTML = '<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
									'<p class=\"linkTitle\" value=\"' + entry.priority + '\"><a class=\"url\" href=\"' + entry.link + '\">' + entry.title + '</a></p>' +
									`<div class="postImage">` +
										`<img src='${entry.image}'></img>` +
									`</div>` +
									`<p class=\'expiryDate\'>${entry.expiry}</p>` +
									'<div class=\"editDiv\">' +
										'<button class=\"edit udButton hidden\">Edit</button>' +
									'</div>' +
									'<div class=\"deleteDiv\">' + 
										'<button class=\"delete udButton hidden\">Delete</button>' + 
									'</div>' +
								'</div>'


				switch(entry.priority){
					case "high": 
						$('#highPriority').append(entryHTML)
						break;
					case "medium": 
						$('#medPriority').append(entryHTML)
						break;
					case "low":
						$('#lowPriority').append(entryHTML)
						break;
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
				success: function(data){
					window.location.reload(true)
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
			let parentDiv = $(this).parent().parent() //targets postDiv
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
			let parentDiv = $(this).parent().parent()
			let entryId = $(parentDiv).attr('id')


			$.ajax({
				type: 'delete',
				url: DATABASE_URL + "/entry/" + entryId,
				success: function(){
					getAndDisplayJournalEntries()
				}
			})
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

},{"is-url":1}]},{},[2]);
