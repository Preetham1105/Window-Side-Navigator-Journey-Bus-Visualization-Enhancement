import { calculateSunPosition } from '../src/services/sunService';
import {
  calculateShadedSide,
  calculateOverallShadeRecommendation,
  computeShadeIntervals,
  DECISION_THRESHOLD
} from '../src/services/shadeService';
import { calculateBearing } from '../src/utils/bearing';
import { ShadeSample } from '../src/types';

describe('Window-Side Navigator Shade Calculations', () => {

  test('Test 1: Sun below horizon (Night Journey)', () => {
    const nightDate = new Date('2026-09-18T23:00:00.000Z');
    const sunPos = calculateSunPosition(nightDate, 12.2958, 76.6394, 90);

    expect(sunPos.isNight).toBe(true);
    expect(sunPos.sunSide).toBe('BELOW_HORIZON');
    expect(sunPos.altitude).toBeLessThanOrEqual(0);

    const shade = calculateShadedSide(sunPos.sunSide, sunPos.isNight);
    expect(shade).toBe('ANY_SEAT');
  });

  test('Test 2: Sun directly to the right (Vehicle East 90°, Sun 150°)', () => {
    const shade = calculateShadedSide('RIGHT', false);
    expect(shade).toBe('LEFT');
  });

  test('Test 3: Sun directly to the left (Vehicle East 90°, Sun 30°)', () => {
    const shade = calculateShadedSide('LEFT', false);
    expect(shade).toBe('RIGHT');
  });

  test('Test 4: Route changes direction affects vehicle bearing and shade recommendation', () => {
    const b1 = calculateBearing(12.2958, 76.6394, 12.4500, 76.6394); // North
    expect(b1).toBeCloseTo(0, 0);

    const b2 = calculateBearing(12.4500, 76.6394, 12.4500, 76.3847); // West
    expect(b2).toBeCloseTo(270, 0);

    const sampleTemplate = {
      pointIndex: 0,
      minutesFromStart: 0,
      timestamp: new Date('2026-09-18T08:30:00.000Z').toISOString(),
      lat: 12.2958,
      lng: 76.6394,
      vehicleBearing: 90,
      sunAzimuth: 150,
      sunAltitude: 40,
      isNight: false,
    };

    const mockSamples: ShadeSample[] = [
      { ...sampleTemplate, pointIndex: 0, minutesFromStart: 0, sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 1, minutesFromStart: 30, sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 2, minutesFromStart: 60, sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 3, minutesFromStart: 90, sunSide: 'LEFT', shadedSide: 'RIGHT' },
    ];

    const overall = calculateOverallShadeRecommendation(mockSamples);
    expect(overall.overallShadedSide).toBe('LEFT');
    expect(overall.leftShadePercentage).toBe(75);
    expect(overall.rightShadePercentage).toBe(25);
    expect(overall.shadeConfidence).toBe(75);
    expect(overall.shadeChangesCount).toBe(1);
  });

  test('Test 5: Decision threshold enforces NO STRONG SIDE PREFERENCE when difference < 10%', () => {
    const sampleTemplate = {
      pointIndex: 0,
      minutesFromStart: 0,
      timestamp: new Date('2026-09-18T08:30:00.000Z').toISOString(),
      lat: 12.2958,
      lng: 76.6394,
      vehicleBearing: 90,
      sunAzimuth: 150,
      sunAltitude: 40,
      isNight: false,
    };

    // 52% LEFT, 48% RIGHT (difference = 4% < 10% threshold)
    const mockSamples: ShadeSample[] = [
      { ...sampleTemplate, pointIndex: 0, minutesFromStart: 0, sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 1, minutesFromStart: 30, sunSide: 'LEFT', shadedSide: 'RIGHT' },
    ];

    const overall = calculateOverallShadeRecommendation(mockSamples);
    expect(overall.leftShadePercentage).toBe(50);
    expect(overall.rightShadePercentage).toBe(50);
    expect(overall.overallShadedSide).toBe('LOW_SIDE_PREFERENCE');
    expect(overall.decisionThreshold).toBe(10);
  });

  test('Test 6: Interval calculation tracking shade change times', () => {
    const sampleTemplate = {
      pointIndex: 0,
      lat: 12.2958,
      lng: 76.6394,
      vehicleBearing: 90,
      sunAzimuth: 150,
      sunAltitude: 40,
      isNight: false,
    };

    const mockSamples: ShadeSample[] = [
      { ...sampleTemplate, pointIndex: 0, minutesFromStart: 0, timestamp: new Date('2026-09-18T08:30:00').toISOString(), sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 1, minutesFromStart: 30, timestamp: new Date('2026-09-18T09:00:00').toISOString(), sunSide: 'RIGHT', shadedSide: 'LEFT' },
      { ...sampleTemplate, pointIndex: 2, minutesFromStart: 60, timestamp: new Date('2026-09-18T09:30:00').toISOString(), sunSide: 'LEFT', shadedSide: 'RIGHT' },
      { ...sampleTemplate, pointIndex: 3, minutesFromStart: 90, timestamp: new Date('2026-09-18T10:00:00').toISOString(), sunSide: 'LEFT', shadedSide: 'RIGHT' },
    ];

    const { intervals, changesCount } = computeShadeIntervals(mockSamples);
    expect(changesCount).toBe(1);
    expect(intervals.length).toBe(2);
    expect(intervals[0].shadedSide).toBe('LEFT');
    expect(intervals[1].shadedSide).toBe('RIGHT');
  });

  test('Test 7: Same start and destination bearing safety', () => {
    const bearing = calculateBearing(12.2958, 76.6394, 12.2958, 76.6394);
    expect(bearing).toBe(0);
  });
});

