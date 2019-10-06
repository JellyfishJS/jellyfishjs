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
        return Bodies.rectangle(this.initialPosition.x, this.initialPosition.y, 20, 30);
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = pixi.Sprite.from('./assets/car.png');
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.DisplayObject) {
        if (!this.physicsBody) { return; }

        sprite.x = this.physicsBody.position.x;
        sprite.y = this.physicsBody.position.y;
        sprite.scale = new pixi.Point(0.1, 0.1);
    }

    public step() {
        if (!this.physicsBody) { return; }

        const force = Vector.lengthAndDirection(0.001, Angle.radians(this.physicsBody.angle));

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
    }

}
