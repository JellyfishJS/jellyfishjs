import { Angle, game, GameObject, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';

export class Camera extends GameObject<[], Body> {

    private followingBody: Body;
    private angleOffset: Angle;

    private position: Vector;
    private angle: Angle;

    private velocity: Vector = Vector.zero;
    private angularVelocity: Angle = Vector.zero;

    private positionFollowSpeed = 0.01;
    private angleFollowSpeed = 0.0001;

    public setFollowing(followingBody: Body) {
        this.followingBody = followingBody;
        this.position = Vector.object(this.followingBody.position);
        this.angle = Angle.radians(this.followingBody.angle).plus(this.angleOffset);
    }

    public setAngleOffset(angleOffset: Angle) {
        this.angleOffset = angleOffset;
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        return [] as [];
    }

    public draw(pixi: typeof PIXI, sprite: [], container: PIXI.Container) {
        const realOffset = this.position
            .times(-container.scale.x)
            .plus(Vector.xy(10, 10));
        container.setTransform(realOffset.x(), realOffset.y());
    }

    public step() {
        const desiredPosition = Vector.object(this.followingBody.position);
        // const offset = desiredPosition.minus(this.position);
        // this.velocity = this.velocity.plus(offset.times(this.positionFollowSpeed)).times(0.9);

        // this.position = this.position.plus(this.velocity);
        // console.log('' + offset);
        this.position = desiredPosition;
        console.log('' + this.position);
    }

}
