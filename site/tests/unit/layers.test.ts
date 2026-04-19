import { describe, it, expect } from 'vitest';
import { buildLayerSchedule } from '../../src/lib/anchors/layers';

describe('buildLayerSchedule', () => {
  it('divides scroll progress evenly across layers', () => {
    const schedule = buildLayerSchedule(5);
    expect(schedule.length).toBe(5);
    expect(schedule[0].enterAt).toBe(0);
    expect(schedule[4].enterAt).toBeCloseTo(0.8, 3);
    schedule.forEach((s, i) => {
      if (i > 0) expect(s.enterAt).toBeGreaterThan(schedule[i - 1].enterAt);
    });
  });
});
