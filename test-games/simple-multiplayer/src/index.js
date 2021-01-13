const Jellyfish = require('engine');

class Server extends Jellyfish.Server {

    onCreate() {
        this.start();
        this.counter = 0;
        this.user;
    }

    onMessage(user, message) {
        console.log(`User ${user.id()} said '${message}'`);
    }

    onUserJoined(user) {
        this.user = user;
        console.log('User joined', user.id());
    }

    onUserLeft(user, reason) {
        this.user = undefined;
        console.log('User left', user.id(), reason);
    }

    step() {
        this.counter++;

        if (!(this.counter % 60)) {
            if (this.user) {
                this.sendMessage(this.user, `message: ${this.counter} is the counter`);
            }
        }

        if (!(this.counter % 133)) {
            if (this.user) {
                this.broadcastMessage(`broadcast: ${this.counter} is the counter`);
            }
        }
    }

}

class Client extends Jellyfish.Client {

    onCreate() {
        this.connect();
    }

    keyPressed(keyCode) {
        this.sendMessage(`${keyCode}`);
    }

    onConnect() {
        console.log('Connected!');
    }

    onRegistered() {
        console.log(`Registered as ${this.user().id()}`);
    }

    onDisconnect(message) {
        console.log('Disconnected', message);
    }

    onMessage(message) {
        console.log('Received message', message);
    }

}

if (Jellyfish.isServer) {
    Jellyfish.game.createObject(Server);
    Jellyfish.serve();
} else {
    Jellyfish.game.createObject(Client);
}

Jellyfish.game.start();
