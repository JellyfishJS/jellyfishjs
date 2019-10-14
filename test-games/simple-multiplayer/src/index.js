const Jellyfish = require("engine");

class MainServer extends Jellyfish.Server {

    onCreate() {
        this.start();
    }

    onMessage(user, message) {
        console.log(`User ${user.id()} said "${message}"`);
    }

}

Jellyfish.game.createObject(MainServer);
Jellyfish.game.start();
