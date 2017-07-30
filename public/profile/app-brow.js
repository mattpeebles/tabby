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


	// Static Display User Data
// *********************************** //

	function getUserData(callback){
		$.ajax({
			type: 'get',
			url: '/users/me',
			success: function(data){
				callback(data)
			},
			error: function(err){
				alert('please log in')
				window.location.href = '/login'
			}
		})
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

	// Signout
// *********************************** //
	function signout(){
		$('#logOutButton').click((event) => {
			if(confirm('Log out?')){
				$.ajax({
					type: 'get',
					url: '/logout',
					success: function(data) {
						alert(data.message)
						window.location.href = data.redirect
					}
				})
			}
		})
	}

$(() => {
	getAndDisplayUserData()
	signout()
})
},{"random-cat":1}]},{},[2]);
