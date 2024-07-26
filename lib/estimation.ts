// Simple Matrix class
class Matrix {
  private data: number[][];

  constructor(data: number[][]) {
    this.data = data;
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(
      Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0))
    );
  }

  static identity(size: number): Matrix {
    return new Matrix(
      Array(size)
        .fill(0)
        .map((_, i) =>
          Array(size)
            .fill(0)
            .map((_, j) => (i === j ? 1 : 0))
        )
    );
  }

  add(other: Matrix): Matrix {
    return new Matrix(this.data.map((row, i) => row.map((val, j) => val + other.data[i][j])));
  }

  subtract(other: Matrix): Matrix {
    return new Matrix(this.data.map((row, i) => row.map((val, j) => val - other.data[i][j])));
  }

  multiply(other: Matrix): Matrix {
    const result = Matrix.zeros(this.data.length, other.data[0].length);
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < other.data[0].length; j++) {
        for (let k = 0; k < this.data[0].length; k++) {
          result.data[i][j] += this.data[i][k] * other.data[k][j];
        }
      }
    }
    return result;
  }

  transpose(): Matrix {
    return new Matrix(this.data[0].map((_, i) => this.data.map((row) => row[i])));
  }

  inverse(): Matrix {
    if (this.data.length !== this.data[0].length) {
      throw new Error("Matrix must be square");
    }
    const n = this.data.length;
    const identity = Matrix.identity(n);
    const augmented = new Matrix(this.data.map((row, i) => [...row, ...identity.data[i]]));

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented.data[j][i]) > Math.abs(augmented.data[maxRow][i])) {
          maxRow = j;
        }
      }
      [augmented.data[i], augmented.data[maxRow]] = [
        augmented.data[maxRow],
        augmented.data[i],
      ];

      const divisor = augmented.data[i][i];
      for (let j = i; j < 2 * n; j++) {
        augmented.data[i][j] /= divisor;
      }

      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const factor = augmented.data[j][i];
          for (let k = i; k < 2 * n; k++) {
            augmented.data[j][k] -= factor * augmented.data[i][k];
          }
        }
      }
    }

    return new Matrix(augmented.data.map((row) => row.slice(n)));
  }

  get(row: number, col: number): number {
    return this.data[row][col];
  }

  set(row: number, col: number, value: number): void {
    this.data[row][col] = value;
  }
}

// Types
type Vector3 = { north: number; east: number; down: number };
type Attitude = { roll: number; pitch: number; yaw: number };

// State variables
let windVelocity: Vector3 = { north: 0, east: 0, down: 0 };
let angleOfAttack = 0;
let sideslipAngle = 0;

// Kalman Filter state
let x = new Matrix([[0], [0], [0], [1]]); // [wind_n, wind_e, wind_d, airspeed_scale]
let P = Matrix.identity(4);
P.set(0, 0, 10);
P.set(1, 1, 10);
P.set(2, 2, 10);
P.set(3, 3, 0.1);

// Kalman Filter parameters
const Q = new Matrix([
  [0.01, 0, 0, 0],
  [0, 0.01, 0, 0],
  [0, 0, 0.01, 0],
  [0, 0, 0, 0.0001],
]);
const R = new Matrix([[1]]);

/**
 * Updates the wind velocity estimate using a Kalman Filter.
 * This function should be called regularly with updated sensor data.
 *
 * @param {Vector3} aircraftVelocity - The current velocity of the aircraft in NED frame
 * @param {Attitude} aircraftAttitude - The current attitude of the aircraft
 * @param {number} measuredAirspeed - The measured airspeed from the pitot tube
 */
export function updateWindEstimate(
  aircraftVelocity: Vector3,
  aircraftAttitude: Attitude,
  measuredAirspeed: number
): void {
  const Rbn = getRotationMatrix(aircraftAttitude);
  const C = new Matrix([[Rbn.get(0, 0), Rbn.get(0, 1), Rbn.get(0, 2), measuredAirspeed]]);

  const y = aircraftVelocity.north - C.multiply(x).get(0, 0);
  const S = C.multiply(P).multiply(C.transpose()).add(R);
  const K = P.multiply(C.transpose()).multiply(S.inverse());

  x = x.add(K.multiply(new Matrix([[y]])));
  P = Matrix.identity(4).subtract(K.multiply(C)).multiply(P);

  windVelocity.north = x.get(0, 0);
  windVelocity.east = x.get(1, 0);
  windVelocity.down = x.get(2, 0);
}

/**
 * Calculates the Angle of Attack (AOA) and Sideslip Angle (SSA)
 * based on the current wind estimate and aircraft state.
 *
 * @param {Vector3} aircraftVelocity - The current velocity of the aircraft in NED frame
 * @param {Attitude} aircraftAttitude - The current attitude of the aircraft
 */
export function calculateAOAandSSA(
  aircraftVelocity: Vector3,
  aircraftAttitude: Attitude
): void {
  const Rbn = getRotationMatrix(aircraftAttitude);
  const windBody = Rbn.multiply(
    new Matrix([[windVelocity.north], [windVelocity.east], [windVelocity.down]])
  );

  const relativeVelocity = {
    x: aircraftVelocity.north - windBody.get(0, 0),
    y: aircraftVelocity.east - windBody.get(1, 0),
    z: aircraftVelocity.down - windBody.get(2, 0),
  };

  const Va = Math.sqrt(
    relativeVelocity.x ** 2 + relativeVelocity.y ** 2 + relativeVelocity.z ** 2
  );

  angleOfAttack = Math.atan2(relativeVelocity.z, relativeVelocity.x);
  sideslipAngle = Math.asin(relativeVelocity.y / Va);
}

/**
 * Calculates the rotation matrix from NED to body frame
 * based on the given aircraft attitude.
 *
 * @param {Attitude} attitude - The current attitude of the aircraft
 * @returns {Matrix} The rotation matrix from NED to body frame
 */
function getRotationMatrix(attitude: Attitude): Matrix {
  const { roll, pitch, yaw } = attitude;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);

  return new Matrix([
    [cp * cy, cp * sy, -sp],
    [sr * sp * cy - cr * sy, sr * sp * sy + cr * cy, sr * cp],
    [cr * sp * cy + sr * sy, cr * sp * sy - sr * cy, cr * cp],
  ]);
}

/**
 * Returns the current wind velocity estimate.
 *
 * @returns {Vector3} The estimated wind velocity in NED frame
 */
export function getWindVelocity(): Vector3 {
  return { ...windVelocity };
}

/**
 * Returns the current Angle of Attack (AOA) estimate.
 *
 * @returns {number} The estimated Angle of Attack in radians
 */
export function getAngleOfAttack(): number {
  return angleOfAttack;
}

/**
 * Returns the current Sideslip Angle (SSA) estimate.
 *
 * @returns {number} The estimated Sideslip Angle in radians
 */
export function getSideslipAngle(): number {
  return sideslipAngle;
}
