
const expireDuration = 3 * 60 * 60 * 1000;
const secondsForDay = 24 * 60 * 60 * 1000;

function find(now, schedule){
	//check date off or not. if day is off day then  get next day start time
	now = checkDayAndIfNotOpenGetNextday(now, schedule, false);

	//get shift end time time to compare with time
	let dayEndTime = createDateObject(now, schedule[now.getDay()].close_at);
	
	//if shit end time less than current time then add one day and get next day start time
	if(dayEndTime < now){
		now = addOneDate(now);
		now = checkDayAndIfNotOpenGetNextday(now, schedule, true);
		dayEndTime =  createDateObject(now, schedule[now.getDay()].close_at);
	}
	
	//check now time is less than to shit start time if it is now time is then set now  to shift start time
	let dayStartTime =  createDateObject(now, schedule[now.getDay()].open_at);
	if(dayStartTime > now){
		now	= dayStartTime;
	}
	
	//get the time difference
	let difference = dayEndTime - now;
	let expireDate = now;
	
	if(difference < expireDuration){
		//if time difference less than 3 hour get next working day
		difference = expireDuration - difference;
		// checking availability of time for next days
		expireDate = checkForTimeDifference(difference, now, schedule);
		let val = 0;
	}else{
		// if expire time within current day working time
		expireDate = new Date(now.getTime() + expireDuration)
	}

	return expireDate;
}

function checkForTimeDifference(difference, now, schedule){
	now = addOneDate(now);
	now = checkDayAndIfNotOpenGetNextday(now, schedule, true);
		
	let dayStartTime = createDateObject(now , schedule[now.getDay()].open_at);
	let dayEndTime = createDateObject(now , schedule[now.getDay()].close_at);

	/* some times even next day time duration is not enough
	 ex -: if day only has one hour working period ({"open": true, "open_at" : "10:00", "close_at" : "11:00" },)
	 then we need check availability of other next days as well */
	let dayTimeDifference = dayEndTime - dayStartTime;
	if(difference >  dayTimeDifference){
		difference -= dayTimeDifference;
		// recursively calling same function untill the difference is full filled
		return checkForTimeDifference(difference, now, schedule);
	}else{
		return new Date(now.getTime() + difference);
	}

}
// create new date using provided hours and minutes
function createDateObject(now, timeString){
	let timeArr = timeString.split(':');
  	return new Date(now.getFullYear(), now.getMonth(), now.getDate(),
   		parseInt(timeArr[0]), parseInt(timeArr[1]), 0);
}


// here we check for open days
function checkDayAndIfNotOpenGetNextday(now, schedule, isAddStartTime){
	
	let dayOfWeek = now.getDay(); 
	let scheduleDay = schedule[dayOfWeek];
	while(!scheduleDay.open){ // untill day is open
		isAddStartTime = true;	
		now = addOneDate(now);
		dayOfWeek = now.getDay();
		scheduleDay = schedule[dayOfWeek];
	}
	
	if(isAddStartTime){ // start time append
		now =  createDateObject(now, schedule[now.getDay()].open_at);
	}
	
	return now;
}

function addOneDate(date){
	return new Date(date.getTime() + secondsForDay);
}