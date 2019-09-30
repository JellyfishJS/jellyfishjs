import * as Engine from 'engine';
import { MainObject } from './game-objects/main-object';

Engine.game.setCanvasByID('game');
Engine.game.createObject(MainObject);
Engine.game.start();
