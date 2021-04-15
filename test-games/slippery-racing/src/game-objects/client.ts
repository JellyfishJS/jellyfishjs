import { Client, game, Vector } from 'engine';
import { Camera } from './camera';
import { Car } from './car';

export class SlipperyClient extends Client {

    private camera: Camera;
    private car: Car | undefined;

    public constructor(camera: Camera) {
        super();
        this.camera = camera;
    }

    public onCreate() {
        this.game().getWorld()!.gravity = { x: 0, y: 0, scale: 0 };

        this.connect(+process.env.SLIPPERY_RACING_PORT!, process.env.SLIPPERY_RACING_SERVER);
    }

    public onRegistered() {
        this.car = this.createObject(
            Car,
            Vector.xy(-300, 0),
            {
                topSpeed: 0.02,
                acceleration: 0.001,
                spinning: 0.0006,
                cornering: 0.000015,
                handling: 0.3,
            },
        );

        this.car.setOwner(this.user());

        this.camera.setFollowing(this.car);
    }

}
game.registerClass(SlipperyClient);
