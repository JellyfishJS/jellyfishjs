import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class LooseTire extends GameObject<PIXI.Graphics, Body> {

    private readonly initialPosition: Vector;
    private readonly radius = 15;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
    }

    public setUpPhysicsBody() {
        const body = Bodies.circle(
            this.initialPosition.x(),
            this.initialPosition.y(),
            this.radius,
            {
                frictionAir: 0.05,
                restitution: 0.5,
                density: 0.003,
            },
        );
        return body;
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Graphics) {
        if (!this.physicsBody) { return; }

        sprite.clear();
        sprite.beginFill(0xff0000);
        sprite.drawCircle(this.physicsBody.position.x, this.physicsBody.position.y, this.radius);
    }

}
