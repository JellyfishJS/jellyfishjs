import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class Camera extends GameObject<[], Body> {

    private followingBody: Body = undefined as any;

    private position: Vector = undefined as any;

    private velocity: Vector = Vector.zero;

    private positionFollowSpeed = 0.004;

    private positionFrictionFactor = 0.9;

    public setFollowing(followingBody: Body) {
        this.followingBody = followingBody;
        this.position = Vector.object(this.followingBody.position);
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        return [] as [];
    }

    public draw(pixi: typeof PIXI, sprite: [], container: PIXI.Container) {
        const realOffset = this.position
        .times(-container.scale.x)
        .plus(Vector.xy(400, 300));
        container.setTransform(
            realOffset.x(),
            realOffset.y(),
        );
        container.scale.set(0.5);
    }

    public step() {
        const desiredPosition = Vector.object(this.followingBody.position);
        const positionOffset = desiredPosition.minus(this.position);
        this.velocity = this.velocity
            .plus(
                positionOffset
                    .times(this.positionFollowSpeed),
            )
            .times(this.positionFrictionFactor);
        this.position = this.position.plus(this.velocity);
    }

}
