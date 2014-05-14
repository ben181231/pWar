/*
	Module for handling user log in  and user regisation
*/


/*
----------------------------------------------------------------
	As I remember we can set a timeout on the insert, which after some time
	the record will auto delete !!!
----------------------------------------------------------------
*/

try{
    var config = require('./config.js');
} catch(e){
    console.error('Cannot load config file "config.js"');
    return;
}

var mongoClient = require("mongodb").MongoClient;
var db_host = config.db_host;
var db_port = config.db_port;
var db_name = config.db_name;
var db_max_pool_size = 200;	// max connection is 200
var db_user = config.db_userName;
var db_passwd = config.db_password;
var conn = "mongodb://" + db_user + ":"  + db_passwd  + "@" + db_host + ":" + db_port + "/" + db_name + "/?" + "maxPoolSize" + db_max_pool_size; 

module.exports = {
// for login checking
check_user: function(name, passwd, callback){
	mongoClient.connect(conn, function(err, db){
		if(err || !db)
		{
			callback(-1, err);	// to tell the server failed in db connection
			return ;
		}
		var collection = db.collection("user");
		
		console.log("Connected to database");
		console.log("find user: "+  name + " passwd: " + passwd);
		// find the user in db
		collection.findOne({name: name, passwd: passwd}, function(err, result){
			// if found the item
			if(result)
				callback(0);
			else
				callback(1, err);
			
			db.close();
		});
	});

},	// end of check_user()

// when user sign up
create_user: function(name , passwd, callback){
	mongoClient.connect(conn, function(err, db){
		if(err || !db)
		{
			callback(-1);
			return ;
		}
		var collection = db.collection("user");
		
		// check if the user had exist in the db, if yes, then we should not insert
		// ----------------- can we do any improvement????????????
		collection.findOne({name: name}, function(err, result){
			if(result)
				callback(1);
			else
				collection.insert({name: name, passwd: passwd}, function(err, result){
					if(err)
						callback(2, err);
					else	// successful reg a user
						callback(0);
				});
		});
	
	});	// end of connection
},	// end of create_user()

find_session: function(id, callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("session");
		console.log("db: finding session " + id);

		collection.findOne({session: id}, function(err, result){
			if(err)
			{
				console.log("error " + JSON.stringify(error));
			}

			if(result)
			{
				console.log("result: " + JSON.stringify(result));
				callback(result.name);	// return the name of user
			}
			else
			{
				console.log("I cannot find any session related to " + id);
				callback(null);
			}
			db.close();
		});
	});	// end of connect()
},	// end of find_session()

// include update previous session, if prev is provided
add_session: function(name, id, callback, prev){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("session");

		// if previous session exist, I update it
		if(prev)
		{
			console.log("login.js: Update session from " + prev + " to " + id + " on user " + name);
			collection.update({name: name, session: prev}, {$set: {session: id}}, function(err, result){
				if(err)
					console.log("login.js: Error in update session: " + session + " for user: " + name);

				db.close();
			});
		}
		else
		{
			console.log("login.js: Insert session: " + id + " to user " + name);
			// insert record
			collection.insert({name: name, session: id}, function(err, result){
				if(err)
					console.log("login.js: Error in inserting the session. Err: ", JSON.stringify(err));

				// adding callback dueo ensure the session must be added before user started to login
				callback();
				db.close();
		});
		}
	});	// end of conn()
},	// end of add_session()	

// remove the session as the user had log out
remove_session: function(id){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("session");
		
		console.log("longin.js: remove session: " + id);
		collection.remove({session: id}, function(err, result){
			if(err)
				console.log("login.js: error in remove session id: " + id);

			db.close();
		});
	});	// end of conn()
},	// end of remove session

/*
	the game room will be stored in the following format:
	{id: id, players: [name: name, status: <ready (true)/not ready(false)>, color: <0/1/2>, ...]}
*/
// to find all the game rooms
find_all_room: function(callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("room");

		console.log("db: Query all the rooms");
		collection.find().toArray(function(err, docs){
			if(err)
			{
				console.log("db: error in finding all rooms " + JSON.stringify(err));
				docs = null;
			}
			callback(docs);
		});
	});
},	// end of find_all_room()

// to create a game room and store in db
create_room: function(id, player_name, callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("room");

		console.log("db: player " + player_name + " want to create a rome with id: " + id);
		// defualt set the creator is not ready for game and color is 0
		collection.insert({id: id, players: [{name: player_name, status: false, color: 0}]}, function(err, item){
			if(err)
				callback(null, err);
			else
				callback(item[0]);	// the result is an array
			db.close();
		});
	});
},	// end of create_room()

join_game: function(id, name, callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("room");
		console.log("db: Player: " + name + " want to join in the room " + id);

		// must cast the id to be number, since in mongodb, the input is number, but when 
		// retrive my socket, it becomes a string, which will result id not found
		collection.findOne({id: Number(id)}, function(err, item){
			if(item)
			{
console.log("db: type of " + item + " content " + JSON.stringify(item));
				if(item.players.length > 2)	// the game is already full
				{
					callback(1);
				}
				else	// allow player to add in the game room
				{
					// finding the availabe of user, since the player is in sorted order according of color
					// this approach include the player is at the last of the list
					for(var i = 0; i < item.players.length; i++)
						if(item.players[i].color != i)
							break;
					/*
						default assume the new added player status is false
						insert the element in the ith position
						as we always insert the smaller number of color at first, so it must be sorted
					*/
					item.players.splice(i, 0, {name: name, status: false, color: i});
					console.log("result of the updated item: " + JSON.stringify(item.players));

					// only update the whole player list which can conserver the room id
					// as previous stated, the id here is a string, but required is number
					collection.update({id: Number(id)}, {$set: {players: item.players}}, function(err, result){
						if(result)	// added in successful
						{
							callback(0, item);
						}
						else		// failed to join in the game
						{
							callback(2);
						}
					});
				}
			}
			else
			{
				console.log("db: no matched result in join room " + id);
			}
		});

	});
},	// end of join_room()

// handle user leave the game room
// the game room will be removed once there is no user
leave_room: function(id, name, callback)
{
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("room");
		// find the target room
		collection.findOne({id: Number(id)}, function(err, result){
			if(result)
			{
				var players = result.players;
				for(var i = 0; i < players.length; i++)
					if(players[i].name == name)
					{
						// deleted the player record
						players.splice(i, 1);
						break;
					}

				// since there is not player, so should delete the room
				if(!players.length)
				{
					console.log("db: The game room " + id + " had been removed")
					collection.remove({id: Number(id)}, function(err, item){
						callback(0);
					});
				}
				else	// update the record now
				{
					console.log("db: Player " + name + " had left the room " + id);
					collection.update({id: Number(id)}, {$set: {players: players}}, function(err, item){
						callback(1, result);
					});
				}
			}
		});
	});
},	// end of leave_room()

// remove the game room by the room id
remove_room: function(room_id, callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("room");
		console.log("db: remove room: " + room_id);
		collection.remove({id: Number(room_id)}, function(err, result){
			callback();	
		});
	});
}, // end of remove_room()

// query the db to find the map
find_map: function(map_id, callback){
	mongoClient.connect(conn, function(err, db){
		if(!db || err){
			console.log('err: ' + JSON.stringify(err));
			return;
		}
		var collection = db.collection("map");
		console.log("db: Query for the map " + map_id);
		collection.findOne({id: Number(map_id)}, function(err, result){
			callback(result);
		});
	});
}	// end of find_map()

}	// end of module.exports

