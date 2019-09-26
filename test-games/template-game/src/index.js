const Engine = require("engine");

class Player extends Engine.GameObject {

    onCreate() {
        this.x = 10;
    }

    getSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    step() {
        if (Engine.game.keyboard.isDown(65))
        {
            this.x += 0.1;
        }

        console.log(this.x);
    }

    draw(pixi, sprite, container) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.x, 120, 30);
    }

}

Engine.game.setCanvasByID("game");
Engine.game.createObject(Player);
Engine.game.start();
