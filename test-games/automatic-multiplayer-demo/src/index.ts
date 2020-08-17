import * as Jellyfish from 'jellyfish.js';
import { MainObject } from './main-object';

Jellyfish.game.setCanvasByID('game');
Jellyfish.game.createObject(MainObject);
Jellyfish.game.start();
