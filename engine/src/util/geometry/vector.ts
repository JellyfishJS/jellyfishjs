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
     * Returns `true` if this vector is strictly equal to the other vector,
     * otherwise `false`.
     */
    public equals(vector: Vector): boolean {
        return this.x() === vector.x() && this.y() === vector.y();
    }

}
