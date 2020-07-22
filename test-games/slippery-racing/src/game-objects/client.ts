import { Client, game, Vector } from 'engine';
import { Car } from './car';

export class SlipperyClient extends Client {

    public onCreate() {
        this.game().getWorld()!.gravity = { x: 0, y: 0, scale: 0 };

        this.connect();
    }

    public onRegistered() {
        this.createObject(
            Car,
            Vector.xy(300, 10),
            {
                topSpeed: 0.02,
                acceleration: 0.001,
                spinning: 0.0006,
                cornering: 0.000015,
                handling: 0.3,
            },
        );
    }

}
game.registerClass(SlipperyClient);
