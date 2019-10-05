/**
 * Represents an angle.
 */
export class Angle {

    /**
     * The size of this angle in radians.
     *
     * Private and readonly to prevent it from being modified incorrectly,
     * and to avoid accidentally modifying shared angles.
     */
    private readonly _radians: number;

    /**
     * Constructs an angle with the specified number of radians.
     *
     * Use the static factory `Angle.radians` to be more clear about units.
     *
     * Automatically normalizes the angle to be in (-pi, pi].
     */
    private constructor(radians: number) {
        const tau = 2 * Math.PI;
        let boundedRadians = (radians % tau + tau) % tau; // In [0, 2 * pi)
        if (boundedRadians > Math.PI) {
            boundedRadians -= tau;
        }
        this._radians = boundedRadians;
    }

    /**
     * Returns an angle with the specified number of radians.
     */
    public static radians(radians: number): Angle {
        return new Angle(radians);
    }

    /**
     * Returns an angle with the specified number of degrees.
     */
    public static degrees(degrees: number): Angle {
        return Angle.radians(degrees / 180 * Math.PI);
    }

    /**
     * An angle pointing right.
     */
    public static right = Angle.radians(0);

    /**
     * An angle pointing up.
     */
    public static up = Angle.radians(Math.PI / 2);

    /**
     * An angle pointing left.
     */
    public static left = Angle.radians(Math.PI);

    /**
     * An angle pointing down.
     */
    public static down = Angle.radians(Math.PI / 2);

    /**
     * An angle representing turning halfway around — 180°.
     */
    public static halfTurn = Angle.radians(Math.PI);

    /**
     * Returns the size of this angle in radians.
     */
    public radians(): number {
        return this._radians;
    }

    /**
     * Returns the size of this angle in degrees.
     */
    public degrees(): number {
        return this._radians / Math.PI * 180;
    }

    /**
     * Returns `true` if this angle equals the specified angle,
     * otherwise `false`.
     */
    public equals(angle: Angle): boolean {
        return this.radians() === angle.radians();
    }

    /**
     * Returns the negation of this angle.
     */
    public negated(): Angle {
        return Angle.radians(-this.radians());
    }

    /**
     * Returns the sum of this angle and the specified angle.
     */
    public plus(angle: Angle): Angle {
        return Angle.radians(this.radians() + angle.radians());
    }

    /**
     * Returns the angle from the specified angle to this angle.
     */
    public minus(angle: Angle): Angle {
        return this.plus(angle.negated());
    }

}
