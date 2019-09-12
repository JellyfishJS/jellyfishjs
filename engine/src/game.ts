import { GameLoop } from "./game-loop/game-loop";
import { GameObject, initializeGameObject } from "./game-object/game-object";

const gameLoop = new GameLoop();

export const Game = {
    GameObject,

    /**
     * Creates an instance of the specified GameObject
     * with the specified arguments.
     *
     * Adds it to the game.
     */
    create<Subclass extends GameObject, Args extends readonly []>(
        Class: new (...args: Args) => Subclass,
        ...args: Args
    ) {
        const newObject = initializeGameObject(Class, ...args);
        gameLoop.addGameObject(newObject);
    },

    /**
     * Begins running the game.
     */
    start() {
        setInterval(() => gameLoop.runLoop(), 1000);
    },
};
