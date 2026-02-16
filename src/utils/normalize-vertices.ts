import type { Vector3 } from 'three';
import { BufferGeometry, BufferAttribute } from 'three';


export function normalizeVertices(vertices: Array<Vector3>) {
  const geometry = new BufferGeometry();
  const positions = vertices.flatMap(({ x, y, z }) => [x, y, z]);

  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.computeBoundingSphere();

  const center = geometry.boundingSphere?.center;
  if (!center) {
    return null;
  }

  // const vertices = vertices.map(vector => vector.sub(center));

  return {
    vertices: vertices.map(vector => vector.sub(center)),
    position: center,
  }
}
