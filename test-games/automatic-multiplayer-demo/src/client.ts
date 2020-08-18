import * as Jellyfish from 'engine';
import { Circle } from './circle';

export class Client extends Jellyfish.Client {

    public onCreate() {
        this.connect(process.env.MULTIPLAYER_CIRCLES_SERVER);
    }

    public onRegistered() {
        this.createObject(Circle).setOwner(this.user());
    }

}
