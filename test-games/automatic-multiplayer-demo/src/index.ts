import * as Jellyfish from 'engine';
import { MainObject } from './main-object';

Jellyfish.game.setCanvasByID('game');
Jellyfish.game.createObject(MainObject);
Jellyfish.game.start();
Jellyfish.serve();
