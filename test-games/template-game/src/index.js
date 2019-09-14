const Engine = require("engine");

class Player extends Engine.GameObject {
    create() {
        console.log("My existence has begun");
    }

    step() {
        console.log("I still exist");
    }
}

Engine.game.createObject(Player);
Engine.game.start();
