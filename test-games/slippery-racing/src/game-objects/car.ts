import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class Car extends GameObject<PIXI.Sprite, Body> {

    private readonly initialPosition: { x: number, y: number };

    public constructor(position: { x: number, y: number }) {
        super();
        this.initialPosition = position;
    }

    public setUpPhysicsBody() {
        const body = Bodies.rectangle(this.initialPosition.x, this.initialPosition.y, 30, 20);
        Body.rotate(body, -90);
        return body;
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = pixi.Sprite.from('./assets/car.png');
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        sprite.texture.baseTexture.mipmap = pixi.settings.MIPMAP_TEXTURES;
        container.scale.set(0.5);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Sprite) {
        if (!this.physicsBody) { return; }

        [sprite.x, sprite.y] = [this.physicsBody.position.x, this.physicsBody.position.y];
        sprite.scale = new pixi.Point(0.1, 0.1);
        sprite.angle = this.physicsBody.angle + 90;
    }

    public step() {
        if (!this.physicsBody) { return; }

        const force = Vector.lengthAndDirection(0.0003, Angle.degrees(this.physicsBody.angle));

        if (game.keyboard.isDown(keycode('up'))) {
            Body.applyForce(
                this.physicsBody,
                this.physicsBody.position,
                force.object(),
            );
        }

        if (game.keyboard.isDown(keycode('down'))) {
            Body.applyForce(
                this.physicsBody,
                this.physicsBody.position,
                force.negated().object(),
            );
        }

        if (game.keyboard.isDown(keycode('left'))) {
            this.physicsBody.torque -= 0.3;
        }

        if (game.keyboard.isDown(keycode('right'))) {
            this.physicsBody.torque += 0.3;
        }
    }

}
