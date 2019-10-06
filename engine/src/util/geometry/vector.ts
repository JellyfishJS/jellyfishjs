import { Angle } from './angle';

/**
 * Represents a 2D point.
 */
export class Vector {

    /**
     * The x coordinate of this vector.
     *
     * Do not modify directly.
     *
     * Readonly and private
     * since accidentally modifying a shared vector
     * could cause confusing and problematic bugs.
     */
    private readonly _x: number;

    /**
     * The y coordinate of this vector.
     *
     * Do not modify directly.
     *
     * Readonly and private
     * since accidentally modifying a shared vector
     * could cause confusing and problematic bugs.
     */
    private readonly _y: number;

    /**
     * Constructs an instance with the specified x and y.
     *
     * Vectors can be constructed from an x and y,
     * or a length and direction,
     * so use the static factory `Vector.xy()` instead.
     */
    private constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    /**
     * Returns a vector with the specified x and y.
     */
    public static xy(x: number, y: number): Vector {
        return new Vector(x, y);
    }

    /**
     * Returns a vector with the specified length in the specified direction.
     */
    public static lengthAndDirection(length: number, direction: Angle): Vector {
        return Vector.xy(length * direction.cos(), length * direction.sin());
    }

    /**
     * Returns a vector represented by the specified array.
     */
    public static array([x, y]: [number, number]) {
        return Vector.xy(x, y);
    }

    /**
     * Returns a vector represented by the specified object.
     */
    public static object({ x, y }: { x: number, y: number }) {
        return Vector.xy(x, y);
    }

    /**
     * Returns a unit vector in the specified direction.
     */
    public static unit(direction: Angle): Vector {
        return Vector.lengthAndDirection(1, direction);
    }

    /**
     * A unit vector that points right.
     */
    public static readonly right = Vector.unit(Angle.right);

    /**
     * A unit vector that points right.
     */
    public static readonly left = Vector.unit(Angle.left);

    /**
     * A unit vector that points up.
     */
    public static readonly up = Vector.unit(Angle.up);

    /**
     * A unit vector that points down.
     */
    public static readonly down = Vector.unit(Angle.down);

    /**
     * A unit vector on the x axis.
     */
    public static readonly x = Vector.right;

    /**
     * A unit vector on the y axis.
     */
    public static readonly y = Vector.up;

    /**
     * A unit vector on the y axis.
     */
    public static readonly zero = Vector.xy(0, 0);

    /**
     * Returns the x coordinate of this vector.
     */
    public x(): number {
        return this._x;
    }

    /**
     * Returns the y coordinate of this vector.
     */
    public y(): number {
        return this._y;
    }

    /**
     * Returns the length of this vector.
     */
    public length(): number {
        return Math.sqrt(this.dot(this));
    }

    /**
     * Returns the direction of this vector.
     */
    public direction(): Angle {
        return Angle.radians(Math.atan2(this.y(), this.x()));
    }

    /**
    * Returns a vector with this vector's y coordinate but a new x coordinate.
     */
    public withX(x: number): Vector {
        return Vector.xy(x, this.y());
    }

    /**
     * Returns a vector with this vector's x coordinate but a new y coordinate.
     */
    public withY(y: number): Vector {
        return Vector.xy(this.x(), y);
    }

    /**
     * Returns a vector with this vector's direction, but a new length.
     */
    public withLength(length: number): Vector {
        return Vector.lengthAndDirection(length, this.direction());
    }

    /**
     * Returns a vector with this vector's length, but a new direction.
     */
    public withDirection(direction: Angle): Vector {
        return Vector.lengthAndDirection(this.length(), direction);
    }

    /**
     * Returns a unit vector with the same direction as this vector.
     */
    public unit(): Vector {
        return this.withLength(1);
    }

    /**
     * Returns the dot product of this vector and the specified vector.
     */
    public dot(vector: Vector): number {
        return this.x() * vector.x() + this.y() * vector.y();
    }

    /**
     * Returns the sum of this vector and the specified vector.
     */
    public negated(): Vector {
        return Vector.xy(-this.x(), -this.y());
    }

    /**
     * Returns the sum of this vector and the specified vector.
     */
    public plus(vector: Vector): Vector {
        return Vector.xy(this.x() + vector.x(), this.y() + vector.y());
    }

    /**
     * Returns the sum of this vector and the specified vector.
     */
    public minus(vector: Vector): Vector {
        return this.plus(vector.negated());
    }

    /**
     * Returns this vector multiplied by the specified constant.
     */
    public times(factor: number): Vector {
        return Vector.xy(this.x() * factor, this.y() * factor);
    }

    /**
     * Returns this vector divided by the specified constant.
     */
    public dividedBy(divisor: number): Vector {
        return this.times(1 / divisor);
    }

    /**
     * Returns this vector rotated by the specified amount.
     */
    public rotatedBy(angle: Angle): Vector {
        return this.withDirection(this.direction().plus(angle));
    }

    /**
     * Returns this vector rotated by the specified amount around the specified point.
     */
    public rotatedAround(angle: Angle, around: Vector): Vector {
        return this.minus(around).rotatedBy(angle).plus(around);
    }

    /**
     * Returns the vector projection onto the specified surface.
     */
    public projection(surface: Vector): Vector {
        const surfaceUnit = surface.unit();
        return surfaceUnit.times(this.dot(surfaceUnit));
    }

    /**
     * Returns `true` if this vector is strictly equal to the other vector,
     * otherwise `false`.
     */
    public equals(vector: Vector): boolean {
        return this.x() === vector.x() && this.y() === vector.y();
    }

    /**
     * Returns the vector as an array.
     *
     * Specifically, returns a tuple
     * containing the x value then the y value.
     */
    public array(): [number, number] {
        return [this.x(), this.y()];
    }

    /**
     * Returns the vector as an object.
     */
    public object(): { x: number, y: number } {
        return { x: this.x(), y: this.y() };
    }

    /**
     * Returns a string describing this vector.
     *
     * For debug purposes only.
     */
    public toString(): string {
        return `Vector(${this.x()}, ${this.y()})`;
    }

}
