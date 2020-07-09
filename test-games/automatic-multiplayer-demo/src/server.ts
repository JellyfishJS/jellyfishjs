import { Server as JellyfishServer, User } from 'engine';
import { Circle } from './circle';

export class Server extends JellyfishServer {
    public onCreate() {
        this.start();
        this.createObject(Circle);
    }
}
