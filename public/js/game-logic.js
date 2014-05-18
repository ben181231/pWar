function transfer(from, to, unit) {
	//Check if pid of two planets is the same
	//console.log("Game.Map.planets: "+Game.Map.planets[from].id+" "+Game.Map.planets[to].id);

	if(Game.Map.planets[from] == null || Game.Map.planets[to] == null) {
		console.log("Invalid Action: Planet does not exist");
		return;
	}

	// if(Game.freezing_others != -1) {
	// 	if(Game.freezing_others != Game.Map.planets[from].pid) {
	// 		console.log("Invalid Action: You cannot move");
	// 		return;
	// 	}
	// }
	
	// if(Game.Map.planets[from].fleet < unit){
	// 	console.log("Invalid Action: Not enough fleets");
	// 	return;
	// }
	
	//calculate range
	var distance = Math.sqrt((Game.Map.planets[from].x - Game.Map.planets[to].x)*(Game.Map.planets[from].x - Game.Map.planets[to].x) + (Game.Map.planets[from].y - Game.Map.planets[to].y)*(Game.Map.planets[from].y - Game.Map.planets[to].y));
	distance -= Game.Map.planets[to].radius;
	if(Game.Map.planets[from].range < distance) {
		console.log("Invalid Action: Out of range");
		return;
	}
	else{
		GameRenderEventHandler.PlanetEventHandler.sendFleet(from, to); // add event


		Game.Map.planets[from].fleet -= unit;

		setTimeout(function(){ 
			if(Game.Map.planets[from].pid == Game.Map.planets[to].pid) { //increase population
	            Game.Map.planets[to].fleet += unit;
				console.log(unit+" fleets is transferred from Planet"+Game.Map.planets[from].id+" to Planet"+Game.Map.planets[to].id);
			}
			else { //Attack
				console.log("Planet"+Game.Map.planets[from].id+" attacks Planet"+Game.Map.planets[to].id+" with "+unit+" fleets!");
				//TODO: Special handle of abilities
				var power = unit*(Game.Map.planets[from].level);
				var to_unit = Game.Map.planets[to].fleet*Game.Map.planets[to].level;

				if(Game.Map.planets[to].pid != -1){
					if(Game.players[Game.Map.planets[to].pid].abilities_info[3].effecting != 0) {
						//console.log("Player"+Game.Map.planets[to].pid+" is in Rampage");
						to_unit = Math.floor(to_unit*0.75);
					}
				}

				var from_unit = unit*Game.Map.planets[from].level;
				if(Game.Map.planets[from].pid != -1){
					if(Game.players[Game.Map.planets[from].pid].abilities_info[3].effecting != 0) {
						//console.log("Player"+Game.Map.planets[from].pid+" is in Rampage");
						from_unit = from_unit*2;
					}
				}
				
				var remains = to_unit - from_unit;
				if(remains >= 0) { //Planet damaged
					Game.Map.planets[to].fleet = Math.floor(remains/Game.Map.planets[to].level);
				}
				else {//Planet Intruded 
					Game.Map.planets[to].level = 1;
					Game.Map.planets[to].rate = 1;
					Game.Map.planets[to].fleet = Math.floor(Math.abs(remains)/Game.Map.planets[from].level);
					//Game.Map.planets[to].fleet = Math.abs(Game.Map.planets[to].fleet);
					Game.Map.planets[to].pid = Game.Map.planets[from].pid;
					//console.log("Planet"+Game.Map.planets[to].id+" is invaded by Player"+Game.Map.planets[to].pid);
				}
			}	
		}, 150);	
	}	
}

function upgrade(pid, upgrade_planet_id) {

	if(Game.Map.planets[upgrade_planet_id] == null) { //No such planet
		console.log("Invalid Action: Planet does not exist");
		return;
	}
	
	// if(Game.freezing_others != -1) {
	// 	if(Game.freezing_others != Game.Map.planets[upgrade_planet_id].pid) {
	// 		console.log("Invalid Action: You cannot move");
	// 		return;
	// 	}
	// }

	if(Game.Map.planets[upgrade_planet_id].level == 4) { //Already the highest level
		console.log("Invalid Action: Already highest level");
		return;
	}
	
	var required_population = Math.pow(Game.Map.planets[upgrade_planet_id].level, 2)*100;
	
	if(Game.Map.planets[upgrade_planet_id].fleet < required_population) { //Not enough fleets to upgrade
		console.log("Invalid Action: Not enough fleets");
		return;
	}
	else {// valid upgrade
		Game.Map.planets[upgrade_planet_id].level ++;
		Game.Map.planets[upgrade_planet_id].rate = Math.floor(Game.Map.planets[upgrade_planet_id].rate*Math.pow(1.5, Game.Map.planets[upgrade_planet_id].level));
		Game.Map.planets[upgrade_planet_id].fleet -= required_population;
		console.log("Planet"+Game.Map.planets[upgrade_planet_id].id+" is upgraded to level "+Game.Map.planets[upgrade_planet_id].level+"!");

		if(pid == Game.myPlayerId){
			createjs.Sound.play("sound_upgrade").volume = 0.5;
		}
	}
}

function bomb(pid, target_planet) {

	// if(Game.freezing_others != -1) {
	// 	if(Game.freezing_others != pid) {
	// 		console.log("Invalid Action: You cannot move");
	// 		return;
	// 	}
	// }

	if(Game.Map.planets[target_planet] == null) { // No such planet
		console.log("Invalid Action: Planet does not exist");
		return;
	}
	if(Game.players[pid].bomb == 0) { //No bomb
		console.log("Invalid Action: You have already used your bomb");
		return;
	}

	(function(){
        var exp = new createjs.Sprite(Resources.SpriteSheet.Effect.shade, "explode");
        exp.setTransform(Game.Map.planets[target_planet].x, Game.Map.planets[target_planet].y, 1, 1);
        exp.framerate = 0.5;
        exp.gotoAndPlay(0);
        GameStage.addChild(exp);
        createjs.Sound.play("sound_explode").volume = 0.5;

        setTimeout(function(){
            //console.log("in timeout closure");
            GameStage.removeChild(exp);
            //createjs.Sound.addEventListener("fileload", playSound_Explode);
        }, 600);
    })();


	//Game.Map.planets[target_planet] = null;
	Game.Map.planets[target_planet].pid = -2;
	Game.Map.planets[target_planet].x = -1000;
	Game.Map.planets[target_planet].y = -1000;
	Game.players[pid].bomb = 0;
	
	if(pid == Game.myPlayerId){
		GameStage.toolArea.planetBombContainer.icon.alpha = 0.2;
	}
	console.log("Planet"+target_planet+" is destroyed");
}

function abilities(pid, Aid, target_planet) {

	// if(Game.freezing_others != -1) {
	// 	if(Game.freezing_others != pid) {
	// 		console.log("Invalid Action: You cannot move");
	// 		return;
	// 	}
	// }

	// if(Game.players[pid].abilities[Aid].waiting != 0){
	// 	console.log("Invalid Action: Cooling Down");
	// 	return;
	// }

	if(Aid == 0){ //Regenerate
		if(Game.Map.planets[target_planet] == null) {
			console.log("Invalid Action: Planet does not exist");
			return;
		}
		
		if(Game.Map.planets[target_planet].pid != pid) {
			console.log("Invalid Action: This is not your planet");
			return;
		}
		console.log("Regenerate is under action");
		Game.Map.planets[target_planet].fleet += 20;
		Game.players[pid].abilities_info[0].waiting = 40;
		//Game.players[pid].abilities[Aid].waiting = Game.players[pid].abilities[Aid].required_coolDown;
	}
	else if(Aid == 1){ //Electric shock
		// Game.freezing_others = pid;
		// Game.players[pid].abilities[Aid].effecting = Game.players[pid].abilities[Aid].effectTime;
		// Game.players[pid].abilities[Aid].waiting = Game.players[pid].abilities[Aid].required_coolDown;
		if(pid != Game.myPlayerId){
			Game.terminate = 1;
			document.getElementById("time").innerHTML = "You have been SHOCKED!";
			document.getElementById("gameCanvas").style.border = "3px solid #FF0";
			setTimeout(function(){
			    Game.terminate = 0;
			    document.getElementById("gameCanvas").style.border = "3px solid #999";
			}, 5000);
		}
		console.log("ELectric Shock is under action");
		Game.players[pid].abilities_info[1].effecting = 5;
		Game.players[pid].abilities_info[1].waiting = 30;
	}
	else if(Aid == 2){ //Assassin
		// Game.players[pid].abilities[Aid].effecting = Game.players[pid].abilities[Aid].effectTime;
		// Game.players[pid].abilities[Aid].waiting = Game.players[pid].abilities[Aid].required_coolDown;
		if(pid == Game.myPlayerId){
			for(var i=0; i<GameStage.planetDrawingArray.length; i++){
				GameStage.planetDrawingArray[i].planetRange.alpha = 1;
	            GameStage.planetDrawingArray[i].planetLevel.alpha = 1;
	        }
	        console.log("Assassin is under action");
	        document.getElementById("time").innerHTML = "You are under ASSASSIN mode!";
	        document.getElementById("gameCanvas").style.border = "3px solid #F0F";
	        setTimeout(function(){
			    for(var i=0; i<GameStage.planetDrawingArray.length; i++){
					GameStage.planetDrawingArray[i].planetRange.alpha = 0;
			        GameStage.planetDrawingArray[i].planetLevel.alpha = 0;
			        document.getElementById("gameCanvas").style.border = "3px solid #999";
			    }
			}, 5000);
		}
        Game.players[pid].abilities_info[2].effecting = 5;
		Game.players[pid].abilities_info[2].waiting = 25;
	}
	else if(Aid == 3){ //Rampage
		console.log("Rampage is under action");
		

		if(pid == Game.myPlayerId){
			document.getElementById("time").innerHTML = "You are under RAMPAGE mode!";
			document.getElementById("gameCanvas").style.border = "3px solid #F00";
		}

		Game.players[pid].abilities_info[3].effecting = 5;
		Game.players[pid].abilities_info[3].waiting = 50;
		setTimeout(function(){
		    document.getElementById("gameCanvas").style.border = "3px solid #999";
		}, 10000);
	}
}

function check_endgame() {
	/* Check end Game */
	var players_alive = new Array(Game.players.length);
	var red_alive = 0, blue_alive = 0, green_alive = 0;

	for(var x = 0; x < Game.Map.planets.length; x++) {
		if(Game.Map.planets[x].pid != -1) {
			players_alive[Game.Map.planets[x].pid] = 1;
		}
		if(Game.Map.planets[x].pid == 0) {
			red_alive = 1;
		}
		if(Game.Map.planets[x].pid == 1) {
			green_alive = 1;
		}
		if(Game.Map.planets[x].pid == 2) {
			blue_alive = 1;
		}
	}
	if(red_alive == 0) Game.players[0].dead = 1;
	if(green_alive == 0) Game.players[1].dead = 1;
	if(blue_alive == 0) Game.players[2].dead = 1;


	var check_alive = red_alive + green_alive + blue_alive;
	if(check_alive == 1){
		// Game.terminate = 1;
		return true;
	}
	/* Check end Game ends */
}

function time_checker() {

	var current_time = new Date();
	var time_difference = current_time.getTime() - Game.time;
	
	//console.log("Time difference: "+time_difference+" ms");

	if(time_difference >= 1000) {
		for(var i = 0; i < Game.Map.planets.length; i++) {//fleet update
			if(Game.Map.planets[i] != null && Game.Map.planets[i].pid != -1)
				Game.Map.planets[i].fleet += Game.Map.planets[i].rate;
		}

		Game.time = current_time.getTime() + 1000 - time_difference;
		Game.total_time += 1;

		// effect/cooldown counter
		for(var i = 0; i < 3; i++){
			for(var j = 0; j < 4; j++){
				if(Game.players[i].abilities_info[j].effecting > 0) Game.players[i].abilities_info[j].effecting -= 1;
				if(Game.players[i].abilities_info[j].waiting > 0) Game.players[i].abilities_info[j].waiting -= 1;
			}
		}
		if(Game.players[Game.myPlayerId].bomb_countdown > 0) Game.players[Game.myPlayerId].bomb_countdown -= 1;


		//if(Game.players[Game.myPlayerId].abilities_info[2].waiting > 0) console.log("Electric Shock = "+Game.players[Game.myPlayerId].abilities_info[2].waiting);
		//if(Game.players[Game.myPlayerId].abilities_info[2].effecting > 0) console.log("Electric Shock = "+Game.players[Game.myPlayerId].abilities_info[2].effecting);

		if((Game.terminate == 0)&&(Game.players[Game.myPlayerId].abilities_info[1].effecting == 0)&&(Game.players[Game.myPlayerId].abilities_info[2].effecting == 0)&&(Game.players[Game.myPlayerId].abilities_info[3].effecting == 0)){
			document.getElementById("time").innerHTML = "Elapsed time : " + Game.total_time + " seconds";
		}

		//Counter Bar

		GameStage.removeChild(Game.Bar.bomb);
        GameStage.removeChild(Game.Bar.regenerate);
        GameStage.removeChild(Game.Bar.electric);
        GameStage.removeChild(Game.Bar.assasin);
        GameStage.removeChild(Game.Bar.rampage);

		var countBar = new createjs.Graphics();
        countBar.beginFill("#FFF").drawRect(0, 0, 50, 5);

        var bomb_width = Game.players[Game.myPlayerId].bomb_countdown/60;
        var regenerate_width = Game.players[Game.myPlayerId].abilities_info[0].waiting/40;
        var electric_width = Game.players[Game.myPlayerId].abilities_info[1].waiting/30;
        var assassin_width = Game.players[Game.myPlayerId].abilities_info[2].waiting/25;
        var rampage_width = Game.players[Game.myPlayerId].abilities_info[3].waiting/50;

        Game.Bar.bomb = new createjs.Shape(countBar).setTransform(815, 70, bomb_width, 1);
        Game.Bar.regenerate = new createjs.Shape(countBar).setTransform(815, 140, regenerate_width, 1);
        Game.Bar.electric = new createjs.Shape(countBar).setTransform(815, 210, electric_width, 1);
        Game.Bar.assasin = new createjs.Shape(countBar).setTransform(815, 280, assassin_width, 1);
        Game.Bar.rampage = new createjs.Shape(countBar).setTransform(815, 350, rampage_width, 1);

        GameStage.addChild(Game.Bar.bomb);
        GameStage.addChild(Game.Bar.regenerate);
        GameStage.addChild(Game.Bar.electric);
        GameStage.addChild(Game.Bar.assasin);
        GameStage.addChild(Game.Bar.rampage);

		//Game.time = current_time.getTime();
		//console.log(Game.time);
		//console.log(Game.total_time);
	}
}





