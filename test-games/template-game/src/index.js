const Jellyfish = require("engine");
const Matter = require("matter-js");

class Player extends Jellyfish.GameObject {

    constructor(position, force) {
        super();
        this.position = position || Jellyfish.Vector.xy(0, 0);
        this.force = force || Jellyfish.Vector.xy(0, 0);
    }

    onCreate() {
        this.sprite = this.createSprite(PlayerSprite);
        this.body = this.createBody(PlayerBody);
        this.sprite.following = this.body;
    }

    step() {
        if (!Jellyfish.game.input.isDown(65)) {
            this.body.applyForce(this.force);
        }
    }

}

class PlayerSprite extends Jellyfish.Sprite {
    initializeSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    draw(pixi, sprite, container) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.following.position.x(), this.following.position.y(), 20);
    }
}

class PlayerBody extends Jellyfish.Body {
    initializeBody() {
        return Matter.Bodies.circle(this.position.x, this.position.y, 20);
    }
}

Jellyfish.game.setCanvasByID("game");
Jellyfish.game.createObject(Player, Jellyfish.Vector.xy(200, 30), Jellyfish.Vector.xy(0, -0.001));
Jellyfish.game.createObject(Player, Jellyfish.Vector.xy(220, 250), Jellyfish.Vector.xy(0, -0.0015));
Jellyfish.game.start();
Jellyfish.serve();
