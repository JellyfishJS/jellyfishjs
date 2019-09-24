import * as MatterType from 'matter-js';
import { containerKey, GameObject, GameObjectBody, spriteKey } from '../game-object/game-object';
import { Matter } from '../matter-setup/matter-setup';
import { PIXI, PIXISetup } from '../pixi-setup/pixi-setup';

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
    private _initializeGameObject<
        Sprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        pixiSetup: PIXISetup | undefined,
    ) {
        if (gameObject.onCreate) {
            gameObject.onCreate();
        }

        // Apparently type narrowing doesn't work on imports.
        const matter = Matter;
        if (matter) {
            this._initializeGameObjectPhysics(gameObject, matter);
        }

        if (pixiSetup) {
            this._initializeGameObjectPIXI(gameObject, pixiSetup);
        }
    }

    /**
     * Sets up the parts of the passed GameObject related to physics.
     */
    private _initializeGameObjectPhysics<
        Sprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        matter: typeof MatterType,
    ) {
        if (!gameObject.setUpPhysicsBody) { return; }

        gameObject.physicsBody = gameObject.setUpPhysicsBody();
        const bodyOrBodies: GameObjectBody = gameObject.physicsBody;
        if (!bodyOrBodies) { return; }

        if (Array.isArray(bodyOrBodies)) {
            bodyOrBodies.forEach((body) => {
                matter.World.addBody(gameObject.physicsWorld, body);
            });
        } else {
            matter.World.addBody(gameObject.physicsWorld, bodyOrBodies);
        }
    }

    /**
     * Sets up the PIXI related aspects of the passed game object.
     */
    private _initializeGameObjectPIXI<
        Sprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        pixiSetup: PIXISetup,
    ) {
        const mainContainer = pixiSetup.getContainer();

        if (!mainContainer || !PIXI) { return; }

        if (!gameObject[containerKey]) {
            gameObject.setContainer(mainContainer);
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
    private _handleCreation(pixiSetup: PIXISetup | undefined) {
        let iterations = 0;

        while (this._gameObjectsToBeCreated.length !== 0 && ++iterations < maxCreationDepth) {
            this._gameObjects = [...this._gameObjects, ...this._gameObjectsToBeCreated];
            const gameObjectsCreatedThisIteration = this._gameObjectsToBeCreated;
            this._gameObjectsToBeCreated = [];

            gameObjectsCreatedThisIteration
                .forEach((gameObject) => this._initializeGameObject(gameObject, pixiSetup));
        }

        if (iterations === maxCreationDepth) {
            console.error('Recursive object creation detected. Some object is probably creating itself in its `create`.');
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
    public runLoop(pixiSetup: PIXISetup | undefined, engine: Matter.Engine | undefined) {
        this._gameObjects.forEach((gameObject) => gameObject.beforeStep && gameObject.beforeStep());

        this._handleCreation(pixiSetup);

        this._gameObjects.forEach((gameObject) => gameObject.beforePhysics && gameObject.beforePhysics());
        Matter && engine && Matter.Engine.update(engine);
        this._gameObjects.forEach((gameObject) => gameObject.afterPhysics && gameObject.afterPhysics());

        this._gameObjects.forEach((gameObject) => gameObject.step && gameObject.step());

        // For some reason Typescript doesn't handle type narrowing on imported constants,
        // so it needs to be reassigned.
        const pixi = PIXI;
        if (pixi) {
            this._gameObjects.forEach((gameObject) => {
                const sprite = gameObject[spriteKey];
                const container = gameObject[containerKey];
                if (gameObject.draw && sprite && container) {
                    gameObject.draw(pixi, sprite, container);
                }
            });
        }

        this._gameObjects.forEach((gameObject) => gameObject.endStep && gameObject.endStep());
    }

}
