import { describe, it, expect } from 'vitest';
import { Group } from 'three';
import { ThreeLine } from './ThreeLine';
import { LngLatAlt } from '../geometries/LngLatAlt';

function makeCoords() {
  return [
    new LngLatAlt(0, 0, 0),
    new LngLatAlt(10, 20, 0),
  ];
}

describe('ThreeLine constructor', () => {
  it('_name is ThreeLine', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._name).toBe('ThreeLine');
  });

  it('assigns a numeric _id', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(typeof line._id).toBe('number');
  });

  it('_id matches _object.id', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._id).toBe(line._object.id);
  });

  it('_object is a Three.js Group', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._object).toBeInstanceOf(Group);
  });

  it('defaults type to solid', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._type).toBe('solid');
  });

  it('defaults width to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._width).toBe(1);
  });

  it('defaults color to 0x000000', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._color).toBe(0x000000);
  });

  it('defaults opacity to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._opacity).toBe(1);
  });

  it('defaults gapSize to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._gapSize).toBe(1);
  });

  it('defaults dashSize to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._dashSize).toBe(1);
  });

  it('defaults dashOffset to 0', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._dashOffset).toBe(0);
  });

  it('applies provided options', () => {
    const line = new ThreeLine({
      lngLatAlts: makeCoords(),
      type: 'dash',
      width: 3,
      color: 0xff0000,
      opacity: 0.5,
      gapSize: 2,
      dashSize: 4,
      dashOffset: 0.5,
    });
    expect(line._type).toBe('dash');
    expect(line._width).toBe(3);
    expect(line._color).toBe(0xff0000);
    expect(line._opacity).toBe(0.5);
    expect(line._gapSize).toBe(2);
    expect(line._dashSize).toBe(4);
    expect(line._dashOffset).toBe(0.5);
  });

  it('_layer is undefined initially', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._layer).toBeUndefined();
  });

  it('creates a Line2 after construction', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line._line).toBeDefined();
  });
});

describe('getLngLatAlts', () => {
  it('returns a non-null array', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getLngLatAlts()).not.toBeNull();
  });

  it('contains the original coords', () => {
    const coords = makeCoords();
    const line = new ThreeLine({ lngLatAlts: coords });
    const result = line.getLngLatAlts()!;
    expect(result).toContain(coords[0]);
    expect(result).toContain(coords[1]);
  });
});

describe('_bounds', () => {
  it('computes north/south/east/west from coords', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    // coords: [0,0,0] and [10,20,0] → lng 0-10, lat 0-20
    expect(line._bounds.north).toBe(20);
    expect(line._bounds.south).toBe(0);
    expect(line._bounds.east).toBe(10);
    expect(line._bounds.west).toBe(0);
  });
});

describe('getType / setType', () => {
  it('getType returns stored type', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getType()).toBe('solid');
  });

  it('setType updates type', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setType('dash');
    expect(line.getType()).toBe('dash');
  });

  it('setType dash sets USE_DASH define on material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setType('dash');
    expect(line._line!.material.defines).toHaveProperty('USE_DASH');
  });

  it('setType solid clears defines on material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setType('dash');
    line.setType('solid');
    expect(line._line!.material.defines).not.toHaveProperty('USE_DASH');
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setType('solid')).toBe(line);
  });
});

describe('getWidth / setWidth', () => {
  it('getWidth returns stored width', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getWidth()).toBe(1);
  });

  it('setWidth updates _width and material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setWidth(5);
    expect(line._width).toBe(5);
    expect(line._line!.material.linewidth).toBe(5);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setWidth(2)).toBe(line);
  });
});

describe('getColor / setColor', () => {
  it('getColor returns stored color', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getColor()).toBe(0x000000);
  });

  it('setColor updates _color', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setColor(0xff0000);
    expect(line._color).toBe(0xff0000);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setColor(0xffffff)).toBe(line);
  });
});

describe('getOpacity / setOpacity', () => {
  it('getOpacity returns stored opacity', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getOpacity()).toBe(1);
  });

  it('setOpacity updates _opacity and material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setOpacity(0.5);
    expect(line._opacity).toBe(0.5);
    expect(line._line!.material.opacity).toBe(0.5);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setOpacity(0.8)).toBe(line);
  });
});

describe('getDashSize / setDashSize', () => {
  it('setDashSize updates _dashSize and material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setDashSize(3);
    expect(line.getDashSize()).toBe(3);
    expect(line._line!.material.dashSize).toBe(3);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setDashSize(3)).toBe(line);
  });
});

describe('getGapSize / setGapSize', () => {
  it('setGapSize updates _gapSize and material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setGapSize(4);
    expect(line.getGapSize()).toBe(4);
    expect(line._line!.material.gapSize).toBe(4);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setGapSize(4)).toBe(line);
  });
});

describe('getDashOffset / setDashOffset', () => {
  it('setDashOffset updates _dashOffset and material', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setDashOffset(0.5);
    expect(line.getDashOffset()).toBe(0.5);
    expect(line._line!.material.dashOffset).toBe(0.5);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setDashOffset(0.2)).toBe(line);
  });
});

describe('setLngLatAlts (explicit call)', () => {
  it('resets and stores the new coords', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    const newCoords = [new LngLatAlt(20, 30, 0), new LngLatAlt(40, 50, 0)];
    line.setLngLatAlts(newCoords);
    const result = line.getLngLatAlts()!;
    expect(result).toHaveLength(2);
    expect(result[0].lng).toBe(20);
    expect(result[1].lng).toBe(40);
  });

  it('updates _bounds after reset', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setLngLatAlts([new LngLatAlt(100, 50, 0), new LngLatAlt(120, 60, 0)]);
    expect(line._bounds.north).toBe(60);
    expect(line._bounds.south).toBe(50);
    expect(line._bounds.east).toBe(120);
    expect(line._bounds.west).toBe(100);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setLngLatAlts(makeCoords())).toBe(line);
  });
});
