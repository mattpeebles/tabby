function addDays(startDate, numberOfDays){
	let returnDate = new Date(
							startDate.getFullYear(),
							startDate.getMonth(),
							startDate.getDate() + numberOfDays);

	return returnDate;
}

function subtractDays(startDate, numberOfDays){
	let returnDate = new Date(
							startDate.getFullYear(),
							startDate.getMonth(),
							startDate.getDate() - numberOfDays)
	return returnDate;
}

function nowDate(){
	let now = new Date(Date.now())

	let noTime = new Date(
							now.getFullYear(),
							now.getMonth(),
							now.getDate());

	return noTime
}


module.exports = {addDays, nowDate}