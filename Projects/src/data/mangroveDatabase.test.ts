import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateMHI } from './mangroveDatabase.ts';

describe('calculateMHI', () => {
  it('calculates the score from all health indicators and rounds it', () => {
    const result = calculateMHI({
      salinityPpt: 25,
      canopyCoverPercent: 50,
      trashLevel: 'light',
      erosionRisk: 'moderate',
      wildlifeCount: 3,
    });

    assert.equal(result.score, 87);
    assert.equal(result.status, 'pristine');
  });

  it('assigns the correct status at each score boundary', () => {
    const cases: {
      name: string;
      input: Parameters<typeof calculateMHI>[0];
      expectedScore: number;
      expectedStatus: ReturnType<typeof calculateMHI>['status'];
      expectedSummary: RegExp;
    }[] = [
      {
        name: 'pristine at 85',
        input: { salinityPpt: 25, canopyCoverPercent: 20, trashLevel: 'light', erosionRisk: 'low', wildlifeCount: 0 },
        expectedScore: 85,
        expectedStatus: 'pristine',
        expectedSummary: /Pristine/,
      },
      {
        name: 'healthy at 70',
        input: { salinityPpt: 25, canopyCoverPercent: 0, trashLevel: 'none', erosionRisk: 'moderate', wildlifeCount: 0 },
        expectedScore: 70,
        expectedStatus: 'healthy',
        expectedSummary: /Healthy/,
      },
      {
        name: 'vulnerable at 50',
        input: { salinityPpt: 25, canopyCoverPercent: 0, trashLevel: 'moderate', erosionRisk: 'moderate', wildlifeCount: 0 },
        expectedScore: 50,
        expectedStatus: 'vulnerable',
        expectedSummary: /Moderate environmental stress/,
      },
      {
        name: 'degraded below 50',
        input: { salinityPpt: 25, canopyCoverPercent: 8, trashLevel: 'severe', erosionRisk: 'moderate', wildlifeCount: 4 },
        expectedScore: 49,
        expectedStatus: 'degraded',
        expectedSummary: /High degradation risk/,
      },
    ];

    for (const testCase of cases) {
      const result = calculateMHI(testCase.input);

      assert.equal(result.score, testCase.expectedScore, testCase.name);
      assert.equal(result.status, testCase.expectedStatus, testCase.name);
      assert.match(result.summary, testCase.expectedSummary, testCase.name);
    }
  });

  it('applies salinity bonuses at and around their boundaries', () => {
    const data = {
      canopyCoverPercent: 0,
      trashLevel: 'moderate' as const,
      erosionRisk: 'moderate' as const,
      wildlifeCount: 0,
    };

    assert.equal(calculateMHI({ ...data, salinityPpt: 15 }).score, 50);
    assert.equal(calculateMHI({ ...data, salinityPpt: 38 }).score, 50);
    assert.equal(calculateMHI({ ...data, salinityPpt: 14.99 }).score, 43);
    assert.equal(calculateMHI({ ...data, salinityPpt: 38.01 }).score, 43);
    assert.equal(calculateMHI({ ...data, salinityPpt: 0 }).score, 43);
    assert.equal(calculateMHI({ ...data, salinityPpt: 50 }).score, 43);
    assert.equal(calculateMHI({ ...data, salinityPpt: -0.01 }).score, 25);
    assert.equal(calculateMHI({ ...data, salinityPpt: 50.01 }).score, 25);
  });

  it('caps the wildlife contribution at fifteen points', () => {
    const data = {
      salinityPpt: 25,
      canopyCoverPercent: 0,
      trashLevel: 'moderate' as const,
      erosionRisk: 'moderate' as const,
    };

    assert.equal(calculateMHI({ ...data, wildlifeCount: 5 }).score, 65);
    assert.equal(calculateMHI({ ...data, wildlifeCount: 100 }).score, 65);
  });

  it('clamps extreme scores to the supported range', () => {
    const best = calculateMHI({
      salinityPpt: 25,
      canopyCoverPercent: 1000,
      trashLevel: 'none',
      erosionRisk: 'low',
      wildlifeCount: 100,
    });
    const worst = calculateMHI({
      salinityPpt: 100,
      canopyCoverPercent: -1000,
      trashLevel: 'severe',
      erosionRisk: 'critical',
      wildlifeCount: 0,
    });

    assert.deepEqual(
      { score: best.score, status: best.status },
      { score: 99, status: 'pristine' },
    );
    assert.deepEqual(
      { score: worst.score, status: worst.status },
      { score: 5, status: 'degraded' },
    );
  });
});
