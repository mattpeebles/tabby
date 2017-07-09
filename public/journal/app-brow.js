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
const isUrl = require('is-url')

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
			let entryHTML = '<div class=\"postDiv\" id=\"' + entry.id + '\">' +
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
			event.preventDefault();

			let title = $('#linkTitle').val()
			let url =  (isUrl($('#linkUrl').val()) == true) ? $('#linkUrl').val() : "http://" + $('#linkUrl').val()
			let priority = $('#linkPriority').val()
			let randId = (Math.floor(100000 + Math.random() * 900000)).toString()

			console.log(title)

			if (title.search(/[a-zA-Z0-9]/g) == -1){
				alert('please enter a title for your entry')
				$('#linkTitle').focus()
				return 
			}

			let newLink = {
				'id': randId,
				'title': title,
				'priority': priority,
				'link': url,
				'user': 'john doe',
				'date': Date.now
			}

			MOCK_JOURNAL_ENTRIES["journalEntries"].push(newLink)

			$(".postDiv").remove()

			getAndDisplayJournalEntries()

			$('#newLinkFormDiv').remove()


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
			
			updateEntryInDatabase(MOCK_JOURNAL_ENTRIES)
		})
	}

	function updateEntryInDatabase(data){
		$('#editLinkFormSubmit').on('click', function(event){
			event.preventDefault()
			let editID = $(".editForm").attr('id').split('-')[1]
			let editTitle = $("#linkTitle").val()
			let editPriority = $('#linkPriority').val()
			let editURL = $('#linkUrl').val()

			for (index in data.journalEntries){
				let entry = data.journalEntries[index]
				if(entry.id === editID){
					entry.title = editTitle
					entry.priority = editPriority
					entry.link = editURL
				}
			}
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
			let linkID = $(parentDiv).attr('id')


			for (index in data.journalEntries){
				let entry = data.journalEntries[index]
				if (entry.id === linkID){
					data.journalEntries.splice(index, 1)
				}
			}

			removeEditDeleteButtons()
			$(".postDiv").remove()
			getAndDisplayJournalEntries()

		})
	}

	function deleteEntryFromDataBase(){
		deleteEntry(MOCK_JOURNAL_ENTRIES)
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
})

},{"is-url":1}]},{},[2]);
