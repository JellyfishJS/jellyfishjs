import * as Engine from 'engine';
import { Circle } from './circle';

export class Server extends Engine.Server {
    public onCreate() {
        this.start();
        this.createObject(Circle);
    }
}
