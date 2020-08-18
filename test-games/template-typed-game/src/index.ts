import * as Engine from 'engine';
import { MainObject } from './main-object';

Engine.game.setCanvasByID('game');
Engine.game.createObject(MainObject);
Engine.game.start();
