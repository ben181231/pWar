var GameRenderInit = function(){
    console.log('Game Render Init Starts');

    var stage = window.GameStage = new createjs.Stage('gameCanvas');
    stage.enableMouseOver();

    console.log('Game Data: ', Game);

    stage.attackContainer = new createjs.Container();
    stage.attackContainer.typeName = 'Attack Container';

    stage.planetDrawingArray = [];
    // prepare all planets
    for(var i=0; i<Game.Map.planets.length; i++){
        GameRenderUtils.preparePlanet(Game.Map.planets[i], stage.planetDrawingArray);
    }

    // prepare drag line
    stage.dragLine = new createjs.Shape();
    stage.dragLine.typeName = 'Drag Line';
    stage.dragLine.alpha = 0;

    // prepare tool area
    stage.toolArea = new createjs.Container();
    stage.toolArea.typeName = 'Tool Area';
    stage.toolArea.x = 815;
    stage.toolArea.y = 0;
    GameRenderUtils.prepareToolArea(stage.toolArea, Game.players[Game.myPlayerId].abilities);

    /****************************
    **  Start of Render Stack  **
    *****************************/

    // add drag line
    stage.addChild(stage.dragLine);

    // add all planetRanges
    for(var i=0; i<stage.planetDrawingArray.length; i++){
        stage.addChild(stage.planetDrawingArray[i].planetRange);
        stage.addChild(stage.planetDrawingArray[i].planetInfoContainer);
        stage.addChild(stage.planetDrawingArray[i].planetLevel);
        stage.addChild(stage.planetDrawingArray[i].planetUpgrade);

    }

    

    // add all planetDrawings
    for(var i=0; i<stage.planetDrawingArray.length; i++){
        stage.addChild(stage.planetDrawingArray[i]);
    }

    // add attack container
    stage.addChild(stage.attackContainer);

    // add tool area
    stage.addChild(stage.toolArea);



    /**************************
    **  End of Render Stack  **
    ***************************/

    //set up ticker
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);    
    createjs.Ticker.addEventListener("tick", GameRenderEventHandler.Ticker.tick);

    var countBar = new createjs.Graphics();
    countBar.beginFill("#FFF").drawRect(0, 0, 50, 5);

    Game.Bar.bomb = new createjs.Shape(countBar).setTransform(815, 70, 1, 1);
    Game.Bar.regenerate = new createjs.Shape(countBar).setTransform(815, 140, 1, 1);
    Game.Bar.electric = new createjs.Shape(countBar).setTransform(815, 210, 1, 1);
    Game.Bar.assasin = new createjs.Shape(countBar).setTransform(815, 280, 1, 1);
    Game.Bar.rampage = new createjs.Shape(countBar).setTransform(815, 350, 1, 1);
    GameStage.addChild(Game.Bar.bomb);
    GameStage.addChild(Game.Bar.regenerate);
    GameStage.addChild(Game.Bar.electric);
    GameStage.addChild(Game.Bar.assasin);
    GameStage.addChild(Game.Bar.rampage);

    console.log('Game Render Init Ends');
};
