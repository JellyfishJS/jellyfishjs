import * as PIXI from "pixi.js";
import { containerKey, GameObject, spriteKey } from "../game-object/game-object";
import { PIXIProvider } from "../pixi-provider/pixi-provider";

/**
 * How many times to add the objects that have been created
 * in one game loop.
 *
 * GameObjects may create other GameObjects in their onCreate,
 * so the creation needs to be handled multiple times per loop.
 * However, if this is recursive it will loop forever,
 * so there needs to be some sort of limit.
 */
const maxCreationDepth = 1000;

/**
 * Handles running the game loop over the GameObjects it owns.
 */
export class GameLoop {

    /**
     * An array of the GameObjects in this GameLoop
     * that will be created on the next step.
     */
    private _gameObjectsToBeCreated: GameObject[] = [];

    /**
     * Calls the appropriate initializers and sets the appropriate defaults
     * on a new GameObject that is to be added to the game loop.
     */
    private _initializeGameObject(gameObject: GameObject, pixiProvider: PIXIProvider | undefined) {
        if (gameObject.onCreate) {
            gameObject.onCreate();
        }

        if (!pixiProvider) { return; }

        if (!gameObject[containerKey]) {
            gameObject.setContainer(pixiProvider.getContainer());
        }

        const container = gameObject[containerKey];
        if (gameObject.getSprite && container) {
            gameObject[spriteKey] = gameObject.getSprite(PIXI, container);
        }
    }

    /**
     * Adds all the game objects that have been created the previous loop
     * to the game objects to be handled this loop.
     */
    private _handleCreation(pixiProvider: PIXIProvider | undefined) {
        let iterations = 0;

        while (this._gameObjectsToBeCreated.length !== 0 && ++iterations < maxCreationDepth) {
            this._gameObjects = [...this._gameObjects, ...this._gameObjectsToBeCreated];
            const gameObjectsCreatedThisIteration = this._gameObjectsToBeCreated;
            this._gameObjectsToBeCreated = [];

            gameObjectsCreatedThisIteration
                .forEach((gameObject) => this._initializeGameObject(gameObject, pixiProvider));
        }

        if (iterations === maxCreationDepth) {
            console.error("Recursive object creation detected. Some object is probably creating itself in its `create`.");
        }
    }

    /**
     * An array of the GameObjects that exist in this game loop.
     */
    private _gameObjects: GameObject[] = [];

    /**
     * Adds the specified GameObject to this GameLoop.
     */
    public addGameObject(object: GameObject) {
        this._gameObjectsToBeCreated.push(object);
    }

    /**
     * Runs a single game loop.
     */
    public runLoop(pixiProvider?: PIXIProvider | undefined) {
        this._handleCreation(pixiProvider);

        this._gameObjects.forEach((gameObject) => gameObject.step && gameObject.step());

        this._gameObjects.forEach((gameObject) => {
            const sprite = gameObject[spriteKey];
            const container = gameObject[containerKey];
            if (gameObject.draw && sprite && container) {
                gameObject.draw(PIXI, sprite, container);
            }
        });
    }

}
