import * as Engine from 'jellyfish.js';
import { MainObject } from './main-object';

Engine.game.setCanvasByID('game');
Engine.game.createObject(MainObject);
Engine.game.start();
