import { GameLoop } from "../game-loop/game-loop";
import { GameObject } from "../game-object/game-object";

/**
 * Represents separate games.
 *
 * Unless you want multiple games running at the same time,
 * use the default `game`.
 */
export class Game {
    /**
     * The GameLoop for this game.
     *
     * Holds the GameObjects and performs appropriate actions on them.
     */
    private readonly _gameLoop = new GameLoop();

    /**
     * Creates an instance of a specified subclass of GameObject,
     * and adds it to this game.
     *
     * Any arguments after the first are passed to the GameObject subclass's constructor.
     */
    public createObject<Subclass extends GameObject, Args extends readonly []>(
        Class: new (...args: Args) => Subclass,
        ...args: Args
    ) {
        const newObject = new Class(...args);
        this._gameLoop.addGameObject(newObject);
    }

    /**
     * Begins running the game.
     */
    public start() {
        setInterval(() => this._gameLoop.runLoop(), 1000);
    }
}

/**
 * The default game.
 *
 * Use this, unless you need multiple instances.
 */
export const game = new Game();
