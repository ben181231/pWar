// Centralized Render Utils
var GameRenderUtils = {
    getColorByPlayerId: function(pid){
        var theColor = "";
        if(typeof pid != "number") pid = -1;

        switch(pid){
            case 0: 
                theColor = "#f09"; 
                break;
            case 1: 
                theColor = "#0f0"; 
                break;
            case 2: 
                theColor = "#49f"; 
                break;
            case -2:
                theColor = "#000"; 
                break;
            default: 
                theColor = "#ccc"; 
                break;
        }

        return theColor;
    },
    getSpriteSheetByPlayerId: function(pid){
        var theSpriteSheet = null;
        if(typeof pid != "number") pid = -1;

        switch(pid){
            case 0: 
                theSpriteSheet = Resources.SpriteSheet.Planets.red; 
                break;
            case 1: 
                theSpriteSheet = Resources.SpriteSheet.Planets.green; 
                break;
            case 2: 
                theSpriteSheet = Resources.SpriteSheet.Planets.blue; 
                break;
            case -2:
                theSpriteSheet = Resources.SpriteSheet.Planets.white; 
                break;
            default: 
                theSpriteSheet = Resources.SpriteSheet.Planets.grey; 
                break;
        }

        return theSpriteSheet;
    },
    preparePlanet: function(planetData, renderQueue){
        if(!GameStage){
            console.error(GameStage + ' is not a stage');
            return;
        }
        if(!renderQueue){
            console.error(renderQueue + ' is not a rendering queue');
            return;
        }

        var planetDrawing = new createjs.Container();
        planetDrawing.data = planetData;

        planetDrawing.renderLevel = planetDrawing.data.level;

        var planetColor 
            = planetDrawing.renderColor 
            = GameRenderUtils.getColorByPlayerId(planetDrawing.data.pid);

        var planetSprite 
            = planetDrawing.renderSprite 
            = GameRenderUtils.getSpriteSheetByPlayerId(planetDrawing.data.pid);

        var planetHitArea
            = planetDrawing.planetHitArea
            = new createjs.Shape();

        planetHitArea.graphics.beginFill('#111').drawCircle(0, 0, planetDrawing.data.radius + 5);
        planetHitArea.typeName = "Planet Hit Area";
        planetHitArea.alpha = 0.1;
        

        planetDrawing.planetCircle = new createjs.Sprite(planetSprite, "run");

        var sprite_ratio = planetDrawing.data.radius/25;
        planetDrawing.planetCircle.setTransform(0, 0, sprite_ratio, sprite_ratio, 0, 0);

        planetDrawing.planetCircle.gotoAndPlay((Math.random() * 60) | 0);
        planetDrawing.planetCircle.typeName = "Planet Circle";
        planetDrawing.planetCircle.hitArea = planetHitArea;

        /* BUG: hit area sometimes cannot catch pressup event */
        // planetDrawing.planetCircle.on("mouseover", GameRenderEventHandler.PlanetEventHandler.mouseOver);
        // planetDrawing.planetCircle.on("mouseout", GameRenderEventHandler.PlanetEventHandler.mouseOut);
        // planetDrawing.planetCircle.on("pressmove", GameRenderEventHandler.PlanetEventHandler.pressMove);
        // planetDrawing.planetCircle.on("pressup", GameRenderEventHandler.PlanetEventHandler.pressUp);

        planetDrawing.planetText = new createjs.Text("" + planetDrawing.data.fleet, "regular Arial", "#fff");
        planetDrawing.planetText.textAlign = "center";
        planetDrawing.planetText.typeName = "Planet Text";
        planetDrawing.planetText.y = -7;

        planetDrawing.planetSuperHitArea = new createjs.Shape();
        planetDrawing.planetSuperHitArea.graphics.beginFill('#111').drawCircle(0, 0, planetDrawing.data.radius + 5);
        planetDrawing.planetSuperHitArea.typeName = "Planet Super Hit Area";
        planetDrawing.planetSuperHitArea.alpha = 0.1;

        planetDrawing.planetSuperHitArea.on("mouseover", GameRenderEventHandler.PlanetEventHandler.mouseOver);
        planetDrawing.planetSuperHitArea.on("mouseout", GameRenderEventHandler.PlanetEventHandler.mouseOut);
        planetDrawing.planetSuperHitArea.on("pressmove", GameRenderEventHandler.PlanetEventHandler.pressMove);
        planetDrawing.planetSuperHitArea.on("pressup", GameRenderEventHandler.PlanetEventHandler.pressUp);

        planetDrawing.planetRange = new createjs.Shape();
        planetDrawing.planetRange.graphics
            .setStrokeStyle(2, "round")
            .beginStroke(planetColor)
            .drawCircle(0, 0, planetDrawing.data.range);
        planetDrawing.planetRange.typeName = "Planet Range";
        planetDrawing.planetRange.alpha = 0;
        planetDrawing.planetRange.x = planetDrawing.data.x;
        planetDrawing.planetRange.y = planetDrawing.data.y;

        // Level
        planetDrawing.planetLevel = new createjs.Text("Planet " + planetDrawing.data.id + "\n" + "Level " + planetDrawing.data.level, "15px regular Arial", planetColor);
        
        planetDrawing.planetLevel.typeName = "Planet Level";
        planetDrawing.planetLevel.x = planetDrawing.data.x+35;
        planetDrawing.planetLevel.y = planetDrawing.data.y-60;
        planetDrawing.planetLevel.alpha = 0;

        if(planetDrawing.data.x > 600) { planetDrawing.planetLevel.x -=85; planetDrawing.planetLevel.textAlign = "right";}
        else planetDrawing.planetLevel.textAlign = "left";

        // Upgrade
        if(planetDrawing.data.level < 4)
            planetDrawing.planetUpgrade = new createjs.Text("You can upgrade this planet \nwith " + (Math.pow(parseInt(planetDrawing.data.level), 2)*100) + " fleet to Level " + (parseInt(planetDrawing.data.level)+1), "13px regular Arial", planetColor);
        else if(planetDrawing.data.level == 4)
            planetDrawing.planetUpgrade = new createjs.Text("Your planet upgrade is \nalready maximized" + (parseInt(planetDrawing.data.level)+1), "13px regular Arial", planetColor);


        
        planetDrawing.planetUpgrade.typeName = "Planet Upgrade";
        planetDrawing.planetUpgrade.x = planetDrawing.data.x+35;
        planetDrawing.planetUpgrade.y = planetDrawing.data.y-25;
        planetDrawing.planetUpgrade.alpha = 0;

        if(planetDrawing.data.x > 600) { planetDrawing.planetUpgrade.x -=250;}
        planetDrawing.planetUpgrade.textAlign = "left";

        // The background
        planetDrawing.planetInfoContainer = new createjs.Shape();

        var rect_x = planetDrawing.data.x+25;
        if(planetDrawing.data.x > 600) rect_x -= 250;

        planetDrawing.planetInfoContainer.graphics
            .setStrokeStyle(2, "round")
            .beginStroke(planetColor)
            .beginFill("#000")
            .drawRect(rect_x, planetDrawing.data.y-70, 200, 80);
        planetDrawing.planetInfoContainer.typeName = "Planet Info Container";
        planetDrawing.planetInfoContainer.alpha = 0;

        // planetDrawing.totalTime = new createjs.Text("Elasped time: " + Game.total_time + " seconds", "14px regular Arial", "#0f0");
        // planetDrawing.totalTime.textAlign = "left";
        // planetDrawing.totalTime.typeName = "Total time";
        // planetDrawing.totalTime.x = 60;
        // planetDrawing.totalTime.y = 60;

        planetDrawing.addChild(planetDrawing.planetText);
        planetDrawing.addChild(planetDrawing.planetCircle);
        planetDrawing.addChild(planetDrawing.planetSuperHitArea);

        ///planetDrawing.addChild(planetDrawing.totalTime);

        planetDrawing.x = planetDrawing.data.x;
        planetDrawing.y = planetDrawing.data.y;
        planetDrawing.typeName = "Planet Drawing";

        renderQueue.push(planetDrawing);
    },
    updateAttackContainer: function(){
        var n = GameStage.attackContainer.getNumChildren();
        // console.log(n);
        var currentTS = (new Date()).getTime();
        for(var i=0; i<n; i++){
            var perFleet = GameStage.attackContainer.getChildAt(i);
            
            if(!perFleet) continue;
            
            var perFleetTime = currentTS - perFleet.startTS;
            if(perFleetTime < 150){
                perFleet.x = perFleetTime / 150.0 * (perFleet.toX - perFleet.fromX) + perFleet.fromX;
                perFleet.y = perFleetTime / 150.0 * (perFleet.toY - perFleet.fromY) + perFleet.fromY;
            }else{
                GameStage.attackContainer.removeChildAt(i--);

                // set up a closure to start explosion animation
                if(perFleet.is_attack == 1){
                    (function(){
                        var exp = new createjs.Sprite(Resources.SpriteSheet.Effect.shade, "explode");
                        exp.setTransform(perFleet.toX, perFleet.toY, 0.5, 0.5);
                        exp.framerate = 0.5;
                        exp.gotoAndPlay(0);
                        GameStage.addChild(exp);
                        createjs.Sound.play("sound_explode").volume = 0.5;

                        setTimeout(function(){
                            //console.log("in timeout closure");
                            GameStage.removeChild(exp);
                            //createjs.Sound.addEventListener("fileload", playSound_Explode);
                        }, 300);
                    })();
                }
                else{
                    createjs.Sound.play("sound_transfer").volume = 3;
                }
            }
        }
    },
    prepareToolArea: function(toolArea, abilityArray){
        if(!toolArea){
            console.error(toolArea + ' is NOT a tool area');
            return;
        }
        if(!abilityArray){
            console.error(abilityArray + ' is NOT a ability array');
            return;
        }
        if(!abilityArray.length || 
            abilityArray.length != 4 /* User can only has 2 abilities */
            ){
            console.error('Length of ability array is NOT correct');
            return;
        }

        console.log('Ability Array: [' + abilityArray.join(',') + ']');

        // draw tool area background
        toolArea.backgroundShape = new createjs.Shape();
        toolArea.backgroundShape.alpha = 0.5;
        toolArea.backgroundShape.graphics
            //.beginFill('#808080')
            .beginFill("#000")
            .drawRoundRect(-6, 0, 62, 300, 10);
        toolArea.addChild(toolArea.backgroundShape);

        var offsetY = 20;

        toolArea.planetBombContainer = new createjs.Container();
        toolArea.planetBombContainer.x = 0;
        toolArea.planetBombContainer.y = offsetY;
        toolArea.planetBombContainer.iconBackground = new createjs.Shape();
        toolArea.planetBombContainer.iconBackground.graphics
            .setStrokeStyle(2, "round")
            .beginStroke('#FFF')
            .drawRoundRect(0, 0, 50, 50, 5);
        toolArea.planetBombContainer.iconBackground.alpha = 0.2;
        toolArea.planetBombContainer.addChild(toolArea.planetBombContainer.iconBackground);



        toolArea.planetBombContainer.iconHitArea = new createjs.Shape();
        toolArea.planetBombContainer.iconHitArea.graphics
            .beginFill('#fff')
            .drawRoundRect(0, 0, 100, 100, 5);
        toolArea.planetBombContainer.icon = new createjs.Bitmap(Resources.Icons.Game.bomb);
        toolArea.planetBombContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
        toolArea.planetBombContainer.icon.alpha = 1;
        toolArea.planetBombContainer.icon.hitArea = toolArea.planetBombContainer.iconHitArea;
        toolArea.planetBombContainer.addChild(toolArea.planetBombContainer.icon);
        toolArea.addChild(GameStage.toolArea.planetBombContainer);

        toolArea.planetBombContainer.icon.on("mouseover", GameRenderEventHandler.Bomb.mouseOver);
        toolArea.planetBombContainer.icon.on("mouseout", GameRenderEventHandler.Bomb.mouseOut);
        toolArea.planetBombContainer.icon.on("pressmove", GameRenderEventHandler.Bomb.pressMove);
        toolArea.planetBombContainer.icon.on("pressup", GameRenderEventHandler.Bomb.pressUp);

        offsetY += 70;

        for (var i = 0; i < abilityArray.length; i++) {
            switch(abilityArray[i]){
                case 0:
                    toolArea.regenerateIconContainer = new createjs.Container();
                    toolArea.regenerateIconContainer.abilityId = abilityArray[i];
                    toolArea.regenerateIconContainer.x = 0;
                    toolArea.regenerateIconContainer.y = offsetY;
                    toolArea.regenerateIconContainer.iconBackground = new createjs.Shape();
                    toolArea.regenerateIconContainer.iconBackground.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke('#fff')
                        .drawRoundRect(0, 0, 50, 50, 5);
                    toolArea.regenerateIconContainer.iconBackground.alpha = 0.2;
                    toolArea.regenerateIconContainer.addChild(toolArea.regenerateIconContainer.iconBackground);

                    toolArea.regenerateIconContainer.iconHitArea = new createjs.Shape();
                    toolArea.regenerateIconContainer.iconHitArea.graphics
                        .beginFill('#fff')
                        .drawRoundRect(0, 0, 100, 100, 5);
                    toolArea.regenerateIconContainer.icon = new createjs.Bitmap(Resources.Icons.Abilities.regenerate);
                    toolArea.regenerateIconContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
                    toolArea.regenerateIconContainer.icon.hitArea = toolArea.regenerateIconContainer.iconHitArea;
                    toolArea.regenerateIconContainer.addChild(toolArea.regenerateIconContainer.icon);
                    
                    toolArea.regenerateIconContainer.icon.on("mouseover", GameRenderEventHandler.Ability.mouseOver);
                    toolArea.regenerateIconContainer.icon.on("mouseout", GameRenderEventHandler.Ability.mouseOut);
                    toolArea.regenerateIconContainer.icon.on("pressmove", GameRenderEventHandler.Ability.regeneratePressMove);
                    toolArea.regenerateIconContainer.icon.on("pressup", GameRenderEventHandler.Ability.regeneratePressUp);

                    toolArea.addChild(toolArea.regenerateIconContainer);

                    break;
                case 1:
                    toolArea.electricShockIconContainer = new createjs.Container();
                    toolArea.electricShockIconContainer.abilityId = abilityArray[i];
                    toolArea.electricShockIconContainer.x = 0;
                    toolArea.electricShockIconContainer.y = offsetY;
                    toolArea.electricShockIconContainer.iconBackground = new createjs.Shape();
                    toolArea.electricShockIconContainer.iconBackground.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke('#fff')
                        .drawRoundRect(0, 0, 50, 50, 5);
                    toolArea.electricShockIconContainer.iconBackground.alpha = 0.2;
                    toolArea.electricShockIconContainer.addChild(toolArea.electricShockIconContainer.iconBackground);

                    toolArea.electricShockIconContainer.iconHitArea = new createjs.Shape();
                    toolArea.electricShockIconContainer.iconHitArea.graphics
                        .beginFill('#fff')
                        .drawRoundRect(0, 0, 100, 100, 5);
                    toolArea.electricShockIconContainer.icon = new createjs.Bitmap(Resources.Icons.Abilities.electricShock);
                    toolArea.electricShockIconContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
                    toolArea.electricShockIconContainer.icon.hitArea = toolArea.electricShockIconContainer.iconHitArea;
                    toolArea.electricShockIconContainer.addChild(toolArea.electricShockIconContainer.icon);

                    toolArea.electricShockIconContainer.icon.on("click", GameRenderEventHandler.Ability.router);
                    toolArea.electricShockIconContainer.icon.on("mouseover", GameRenderEventHandler.Ability.mouseOver);
                    toolArea.electricShockIconContainer.icon.on("mouseout", GameRenderEventHandler.Ability.mouseOut);

                    toolArea.addChild(toolArea.electricShockIconContainer);

                    break;
                case 2:
                    toolArea.assassinIconContainer = new createjs.Container();
                    toolArea.assassinIconContainer.abilityId = abilityArray[i];
                    toolArea.assassinIconContainer.x = 0;
                    toolArea.assassinIconContainer.y = offsetY;
                    toolArea.assassinIconContainer.iconBackground = new createjs.Shape();
                    toolArea.assassinIconContainer.iconBackground.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke('#fff')
                        .drawRoundRect(0, 0, 50, 50, 5);
                    toolArea.assassinIconContainer.iconBackground.alpha = 0.2;
                    toolArea.assassinIconContainer.addChild(toolArea.assassinIconContainer.iconBackground);

                    toolArea.assassinIconContainer.iconHitArea = new createjs.Shape();
                    toolArea.assassinIconContainer.iconHitArea.graphics
                        .beginFill('#fff')
                        .drawRoundRect(0, 0, 100, 100, 5);
                    toolArea.assassinIconContainer.icon = new createjs.Bitmap(Resources.Icons.Abilities.assassin);
                    toolArea.assassinIconContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
                    toolArea.assassinIconContainer.icon.hitArea = toolArea.assassinIconContainer.iconHitArea;
                    toolArea.assassinIconContainer.addChild(toolArea.assassinIconContainer.icon);

                    toolArea.assassinIconContainer.icon.on("click", GameRenderEventHandler.Ability.router);
                    toolArea.assassinIconContainer.icon.on("mouseover", GameRenderEventHandler.Ability.mouseOver);
                    toolArea.assassinIconContainer.icon.on("mouseout", GameRenderEventHandler.Ability.mouseOut);

                    toolArea.addChild(toolArea.assassinIconContainer);

                    break;
                case 3:
                    toolArea.rempageIconContainer = new createjs.Container();
                    toolArea.rempageIconContainer.abilityId = abilityArray[i];
                    toolArea.rempageIconContainer.x = 0;
                    toolArea.rempageIconContainer.y = offsetY;
                    toolArea.rempageIconContainer.iconBackground = new createjs.Shape();
                    toolArea.rempageIconContainer.iconBackground.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke('#fff')
                        .drawRoundRect(0, 0, 50, 50, 5);
                    toolArea.rempageIconContainer.iconBackground.alpha = 0.2;
                    toolArea.rempageIconContainer.addChild(toolArea.rempageIconContainer.iconBackground);

                    toolArea.rempageIconContainer.iconHitArea = new createjs.Shape();
                    toolArea.rempageIconContainer.iconHitArea.graphics
                        .beginFill('#fff')
                        .drawRoundRect(0, 0, 100, 100, 5);
                    toolArea.rempageIconContainer.icon = new createjs.Bitmap(Resources.Icons.Abilities.rempage);
                    toolArea.rempageIconContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
                    toolArea.rempageIconContainer.icon.hitArea = toolArea.rempageIconContainer.iconHitArea;
                    toolArea.rempageIconContainer.addChild(toolArea.rempageIconContainer.icon);

                    toolArea.rempageIconContainer.icon.on("click", GameRenderEventHandler.Ability.router);
                    toolArea.rempageIconContainer.icon.on("mouseover", GameRenderEventHandler.Ability.mouseOver);
                    toolArea.rempageIconContainer.icon.on("mouseout", GameRenderEventHandler.Ability.mouseOut);

                    toolArea.addChild(toolArea.rempageIconContainer);

                    break;
                default:
                    console.error('Unknown Ability #' + abilityArray[i]);
                    return;
            }
            offsetY += 70;
        }
        //upgrade icon 
        toolArea.planetUpgradeContainer = new createjs.Container();
        toolArea.planetUpgradeContainer.x = 0;
        toolArea.planetUpgradeContainer.y = offsetY;
        toolArea.planetUpgradeContainer.iconBackground = new createjs.Shape();
        toolArea.planetUpgradeContainer.iconBackground.graphics
            .setStrokeStyle(2, "round")
            .beginStroke('#fff')
            .drawRoundRect(0, 0, 50, 50, 5);
        toolArea.planetUpgradeContainer.iconBackground.alpha = 0.2;
        toolArea.planetUpgradeContainer.addChild(toolArea.planetUpgradeContainer.iconBackground);

        toolArea.planetUpgradeContainer.iconHitArea = new createjs.Shape();
        toolArea.planetUpgradeContainer.iconHitArea.graphics
            .beginFill('#fff')
            .drawRoundRect(0, 0, 100, 100, 5);
        toolArea.planetUpgradeContainer.icon = new createjs.Bitmap(Resources.Icons.Game.upgrade);
        toolArea.planetUpgradeContainer.icon.setTransform(0, 0, 0.5, 0.5, 0, 0, 0, 0, 0);
        toolArea.planetUpgradeContainer.icon.hitArea = toolArea.planetUpgradeContainer.iconHitArea;
        toolArea.planetUpgradeContainer.addChild(toolArea.planetUpgradeContainer.icon);
        toolArea.addChild(GameStage.toolArea.planetUpgradeContainer);

        toolArea.planetUpgradeContainer.icon.on("mouseover", GameRenderEventHandler.Upgrade.mouseOver);
        toolArea.planetUpgradeContainer.icon.on("mouseout", GameRenderEventHandler.Upgrade.mouseOut);
        toolArea.planetUpgradeContainer.icon.on("pressmove", GameRenderEventHandler.Upgrade.pressMove);
        toolArea.planetUpgradeContainer.icon.on("pressup", GameRenderEventHandler.Upgrade.pressUp);
    },
    updatePlanetInfo: function(){
        // GameStage.planetDrawingArray
        for (var i = 0; i < GameStage.planetDrawingArray.length; i++) {
            var currentPlanet = GameStage.planetDrawingArray[i];
            
            // Update Planet Colour
            var currentColor = GameRenderUtils.getColorByPlayerId(currentPlanet.data.pid);

            currentPlanet.planetText.text = "" + currentPlanet.data.fleet;


            if(currentPlanet.data.pid != -2){
                if(currentColor != currentPlanet.renderColor){
                    console.log('Planet Color changed, re-render.');

                    currentPlanet.renderColor = currentColor;
                    currentPlanet.renderSprite = GameRenderUtils.getSpriteSheetByPlayerId(currentPlanet.data.pid);

                    currentPlanet.removeChild(currentPlanet.planetCircle);
                    currentPlanet.planetCircle = new createjs.Sprite(currentPlanet.renderSprite, "run");
                    var sprite_ratio = currentPlanet.data.radius/25;
                    currentPlanet.planetCircle.setTransform(0, 0, sprite_ratio, sprite_ratio, 0, 0);
                    currentPlanet.planetCircle.gotoAndPlay((Math.random() * 60) | 0);
                    currentPlanet.planetCircle.typeName = "Planet Circle";
                    currentPlanet.planetCircle.hitArea = currentPlanet.planetHitArea;
            
                    // currentPlanet.planetCircle.on("mouseover", GameRenderEventHandler.PlanetEventHandler.mouseOver);
                    // currentPlanet.planetCircle.on("mouseout", GameRenderEventHandler.PlanetEventHandler.mouseOut);
                    // currentPlanet.planetCircle.on("pressmove", GameRenderEventHandler.PlanetEventHandler.pressMove);
                    // currentPlanet.planetCircle.on("pressup", GameRenderEventHandler.PlanetEventHandler.pressUp);

                    currentPlanet.planetRange.graphics.clear()
                        .setStrokeStyle(2, "round")
                        .beginStroke(currentColor)
                        .drawCircle(0, 0, currentPlanet.data.range);
                        
                    currentPlanet.planetRange.typeName = "Planet Range";
                    currentPlanet.planetRange.alpha = 0;
                    currentPlanet.planetRange.x = currentPlanet.data.x;
                    currentPlanet.planetRange.y = currentPlanet.data.y;

                    GameStage.removeChild(currentPlanet.planetInfoContainer);
                    GameStage.removeChild(currentPlanet.planetLevel);
                    GameStage.removeChild(currentPlanet.planetUpgrade);

                    currentPlanet.planetLevel = new createjs.Text("Planet " + currentPlanet.data.id + "\n" + "Level " + currentPlanet.data.level, "15px regular Arial", currentColor);
                    
                    currentPlanet.planetLevel.typeName = "Planet Level";
                    currentPlanet.planetLevel.x = currentPlanet.data.x+35;
                    currentPlanet.planetLevel.y = currentPlanet.data.y-60;

                    if(currentPlanet.data.x > 600) { currentPlanet.planetLevel.x -=85; currentPlanet.planetLevel.textAlign = "right"; }
                    else currentPlanet.planetLevel.textAlign = "left";

                    currentPlanet.planetLevel.alpha = 0;

                    currentPlanet.planetUpgrade = new createjs.Text("You can upgrade this planet \nwith " + (Math.pow(parseInt(currentPlanet.data.level), 2)*100) + " fleet to Level " + (parseInt(currentPlanet.data.level)+1), "13px regular Arial", currentColor);
                    currentPlanet.planetUpgrade.textAlign = "left";
                    
                    currentPlanet.planetUpgrade.x = currentPlanet.data.x+35;
                    currentPlanet.planetUpgrade.y = currentPlanet.data.y-25;
                    currentPlanet.planetUpgrade.alpha = 0;

                    if(currentPlanet.data.x > 600) { currentPlanet.planetUpgrade.x -=250;}
                    currentPlanet.planetUpgrade.typeName = "Planet Upgrade";

                    currentPlanet.planetInfoContainer = new createjs.Shape();

                    var rect_x = currentPlanet.data.x+25;
                    if(currentPlanet.data.x > 600) rect_x -= 250;

                    currentPlanet.planetInfoContainer.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke(currentColor)
                        .beginFill("#000")
                        .drawRect(rect_x, currentPlanet.data.y-70, 200, 80);
                    currentPlanet.planetInfoContainer.typeName = "Planet Info Container";
                    currentPlanet.planetInfoContainer.alpha = 0;

                    GameStage.addChild(currentPlanet.planetInfoContainer);
                    GameStage.addChild(currentPlanet.planetLevel);
                    GameStage.addChild(currentPlanet.planetUpgrade);

                    currentPlanet.addChild(currentPlanet.planetCircle);
                    currentPlanet.removeChild(currentPlanet.planetSuperHitArea);
                    currentPlanet.addChild(currentPlanet.planetSuperHitArea);

                }
                else if(currentPlanet.data.level != currentPlanet.renderLevel){
                    currentPlanet.renderLevel = currentPlanet.data.level;

                    GameStage.removeChild(currentPlanet.planetInfoContainer);
                    GameStage.removeChild(currentPlanet.planetLevel);
                    GameStage.removeChild(currentPlanet.planetUpgrade);

                    currentPlanet.planetLevel = new createjs.Text("Planet " + currentPlanet.data.id + "\n" + "Level " + currentPlanet.data.level, "15px regular Arial", currentColor);
                    
                    currentPlanet.planetLevel.typeName = "Planet Level";
                    currentPlanet.planetLevel.x = currentPlanet.data.x+35;
                    currentPlanet.planetLevel.y = currentPlanet.data.y-60;
                    currentPlanet.planetLevel.alpha = 0;

                    if(currentPlanet.data.x > 600) { currentPlanet.planetLevel.x -=85; currentPlanet.planetLevel.textAlign = "right"; }
                    else currentPlanet.planetLevel.textAlign = "left";

                    if(currentPlanet.data.level < 4)
                        currentPlanet.planetUpgrade = new createjs.Text("You can upgrade this planet \nwith " + (Math.pow(parseInt(currentPlanet.data.level), 2)*100) + " fleet to Level " + (parseInt(currentPlanet.data.level)+1), "13px regular Arial", currentColor);
                    else if(currentPlanet.data.level == 4)
                        currentPlanet.planetUpgrade = new createjs.Text("Your planet upgrade is \nalready maximized" + (parseInt(currentPlanet.data.level)+1), "13px regular Arial", currentColor);

                    
                    currentPlanet.planetUpgrade.typeName = "Planet Upgrade";
                    currentPlanet.planetUpgrade.x = currentPlanet.data.x+35;
                    currentPlanet.planetUpgrade.y = currentPlanet.data.y-25;
                    currentPlanet.planetUpgrade.alpha = 0;

                    if(currentPlanet.data.x > 600) { currentPlanet.planetUpgrade.x -=250;}
                    currentPlanet.planetUpgrade.textAlign = "left";

                    var rect_x = currentPlanet.data.x+25;
                    if(currentPlanet.data.x > 600) rect_x -= 250;

                    currentPlanet.planetInfoContainer = new createjs.Shape();
                    currentPlanet.planetInfoContainer.graphics
                        .setStrokeStyle(2, "round")
                        .beginStroke(currentColor)
                        .beginFill("#000")
                        .drawRect(rect_x, currentPlanet.data.y-70, 200, 80);
                    currentPlanet.planetInfoContainer.typeName = "Planet Info Container";
                    currentPlanet.planetInfoContainer.alpha = 0;

                    GameStage.addChild(currentPlanet.planetInfoContainer);
                    GameStage.addChild(currentPlanet.planetLevel);
                    GameStage.addChild(currentPlanet.planetUpgrade);
                }
            }
            else if(currentPlanet.data.pid == -2){
                currentPlanet.removeChild(currentPlanet.planetCircle);
                currentPlanet.removeChild(currentPlanet.planetText);
                //currentPlanet.removeChild(currentPlanet.planetSuperHitArea);
            }

        };
    }
};

