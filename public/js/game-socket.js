var my_id;
var room_id;
var counter = 10;
var time_counter;

var socket = io.connect(window.location.origin + '/game');
var display = function(data) {
	console.log(JSON.stringify(data));
}
socket.on('dataEvent', function (data) {
	//display(data)
	//console.log("type of action: "+data.type);
	if(data.room ==  room_id) { //Check room_id, if not match, ignore
		if(data.type == 'transfer'){
			transfer(data.start, data.goal, data.fleet);
		}
		else if(data.type == 'bomb'){
			bomb(data.pid, data.target);
		}
		else if(data.type == 'upgrade') {
			upgrade(data.pid, data.target);
		}
		else if(data.type == 'abilities') {
			abilities(data.pid, data.aid, data.goal);
		}
		else if(data.type == 'dead') {
			Game.players[data.dead_guy] = null;
			// if(Game.freezing_others == data.dead_guy) {
			// 	Game.freezing_others = -1;
			// }
			console.log("Player"+data.dead_guy+" is dead!!");
		}
		else if(data.type == 'count_down') { //Receive message from player[0] (even player[0] himself is receiving)
			if(data.remain == 0) { //Start game
				console.log("Game Start!!");
				Game.time = new Date();
				GameRenderInit();
    			SoundInit();	
			}
			else { //TODO: Display(render) remain time to the screen
				console.log("Game starts on "+data.remain);
				document.getElementById("time").innerHTML = "Game starts on "+data.remain+" seconds";
			}
		}
		else
			display(data);
	}
});
socket.on('action', function(data) {
	console.log(JSON.stringify(data));
});


function send_transfer(from, to, unit) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'transfer',
			start: from,
			goal: to,
			fleet: unit
		});
	}
	else {
		alert('Null Socket Object !!!');
	}
}

function send_bomb(target_planet) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'bomb',
			pid: my_id,
			target: target_planet
		});
	}
	else {
		alert('Null Socket Object !!!');
	}
}

function send_upgrade(target_planet) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'upgrade',
			target: target_planet
		});
	}
	else {
		alert('Null Socket Object !!!');
	}
}

function send_abilities(aid, target_planet) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'abilities',
			pid: my_id,
			aid: aid,
			goal: target_planet
		});
	}
	else {
		alert('Null Socket Object !!!');
	}
}

function send_dead() {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'dead',
			dead_guy: my_id
		});
	}
	else 
		alert('Null Socket Object !!!');
}

//Only useful when my_id == 0
function send_count_down(input) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'count_down',
			remain: input
		});
	}
	else 
		alert('Null Socket Object !!!');
}

function send_upgrade(target_planet) {
	if(socket) {
		socket.emit('dataEvent', {
			room: room_id,
			type: 'upgrade',
			pid: my_id,
			target: target_planet
		});
	}
	else {
		alert('Null Socket Object !!!');
	}
}

//Only useful when my_id == 0
function count_down(){
	send_count_down(counter);
	counter--;
	if(counter < 0) {
		clearInterval(time_counter);
	}
}

window.addEventListener('load', function() {
	// my_id = window.prompt("Please input your id:");
	// TODO
	my_id = window.sessionStorage.getItem('playerID');
	console.log('Haha, I can find PID in sessionStorage: ' + my_id);
	room_id = window.sessionStorage.getItem('roomID');
	console.log('Haha, I can find RoomID in sessionStorage: ' + room_id);

	if(my_id == 0) { //Responsible for counting to start game
		console.log("I am counting");
		time_counter = setInterval(function() {
			count_down();}
		, 1000);
		// speed up testing
	}

}, false);

function get_my_id(){
	return my_id;
}