const Engine = require("engine");
const Matter = require("matter-js");

class Player extends Engine.GameObject {

    constructor(position, force) {
        super();
        this.position = position || { x: 0, y: 0 };
        this.force = force || { x: 0, y: 0 };
    }

    setUpSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    setUpPhysicsBody() {
        return Matter.Bodies.circle(this.position.x, this.position.y, 20);
    }

    step() {
        if (!Engine.game.keyboard.isDown(65)) {
            Matter.Body.applyForce(this.physicsBody, { x: 0, y: 0 }, this.force);
        }

        console.log(this.physicsBody.position.x, this.physicsBody.position.y);
    }

    draw(pixi, sprite, container) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.physicsBody.position.x, this.physicsBody.position.y, 20);
    }

}

Engine.game.setCanvasByID("game");
Engine.game.createObject(Player, { x: 200, y: 30 }, { x: 0, y: -0.001 });
Engine.game.createObject(Player, { x: 220, y: 250 }, { x: 0, y: -0.0015 });
Engine.game.start();
