/**
 * The superclass of any objects that appear in the game.
 */
export abstract class GameObject {

    /**
     * Called when the object is created.
     */
    public onCreate?(): void;

    /**
     * Called every step.
     */
    public step?(): void;

}
