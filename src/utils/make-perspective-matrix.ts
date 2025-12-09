/**
 * Creates a perspective projection matrix as a flat 16-element array.
 * @param {number} fovy - Vertical field of view in radians.
 * @param {number} aspect - Aspect ratio (width / height).
 * @param {number} near - Near clipping plane distance.
 * @param {number} far - Far clipping plane distance.
 * @returns {number[]} Flattened 4x4 perspective matrix.
 */
export function makePerspectiveMatrix(fovy: number, aspect: number, near: number, far: number): number[] {
  let f = 1.0 / Math.tan(fovy / 2);
  let nf = 1 / (near - far);

  return [
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ];
}
