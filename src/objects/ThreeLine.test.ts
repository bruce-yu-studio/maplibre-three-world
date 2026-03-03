import { describe, it, expect } from 'vitest';
import { ThreeLine } from './ThreeLine';
import { LngLatAlt } from '../geometries/LngLatAlt';

function makeCoords() {
  return [
    new LngLatAlt(0, 0, 0),
    new LngLatAlt(10, 20, 0),
  ];
}

describe('ThreeLine constructor', () => {
  it('defaults type to solid', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getType()).toBe('solid');
  });

  it('defaults width to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getWidth()).toBe(1);
  });

  it('defaults color to 0x000000', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getColor()).toBe(0x000000);
  });

  it('defaults opacity to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getOpacity()).toBe(1);
  });

  it('defaults gapSize to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getGapSize()).toBe(1);
  });

  it('defaults dashSize to 1', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getDashSize()).toBe(1);
  });

  it('defaults dashOffset to 0', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.getDashOffset()).toBe(0);
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
    expect(line.getType()).toBe('dash');
    expect(line.getWidth()).toBe(3);
    expect(line.getColor()).toBe(0xff0000);
    expect(line.getOpacity()).toBe(0.5);
    expect(line.getGapSize()).toBe(2);
    expect(line.getDashSize()).toBe(4);
    expect(line.getDashOffset()).toBe(0.5);
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

  it('setWidth updates width', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setWidth(5);
    expect(line.getWidth()).toBe(5);
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

  it('setColor updates color', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setColor(0xff0000);
    expect(line.getColor()).toBe(0xff0000);
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

  it('setOpacity updates opacity', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setOpacity(0.5);
    expect(line.getOpacity()).toBe(0.5);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setOpacity(0.8)).toBe(line);
  });
});

describe('getDashSize / setDashSize', () => {
  it('setDashSize updates dashSize', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setDashSize(3);
    expect(line.getDashSize()).toBe(3);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setDashSize(3)).toBe(line);
  });
});

describe('getGapSize / setGapSize', () => {
  it('setGapSize updates gapSize', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setGapSize(4);
    expect(line.getGapSize()).toBe(4);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setGapSize(4)).toBe(line);
  });
});

describe('getDashOffset / setDashOffset', () => {
  it('setDashOffset updates dashOffset', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    line.setDashOffset(0.5);
    expect(line.getDashOffset()).toBe(0.5);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setDashOffset(0.2)).toBe(line);
  });
});

describe('setLngLatAlts', () => {
  it('resets and stores the new coords', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    const newCoords = [new LngLatAlt(20, 30, 0), new LngLatAlt(40, 50, 0)];
    line.setLngLatAlts(newCoords);
    const result = line.getLngLatAlts()!;
    expect(result).toHaveLength(2);
    expect(result[0].lng).toBe(20);
    expect(result[1].lng).toBe(40);
  });

  it('is chainable', () => {
    const line = new ThreeLine({ lngLatAlts: makeCoords() });
    expect(line.setLngLatAlts(makeCoords())).toBe(line);
  });
});
