# Maplibre Three World Changelog


## [1.4.0] - 2026-04-20

### Added
- Add `animate()` method to `ThreeModel` for smooth transitions of position, rotation, and scale with multi-waypoint constant-speed interpolation.
- Add `stopAnimate()` method to `ThreeModel` to immediately stop and resolve an active animation.
- Extract animation calculation utilities `computeSegmentThresholds` and `resolveWaypointSegment` to `src/utils/animate-waypoints.ts`.

### Documentation
- Add `animate()` and `stopAnimate()` documentation to `docs/three-model.md`.

### Chore
- Remove `live-server` from `npm start`; run `tsup --watch` only.
- Rename `src/configs` to `src/constants` and move `EARTH_RADIUS_M` there; add unit tests for `haversineDistance`.


## [1.3.1] - 2026-03-03

### Documentation
- Add JSDoc comments for `ThreeLine`.
- Change example code in README.md.


## [1.3.0] - 2026-03-03

### Added
- Create `ThreeLine` class for rendering 3D lines on the map.
- Export utility functions.

### Documentation
- Add documentation for `ThreeLine` class and utility functions.
- Rewrite example codes.

### Chore
- Refactor project structure for better organization and maintainability.
- Add unit tests for this project.
- Add live-server for development and testing.


## [1.2.0] - 2026-02-11

### Added
- Added `clone()` method for `ThreeModel` to allow duplication of models with the same properties and geometry.

### Optimization
- Optimized the `Three.Object3D` visibility update.

### Changed
- Replaced `mesh` type with `custom` type for `ThreeModel` to allow more flexible 3D object types.


## [1.1.2] - 2026-01-10

### Fixed
- Revised the Three.js type definitions version used during library development.

### Chore
- Add automated npm publish workflow.


## [1.1.1] - 2026-01-04

### Added
- Add peerDependencies version requirements for maplibre-gl (>=5.0.0) and three (>=0.130.0)".

### Documentation
- Add peerDependencies version requirements to README.md.
- Add cover image to README.md.


## [1.1.0] - 2026-01-02

### Added
- Added `ThreeLight` class with basic functionality.


## [1.0.2] - 2025-12-12

### Changed
- Refined default lighting configuration.


## [1.0.1] - 2025-12-10

### Fixed
- Fix type errors in `ThreeLayer`, `ThreeModel`, and `LngLatAltLike`.


## [1.0.0] - 2025-12-10

### Added
- Initial release of Maplibre Three World.
- Integration of Three.js 3D models (mesh, GLTF, FBX) into Maplibre maps.
- `ThreeLayer` for managing 3D objects with Maplibre-like API, event system, and zoom/visibility control.
- `ThreeModel` with scale, rotation, and popup support.
- Full TypeScript support with typed options, events, and models.
