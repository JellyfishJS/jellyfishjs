const Engine = require("engine");
const Matter = require("matter-js");

class Player extends Engine.GameObject {

    getSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    setUpPhysicsBody() {
        return Matter.Bodies.circle(40, 20, 20);
    }

    step() {
        Matter.Body.applyForce(this.physicsBody, { x: 0, y: 0 }, { x: 0, y: 0.001 });
    }

    draw(pixi, sprite, container) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.physicsBody.position.x, this.physicsBody.position.y, 20);
    }

}

Engine.game.setCanvasByID("game");
Engine.game.createObject(Player);
Engine.game.start();
