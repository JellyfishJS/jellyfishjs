const { Game } = require("engine");

class Player extends Game.GameObject {
    create() {
        console.log("My existence has begun");
    }

    step() {
        console.log("I still exist");
    }
}

Game.create(Player);
Game.start();
