// Centralized Event Handlers
var GameRenderEventHandler = {
    PlanetEventHandler: {
        mouseOver: function(e){ if((e.target.parent.data.pid == Game.myPlayerId)&&(Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)){
            if(GameRenderState.Mouse.pressMoving == false){
                e.target.parent.planetRange.alpha = 1;
                e.target.parent.planetLevel.alpha = 1;
                e.target.parent.planetUpgrade.alpha = 1;
                e.target.parent.planetInfoContainer.alpha = 0.5;
            }
        }},
        mouseOut: function(e){
            if(Game.players[Game.myPlayerId].abilities_info[2].effecting == 0){
                e.target.parent.planetRange.alpha = 0;
                e.target.parent.planetLevel.alpha = 0;
            }
            e.target.parent.planetUpgrade.alpha = 0;
            e.target.parent.planetInfoContainer.alpha = 0;
        },
        pressMove: function(e){ if((e.target.parent.data.pid == Game.myPlayerId)&&(Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)){ 
            var targetCircle = e.target.parent.planetCircle;
            var fromX = targetCircle.parent.x;
            var fromY = targetCircle.parent.y;
            var toX = e.stageX;
            var toY = e.stageY;

            GameRenderState.Mouse.pressMoving = true;

            var pow = Math.pow;
            var outOfRange = (
                    pow(fromX - toX, 2) + 
                    pow(fromY - toY, 2) - 
                    pow(targetCircle.parent.data.range, 2) 
                    > 0
                );

            var targetObj = GameStage.getObjectUnderPoint(e.stageX, e.stageY);
            if(
                targetObj &&
                targetObj.typeName &&
                (targetObj.typeName == 'Planet Circle' || targetObj.typeName == 'Planet Text' || targetObj.typeName == 'Planet Super Hit Area')
                && (targetObj.parent.data.pid != -2) 
            ){
                toX = targetObj.parent.x;
                toY = targetObj.parent.y;
                outOfRange = (
                        pow(fromX - toX, 2) + 
                        pow(fromY - toY, 2) - 
                        pow(targetCircle.parent.data.range + targetObj.parent.data.radius, 2) 
                        > 0
                    );
            }

            // reset target planet graphic
            targetCircle.parent.planetRange.alpha = 1;
            targetCircle.parent.planetLevel.alpha = 1;
            targetCircle.parent.planetUpgrade.alpha = 1;
            targetCircle.parent.planetInfoContainer.alpha = 0.5;

            var strokeColor = "#fff";      // default value
            switch(targetCircle.parent.data.pid){
                case 0: // red
                    strokeColor = "#f09";
                    break; 
                case 1: // green
                    strokeColor = "#0f0";
                    break;
                case 2: // blue
                    strokeColor = "#49f";
                    break;
            }


            GameStage.dragLine.graphics.clear()
                .setStrokeStyle(2, "round")
                .beginStroke(strokeColor)
                .moveTo(fromX, fromY)
                .lineTo(toX, toY);
            
            if(outOfRange){
                GameStage.dragLine.alpha = 0.1;
            }else{
                GameStage.dragLine.alpha = 1;
            }
        }},
        pressUp: function(e){ if((e.target.parent.planetCircle.parent.data.pid == Game.myPlayerId)&&(Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)) {
            var targetCircle = e.target.parent.planetCircle;
            var fromX = targetCircle.parent.x;
            var fromY = targetCircle.parent.y;
            var toX = e.stageX;
            var toY = e.stageY;

            // var targetObj = GameStage.getObjectUnderPoint(e.stageX, e.stageY);
            var targetObj = null;
            var targetObjArray = GameStage.getObjectsUnderPoint(toX, toY);

            // Prevent Library Bug in Nested Container
            for (var j = 0; j < targetObjArray.length; j++) {
                if(
                    targetObjArray[j] &&
                    targetObjArray[j].typeName &&
                    (targetObjArray[j].typeName == 'Planet Circle' || targetObjArray[j].typeName == 'Planet Text' || targetObjArray[j].typeName == 'Planet Super Hit Area')
                ){
                    targetObj = targetObjArray[j];
                    break;
                }
            }

            if(!targetObj){
                console.log('Cannot find planet in target object array ', targetObjArray);
            }
            
            if(targetObj){
                console.log('target obj [' + targetObj.typeName + ']: (' + targetObj.parent.x + ', ' + targetObj.parent.y + ')');

                toX = targetObj.parent.x;
                toY = targetObj.parent.y;

                var pow = Math.pow;
                var powDist = pow(fromX - toX, 2) + pow(fromY - toY, 2);
                var outOfRange = (
                        (powDist > pow(targetCircle.parent.data.range + targetObj.parent.data.radius, 2)) || 
                        (powDist < pow(targetCircle.parent.data.radius, 2))
                    );

                if(!outOfRange){
                    console.log('Planet #' + targetCircle.parent.data.id + ' --> Planet #' + targetObj.parent.data.id);
                    console.log('Before: (' + targetCircle.parent.data.fleet + ') --> (' + targetObj.parent.data.fleet + ')');

                    //Percentage
                    
                    // [T_T BUG hard fix]
                    var transfer_unit = Math.floor((targetCircle.parent.data.fleet) * (Game.players[Game.myPlayerId].percentage/10));
                    if ((targetCircle.parent.data.fleet >=2) && (Game.terminate == 0) && (targetCircle.parent.data.fleet >= transfer_unit)){
                    //if(true){
                        send_transfer(targetCircle.parent.data.id, targetObj.parent.data.id, transfer_unit);
                        // console.log('After: (' + Game.Map.planets[targetCircle.parent.data.id].fleet + ') --> (' + Game.Map.planets[targetObj.parent.data.id].fleet + ')');

                        // send fleet function is modulized
                        // send fleet is moved to logic-transfer
                    }
                    else{
                        console.log("Fleet less than 1 fleet");
                    }

                }else{
                    console.log("Out Of Range!");
                }
            }

            // reset target planet graphic
            targetCircle.parent.planetRange.alpha = 0;
            targetCircle.parent.planetLevel.alpha = 0;
            targetCircle.parent.planetUpgrade.alpha = 0;
            targetCircle.parent.planetInfoContainer.alpha = 0;

            GameStage.dragLine.graphics.clear();
            GameStage.dragLine.alpha = 0;

            GameRenderState.Mouse.pressMoving = false;
        }},

        sendFleet: function(from, to){ // from and to are planet_id
            var fromX = Game.Map.planets[from].x;
            var fromY = Game.Map.planets[from].y;
            var toX = Game.Map.planets[to].x;
            var toY = Game.Map.planets[to].y;

            var is_attack = (Game.Map.planets[from].pid != Game.Map.planets[to].pid)? 1 : 0 ;

            // calculate rotation angle
            var delta_y = (toY - fromY);
            var delta_x = (toX - fromX);
            var theAngle = ((Math.atan( delta_y / delta_x )) / Math.PI) * 180 + 120;
            if(delta_x < 0){
                theAngle += 180;
            }

            // get fleet color by source planet
            var strokeColor = "#fff";      // default value
            var fillColor = "#ddd";        // default value
            switch(Game.Map.planets[from].pid){
                case 0: // red
                    strokeColor = "#f09";
                    fillColor = "#fff";
                    break; 
                case 1: // green
                    strokeColor = "#ff0";
                    fillColor = "#0f0";
                    break;
                case 2: // blue
                    strokeColor = "#00f";
                    fillColor = "#0ff";
                    break;
            }

            var fleet = new createjs.Shape();
            fleet.rotationAngle = theAngle;
            fleet.startTS = (new Date()).getTime();
            fleet.fromX = fromX;
            fleet.fromY = fromY;
            fleet.toX = toX;
            fleet.toY = toY;
            fleet.x = fleet.fromX;
            fleet.y = fleet.fromY;
            fleet.graphics
                .setStrokeStyle(2,"round")
                .beginStroke(strokeColor)
                .beginFill(fillColor)
                .drawPolyStar(0, 0, 10, 3, 0.7, fleet.rotationAngle);
            fleet.is_attack = is_attack;

            GameStage.attackContainer.addChild(fleet);
        }
    },
    Ability: { 
        router: function(e){if((Game.players[Game.myPlayerId].dead ==0)&&(Game.terminate ==0)){
            switch(e.target.parent.abilityId){
                case 1: 
                    //TODO: Electric Shock Action
                    //console.log("Ability: Electric Shock");
                    if (Game.players[Game.myPlayerId].abilities_info[1].waiting == 0)
                        send_abilities(1, -1);
                    break;
                case 2: 
                    //TODO: Assassin Action
                    //console.log("Ability: Assassin")
                    if (Game.players[Game.myPlayerId].abilities_info[2].waiting == 0)
                        send_abilities(2, -1);
                    break;
                case 3: 
                    //TODO: Rempage Action
                    //console.log("Ability: Rampage");
                    if (Game.players[Game.myPlayerId].abilities_info[3].waiting == 0)
                        send_abilities(3, -1);
                    break;
                default: 
                    console.error(e.target.parent.abilityId + ' is NOT a valid ability ID');
            }
        }},
        mouseOver: function(e){
            e.target.parent.iconBackground.alpha = 1;
        },
        mouseOut: function(e){
            e.target.parent.iconBackground.alpha = 0.2;
        },
        regeneratePressMove: function(e){ if((Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)&&(Game.players[Game.myPlayerId].abilities_info[0].waiting == 0)){
            var sourceObj = e.target;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x + 25;
            var fromY = fromGlobalPoint.y + 25;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = GameStage.getObjectUnderPoint(toX, toY);
            if(
                targetObj &&
                targetObj.typeName &&
                (targetObj.typeName == 'Planet Circle' || targetObj.typeName == 'Planet Text' || targetObj.typeName == 'Planet Super Hit Area')
                && (targetObj.parent.data.pid != -2) 
            ){
                toX = targetObj.parent.x;
                toY = targetObj.parent.y;
            }

            GameStage.dragLine.graphics.clear()
                .setStrokeStyle(2, "round")
                .beginStroke('#ccc')
                .moveTo(fromX, fromY)
                .lineTo(toX, toY);
            GameStage.dragLine.alpha = 1;
        }},
        regeneratePressUp: function(e){ if((Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)&&(Game.players[Game.myPlayerId].abilities_info[0].waiting == 0)){
            var sourceObj = e.target.parent;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x;
            var fromY = fromGlobalPoint.y;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = null;
            var targetObjArray = GameStage.getObjectsUnderPoint(toX, toY);

            // Prevent Library Bug in Nested Container
            for (var j = 0; j < targetObjArray.length; j++) {
                if(
                    targetObjArray[j] &&
                    targetObjArray[j].typeName &&
                    (targetObjArray[j].typeName == 'Planet Circle' || targetObjArray[j].typeName == 'Planet Text' || targetObjArray[j].typeName == 'Planet Super Hit Area')
                ){
                    targetObj = targetObjArray[j];
                    break;
                }
            }

            if(targetObj){
                console.log('Regenerate Ability at Planet #' + targetObj.parent.data.id);
                //TODO: Insert Regenerate Action here
                if(targetObj.parent.data.pid == Game.myPlayerId){
                    send_abilities(0, targetObj.parent.data.id);
                    createjs.Sound.play("sound_transfer").volume = 3;
                }
                else{
                    console.log("You cannot regenerate enemy");
                }
            }

            GameStage.dragLine.graphics.clear();
            GameStage.dragLine.alpha = 0;
        }}
    },
    Bomb: {
        mouseOver: function(e){
            if(Game.players[Game.myPlayerId].bomb == 1){
                e.target.parent.iconBackground.alpha = 1;
            }
        },
        mouseOut: function(e){
            e.target.parent.iconBackground.alpha = 0.2;
        },
        pressMove: function(e){if((Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)&&(Game.players[Game.myPlayerId].bomb_countdown == 0)&&(Game.players[Game.myPlayerId].bomb == 1)){
            var sourceObj = e.target;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x + 25;
            var fromY = fromGlobalPoint.y + 25;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = GameStage.getObjectUnderPoint(toX, toY);
            if(
                targetObj &&
                targetObj.typeName &&
                (targetObj.typeName == 'Planet Circle' || targetObj.typeName == 'Planet Text' || targetObj.typeName == 'Planet Super Hit Area')
                && (targetObj.parent.data.pid != -2) 
            ){
                toX = targetObj.parent.x;
                toY = targetObj.parent.y;
            }

            GameStage.dragLine.graphics.clear()
                .setStrokeStyle(2, "round")
                .beginStroke('#ccc')
                .moveTo(fromX, fromY)
                .lineTo(toX, toY);
            GameStage.dragLine.alpha = 1;
        }},
        pressUp: function(e){if((Game.terminate == 0)&&(Game.players[Game.myPlayerId].dead ==0)&&(Game.players[Game.myPlayerId].bomb_countdown == 0)){
            var sourceObj = e.target.parent;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x;
            var fromY = fromGlobalPoint.y;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = null;
            var targetObjArray = GameStage.getObjectsUnderPoint(toX, toY);        

            // Prevent Library Bug in Nested Container
            for (var j = 0; j < targetObjArray.length; j++) {
                if(
                    targetObjArray[j] &&
                    targetObjArray[j].typeName &&
                    (targetObjArray[j].typeName == 'Planet Circle' || targetObjArray[j].typeName == 'Planet Text' || targetObjArray[j].typeName == 'Planet Super Hit Area')
                ){
                    targetObj = targetObjArray[j];
                    break;
                }
            }

            if(targetObj){
                console.log('Planet Bomb at Planet #' + targetObj.parent.data.id);
                //TODO: Insert Bomb Action here
                send_bomb(targetObj.parent.data.id);
                //createjs.Sound.play("sound_explode").volume = 0.5;
            }

            GameStage.dragLine.graphics.clear();
            GameStage.dragLine.alpha = 0;

        }}
    },
    Upgrade: {
        mouseOver: function(e){if((Game.players[Game.myPlayerId].dead ==0)&&(Game.terminate ==0)){
            e.target.parent.iconBackground.alpha = 1;
        }},
        mouseOut: function(e){
            e.target.parent.iconBackground.alpha = 0.2;
        },
        pressMove: function(e){if((Game.players[Game.myPlayerId].dead ==0)&&(Game.terminate ==0)){
            var sourceObj = e.target;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x + 25;
            var fromY = fromGlobalPoint.y + 25;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = GameStage.getObjectUnderPoint(toX, toY);
            if(
                targetObj &&
                targetObj.typeName &&
                (targetObj.typeName == 'Planet Circle' || targetObj.typeName == 'Planet Text' || targetObj.typeName == 'Planet Super Hit Area')
                && (targetObj.parent.data.pid != -2) 
            ){
                toX = targetObj.parent.x;
                toY = targetObj.parent.y;
            }

            GameStage.dragLine.graphics.clear()
                .setStrokeStyle(2, "round")
                .beginStroke('#ccc')
                .moveTo(fromX, fromY)
                .lineTo(toX, toY);
            GameStage.dragLine.alpha = 1;
        }},
        pressUp: function(e){if((Game.players[Game.myPlayerId].dead ==0)&&(Game.terminate ==0)){
            var sourceObj = e.target.parent;
            var fromGlobalPoint = sourceObj.localToGlobal(sourceObj.x, sourceObj.y);
            var fromX = fromGlobalPoint.x;
            var fromY = fromGlobalPoint.y;
            var toX = e.stageX;
            var toY = e.stageY;

            var targetObj = null;
            var targetObjArray = GameStage.getObjectsUnderPoint(toX, toY);        

            // Prevent Library Bug in Nested Container
            for (var j = 0; j < targetObjArray.length; j++) {
                if(
                    targetObjArray[j] &&
                    targetObjArray[j].typeName &&
                    (targetObjArray[j].typeName == 'Planet Circle' || targetObjArray[j].typeName == 'Planet Text' || targetObjArray[j].typeName == 'Planet Super Hit Area')
                ){
                    targetObj = targetObjArray[j];
                    break;
                }
            }

            if(targetObj){
                console.log('Upgrade Planet #' + targetObj.parent.data.id);
                //TODO: Insert Bomb Action here
                if(targetObj.parent.data.pid == Game.myPlayerId){
                    send_upgrade(targetObj.parent.data.id);
                }
                else
                    console.log("You cannot upgrade enemy");
            }

            GameStage.dragLine.graphics.clear();
            GameStage.dragLine.alpha = 0;

        }}
    },
    Ticker:{
        tick: function(e){
            if(check_endgame() == true && Game.terminate == 0){  //end game
                createjs.Sound.stop("sound_background");
                createjs.Sound.play("sound_win");
                Game.terminate = 1;
                document.getElementById("time").innerHTML = "End Game";
                setTimeout(function(){
                    window.location.href = "game_hall.html";
                    //window.location.href ="http://google.com";
                    //alert("End Game after 10 secdons");
                }, 10000);
            }
            else if (check_endgame() == true && Game.terminate == 1){  //after condition 1  -> return to game hall
                GameRenderUtils.updateAttackContainer();
                GameRenderUtils.updatePlanetInfo();
                GameStage.update();    
            }
            else if (check_endgame() == false && Game.terminate == 1){  // electric shock
                GameRenderUtils.updateAttackContainer();
                GameRenderUtils.updatePlanetInfo();
                time_checker();
                GameStage.update();    
            }
            else{
                GameRenderUtils.updateAttackContainer();
                GameRenderUtils.updatePlanetInfo();
                time_checker();
                GameStage.update();         
            }
        }
    }
};