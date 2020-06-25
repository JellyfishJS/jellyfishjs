import * as Engine from 'engine';
import { Circle } from './circle';

export class Client extends Engine.Client {
    public onCreate() {
        this.connect(process.env.MULTIPLAYER_CIRCLES_SERVER);
    }
}
