/*
	Main server of the Peanut War game
*/

/* Load Config File */
try{
    var config = require('./config.js');
} catch(e){
    console.error('Cannot load config file "config.js"');
    return;
}

var express = require("express");
var app = express();
var connect = require("connect");
var login = require("./login.js");
var sha1 = require('sha1');
var server = require("http").createServer(app);
var cookieParser = require('cookie-parser');
var page_dir = __dirname + "/public";
var port = config.server_portNum;

// connect().use(cookieParser());
// to parse the POST data input
// since the origin express.json() didn't include in express 4.0 anymore
app.use(connect.json());
app.use(connect.urlencoded());
// parsing cookie
app.use(cookieParser());

server.listen(port);

console.log("Sever STARTS lisent to port: " + port);

// ask for homepage, which is login
app.get("/", function(req, res){
	var cookies = req.cookies;
	var session = cookies.id;	// get the session id
	var name = cookies.username;
	console.log("Home page");
console.log("session: " + session + " name: "  + name);	

	check_session(session, res, "/game_hall.html", true);
});

// when user attem to log in, using ajax
app.post("/login", function(req, res){
	var name = req.param("username");
	var passwd = req.param("passwd");
	
	console.log("user: " + name + " passwd: " + passwd + " attemp to log in");
	login.check_user(name, passwd, function(status, err){
		switch(status)
		{
			case 0:
console.log("user successfuly log in");
				// send cookie and send it out too
				var id = create_cookie(name, res);
				// add the record in the db
				login.add_session(name, id, function(){
					res.send({status: status, reason: "Log in Successful"});
				});
				break;
			case 1:
				res.send({status: status, reason: "Wrong user name or password"});
				break;
			case -1:
				res.send({status: 2, reason: "Sorry, the server has problem. Please try again later"});
				console.log("Error in db while look up record in db " + err);
				break;
		}
	});
});

// when user attem to register
app.post("/register", function(req, res){
	var name = req.param("username");
	var passwd = req.param("passwd");
	var confirm = req.param("confirm");

	// the confirm passwd is not the same as input
	if(confirm != passwd)
	{
		res.send({status: 2, reason: "The confirm password is not the same as input"});
	}
	else
	{
		console.log("user: " + name + " passwd: " + passwd + " attemp to register");
		login.create_user(name, passwd, function(status, err){
			switch(status)
			{
				case 0:
console.log("Create user: " + name + " succesfully");
					// send cookie and send it out too
					var id = create_cookie(name, res);
					login.add_session(name, id, function(){
						res.send({status: status, reason: "Registeration successful"});
					});
					break;
				case 1:
					res.send({status: status, reason: "The user name: " + name + " had been registered by others"});
					break;
				case 2:
					res.send({status: 2, reason: "Sorry, the server has problem. Please try again later"});
					console.log("Error in db while look up record in db " + JSON.stringify(err));
					break;
			}
		});
	}
});

// going to a game hall
app.get("/game_hall.html", function(req, res){
	var cookies = req.cookies;
	var session = cookies.id;
	var name = cookies.name;

	// check for the valid session
	console.log("user request the game hall");
	check_session(session, res, "/game_hall.html", false);
});

// going to a game room
app.get("/game_room.html", function(req, res){
	var cookies = req.cookies;
	var session = cookies.id;
	var name = cookies.name;
	check_session(session, res, "/game_room.html", false);
});

// for log out
app.get("/logout", function(req, res){
	var session = req.cookies.id;
	// expire user session
	res.clearCookie("id");
	res.clearCookie("username")
	// remove the record in db
	login.remove_session(session);
	res.redirect("/");	// redirect back to home page
});

// ajax for the game info
app.post("/hall_info", function(req, res){
	// check how many rooms insidet the db 
	login.find_all_room(function(result){
		res.send(result);	// send back the result to client
	});
});

// ajax for getting map info, when the game starts
app.get("/map", function(req, res){
	var map_id = req.query.id;
	// find the id in the database
	login.find_map(map_id, function(result){
		res.send(result);
	});
});

// check for the valid session
function check_session(session, res, page, redirect)
{
	// if there is a session
	if(session)
		login.find_session(session, function(name){
			if(name == null)
			{
				// expire the found session, then redirect to index page
				res.clearCookie("id");
				res.redirect("/");
			}
			else
			{
				console.log("server.js: welcome back " + name);
				if(redirect)
					res.redirect(page);
				else
				{
					// give a new session to the user
					// var id = create_cookie(name, res);
					// add the new session to db
					// login.add_session(name, id, session);
					res.status(200);
					res.sendfile(page_dir + page);
				}
			}
		});
	else
	{
		console.log("No session is found");
		// this is very ugly, to prevent keep dead loop
		// dead loop if request "/", since can never find session
		if(!redirect)
			res.redirect("/");
		else
			res.sendfile(page_dir + "/index.html");
	}
}

// set the respond cookie and return the id
// prev is previous session id, in case it is an update
function create_cookie(name, res)
{
	var curr_time = Date.now();
	var id = sha1(curr_time);
	console.log("sha1 hash of " + curr_time + " is " + id);
	// set mutli cookie
	// expire on 12 hrs
	res.cookie("id", id, {expires: new Date(Date.now() + 43200000)});
	res.cookie("username", name,  {expires: new Date(Date.now() + 43200000)});
	return id;
}


/*
	socket io part
*/
// var io = require("socket.io").listen(server);
var io = require("socket.io").listen(server, {log: false});		// disable the debug log

// when the game hall is connected
var game_hall = io.of("/game_hall").on("connection", function(socket){
	// set the user name
	socket.on("greet", function(data){
		socket.set("user", data, function(){
			// tell the user he is okay to use the page, since the socket.io needs
			// time to set the name
			socket.emit("greet_ack");
			console.log("User: " + data + " in the game hall");
		});
		
	});
	
	// when user disconnet
	socket.on("disconnect", function(){
		socket.get("user", function(err, name){
			console.log("user: " + name + " had leave the game hall");
		});
	});

	// when player request to create a room
	socket.on("create_room", function(data){
		var id = Date.now();
		socket.get("user", function(err, name){
			console.log("player " + name + " request to create room @ " + id);
			login.create_room(id, name, function(result, err){
				// case of success
				if(result)
				{
					console.log("Result room: " + JSON.stringify(result));
					// boardcasr to all people in the game hall that a room had been created
					socket.broadcast.emit("new_room", result);
					// tell the player that he success
					socket.emit("create_result", {id: result.id});
				}
				else	// error in creating a room, reflect back the user
				{
					socket.emit("create_result", {msg: "Cannot create room. Please try again later"});
				}
			});
		});
	});

	// request to join a game
	// need to boardcat to others some join in the game if success
	socket.on("join_game", function(data){
		var room_id = data;
		socket.get("user", function(err, name){
			console.log("server: player " + name + " wants to join in the room  " + data);
			login.join_game(room_id, name, function(err, result){
				switch(err)
				{
					case 1:		// the game is full already
						socket.emit("join_result", {status: err, msg: "The number of players in the room reaches the limit"})
						break;
					case 2:
						socket.emit("join_result", {status: err, msg: "Server problem, Please try again later"})
						break;
					default:	// successful, return the room id to the user
						socket.emit("join_result", {status: err, id: result.id});
						// also boardcast to all user, return the new condition of the room
						socket.broadcast.emit("room_change", result);
						break;
				}
			});
		});
	});

	// tell other when there is something change in the game room
	// include people ENTER the room / LEAVE the room
	socket.on("leave_game", function(data){
		var room_id = data;
	});
	// tell other when a game room is disappear

});

var game_room = io.of('/game_room').on("connection", function(socket){

	/* Handshaking Protocol */
	socket.emit('handshake', {seq: 1}); //HandShake #1
	socket.on('handshake', function(data){
		if(!data.seq || data.seq != 2) return;
		socket.set('userName', data.userName);
		socket.set('roomID', data.roomID);

		console.log('HandShake #2 Data: ' + JSON.stringify(data));
		console.log('User "' + data.userName + '" has joined room "' + data.roomID + '"');
		bcast(game_room, 'info', {msg: 'User [' + data.userName + '] has joined room [' + data.roomID + ']'});
	});

    bcast(game_room, 'info', {msg: '(Before HandShake) A user joined'});
    console.log("(Before HandShake) A user joined");

    socket.on('userAction', function(data){
    	// Filter INVALID queries
    	if(!data || !data.roomID){ return; }

    	console.log('User Action: ' + JSON.stringify(data));
    	bcast(game_room, 'userAction', data);
    });

    // ID Query Protocol (Server only redirecting correct data)
    socket.on('idQuery', function(data){
    	if(  // only forward VALID sockets
			data &&
    		data.roomID &&
    		data.queryType
		){
    		bcast(game_room, 'idQuery', data);
			console.log('ID Query Data: ' + JSON.stringify(data));

			if(data.queryType == 'confirm'){
				// confirm a query ID
				console.log('ID Query Confirm: ' + data.confirmUserName + ' --> ' + data.query);
				socket.set('playerID', data.query);
			}
		}else{
			console.log('Invalid ID Query Data: ' + JSON.stringify(data));
		}
    });

    socket.on('stateQuery', function(data){
    	// Filter INVALID queries
    	if(!data || !data.roomID){ return; }

    	console.log('State Query: ' + JSON.stringify(data));
    	bcast(game_room, 'stateQuery', data);
    });

    socket.on('disconnect', function(){
    	socket.get('userName', function(err, uName){
    		socket.get('roomID', function(err, rid){
    			socket.get('playerID', function(err, pid){
    				bcast(game_room, 'info', {
	    				msg: 'User [' + uName + ', ID#' + pid + '] has left room [' + rid + ']'
	    			});

	    			bcast(game_room, 'userLeave', {
	    				roomID: rid,
	    				userName: uName,
	    				playerID: pid
	    			});

	    			// tell game hall to remove user from room
	    			// leave_game_room(rid, uName);
	    			remove_room(rid);

	    			console.log('User [' + uName + ', ID#' + pid + '] has left room [' + rid + ']');
    			});
    			
    		});
    	});
    });
});

// a reflection websocket for game playing
var game_socket = io.of('/game').on('connection', function (socket) {
    socket.on('dataEvent', function (data) {
        bcast(game_socket, 'dataEvent', data);
    });
});


// boardcast message to eveyone inside a room
function bcast(to, type, data)
{
	to.emit(type, data);
}

// handle the event when client disconnect from the game hall
function leave_game_room(room_id, player_name)
{
	// remove the record on db
	// result -> final game room state
	login.leave_room(room_id, player_name, function(status, result){
		// if the room is no longer eixst
		if(status == 0)
			bcast(game_hall, "destroy_room", {id: room_id});
		else
			bcast(game_hall, "leave_game", result);
	});
}

// remove the game room when the game started
function remove_room(room_id)
{
	console.log("server: Game " + room_id + "stared. Remove the game room " + room_id);
	login.remove_room(room_id, function(){
		bcast(game_hall, "destroy_room", {id: room_id});
	});
}

// var gameRoomSocket = require('./gameRoom-socket.js');
// gameRoomSocket.start(server, '/game_room');

// to parse the route
app.use(express.static(__dirname + '/public'));
// must be in the bottom, as all routes cannot find it
// adding 404 not found page 
app.use(function(req, res, next){
	// res.send(404, 'Sorry cant find that!');
	res.sendfile("404page.html");
});
