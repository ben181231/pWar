var init = function(){
    //global init function


    // generate demo game data
    (function(){
        var canvas = document.getElementById('gameCanvas');
        var rand = Math.random;

        var planetNum = (rand() * 5 | 0) + 13;

        var game = window.Game = {};
        var map = game.Map = {};
        game.Bar = {};
        game.time = 0;
        game.total_time = 0;
        game.terminate = 0;

        //var planets = map.planets = [];

         var planets = map.planets = [
        //     { fleet: 100, id: 0, level: 1, pid: 0 , radius: 35, range: 200, rate: 1, x: 400, y: 100 },
        //     { fleet: 100, id: 1, level: 1, pid: 1 , radius: 35, range: 200, rate: 1, x: 230, y: 380 },
        //     { fleet: 100, id: 2, level: 1, pid: 2 , radius: 35, range: 200, rate: 1, x: 570, y: 380 },
        //     { fleet: 20, id: 3, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 230, y: 130 },
        //     { fleet: 20, id: 4, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 570, y: 130 },
        //     { fleet: 20, id: 5, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 100, y: 300 },
        //     { fleet: 20, id: 6, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 400, y: 300 },
        //     { fleet: 20, id: 7, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 700, y: 300 },
        //     { fleet: 20, id: 8, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 300, y: 530 },
        //     { fleet: 20, id: 9, level: 1, pid: -1, radius: 26, range: 200, rate: 1, x: 500, y: 530 }



            // { fleet: 100, id: 0, level: 1, pid: 0 , radius: 20, range: 70, rate: 1, x: 400, y: 350 },
            // { fleet: 20, id: 1, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 380, y: 310 },
            // { fleet: 20, id: 2, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 420, y: 310 },
            // { fleet: 20, id: 3, level: 2, pid: -1 , radius: 20, range: 70, rate: 1, x: 360, y: 270 },
            // { fleet: 20, id: 4, level: 2, pid: -1 , radius: 20, range: 70, rate: 1, x: 440, y: 270 },
            // { fleet: 20, id: 5, level: 3, pid: -1 , radius: 20, range: 110, rate: 1, x: 340, y: 230 },
            // { fleet: 20, id: 6, level: 3, pid: -1 , radius: 20, range: 110, rate: 1, x: 460, y: 230 },
            // { fleet: 20, id: 7, level: 4, pid: -1 , radius: 20, range: 150, rate: 1, x: 320, y: 190 },
            // { fleet: 20, id: 8, level: 4, pid: -1 , radius: 20, range: 150, rate: 1, x: 480, y: 190 },
            // { fleet: 20, id: 9, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 480, y: 270 },
            // { fleet: 20, id: 10, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 520, y: 270 },
            // { fleet: 20, id: 11, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 560, y: 270 },
            // { fleet: 20, id: 12, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 600, y: 270 },
            // { fleet: 20, id: 13, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 320, y: 270 },
            // { fleet: 20, id: 14, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 280, y: 270 },
            // { fleet: 20, id: 15, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 240, y: 270 },
            // { fleet: 100, id: 16, level: 1, pid: 1 , radius: 20, range: 70, rate: 1, x: 200, y: 270 },
            // { fleet: 20, id: 17, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 640, y: 270 },
            // { fleet: 20, id: 18, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 640, y: 230 },
            // { fleet: 20, id: 19, level: 4, pid: -1 , radius: 20, range: 150, rate: 1, x: 640, y: 190 },
            // { fleet: 20, id: 20, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 640, y: 310 },
            // { fleet: 100, id: 21, level: 1, pid: 2 , radius: 20, range: 70, rate: 1, x: 640, y: 350 },
            // { fleet: 20, id: 22, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 680, y: 270 },
            // { fleet: 20, id: 23, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 720, y: 290 },
            // { fleet: 20, id: 24, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 720, y: 330 },
            // { fleet: 20, id: 25, level: 1, pid: -1 , radius: 20, range: 70, rate: 1, x: 680, y: 350 }


            { fleet: 100, id: 0, level: 1, pid: -1 , radius: 45, range: 300, rate: 1, x: 430, y: 255 },
            { fleet: 100, id: 1, level: 1, pid: 0 , radius: 30, range: 130, rate: 1, x: 310, y: 330 },
            { fleet: 100, id: 2, level: 1, pid: 1 , radius: 30, range: 130, rate: 1, x: 550, y: 330 },
            { fleet: 100, id: 3, level: 1, pid: 2 , radius: 30, range: 130, rate: 1, x: 430, y: 120 },
            { fleet: 40, id: 4, level: 1, pid: -1 , radius: 30, range: 250, rate: 1, x: 185, y: 120 },
            { fleet: 40, id: 5, level: 1, pid: -1 , radius: 30, range: 250, rate: 1, x: 675, y: 120 },
            { fleet: 40, id: 6, level: 1, pid: -1 , radius: 30, range: 250, rate: 1, x: 430, y: 520 },
            { fleet: 40, id: 7, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 245, y: 230 },
            { fleet: 40, id: 8, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 305, y: 120 },
            { fleet: 40, id: 9, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 620, y: 230 },
            { fleet: 40, id: 10, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 550, y: 120 },
            { fleet: 40, id: 11, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 370, y: 430 },
            { fleet: 40, id: 12, level: 1, pid: -1 , radius: 30, range: 130, rate: 1, x: 480, y: 430 }

         ];

            

        // for (var i = 0; i < planetNum; i++) {
        //     var aPlanet = {};
        //     aPlanet.id = i;
        //     aPlanet.level = 1;
        //     aPlanet.radius = (rand() * 10 | 0) + 20;
        //     aPlanet.pid = (rand() * 4 | 0) + -1;
        //     aPlanet.fleet = (rand() * 70 | 0) + 100;
        //     aPlanet.range = 170 + aPlanet.radius;
        //     aPlanet.x = (((canvas.width - 70 - aPlanet.radius * 2) * rand()) | 0) + aPlanet.radius;
        //     aPlanet.y = (((canvas.height - aPlanet.radius * 2) * rand()) | 0) + aPlanet.radius;
        //     aPlanet.rate = (rand() * 3 | 0) + 3;

        //     // checking conditions
        //     var conditionFail = false;
        //     var pow = Math.pow;
        //     // condition #1: no collision
        //     for(var j=0; j<planets.length && !conditionFail; j++){
        //         var d = pow(aPlanet.x - planets[j].x, 2) + pow(aPlanet.y - planets[j].y, 2) - pow(aPlanet.radius + planets[j].radius, 2);
        //         if(d < 50) conditionFail = true;
        //     }

        //     if(!conditionFail){
        //         // condition #2: connections
        //         var connect_cnt = 0;
        //         if(planets.length > 0) conditionFail = true;
        //         for(var j=0; j<planets.length; j++){
        //             var d1 = pow(aPlanet.x - planets[j].x, 2) + pow(aPlanet.y - planets[j].y, 2) - pow(aPlanet.range + planets[j].radius, 2);
        //             var d2 = pow(aPlanet.x - planets[j].x, 2) + pow(aPlanet.y - planets[j].y, 2) - pow(aPlanet.radius + planets[j].range, 2);
        //             // console.log(i+1, j, d1, d2);
        //             if(d1 < 0 || d2 < 0){
        //                 conditionFail = false;
        //                 connect_cnt++;
        //             }
        //         }

        //         if(connect_cnt > planetNum / 5) 
        //             conditionFail = true;
        //     }

        //     if(!conditionFail){
        //         planets.push(aPlanet);
        //     }else{
        //         i--;
        //     }
        // }

        game.players = [];
        for (var i = 0; i < 3; i++) {
            game.players[i] = {};
            game.players[i].id = i;
            game.players[i].bomb = 1;
            game.players[i].bomb_countdown = 60;
            game.players[i].abilities = [0, 1, 2, 3];
            game.players[i].abilities_info = [];
            game.players[i].dead = 0;
            game.players[i].percentage = 5;

            for(var j = 0; j < 4; j++){
                game.players[i].abilities_info[j] = {};
                game.players[i].abilities_info[j].effecting = 0;
            }
            game.players[i].abilities_info[0].waiting = 40;
            game.players[i].abilities_info[1].waiting = 30;
            game.players[i].abilities_info[2].waiting = 25;
            game.players[i].abilities_info[3].waiting = 60;
            // game.players[i].abilities_info[0].waiting = 0;
            // game.players[i].abilities_info[1].waiting = 0;
            // game.players[i].abilities_info[2].waiting = 0;
            // game.players[i].abilities_info[3].waiting = 0;

            // game.players[i].abilities.push((rand() * 2) | 0);           // 0 or 1
            // game.players[i].abilities.push(((rand() * 2) | 0) + 2);     // 2 or 3
        };
        //game.myPlayerId = (rand() * 3) | 0;
        game.myPlayerId = parseInt(get_my_id());
        
    })();
};