var div_room = document.getElementById("game");
var host = window.location.origin;
var socket = io.connect(host + "/game_hall");;
var username = getCookie("username");
var num_room = 0;	// number of room

var fixResize = function(){
    var w = $('body').width();
    var h = $('body').height();

    if(w * 1.0 / h > 16.0 / 10){
        $('body').removeClass('hBody').addClass('wBody');
    }else{
        $('body').removeClass('wBody').addClass('hBody');
    }
};


function main(e)
{
	// clean up the session storage for all the room
	window.sessionStorage.removeItem("roomID");
	window.sessionStorage.removeItem("playerID");
	// document.getElementById("logout").addEventListener("click", logout, false);

	// fixing background
	fixResize();

	// tell the server who I am, so the server can attach the user name on the socket
	socket.on("connect", function(){
		socket.emit("greet", username);
		socket.on("greet_ack", function(){
			init_hall();
		});
	});

	// receive from others when there is a room created
	socket.on("new_room", function(data){
		console.log("A new room is created");
		create_room(data);
		// fix the empty the room position
		$("#r" + data.id).after($("#empty_room"));
	});
	
	// when someone join in the room
	socket.on("room_change", function(data){
		console.log("The room " + data.id + " had changed to " + data.players.length);
		// fill in the color indicate the seat is occurpied
		for(var i = 0; i < data.players.length; i++)
		{
			 var seat_num = data.players[i].color;
			 var seat = document.querySelector("#r" + data.id + " .seat" + seat_num);
			 // var color = $("#r" + data.id + " .seat" + seat_num).css("color");
			 // seat.style.backgroundColor = color;
			 $("#r" + data.id + " .seat" + seat_num).addClass('fillSeat');
		}

		// check if the seat is fulled or not
		if(data.players.length > 2)	// room is fulled
		{
			var room = find_room_tag(data.id);
			// change the title
			room.title = "Room is full";
			// change to the event which the room is full
			room.removeEventListener("click", join_game);
			room.addEventListener("click", room_is_full);	// alert prompt tell the player that the room is sulled
		}
	});

	// when a game_room had been destoried
	socket.on("destroy_room", function(data){
		var room_id = data.id;
		// to remove the room by setting the innerHTML to be nothing
		console.log("Destory the room: " + room_id);
		var targetNode = find_room_tag(room_id);
		if(targetNode)
			targetNode.parentNode.removeChild(targetNode);
	});
	
	// when someone leave a room
	socket.on("leave_game", function(data){
		var room_id = data.id;
		var li_tag = find_room_tag(room_id);
		var seats = [];
		var players = data.players;
		// find out which usr had level the room by loop through all the seats
		// first unset all the seat, then let it join in one by one
		for(var i = 0; i < 3; i++)
		{
			seats[i] = li_tag.querySelector(".seat" + i);
			// seats[i].style.backgroundColor = "transparent";
			seats[i].classList.remove('fillSeat');
		}
		// set the seat back color now
		for(var i = 0; i < players.length; i++)
		{
			// seats[players[i].color].style.backgroundColor = seats[players[i].color].style.color;
			seats[players[i].color].classList.add('fillSeat');
		}
	});
}

// get the init state of the game hall, using ajax
function init_hall()
{
	// append welcome message
	$("#helloMsg").html("Hello, " + username + " <small> Log out </small>");
	$("#helloMsg > small").click(logout);

	// sending ajax to ask for the game hall status
	var ajax_request = $.ajax({
		type: "POST",
		url: "/hall_info"
	});

	// construct the game room now
	ajax_request.done(function(room_info){
		// when there is at least a room, we create the entry
		if(room_info)
		{
			for(var i = 0; i < room_info.length; i++)
			{
				console.log("Create room " + i);
				create_room(room_info[i]);
			}
		}
		create_empty_room();

		// disable loading gif
		$('#loading').fadeOut('slow', function() {
			$('#game_hall_container').fadeIn('slow');
		});
	});

	ajax_request.fail(function(jqXHR, textStatus){
		console.log("Error in getting room info: " + JSON.stringify(jqXHR) + " err: " + JSON.stringify(textStatus));
	});
}	// end of init_hall()

// function to create a empty room
function create_empty_room()
{
	// create remaining part of the rooom
	$("#game_hall").append("<li class='room' id='empty_room' title='Create room'> Create Room </li>");
	// when user click on the empty room, should create a room
	document.getElementById("empty_room").addEventListener("click", function(e){
		console.log("user request to creat room");
		// ask for server to create a room
		socket.emit("create_room");
		// if the result success, you have the room
		socket.on("create_result", function(data){
			// user get the room id, that meansa room is created
			if(data.id)
			{
				console.log("I can create a room with id: " + data.id + " -v-b");
				// set the session storage to for game room to get the id
				window.sessionStorage.setItem("roomID", data.id);
				// go to the game room
				window.location = "/game_room.html"
			}
			else	// user cannot create the room
			{
				console.log("Failed in create a room");
				// prompt the msg on the hall page
			}
		});
	}, false);
}

// change the game hall outline when a new room is created
function create_room(room)
{
	var players = room.players;	// this is an array of player info
	// NOTE: the id of tag CANNOT BE a number, so need to add "room" before the number
	$("#game_hall").append("<li class='room' id='r" + room.id + "'></li>");
	console.log("room " + JSON.stringify(room));

	var li_tag = find_room_tag(room.id);
	// put the room number
	// $("#r" + room.id).append("<p>Room " + (++num_room)  + "</p>");
	$("#r" + room.id).append("<p class=\"room_title\"> Game Room </p>");

	// adding the seat in the room
	for(var i = 2; i >= 0; i--)
	{
		$("#r" + room.id).append("<div class='seat" + i + "'></div>");
	}
	
	// check if occurpied, if yes, then fill in color
	// we separate because the seat1 and seat3 maybe occupied, but not others
	
	for(var i = 0; i < players.length; i++)
	{
		var num = players[i].color
		// var color = $("#r" + room.id + " .seat" + num).css("color");
		// $("#r" + room.id + " .seat" + num).css("background", color);
		$("#r" + room.id + " .seat" + num).addClass('fillSeat');
	}
	
	// there is still available seat in the room
	if(players.length < 3)
	{
		li_tag.title = "Join game";
		// add event listener for other to join in the game
		li_tag.addEventListener("click", join_game, false);
	}
	else	// when the room is full
	{
		li_tag.title = "Room is full";
		// need to remove it if the room is available again
		li_tag.addEventListener("click", room_is_full, false); 
	}
}

// Event listener when the room is full
function room_is_full(e)
{
	e.stopPropagation();
	alert("Cannot join the game because the room is fulled");
}

// event for joining a room
function join_game(e)
{
	e.stopPropagation();
	var room_id = e.currentTarget.id.substring(1);

	socket.emit("join_game", room_id);
	socket.on("join_result", function(data){
		if(data.status)	// failed case
		{
			console.log("Failed to join the game");
			display_err(data.msg);
		}
		else	// successful case
		{
			console.log("Player " + username + " goto the room id: " + room_id);
			// set the session storage
			window.sessionStorage.setItem("roomID", room_id);
			// go to the game room
			window.location = "/game_room.html";
		}
	});
}

// to display the error message on the game hall
function display_err(err)
{
	$("#err_msg").html(err);
}

// to find the room (li_tag) by the id, return the tag object
function find_room_tag(id)
{
	return document.querySelector("#r" + id);
}

window.addEventListener("load", main, false);
$(window).resize(fixResize);
