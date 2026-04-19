import { describe, it, expect } from 'vitest';
import { buildPremiseTimeline } from '../../src/lib/anchors/premise';

describe('buildPremiseTimeline', () => {
  it('creates a step per line with increasing startFraction', () => {
    const steps = buildPremiseTimeline(4);
    expect(steps.length).toBe(4);
    expect(steps[0].startFraction).toBe(0);
    expect(steps[3].startFraction).toBeCloseTo(0.675, 2);
    steps.forEach((s, i) => {
      if (i > 0) expect(s.startFraction).toBeGreaterThan(steps[i - 1].startFraction);
    });
  });

  it('each step has a non-zero duration within [0,1]', () => {
    const steps = buildPremiseTimeline(4);
    steps.forEach(s => {
      expect(s.durationFraction).toBeGreaterThan(0);
      expect(s.startFraction + s.durationFraction).toBeLessThanOrEqual(1);
    });
  });
});
