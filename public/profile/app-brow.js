(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function RandomCat() { }

RandomCat.prototype.get = function (options) {
  options = options || {};

  if (options.dummyText) {
    options.dummyText = escape(options.dummyText);
  }

  var randomSizes = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];

  var urlParts = [
      options.gray ? 'g' : false
    , options.width || randomSizes[Math.ceil(Math.random() * 12)]
    , options.height || randomSizes[Math.ceil(Math.random() * 12)]
    , options.category || 'cats'
    , options.imageIndex
    , options.dummyText
  ];

  var length = urlParts.length;
  var protocol = options.protocol || 'http';
  var baseUrl = options.baseUrl || 'lorempixel.com';
  var lastSlash = baseUrl.lastIndexOf('/');
  baseUrl = lastSlash === baseUrl.length - 1
    ? baseUrl.substr(0, lastSlash)
    : baseUrl;

  for (var i=0; i<length; i++) {
    if (!!!urlParts[i]) {
      urlParts.splice(i, 1);
    }
  }

  return protocol + '://' + baseUrl + '/' + urlParts.join('/');
}

module.exports = (new RandomCat());
},{}],2:[function(require,module,exports){
const randomCat = require('random-cat')
const DATABASE_URL = "http://localhost:3030/users"



	// Static Display User Data
// *********************************** //

	function getUserData(callback){
		$.get(DATABASE_URL + '/me', callback)
	}

	function displayUserData(data){
		

		let catPhoto = randomCat.get({
			width: 300,
			height: 300,

		})
		let formatDate = $.format.date(data.user.joinDate, "MMMM D, yyyy")
		
		// let userHTML = 	`<div id="userName">` + 
		// 					`<p>Name: <span id="firstName">${data.user.user.firstName} ${data.user.user.lastName}</span></p>` +
		// 				`</div>` +
		// 				`<div id="userJoinDate">` +
		// 					`<p>Join Date: <span id="joinDate">${formatDate}</span></p>` +
		// 				`</div>` +
		// 				`<div id="userEmail">` +
		// 					`<p>Email: <span id="email">${data.user.email}</span></p>` +
		// 				`</div>` +
		// 				`<div id="userPriorityExpiry">` +
		// 					`<p>Priority Settings</p>` +
		// 					`<div id='priorities'>` +
		// 						`<p id="priorityHigh">High: <span id="high">${data.user.priorityExpiry.high}</span></p>` +
		// 						`<p id="priorityMedium">Medium: <span id="medium">${data.user.priorityExpiry.medium}</span></p>` +
		// 						`<p id="priorityLow">Low: <span id="low">${data.user.priorityExpiry.low}</span></p>` +
		// 					`</div>` +
		// 				`</div>`;

		// $('#userInfo').append(userHTML)

		$('#profileImage').append(`<img src="${catPhoto}"></img>`)
		$("#name").append(`<p>${data.user.user.firstName} ${data.user.user.lastName}</p>`)
		$('#email').append(`<p>${data.user.email}</p>`)
		$('#joinDate').append(`<p>${formatDate}</p>`)
		$('#highExpiry').append(`<p>${data.user.priorityExpiry.high} days</p>`)
		$('#medExpiry').append(`<p>${data.user.priorityExpiry.medium} days</p>`)
		$('#lowExpiry').append(`<p>${data.user.priorityExpiry.low} days</p>`)
	}

	function getAndDisplayUserData(){
		getUserData(displayUserData)
	}
// *********************************** //



	// Edit User Data
// *********************************** //
	function editUserData(data){

		let editForm = 	
			`<form class='horizontal' id='editUserForm'>` +
				`<div class='form-group' id='firstName'>`+
					`<label for='firstName' class='col-sm-2' control-label>First Name: </label>` +
					`<div class='col-sm-10'>` +
						`<input type="text" name="firstName" class='form-control' placeholder="${data.user.user.firstName}" id="firstName"></input>` +
					`</div>` +	
				`</div>` +
				`<div class='form-group' id='lastName'>` +
					`<label class='col-sm-2' for="lastName" control-label>Last Name: </label>` +
					`<div class='col-sm-10'>` +
						`<input type="text" name="lastName" class='form-control' placeholder="${data.user.user.lastName}" id="firstName"></input>` +
					`</div>` +	
				`</div>` +
				`<div class='form-group' id="userEmail">` +
					`<label for="email" class='col-sm-2' control-label>Email: </label>`+
					`<div class='col-sm-10'>` +	
						`<input type="text" name="email" class='form-control' placeholder="${data.user.email}" id="email"></input>` +
					`</div>` +	
				`</div>` +
				`<div id="userPriorityExpiry">` +
					`<p>Priority Settings</p>` +
					`<div class="form-group priorities">` +
						`<label for="high" class='col-sm-2' control-label>High: </label>`+
						`<div class='col-sm-10'>` +
							`<input type="text" name="high" class='form-control' placeholder="${data.user.priorityExpiry.high}" id="high"></input>`+
						`</div>` +	
					`<div class='form-group priorities'>` +
						`<label for="medium" class='col-sm-2' control-label>Medium: </label>`+
						`<div class='col-sm-10'>` +
							`<input type="text" name="medium" class='form-control' placeholder="${data.user.priorityExpiry.medium}" id="medium"></input>`+	
						`</div>` +
					`</div>` +		
					`<div class='form-group priorities'>` +
						`<label for="low" class='col-sm-2' control-label>Low: </label>`+
						`<div class='col-sm-10'>` +
							`<input type="text" name="low" class='form-control' placeholder="${data.user.priorityExpiry.low}" id="low"></input>`+
						`</div>` +
					`</div>` +		
				`</div>`+
				`<div class='form-group' id='buttonContainer'>` +
					`<div class='col-sm-offset-2 col-sm-10' id='buttonDiv'>` +
						`<input class='btn btn-default' type="submit" name="submit" id="editUserSubmit"></input>` +
					`</div>` +
				`</div>` +
				`<button type="cancel"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>` +
			`</form>`;

		$('#userSection').append(editForm)

	}

	function getAndEditUserData(){
		$('#editUserButton').on('click', (event) => {
			
			$('#userSection').empty()
			getUserData(editUserData)

			$('#userSection').on('click', '#editUserSubmit', (event) => {
				event.preventDefault()
				let user = {};
				let priorityExpiry = {};

					//serializes object to database standard if input has a string
				let userData = $('#editUserForm').serializeArray().reduce((obj, item) => {
			   		 if((item.name === "firstName" || item.name === "lastName") && item.value !== ""){
			   		 	user[item.name] = item.value
			   		 }
			   		 else if((item.name === 'high' || item.name === 'medium' || item.name === 'low') && item.value !== ""){
			   		 	priorityExpiry[item.name] = parseInt(item.value) //parseInt is required to ensure expiry is a number.
			   		 }
			   		 else if(item.value !== ""){
			   		 	obj[item.name] = item.value;
			   		}


			   			//adds user and priorityexpiry object to returned object
			   			//if it is not empty
			   		if(Object.keys(user).length !== 0 && user.constructor === Object){
				   		obj["user"] = user
			   		}
			   		if(Object.keys(priorityExpiry).length !== 0 && priorityExpiry.constructor === Object){
						obj["priorityExpiry"] = priorityExpiry
			   		}

			   		 return obj;
					}, {});


				getUserData((data) => {
					userData.id = data.user.id
					
					$.ajax({
						type: 'put',
						url: DATABASE_URL + '/' + data.user.id,
						data: JSON.stringify(userData),
						contentType: 'application/json',
						success: function(){
							location.reload()
						}
					})
				})
			})
		})
	}
// *********************************** //

$(() => {
	getAndDisplayUserData()
	getAndEditUserData()
})
},{"random-cat":1}]},{},[2]);
