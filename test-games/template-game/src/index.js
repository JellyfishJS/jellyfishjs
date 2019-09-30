const Engine = require("engine");

class Player extends Engine.GameObject {

    onCreate() {
        this.x = 200;
        this.y = 100;
    }

    getSprite(pixi, container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    step() {
        this.y += 0.5;
    }

    keyHeld(keyCode) {
        switch(keyCode)
        {
            case 87: // W
                this.y -= 0.5;
                break;
            case 65: // A
                this.x -= 0.5;
                break;
            case 68: // D
                this.x += 0.5;
                break;
            case 83: // S
                this.y += 0.5;
                break;
        }
    }

    keyPressed(keyCode) {
        if(keyCode == 32)
        {
            this.y -= 10;
        }
    }

    draw(pixi, sprite, container) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.x, this.y, 30);
    }

}

Engine.game.setCanvasByID("game");
Engine.game.createObject(Player);
Engine.game.start();
