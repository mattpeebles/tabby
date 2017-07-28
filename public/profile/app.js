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