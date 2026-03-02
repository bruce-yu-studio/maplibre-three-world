import { describe, it, expect } from 'vitest';
import { makePerspectiveMatrix } from './make-perspective-matrix';

describe('makePerspectiveMatrix', () => {
  it('returns an array of length 16', () => {
    const matrix = makePerspectiveMatrix(Math.PI / 4, 1, 1, 1000);
    expect(matrix).toHaveLength(16);
  });

  it('has zeros at positions 3, 7, 12, and 15', () => {
    const matrix = makePerspectiveMatrix(Math.PI / 4, 1, 1, 1000);
    expect(matrix[3]).toBe(0);
    expect(matrix[7]).toBe(0);
    expect(matrix[12]).toBe(0);
    expect(matrix[15]).toBe(0);
  });

  it('computes correct nf terms for near=1, far=1000', () => {
    const near = 1;
    const far = 1000;
    const nf = 1 / (near - far);
    const matrix = makePerspectiveMatrix(Math.PI / 4, 1, near, far);
    expect(matrix[10]).toBeCloseTo((far + near) * nf, 10);
    expect(matrix[14]).toBeCloseTo(2 * far * near * nf, 10);
  });
});
