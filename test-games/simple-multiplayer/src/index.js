const Jellyfish = require('engine');

class Server extends Jellyfish.Server {

    onCreate() {
        this.start();
    }

    onMessage(user, message) {
        console.log(`User ${user.id()} said '${message}'`);
    }

}

class Client extends Jellyfish.Client {

    onCreate() {
        this.connect('http://localhost');
    }

    keyPressed(keyCode) {
        this.sendMessage(`${keyCode}`);
    }

}

if (Jellyfish.isServer) {
    Jellyfish.game.createObject(Server);
} else {
    Jellyfish.game.createObject(Client);
}

Jellyfish.game.start();