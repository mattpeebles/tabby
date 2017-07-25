const DATABASE_URL = "http://localhost:3030/users"



	// Static Display User Data
// *********************************** //

	function getUserData(callback){
		$.get(DATABASE_URL + '/me', callback)
	}

	function displayUserData(data){

		console.log(data.user.id)

		let userHTML = 	`<div id="userName">` + 
							`<p>First Name: <span id="firstName">${data.user.user.firstName}</span></p>` +
							`<p>Last Name: <span id="lastName">${data.user.user.lastName}</span></p>` +
						`</div>` +
						`<div id="userJoinDate">` +
							`<p>Join Date: <span id="joinDate">${data.user.joinDate}</span></p>` +
						`</div>` +
						`<div id="userEmail">` +
							`<p>Email: <span id="email">${data.user.email}</span></p>` +
						`</div>` +
						`<div id="userPriorityExpiry">` +
							`<p>Priority Settings</p>` +
							`<div id='priorities'>` +
								`<p id="priorityHigh">High: <span id="high">${data.user.priorityExpiry.high}</span></p>` +
								`<p id="priorityMedium">Medium: <span id="medium">${data.user.priorityExpiry.medium}</span></p>` +
								`<p id="priorityLow">Low: <span id="low">${data.user.priorityExpiry.low}</span></p>` +
							`</div>` +
						`</div>`;

		$('#userInfo').append(userHTML)
	}

	function getAndDisplayUserData(){
		getUserData(displayUserData)
	}
// *********************************** //



	// Edit User Data
// *********************************** //
	function editUserData(data){

		let editForm = 	
			`<form id='editUserForm'>` +
				'<div id="userName">'+
					`<label>First Name: </label>` +
					`<input type="text" name="firstName" placeholder="${data.user.user.firstName}" id="firstName"></input>` +
					`<label>First Name: </label>` +
					`<input type="text" name="lastName" placeholder="${data.user.user.lastName}" id="firstName"></input>` +
				`</div>` +
				`<div id="userEmail">` +
					`<label>Email: </label>`+
					`<input type="text" name="email" placeholder="${data.user.email}" id="email"></input>` +
				`</div>` +
				`<div id="userPriorityExpiry">` +
					`<p>Priority Settings</p>` +
					`<div id='priorities'>` +
						`<label>High: </label>`+
						`<input type="text" name="high" placeholder="${data.user.priorityExpiry.high}" id="high"></input>`+
						`<label>Medium: </label>`+
						`<input type="text" name="medium" placeholder="${data.user.priorityExpiry.medium}" id="medium"></input>`+	
						`<label>Low: </label>`+
						`<input type="text" name="low" placeholder="${data.user.priorityExpiry.low}" id="low"></input>`+
					`</div>` +
				`</div>`+
				`<input type=\"submit\" name=\"submit\" id=\"editUserSubmit\"></input>` +
				`<button type=\"cancel\">Cancel</button>` +
			`</form>`;

		$('#userInfo').append(editForm)

	}

	function getAndEditUserData(){
		$('#editUserButton').on('click', (event) => {
			$('#userInfo').empty()
			getUserData(editUserData)

			$('#userInfo').on('click', '#editUserSubmit', (event) => {
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