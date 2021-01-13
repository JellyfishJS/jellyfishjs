const Jellyfish = require('engine');
const keycode = require('keycode');
const Vector = Jellyfish.Vector;

class Server extends Jellyfish.Server {

    onCreate() {
        this.start();
        this.counter = 0;
        this.positions = {};
        this.users = {};
        this.updated = false;
    }

    onMessage(user, message) {
        this.positions[user.id()] = JSON.parse(message);
        this.updated = true;
    }

    onUserJoined(user) {
        this.users[user.id()] = user;
        console.log('User joined', user.id());
    }

    onUserLeft(user, reason) {
        delete this.users[user.id()];
        delete this.positions[user.id()];
        this.updated = true;
        console.log('User left', user.id(), reason);
    }

    step() {
        if (this.updated) {
            Object.values(this.users).forEach((user) => this.sendMessage(user, JSON.stringify(this.positions)));
            this.updated = false;
        }
    }

}

const moves = [
    [keycode('up'), Vector.xy(0, -1)],
    [keycode('down'), Vector.xy(0, 1)],
    [keycode('left'), Vector.xy(-1, 0)],
    [keycode('right'), Vector.xy(1, 0)],
];

class Client extends Jellyfish.Client {

    onCreate() {
        this.position = Vector.xy(Math.floor(Math.random() * 400), Math.floor(Math.random() * 300));
        this.others = [];
        this.connect(process.env.MULTIPLAYER_CIRCLES_SERVER);
        this.sprite = this.createSprite(ClientSprite);
        this.sprite.others = this.others;
        this.sprite.position = this.position;
    }

    onConnect() {
        console.log('Connected!');
    }

    onRegistered() {
        console.log(`Registered as ${this.user().id()}`);
        this.sendMessage(JSON.stringify(this.position.object()));
    }

    onDisconnect(message) {
        console.log('Disconnected', message);
    }

    onMessage(message) {
        this.others = Object.entries(JSON.parse(message)).filter(([id]) => this.user().id() !== id)
            .map(([, position]) => position);
    }

    step() {
        let moved = false;
        moves.forEach(([key, delta]) => {
            if (Jellyfish.game.input.isDown(key)) {
                this.position = this.position.plus(delta);
                moved = true;
            }
        });
        if (moved) {
            this.sendMessage(JSON.stringify(this.position.object()));
        }
        this.sprite.position = this.position;
        this.sprite.others = this.others;
    }

}

class ClientSprite extends Jellyfish.Sprite {
    initializeSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    draw(pixi, sprite) {
        sprite.clear();
        sprite.beginFill(0xFF0000);
        this.others.forEach((position) => sprite.drawCircle(position.x, position.y, 5));
        sprite.beginFill(0xFF00);
        sprite.drawCircle(this.position.x(), this.position.y(), 5);
    }
}

if (Jellyfish.isServer) {
    Jellyfish.game.createObject(Server);
} else {
    Jellyfish.game.setCanvasByID('game');
    Jellyfish.game.createObject(Client);

}
Jellyfish.game.start();
Jellyfish.serve();
