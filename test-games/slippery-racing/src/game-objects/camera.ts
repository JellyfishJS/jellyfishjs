import { Body, GameObject, Sprite, Vector } from 'engine';
import type * as PIXI from 'pixi.js';

export class Camera extends GameObject {

    private followingBody: Body = undefined as any;

    private velocity: Vector = Vector.zero;

    private positionFollowSpeed = 0.004;

    private positionFrictionFactor = 0.9;

    private sprite = this.createSprite(CameraSprite, Vector.zero);

    public setFollowing(followingBody: Body) {
        this.followingBody = followingBody;
        this.sprite.position = this.followingBody.position;
    }

    public step() {
        const desiredPosition = this.followingBody.position;
        const positionOffset = desiredPosition.minus(this.sprite.position);
        this.velocity = this.velocity
            .plus(
                positionOffset
                    .times(this.positionFollowSpeed),
            )
            .times(this.positionFrictionFactor);
        this.sprite.position = this.sprite.position.plus(this.velocity);
    }

}

class CameraSprite extends Sprite<PIXI.Container> {
    public constructor(position: Vector) {
        super();
        this.position = position;
    }

    public position: Vector;

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        return container;
    }

    public draw(pixi: typeof PIXI, container: PIXI.Container) {
        container.scale.set(0.5);
        const realOffset = this.position
            .times(-container.scale.x)
            .plus(Vector.xy(400, 300));
        container.setTransform(
            realOffset.x(),
            realOffset.y(),
        );
    }
}
