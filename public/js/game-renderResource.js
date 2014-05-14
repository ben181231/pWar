var Resources = {
    Icons: {
        Abilities:{
            assassin: 'img/icons/ability-assassin.png',
            electricShock: 'img/icons/ability-electricShock.png',
            regenerate: 'img/icons/ability-regenerate.png',
            rempage: 'img/icons/ability-rempage.png'
        },
        Game:{
            bomb: 'img/icons/game-bomb.png',
            upgrade: 'img/icons/game-upgrade.png'
        }
    },
    SpriteSheet: {
        Planets:{
            red: new createjs.SpriteSheet({
                "animations": {
                    "run": [0, 59, "run", 2]
                },
                "images": ["img/sprite/planet-red.png"],
                "frames":{
                    "height": 60,
                    "width":60,
                    "regX": 30,
                    "regY": 30,
                    "count": 60
                }
            }),
            blue: new createjs.SpriteSheet({
                "animations": {
                    "run": [0, 59, "run", 2]
                },
                "images": ["img/sprite/planet-blue.png"],
                "frames":{
                    "height": 60,
                    "width":60,
                    "regX": 30,
                    "regY": 30,
                    "count": 60
                }
            }),
            green: new createjs.SpriteSheet({
                "animations": {
                    "run": [0, 59, "run", 2]
                },
                "images": ["img/sprite/planet-green.png"],
                "frames":{
                    "height": 60,
                    "width":60,
                    "regX": 30,
                    "regY": 30,
                    "count": 60
                }
            }),
            grey: new createjs.SpriteSheet({
                "animations": {
                    "run": [0, 59, "run", 2]
                },
                "images": ["img/sprite/planet-grey.png"],
                "frames":{
                    "height": 60,
                    "width":60,
                    "regX": 30,
                    "regY": 30,
                    "count": 60
                }
            }),
            white: new createjs.SpriteSheet({
                "animations": {
                    "run": [0, 59, "run", 2]
                },
                "images": ["img/sprite/planet-white.png"],
                "frames":{
                    "height": 60,
                    "width":60,
                    "regX": 30,
                    "regY": 30,
                    "count": 60
                }
            })
        },
        Effect:{
            shade: new createjs.SpriteSheet({
                "animations": {
                    "shade": [0, 8, "shade", 20]
                },
                "images": ["img/sprite/effect-shade.png"],
                "frames":{
                    "height": 250,
                    "width":250,
                    "regX": 125,
                    "regY": 125,
                    "count": 9
                }
            }),
            
        }
    }
};