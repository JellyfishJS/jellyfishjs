import * as Engine from 'jellyfish.js';
import { Circle } from './circle';

export class Client extends Engine.Client {

    public onCreate() {
        this.connect(process.env.MULTIPLAYER_CIRCLES_SERVER);
    }

    public onRegistered() {
        this.createObject(Circle).setOwner(this.user());
    }

}
