const Jellyfish = require("engine");
const Matter = require("matter-js");

class Player extends Jellyfish.GameObject {

    constructor(position, force) {
        super();
        this.position = position || { x: 0, y: 0 };
        this.force = force || { x: 0, y: 0 };
        this.sprite = this.createSprite(PlayerSprite);
    }

    setUpPhysicsBody() {
        const physicsBody = Matter.Bodies.circle(this.position.x, this.position.y, 20);
        this.sprite.physicsBody = physicsBody;
        return physicsBody;
    }

    step() {
        if (!Jellyfish.game.input.isDown(65)) {
            Matter.Body.applyForce(this.physicsBody, { x: 0, y: 0 }, this.force);
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
        sprite.drawCircle(this.physicsBody.position.x, this.physicsBody.position.y, 20);
    }
}

Jellyfish.game.setCanvasByID("game");
Jellyfish.game.createObject(Player, { x: 200, y: 30 }, { x: 0, y: -0.001 });
Jellyfish.game.createObject(Player, { x: 220, y: 250 }, { x: 0, y: -0.0015 });
Jellyfish.game.start();
