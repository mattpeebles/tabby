const windowURL = window.location.origin


function getUserData(callback){
	$.ajax({
		type: 'get',
		url: windowURL + '/users/me',
		success: function(data){
			callback(data)
		},
		error: function(err){
			window.location.href = windowURL + '/login'
		}
	})
}

// Edit User Data
// *********************************** //
function editUserData(data){

	let editForm = 	
		`<form class='horizontal normal-font' id='editUserForm'>` +
			`<div id="editProfile">` +
				`<h1 class="title-font">Edit Profile</h1>` +
			`</div>` +
			`<div class='form-group has-feedback' id='firstNameDiv'>`+
				`<label for='firstName' class='col-sm-2' control-label>First Name: </label>` +
				`<div class='col-sm-10'>` +
					`<input type="text" name="firstName" class='form-control' placeholder="${data.user.user.firstName}" id="firstName"></input>` +
				`</div>` +	
			`</div>` +
			`<div class='form-group has-feedback' id='lastNameDiv'>` +
				`<label class='col-sm-2' for="lastName" control-label>Last Name: </label>` +
				`<div class='col-sm-10'>` +
					`<input type="text" name="lastName" class='form-control' placeholder="${data.user.user.lastName}" id="lastName"></input>` +
				`</div>` +	
			`</div>` +

			`<div class='row' id="userPriorityExpiry">` +
				`<div class='col-sm-12'>` +
					`<p id="priorityTitle">Priority Settings</p>` +
				`</div>` +
				`<div class='col-xs-4'>` +
					`<div class="form-group has-feedback priorities">` +
						`<label for="high" class='col-sm-3' control-label>High: </label>`+
						`<div class='col-sm-9'>` +
							`<input type="text" name="high" class='form-control' placeholder="${data.user.priorityExpiry.high}" id="high"></input>`+
						`</div>` +
					`</div>` +
				`</div>` +
				`<div class='col-xs-4'>` +
					`<div class='form-group has-feedback priorities'>` +
						`<label for="medium" class='col-sm-3' control-label>Medium: </label>`+
						`<div class='col-sm-9'>` +
							`<input type="text" name="medium" class='form-control' placeholder="${data.user.priorityExpiry.medium}" id="medium"></input>`+	
						`</div>` +
					`</div>` +
				`</div>` +
				`<div class='col-xs-4'>` +
					`<div class='form-group has-feedback priorities'>` +
						`<label for="low" class='col-sm-3' control-label>Low: </label>`+
						`<div class='col-sm-9'>` +
							`<input type="text" name="low" class='form-control' placeholder="${data.user.priorityExpiry.low}" id="low"></input>`+
						`</div>` +
					`</div>` +	
				`</div>` +
			`</div>`+
			`<div class='form-group has-feedback' id='buttonContainer'>` +
				`<div class='col-sm-offset-2 col-sm-10' id='buttonDiv'>` +
					`<input class='btn btn-variant' type="submit" name="submit" id="editUserSubmit" disabled></input>` +
				`</div>` +
			`</div>` +
		`</form>`;

	$('#userSection').append(editForm)

	validateForm()
	displayError()


}


function format(){
	let elementArray = ['#firstName', '#lastName', '#high', '#medium', '#low']
	
	let errorCount = 0

		elementArray.forEach(element => {		

			if ($(element).val() == ''){
				let parent = $(element).parent()
				$(element).removeClass('valid')
				$(element).removeClass('error')
				$(parent).children('.feedback').remove()
				$(parent).removeClass('has-success')
				$(parent).removeClass('has-danger')
			}

			if ($(element).hasClass('error')){
					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).children('.feedback').remove()
					$(parent).removeClass('has-success').addClass('has-danger')
					$('#editUserSubmit').prop('disabled', true)
					errorCount++
			}
		}) 
		
		if(errorCount == 0){
			$('#editUserSubmit').prop('disabled', false)
		} 

}

function displayError(){
	$('input').on('keydown', () => {
		setTimeout(format, 100)
	});

	$(window).mousemove(() => {
		setTimeout(format, 100)
	});
}

function validateForm(){
	$('#editUserForm').validate({
		rules: {
			firstName: {
				letterswithbasicpunc: true
			},
			lastName: {
				letterswithbasicpunc: true
			},
			high: {
				digits: true
			},
			medium: {
				digits: true
			},
			low: {
				digits: true
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
			firstName: "Please enter a name with no numbers",
			lastName: "Please enter a name with no numbers",
			high: "Please enter a number",
			medium: "Please enter a number",
			low: "Please enter a number",
			email: "Please enter a valid email address"
		}
	})	         
}

function getAndEditUserData(){
		
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

				
				if(userData.priorityExpiry !== undefined){
						//if user changes only one priority, this ensures the object is filled with previous priority numbers when submitting
					if (userData.priorityExpiry.high === undefined){
						userData.priorityExpiry.high = parseInt($('#high').attr('placeholder'))
					};

					if (userData.priorityExpiry.medium === undefined){
						userData.priorityExpiry.medium = parseInt($('#medium').attr('placeholder'))
					};

					if (userData.priorityExpiry.low === undefined){
						userData.priorityExpiry.low = parseInt($('#low').attr('placeholder'))
					};
				}

			getUserData((data) => {
				userData.id = data.user.id
				
				$.ajax({
					type: 'put',
					url: windowURL + '/users/' + data.user.id,
					data: JSON.stringify(userData),
					contentType: 'application/json',
					success: function(){
						window.location.href = windowURL + '/profile'
					}
				})
			})
		})
}

$(() => {
	getAndEditUserData()
})